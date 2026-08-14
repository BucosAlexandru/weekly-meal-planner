// Phase 3A — full multilingual adversarial + NEGATIVE search matrix (225 recipes).
//   node scripts/test-full-search.mjs
// Precision failures are BLOCKING (non-zero exit).

import { searchRecipes, pwNorm } from '../public/js/recipe-search.js';
import { buildFullIndex } from './build-full-index.mjs';

const { perLocale, taxonomy } = buildFullIndex({ write: false });
const idsOf = arr => arr.map(e => e.id);
let pass = 0, fail = 0; const fails = [];
function check(label, ok, detail) {
  if (ok) pass++; else { fail++; fails.push(`${label} — ${detail}`); }
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '   → ' + detail}`);
}
const q = (lc, text, opts) => idsOf(searchRecipes(perLocale[lc], text, opts));

// derive negative target sets from the taxonomy
const nameEn = {}; for (const [id] of Object.entries(taxonomy)) nameEn[id] = id;
const setOf = pred => new Set(Object.entries(taxonomy).filter(([, t]) => pred(t)).map(([id]) => Number(id)));
const stockNotChicken = setOf(t => t.ingredientIds.includes('stock') && !t.ingredientIds.includes('chicken'));
const coconutNotMilk = setOf(t => t.ingredientIds.includes('coconut_milk') && !t.ingredientIds.includes('milk'));
const vinegarNotRice = setOf(t => t.ingredientIds.includes('vinegar') && !t.ingredientIds.includes('rice'));

console.log('\n=== POSITIVE — recipe names (7 Latin locales) ===');
check('[ro] name "carbonara" → 1', q('ro', 'carbonara').includes(1), q('ro', 'carbonara'));
check('[en] name "risotto" → 26', q('en', 'risotto').includes(26), q('en', 'risotto'));
check('[it] name "tiramisu" → 202', q('it', 'tiramisu').includes(202), q('it', 'tiramisu'));
check('[es] name "paella" → 22', q('es', 'paella').includes(22), q('es', 'paella'));

console.log('\n=== POSITIVE — common ingredient (chicken) across locales ===');
const chickenWord = { ro: 'pui', en: 'chicken', it: 'pollo', de: 'Hähnchen', fr: 'poulet', es: 'pollo', pt: 'frango' };
for (const [lc, w] of Object.entries(chickenWord)) {
  const r = q(lc, w);
  check(`[${lc}] "${w}" → chicken recipes (has 9 & 187)`, r.includes(9) && r.includes(187), r.slice(0, 12));
}

console.log('\n=== POSITIVE — common ingredient (potato) across locales ===');
const potatoWord = { ro: 'cartofi', en: 'potatoes', it: 'patate', de: 'Kartoffeln', fr: 'pommes de terre', es: 'patatas', pt: 'batatas' };
for (const [lc, w] of Object.entries(potatoWord)) {
  const r = q(lc, w);
  check(`[${lc}] "${w}" → potato recipes (has 20 & 32)`, r.includes(20) && r.includes(32), r.slice(0, 12));
}

console.log('\n=== POSITIVE — cuisine name search across locales ===');
const italyWord = { ro: 'Italia', en: 'Italy', it: 'Italia', de: 'Italien', fr: 'Italie', es: 'Italia', pt: 'Itália' };
for (const [lc, w] of Object.entries(italyWord)) {
  const r = q(lc, w);
  check(`[${lc}] "${w}" → Italian recipes (has 1 & 202)`, r.includes(1) && r.includes(202), r.slice(0, 12));
}

console.log('\n=== POSITIVE — AR / JA / KO (validated concepts) ===');
check('[ar] "دجاج" (chicken) → 9 & 187', q('ar', 'دجاج').includes(9) && q('ar', 'دجاج').includes(187), q('ar', 'دجاج').slice(0, 10));
check('[ja] "米" (rice) → has 5 (sushi)', q('ja', '米').includes(5), q('ja', '米').slice(0, 10));
check('[ko] "소고기" (beef) → has 23 (bibimbap)', q('ko', '소고기').includes(23), q('ko', '소고기').slice(0, 10));
check('[ar] "حمص" (chickpeas) → has 24', q('ar', 'حمص').includes(24), q('ar', 'حمص').slice(0, 10));

console.log('\n=== POSITIVE — filters (meal / cuisine / time / combined) ===');
check('filter meal=breakfast (has 15 & 44)', (() => { const r = q('en', '', { meal: 'breakfast' }); return r.includes(15) && r.includes(44); })(), '');
check('filter cuisine=italy (has 1 & 26)', (() => { const r = q('en', '', { cuisine: 'italy' }); return r.includes(1) && r.includes(26); })(), '');
check('filter maxTime=15 (all ≤15)', (() => { const r = searchRecipes(perLocale.en, '', { maxTime: 15 }); return r.length > 0 && r.every(e => e.time <= 15); })(), '');
check('combined cuisine=italy + meal=dessert (has 202)', q('it', '', { cuisine: 'italy', meal: 'dessert' }).includes(202), '');
check('combined text+filter: "pollo" + cuisine=india', (() => { const r = q('it', 'pollo', { cuisine: 'india' }); return r.includes(9) && r.every(id => taxonomy[id].cuisineId === 'india'); })(), '');

console.log('\n=== DIACRITICS ===');
check('[de] "Hähnchen" == "Hahnchen"', q('de', 'Hähnchen').includes(9) && q('de', 'Hahnchen').includes(9), '');
check('[ro] "Italia" == "italia"', q('ro', 'Italia').includes(1) && q('ro', 'italia').includes(1), '');

// A returned recipe whose NAME contains the term is a legitimate match (e.g.
// "Chicken Paprikash" for "chicken"). The precision property is that a recipe
// is never returned *merely* because a derived-product line (stock/coconut
// milk/vinegar) was mis-tagged as the base — i.e. no INGREDIENT-tier leak. So
// we exclude name-matchers and assert nothing remains.
console.log('\n=== NEGATIVE (precision — BLOCKING) ===');
const nameMatchers = (lc, term) => { const nq = pwNorm(term); return new Set(perLocale[lc].recipes.filter(e => e.hayName.includes(nq)).map(e => e.id)); };
function negative(label, lc, term, badSet) {
  const r = new Set(q(lc, term)); const nm = nameMatchers(lc, term);
  const bad = [...badSet].filter(id => r.has(id) && !nm.has(id));
  check(label, bad.length === 0, `INGREDIENT-tier leak: ${bad.slice(0, 8)}`);
}
negative('"chicken" ↛ stock-only (ingredient tier)', 'en', 'chicken', stockNotChicken);
negative('"milk" ↛ coconut-milk-only (ingredient tier)', 'en', 'milk', coconutNotMilk);
negative('"rice" ↛ rice-vinegar-only (ingredient tier)', 'en', 'rice', vinegarNotRice);
negative('[it] "pollo" ↛ stock-only (ingredient tier)', 'it', 'pollo', stockNotChicken);
negative('[de] "Kartoffeln" ↛ non-potato (sanity)', 'de', 'Kartoffeln', setOf(t => !t.ingredientIds.includes('potato')));

console.log(`\n──────── ${pass} passed, ${fail} failed ────────`);
if (fail) { console.log('\nFAILURES:'); for (const f of fails) console.log('  ✗ ' + f); process.exit(1); }
