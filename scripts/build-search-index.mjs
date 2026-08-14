// Phase 2C — Build the per-locale Recipe Explorer search index (PILOT).
//
// Reads recipes.js + recipes-meta.js + the Phase 2 taxonomy, validates it
// strictly (aborts on any error), and writes one lazy-loadable JSON per locale
// to public/data/recipe-search-index.<lc>.json.
//
//   node scripts/build-search-index.mjs
//
// Per-locale entry (all haystacks pre-normalized with the SAME pwNorm the
// runtime uses, so the client only does cheap substring/startsWith):
//   { id, name, hayName, hayRest, cuisine, meal, time, tags }
//     hayName : pwNorm(localized recipe name)          → tiers 0/1
//     hayRest : pwNorm(ingredient aliases + origin + meal label, this locale) → tier 2
//
// No external search dependency: the corpus is tiny and searchRecipes() is a
// linear scan (see the perf numbers printed at the end).

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

import { recipes } from '../public/js/recipes.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import { pwNorm } from '../public/js/recipe-search.js';

import { ALIAS_LOCALES, INGREDIENTS } from './taxonomy/ingredients.mjs';
import { MEAL_TYPE_LABELS } from './taxonomy/meal-types.mjs';
import { PILOT } from './taxonomy/pilot.mjs';
import { validateTaxonomy } from './taxonomy/validate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Pilot (20-recipe) index → scratch, so it never clobbers the PRODUCTION
// per-locale index (225 recipes) that scripts/build-full-index.mjs owns in
// public/data/. This builder + its tests are a Phase-2 regression guard.
const OUT_DIR = path.join(__dirname, '..', 'scratch_phase2', 'pilot-index');
const PREFIX = 'recipe-search-index';

function fmtBytes(n) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

export function buildIndex({ write = true } = {}) {
  // ── validate first — never emit an index from invalid taxonomy ──────────
  const { errors, warnings, stats } = validateTaxonomy({ recipes });
  if (errors.length) {
    console.error(`\n✗ Taxonomy validation FAILED (${errors.length} error(s)):`);
    for (const e of errors) console.error('   • ' + e);
    throw new Error('taxonomy validation failed — index not built');
  }

  const recipeById = new Map(recipes.map(r => [r.id, r]));
  const perLocale = {};

  for (const lc of ALIAS_LOCALES) {
    const entries = [];
    for (const [rawId, tax] of Object.entries(PILOT)) {
      const id = Number(rawId);
      const r = recipeById.get(id);
      const meta = recipesMeta[id] || {};

      const name = r.name?.[lc] || r.name?.en || r.name?.ro || '';
      const phrases = [];
      for (const ing of tax.ingredientIds)
        for (const a of (INGREDIENTS[ing]?.[lc] || [])) phrases.push(pwNorm(a));
      const originLabel = r.origin?.[lc] || r.origin?.en || '';
      const mealLabel = MEAL_TYPE_LABELS[tax.mealType]?.[lc] || '';
      if (originLabel) phrases.push(pwNorm(originLabel));
      if (mealLabel) phrases.push(pwNorm(mealLabel));

      entries.push({
        id,
        name,
        hayName: pwNorm(name),
        phrases: [...new Set(phrases)].filter(Boolean),
        cuisine: tax.cuisineId,
        meal: tax.mealType,
        time: typeof meta.time === 'number' ? meta.time : null,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
      });
    }
    entries.sort((a, b) => a.id - b.id);
    perLocale[lc] = { lang: lc, count: entries.length, recipes: entries };
  }

  // ── write + measure ─────────────────────────────────────────────────────
  if (write) fs.mkdirSync(OUT_DIR, { recursive: true });
  const sizes = [];
  for (const lc of ALIAS_LOCALES) {
    const json = JSON.stringify(perLocale[lc]);
    const raw = Buffer.byteLength(json, 'utf8');
    const gz = zlib.gzipSync(json).length;
    const br = zlib.brotliCompressSync(json).length;
    if (write) fs.writeFileSync(path.join(OUT_DIR, `${PREFIX}.${lc}.json`), json, 'utf8');
    sizes.push({ lc, raw, gz, br });
  }

  return { perLocale, sizes, warnings, stats };
}

// Run directly (not when imported by the test harness).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { sizes, warnings, stats } = buildIndex({ write: true });

  console.log('\n✓ Taxonomy valid. Index written to public/data/');
  console.log(`  cuisines=${stats.cuisines}  mealTypes=${stats.mealTypes}  ingredients=${stats.ingredients} (pilot uses ${stats.ingredientsUsedByPilot})  pilotRecipes=${stats.pilotRecipes}  locales=${stats.aliasLocales}`);

  console.log('\n  Per-locale size (raw / gzip / brotli):');
  let tRaw = 0, tGz = 0, tBr = 0;
  for (const s of sizes) {
    console.log(`   ${s.lc}  ${fmtBytes(s.raw).padStart(8)}  ${fmtBytes(s.gz).padStart(8)}  ${fmtBytes(s.br).padStart(8)}`);
    tRaw += s.raw; tGz += s.gz; tBr += s.br;
  }
  console.log(`   ── all 14: ${fmtBytes(tRaw)} raw / ${fmtBytes(tGz)} gzip / ${fmtBytes(tBr)} brotli`);
  const avg = sizes.reduce((a, s) => a + s.raw, 0) / sizes.length;
  console.log(`   avg per locale: ${fmtBytes(avg)} raw (this is what a user actually downloads)`);

  if (warnings.length) {
    console.log(`\n  ${warnings.length} warning(s) (non-fatal):`);
    for (const w of warnings) console.log('   • ' + w);
  }
}
