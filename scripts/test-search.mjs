// Phase 2D/2E/2F — prototype test harness.
//   node scripts/test-search.mjs
//
// 2D: multilingual adversarial search matrix (PASS/FAIL per case)
// 2E: cart/favorites recipeId migration + backwards compatibility
// 2F: index load time + query execution time + shipped-JS footprint
//
// Exits non-zero if any 2D/2E assertion fails.

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

import { recipes } from '../public/js/recipes.js';
import { searchRecipes, pwNorm } from '../public/js/recipe-search.js';
import { normalizeRef, makeRef, resolveRef, upgradeRef, dedupeRefs } from '../public/js/recipe-ref.js';
import { buildIndex } from './build-search-index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'scratch_phase2', 'pilot-index');

const { perLocale } = buildIndex({ write: true }); // ensure fresh index on disk
const idsOf = arr => arr.map(e => e.id).sort((a, b) => a - b);
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const subset = (want, got) => want.every(id => got.includes(id));

let pass = 0, fail = 0;
const fails = [];
function check(label, ok, detail) {
  if (ok) { pass++; }
  else { fail++; fails.push(`${label} — ${detail}`); }
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '   → ' + detail}`);
}

// ─────────────────────────────────────────────────────────────────────────
// 2D — multilingual adversarial search matrix
// ─────────────────────────────────────────────────────────────────────────
// includes: these ids MUST be returned. excludes: these MUST NOT. exact: the
// full result set must equal this (order-independent).
const MATRIX = [
  // RO
  { lang:'ro', q:'pui',       includes:[9,187] },
  { lang:'ro', q:'cartofi',   includes:[20,32,40] },
  { lang:'ro', q:'Italia',    includes:[1,199,202] },
  { lang:'ro', q:'carbonara', exact:[1] },
  // EN — and prove concept-tagging beats raw text: chicken must NOT hit
  // Tom Yum(112)/Miso Ramen(183) whose EN lines only say "chicken stock".
  { lang:'en', q:'chicken',   includes:[9,187], excludes:[112,183] },
  { lang:'en', q:'potatoes',  includes:[20,32,40] },
  { lang:'en', q:'Italy',     includes:[1,199,202] },
  { lang:'en', q:'carbonara', exact:[1] },
  // IT
  { lang:'it', q:'pollo',     includes:[9,187] },
  { lang:'it', q:'patate',    includes:[20,32,40] },
  { lang:'it', q:'Italia',    includes:[1,199,202] },
  // DE — active-locale alias must resolve WITHOUT depending on EN display text.
  { lang:'de', q:'Hähnchen',  includes:[9,187] },
  { lang:'de', q:'Kartoffeln',includes:[20,32,40] },
  { lang:'de', q:'Italien',   includes:[1,199,202] },
  // FR — multiword alias "pommes de terre"
  { lang:'fr', q:'poulet',        includes:[9,187] },
  { lang:'fr', q:'pommes de terre',includes:[20,32,40] },
  { lang:'fr', q:'Italie',        includes:[1,199,202] },
  // AR / JA / KO — one each, non-Latin, must resolve via active-locale alias
  { lang:'ar', q:'دجاج',      includes:[9,187] },   // chicken
  { lang:'ja', q:'鶏肉',      includes:[9,187] },   // chicken
  { lang:'ko', q:'소고기',    includes:[23,32] },   // beef → Bibimbap + Goulash
  // Non-Latin bonus proving cross-recipe concept: JA rice, AR chickpeas
  { lang:'ja', q:'米',        includes:[5,23] },    // rice → Sushi + Bibimbap
  { lang:'ar', q:'حمص',       exact:[24] },         // chickpeas → Hummus only
];

console.log('\n=== 2D. Multilingual adversarial search matrix ===');
for (const t of MATRIX) {
  const idx = perLocale[t.lang];
  const got = idsOf(searchRecipes(idx, t.q));
  let ok = true, detail = `got [${got.join(',')}]`;
  if (t.exact)   { ok = eq(got, [...t.exact].sort((a,b)=>a-b)); if (!ok) detail = `expected exactly [${t.exact}], got [${got}]`; }
  if (ok && t.includes) { ok = subset(t.includes, got); if (!ok) detail = `missing ${t.includes.filter(i=>!got.includes(i))} from [${got}]`; }
  if (ok && t.excludes) { const bad = t.excludes.filter(i=>got.includes(i)); ok = bad.length===0; if (!ok) detail = `should NOT contain ${bad}`; }
  check(`[${t.lang}] "${t.q}"`, ok, detail);
}

// ─────────────────────────────────────────────────────────────────────────
// 2C — structured filters (cuisine / meal-type / time) exercised directly
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== 2C. Structured filters ===');
{
  const en = perLocale.en;
  const italy = idsOf(searchRecipes(en, '', { cuisine:'italy' }));
  check('filter cuisine=italy', eq(italy,[1,199,202]), `got [${italy}]`);
  const breakfast = idsOf(searchRecipes(en, '', { meal:'breakfast' }));
  check('filter meal=breakfast', eq(breakfast,[15,44]), `got [${breakfast}]`);
  const dessert = idsOf(searchRecipes(en, '', { meal:'dessert' }));
  check('filter meal=dessert', eq(dessert,[35,202]), `got [${dessert}]`);
  const fast = idsOf(searchRecipes(en, '', { maxTime:20 }));
  check('filter maxTime<=20', eq(fast,[13,15,24,25,30,44,65]), `got [${fast}]`);
  // combined: filter + free text (Italian dessert containing "tiramisu")
  const combo = idsOf(searchRecipes(perLocale.it, 'tiramisu', { cuisine:'italy', meal:'dessert' }));
  check('combined cuisine+meal+text', eq(combo,[202]), `got [${combo}]`);
}

// ─────────────────────────────────────────────────────────────────────────
// 2E — cart/favorites recipeId migration + backwards compatibility
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== 2E. Cart/favorites backwards compatibility ===');
{
  const byId = new Map(recipes.map(r => [r.id, r]));
  const carbo = recipes.find(r => r.id === 1);

  // Legacy { en, display } (no recipeId) must still resolve.
  const legacy = { en: 'Spaghetti Carbonara', display: 'Spaghete Carbonara' };
  check('legacy {en,display} resolves', resolveRef(legacy, byId, recipes)?.id === 1, 'did not resolve to 1');

  // Legacy holding a LOCALIZED name (older/hand-edited storage) still resolves.
  const legacyLoc = { en: 'Spaghete Carbonara', display: 'x' };
  check('legacy localized-name resolves', resolveRef(legacyLoc, byId, recipes)?.id === 1, 'did not resolve to 1');

  // New { recipeId } wins even when en is wrong/renamed.
  const renamed = { recipeId: 1, en: 'TOTALLY DIFFERENT NAME', display: 'x' };
  check('recipeId wins over stale en', resolveRef(renamed, byId, recipes)?.id === 1, 'recipeId ignored');

  // New entry with ONLY recipeId resolves.
  check('recipeId-only resolves', resolveRef({ recipeId: 9 }, byId, recipes)?.id === 9, 'did not resolve to 9');

  // makeRef produces the full new shape for the active locale.
  const ref = makeRef(carbo, 'ro');
  check('makeRef shape', ref.recipeId === 1 && ref.en === 'Spaghetti Carbonara' && ref.display === 'Spaghete Carbonara',
    JSON.stringify(ref));

  // Upgrade a legacy entry in place → gains recipeId, keeps working.
  const up = upgradeRef(legacy, byId, recipes, 'it');
  check('upgrade legacy → recipeId', up.recipeId === 1 && up.display === 'Spaghetti Carbonara', JSON.stringify(up));

  // Unresolvable legacy entry SURVIVES (not dropped, not crashed).
  const orphan = { en: 'Nonexistent Dish 9999', display: 'Nonexistent Dish 9999' };
  const keptOrphan = upgradeRef(orphan, byId, recipes, 'en');
  check('unresolvable legacy survives', keptOrphan && keptOrphan.en === 'Nonexistent Dish 9999' && keptOrphan.recipeId == null,
    JSON.stringify(keptOrphan));

  // Mixed cart: a legacy entry + a new entry for the SAME recipe collapse to one
  // after upgrade+dedupe (no phantom duplicate).
  const mixed = [ { en: 'Spaghetti Carbonara', display: 'x' }, { recipeId: 1, display: 'y' } ];
  const merged = dedupeRefs(mixed.map(e => upgradeRef(e, byId, recipes, 'en')));
  check('mixed legacy+new dedupe to 1', merged.length === 1 && merged[0].recipeId === 1, JSON.stringify(merged));

  // Garbage entry is ignored, not fatal.
  check('garbage entry ignored', normalizeRef({ foo: 'bar' }) === null && normalizeRef(null) === null, 'garbage not rejected');
}

// ─────────────────────────────────────────────────────────────────────────
// 2F — performance measurement
// ─────────────────────────────────────────────────────────────────────────
console.log('\n=== 2F. Performance ===');
{
  // Index load (read file + JSON.parse), averaged.
  const file = path.join(DATA_DIR, 'recipe-search-index.en.json');
  const N_LOAD = 200;
  let tLoad = 0;
  for (let i = 0; i < N_LOAD; i++) {
    const s = performance.now();
    JSON.parse(fs.readFileSync(file, 'utf8'));
    tLoad += performance.now() - s;
  }
  console.log(`  index load (read+parse en, ${perLocale.en.count} entries): ${(tLoad / N_LOAD).toFixed(3)} ms avg`);

  // Query execution over the in-memory index.
  const idx = perLocale.en;
  const queries = ['chicken', 'potato', 'italy', 'carbonara', 'tomato', 'egg', 'zzz'];
  const N_Q = 20000;
  const s = performance.now();
  for (let i = 0; i < N_Q; i++) searchRecipes(idx, queries[i % queries.length]);
  const perQuery = (performance.now() - s) / N_Q;
  console.log(`  query exec (20 entries): ${(perQuery * 1000).toFixed(2)} µs avg over ${N_Q} runs`);

  // Extrapolation to full/expanded catalogs (linear scan).
  for (const scale of [225, 500]) {
    console.log(`  projected @ ${scale} recipes (linear): ~${(perQuery * 1000 * scale / 20).toFixed(1)} µs/query`);
  }

  // Shipped JS footprint (raw source; would be minified+gzipped in prod).
  const jsSearch = fs.statSync(path.join(__dirname, '..', 'public', 'js', 'recipe-search.js')).size;
  const jsRef = fs.statSync(path.join(__dirname, '..', 'public', 'js', 'recipe-ref.js')).size;
  console.log(`  extra JS on /recipes/ (lazy, raw): recipe-search.js ${jsSearch} B + recipe-ref.js ${jsRef} B = ${jsSearch + jsRef} B`);
  console.log('  (index is fetched only on the Explorer page — NOT in app.min.js)');
}

// ─────────────────────────────────────────────────────────────────────────
console.log(`\n──────── ${pass} passed, ${fail} failed ────────`);
if (fail) {
  console.log('\nFAILURES:');
  for (const f of fails) console.log('  ✗ ' + f);
  process.exit(1);
}
