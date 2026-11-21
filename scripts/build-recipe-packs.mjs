// Usage:
//   node scripts/build-recipe-packs.mjs        (also runs as part of `npm run build`)
//
// Writes public/js/recipe-packs/<lc>.js: one small ES module per app locale
// with the subset of recipes.js (+ recipes-meta.js) that the browser planner
// (app.js) actually reads. app.js lazy-loads only the active locale's pack
// (ensureMainRecipes) instead of the full recipes.js corpus.
//
// Why: recipes.js carries every recipe in all 14 languages, including long
// prose (howIsMade, originText, featureCards) that only the static recipe
// pages need. It is ~33 MB raw; loading it in the planner cost every visitor
// that download (~7.6 MB brotli). A pack is ~1.3–2.3 MB raw (~0.3–0.45 MB
// brotli), mostly the ingredient lists the shopping list / PDF need.
//
// Client contract — keep in sync with app.js if it starts reading new fields:
//   - name ........................ all 14 locales (cross-locale name lookups:
//                                   ?meal= deep links, plan cart, favourites)
//   - other per-locale objects .... only { <lc>, en, ro } (app.js always reads
//                                   r.x[lang] || r.x.en || r.x.ro, and en/ro
//                                   ingredients directly for shopping-list
//                                   alignment and keyword filters)
//   - originText / howIsMade ...... only the first sentence, capped near 90
//                                   chars: renderRecipeMeta() uses nothing else
//   - featureCards / pairings ..... dropped (static recipe pages only)
//   - time / costRon / tags / desc  baked in from recipes-meta.js (incl. its
//                                   auto-filled defaults), exactly as app.js
//                                   used to merge them at runtime
//
// Vercel serves public/ as-is (no build step), so the generated packs are
// committed like the generated HTML; recipe-content-sync.yml regenerates them
// whenever recipes.js / recipes-meta.js change.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recipes } from '../public/js/recipes.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import { i18n } from '../public/js/i18n.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'js', 'recipe-packs');

const LANGS = Object.keys(i18n);
const LANG_SET = new Set(LANGS);
const FALLBACK_LANGS = ['en', 'ro'];
const ALL_LOCALES_FIELDS = new Set(['name']);
const DROP_FIELDS = new Set(['featureCards', 'pairings']);

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isLocaleMap = (v) => isPlainObject(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => LANG_SET.has(k));

// originText / howIsMade feed only renderRecipeMeta() in app.js, which takes
// the first sentence and caps the final description at 90 chars (88 + '…').
// Ship just enough text that app.js's own logic yields exactly the same string
// it would have produced from the full text:
//  - originText: app.js does text.split(/(?<=[.!?])\s/)[0].trim(). The
//    untrimmed first piece is never empty for a non-empty string, so the
//    lang → en fallback behaves the same.
//  - howIsMade: app.js does text.split(/[.!?]/)[0].trim(). Keep the
//    terminating punctuation mark so a text that STARTS with one stays truthy.
//  - CJK / Hindi / Arabic prose often has no ". " boundary at all, so the
//    "first sentence" is the whole text: capPiece() then keeps the first 91+
//    chars (ending on a non-space), which still trims to > 90 chars, so
//    app.js truncates it to the identical 88 chars + '…'.
const DESC_MAX = 90;
function capPiece(piece) {
  const t = piece.trim();
  if (t.length <= DESC_MAX) return piece;
  let j = DESC_MAX + 1;
  while (j < t.length && /\s/.test(t[j - 1])) j++;
  return t.slice(0, j);
}
const TRIM = {
  originText: (s) => capPiece(s.split(/(?<=[.!?])\s/)[0]),
  howIsMade: (s) => {
    const first = s.split(/[.!?]/)[0];
    const capped = capPiece(first);
    return capped === first ? first + s.charAt(first.length) : capped;
  },
};

function pickLocales(map, keys, trim) {
  const out = {};
  for (const k of keys) {
    if (!(k in map)) continue;
    const v = map[k];
    out[k] = trim && typeof v === 'string' ? trim(v) : v;
  }
  return out;
}

function projectRecipe(r, lc) {
  const keys = [...new Set([lc, ...FALLBACK_LANGS])];
  const out = {};
  for (const [field, value] of Object.entries(r)) {
    if (DROP_FIELDS.has(field)) continue;
    if (isLocaleMap(value)) {
      out[field] = ALL_LOCALES_FIELDS.has(field) ? value : pickLocales(value, keys, TRIM[field]);
    } else {
      out[field] = value;
    }
  }
  // Same merge app.js used to do at runtime after loading recipes.js.
  const meta = recipesMeta[r.id];
  if (meta) {
    out.time = meta.time;
    out.costRon = meta.costRon;
    out.tags = meta.tags || [];
    if (meta.desc) out.desc = isLocaleMap(meta.desc) ? pickLocales(meta.desc, keys) : meta.desc;
  }
  return out;
}

// JSON is valid JS; escape U+2028/U+2029 so older parsers never choke on them.
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);
const toJsLiteral = (v) => JSON.stringify(v)
  .split(LINE_SEP).join('\\u2028')
  .split(PARA_SEP).join('\\u2029');

export function buildRecipePack(lc) {
  return recipes.map((r) => projectRecipe(r, lc));
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  // Drop packs for locales that no longer exist in i18n.js.
  for (const f of readdirSync(OUT_DIR)) {
    if (f.endsWith('.js') && !LANG_SET.has(f.slice(0, -3))) rmSync(join(OUT_DIR, f));
  }

  let total = 0;
  for (const lc of LANGS) {
    const pack = buildRecipePack(lc);
    const body = [
      '// AUTO-GENERATED by scripts/build-recipe-packs.mjs. DO NOT EDIT.',
      `// Planner subset of recipes.js + recipes-meta.js for locale "${lc}" (${pack.length} recipes).`,
      '// Regenerate with `npm run build` (or `npm run build:packs`).',
      'export const recipes = [',
      pack.map(toJsLiteral).join(',\n'),
      '];',
      'export default recipes;',
      '',
    ].join('\n');
    writeFileSync(join(OUT_DIR, `${lc}.js`), body, 'utf8');
    const bytes = Buffer.byteLength(body);
    total += bytes;
    console.log(`  recipe-packs/${lc}.js  ${(bytes / 1024).toFixed(0).padStart(6)} KB`);
  }
  console.log(`recipe packs: ${LANGS.length} locales, ${recipes.length} recipes, ` +
    `avg ${(total / LANGS.length / 1024).toFixed(0)} KB/locale`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
