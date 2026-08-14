// Phase 3A — PRODUCTION per-locale search index for all 225 MAIN recipes.
//   node scripts/build-full-index.mjs
//
// Consumes the generated taxonomy (buildTaxonomy) and writes one lazy-loaded
// index per locale to public/data/recipe-search-index.<lc>.json.
//
// Safe degradation: an ingredient concept contributes a phrase in locale L only
// if it has a VALIDATED or CANDIDATE alias there. A REVIEW_REQUIRED/missing
// alias is simply omitted for L — the recipe still indexes (name, cuisine,
// meal, time, other ingredient aliases all keep working). English is NEVER used
// as a fallback surface in a localized index.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { recipes } from '../public/js/recipes.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import { ALIAS_LOCALES } from './taxonomy/ingredients.mjs';
import { MEAL_TYPE_LABELS } from './taxonomy/meal-types.mjs';
import { pwNorm } from '../public/js/recipe-search.js';
import { buildTaxonomy } from './migrate/build-taxonomy.mjs';
import { recipeImages } from '../public/js/recipe-images.js';

// Per-locale recipe URL prefixes (mirrors RECIPE_LANG in generate-content.mjs).
// Card links point at the EXISTING static recipe detail pages — no new URLs.
const RECIPE_DIR = { ro: '/ro/retete', en: '/en/recipes', es: '/es/recetas', fr: '/fr/recettes',
  de: '/de/rezepte', pt: '/pt/receitas', ru: '/ru/retsepty', ar: '/ar/wasafat', zh: '/zh/shipu',
  ja: '/ja/reshipi', hi: '/hi/recipes', tr: '/tr/tarifler', it: '/it/ricette', ko: '/ko/recipes' };
const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
// Mirror resolveRecipeImage precedence: local file → recipeImages map → '' (the
// Explorer renders its own 🍽 placeholder). All 225 main recipes resolve to a
// real image; '' only for a genuinely image-less recipe.
function resolveImg(rslug, id) {
  for (const ext of ['webp', 'jpg', 'png']) {
    if (fs.existsSync(path.join(PUBLIC, 'images', `${rslug}.${ext}`))) return `/images/${rslug}.${ext}`;
  }
  return recipeImages[id] || '';
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');
const PREFIX = 'recipe-search-index';
const fmt = n => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`);

export function buildFullIndex({ write = true } = {}) {
  const { registry, taxonomy } = buildTaxonomy();
  const recipeById = new Map(recipes.map(r => [r.id, r]));
  if (write) fs.mkdirSync(OUT_DIR, { recursive: true });

  // per-locale alias-coverage counters over DISTINCT concepts actually used
  const usedConcepts = new Set();
  for (const t of Object.values(taxonomy)) t.ingredientIds.forEach(id => usedConcepts.add(id));
  const coverage = {}; // lc -> {validated, candidate, missing}
  for (const lc of ALIAS_LOCALES) coverage[lc] = { validated: 0, candidate: 0, missing: 0 };
  for (const id of usedConcepts) {
    const e = registry.get(id);
    for (const lc of ALIAS_LOCALES) {
      const a = e?.aliases?.[lc];
      if (a && a.tier === 'VALIDATED' && a.text.length) coverage[lc].validated++;
      else if (a && a.tier === 'CANDIDATE' && a.text.length) coverage[lc].candidate++;
      else coverage[lc].missing++;
    }
  }

  const sizes = [];
  const perLocale = {};
  for (const lc of ALIAS_LOCALES) {
    const entries = [];
    for (const [rid, tax] of Object.entries(taxonomy)) {
      const r = recipeById.get(Number(rid));
      const meta = recipesMeta[Number(rid)] || {};
      const name = r.name?.[lc] || r.name?.en || r.name?.ro || '';
      const phrases = [];
      for (const id of tax.ingredientIds) {
        const a = registry.get(id)?.aliases?.[lc];
        if (a && (a.tier === 'VALIDATED' || a.tier === 'CANDIDATE')) for (const t of a.text) phrases.push(pwNorm(t));
      }
      const originLabel = r.origin?.[lc] || '';
      const mealLabel = MEAL_TYPE_LABELS[tax.mealType]?.[lc] || '';
      if (originLabel) phrases.push(pwNorm(originLabel));
      if (mealLabel) phrases.push(pwNorm(mealLabel));
      const rslug = slug(r.name?.en || r.name?.ro || '');
      entries.push({
        id: Number(rid), name, hayName: pwNorm(name),
        en: r.name?.en || '',                       // english name: cart legacy key + resolution
        cl: r.origin?.[lc] || r.origin?.en || '',   // localized cuisine label (card display)
        img: resolveImg(rslug, Number(rid)),         // local file → map → '' (🍽 placeholder)
        url: `${RECIPE_DIR[lc]}/${rslug}/`,          // existing static detail page
        phrases: [...new Set(phrases)].filter(Boolean),
        cuisine: tax.cuisineId, meal: tax.mealType,
        time: typeof meta.time === 'number' ? meta.time : null,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
      });
    }
    entries.sort((a, b) => a.id - b.id);
    const obj = { lang: lc, count: entries.length, recipes: entries };
    perLocale[lc] = obj;
    const json = JSON.stringify(obj);
    if (write) fs.writeFileSync(path.join(OUT_DIR, `${PREFIX}.${lc}.json`), json, 'utf8');
    sizes.push({ lc, raw: Buffer.byteLength(json, 'utf8'), gz: zlib.gzipSync(json).length, br: zlib.brotliCompressSync(json).length });
  }

  return { perLocale, sizes, coverage, usedConcepts: usedConcepts.size, registry, taxonomy };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { sizes, coverage, usedConcepts, perLocale } = buildFullIndex({ write: true });
  console.log(`\n✓ Production indexes written to public/data/ (${perLocale.en.count} recipes × 14 locales)`);
  console.log(`  distinct ingredient concepts used: ${usedConcepts}`);
  console.log(`\n  Per-locale size (raw / gzip / brotli) + alias coverage over used concepts:`);
  let tRaw = 0, tGz = 0, tBr = 0;
  for (const s of sizes) {
    const c = coverage[s.lc];
    const pct = Math.round((c.validated + c.candidate) / (c.validated + c.candidate + c.missing) * 100);
    console.log(`   ${s.lc}  ${fmt(s.raw).padStart(9)} ${fmt(s.gz).padStart(8)} ${fmt(s.br).padStart(8)}   ` +
      `val=${String(c.validated).padStart(3)} cand=${String(c.candidate).padStart(3)} miss=${String(c.missing).padStart(3)}  (${pct}% covered)`);
    tRaw += s.raw; tGz += s.gz; tBr += s.br;
  }
  console.log(`   ── all 14: ${fmt(tRaw)} raw / ${fmt(tGz)} gzip / ${fmt(tBr)} brotli`);
  console.log(`   avg/locale: ${fmt(tRaw / sizes.length)} raw (what a user downloads on the Explorer page)`);
}
