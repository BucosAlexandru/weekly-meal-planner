// tests/meal-category.test.mjs — PL-001 regression suite.
// Guards the shared lunch/dinner predicate (public/js/meal-category.js) used by
// the planner (app.js) and the SEO weekly-plan generator (plan-picker.mjs).
//
// Run: node --test tests/meal-category.test.mjs
//
// Anti-tautology rule: the 52-week checks do NOT ask the predicate whether it
// made mistakes. They use an INDEPENDENT oracle (category keywords + tipType)
// and prove the oracle has teeth by running it against the legacy guard too.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import { PLAN_MEALS } from '../public/js/plan-meals.generated.js';
import {
  isMainMealCandidate, mealClassOf, filterMainMeals, NON_MAIN_OVERRIDES,
} from '../public/js/meal-category.js';
import { autoPlanMeals } from '../scripts/plan-picker.mjs';

const APP = { allowSalad: false };
const GEN = { allowSalad: true };

// ── Independent oracle ──────────────────────────────────────────────────────
// Flags anything that LOOKS like a non-main from its raw data, without using
// meal-category.js. Deliberately broader than the predicate.
const STD_NON_MAIN = new Set(['dessert', 'breakfast', 'snack', 'appetizer', 'side dish']);
const NON_MAIN_RX = /(dessert|cake|tart\b|pudding|cookie|biscuit|doughnut|custard|sweet|bread|muesli|scone|\bbuns?\b|snack|breakfast|side dish|street food|pancake)/i;
const oracleNonMain = r => {
  const cat = (r.category?.en || '').trim();
  return r.tipType === 'dessert' || STD_NON_MAIN.has(cat.toLowerCase()) || NON_MAIN_RX.test(cat);
};
const oracleSalad = r => /\bsalad\b/i.test(r.category?.en || '');

// Oracle hits that are reviewed, documented full meals (PL-001 doc):
// keyword matched ("pancake", "bread", "buns") but the dish is a lunch/dinner.
const REVIEWED_MAINS = new Map([
  [251, 'Haemul Pajeon'], [597, 'Murtabak'], [610, 'Fattah'],
  [627, 'Pirozhki'], [645, 'Placki Ziemniaczane'],
]);
const isOracleViolation = r => oracleNonMain(r) && !(REVIEWED_MAINS.get(r.id) === r.name?.en);

const LEGACY_SET = new Set(['Dessert', 'Breakfast', 'Snack', 'Appetizer', 'Side dish']);
const legacyGen = r => !LEGACY_SET.has(r.category?.en || '');

const byId = new Map(recipes.map(r => [r.id, r]));
const PLANS = Object.values(PLAN_MEALS);
// Published week at the time of PL-001 (2026-W47 → rotation index 150).
const BASE_WEEK = 150;
const WEEKS = Array.from({ length: 52 }, (_, i) => BASE_WEEK + i);

function simulate(week, isMainMeal) {
  const out = [];
  for (const p of PLANS) {
    const m = autoPlanMeals(p, { week, recipes, budgetRecipes, recipesMeta, isMainMeal });
    if (!m) continue;
    const src = p.isBudget ? budgetRecipes : recipes;
    const find = id => src.find(r => r.id === id);
    m.lunchIds.forEach(id => out.push({ plan: p.id, slot: 'lunch', r: find(id) }));
    m.dinnerIds.forEach(id => out.push({ plan: p.id, slot: 'dinner', r: find(id) }));
  }
  return out;
}

// ── 1. Unit tests: predicate ────────────────────────────────────────────────
test('unit: tipType dessert is never a main, whatever the category says', () => {
  const r = { id: 99901, name: { en: 'X' }, category: { en: 'Dinner' }, tipType: 'dessert' };
  assert.equal(mealClassOf(r), 'dessert');
  assert.equal(isMainMealCandidate(r, APP), false);
  assert.equal(isMainMealCandidate(r, GEN), false);
});

test('unit: category match ignores case and whitespace', () => {
  for (const en of ['Side dish', 'Side Dish', '  side   DISH ', 'SNACK', 'breakfast', 'Appetizer', 'dessert']) {
    const r = { id: 99902, name: { en: 'X' }, category: { en }, tipType: 'veg' };
    assert.equal(isMainMealCandidate(r, GEN), false, en);
  }
});

test('unit: overrides match only id AND English name together', () => {
  const real = { id: 661, name: { en: 'Ruisleipä' }, category: { en: 'Dense rye bread' }, tipType: 'def' };
  assert.equal(mealClassOf(real), 'side');
  const reusedId = { ...real, name: { en: 'Some budget stew' } };
  assert.equal(mealClassOf(reusedId), 'main');
});

test('unit: salads — excluded in the app, allowed in the generator', () => {
  for (const en of ['Salad', 'salad', 'Festive mayonnaise salad']) {
    const r = { id: 99903, name: { en: 'X' }, category: { en }, tipType: 'salad' };
    assert.equal(mealClassOf(r), 'salad', en);
    assert.equal(isMainMealCandidate(r, APP), false, en);
    assert.equal(isMainMealCandidate(r, GEN), true, en);
  }
});

test('unit: unknown / new / missing categories stay eligible', () => {
  const cases = [
    { id: 99904, name: { en: 'A' }, category: { en: 'Brand-new category' }, tipType: 'meat' },
    { id: 99905, name: { en: 'B' }, category: { en: '' }, tipType: 'veg' },
    { id: 99906, name: { en: 'C' }, tipType: 'fish' },
    { id: 99907, name: { en: 'D' }, category: null },
  ];
  for (const r of cases) assert.equal(isMainMealCandidate(r, APP), true, r.name.en);
  assert.equal(isMainMealCandidate(null, APP), true);
});

test('unit: filterMainMeals falls back to the full pool below 2 mains', () => {
  const main = { id: 1, name: { en: 'M' }, category: { en: 'Dinner' } };
  const main2 = { id: 2, name: { en: 'M2' }, category: { en: 'Lunch' } };
  const dessert = { id: 3, name: { en: 'D' }, category: { en: 'Dessert' }, tipType: 'dessert' };
  assert.deepEqual(filterMainMeals([main, main2, dessert]), [main, main2]);
  assert.deepEqual(filterMainMeals([main, dessert]), [main, dessert]);  // only 1 main → fallback
  assert.deepEqual(filterMainMeals([dessert]), [dessert]);
  assert.deepEqual(filterMainMeals(undefined), []);
});

// ── 2. Corpus-wide tests ────────────────────────────────────────────────────
test('corpus: every override still points at the recipe it was written for', () => {
  for (const [id, o] of Object.entries(NON_MAIN_OVERRIDES)) {
    const r = byId.get(Number(id));
    assert.ok(r, `override id ${id} (${o.name}) missing from recipes.js`);
    assert.equal(r.name?.en, o.name, `override id ${id} renamed — re-review it`);
  }
});

test('corpus: every Dessert-category and dessert-tipType recipe is excluded', () => {
  const bad = recipes.filter(r => (r.category?.en === 'Dessert' || r.tipType === 'dessert') && isMainMealCandidate(r, GEN));
  assert.deepEqual(bad.map(r => r.name.en), []);
});

test('corpus: predicate and independent oracle agree except reviewed cases', () => {
  const oracleOnly = [], predOnly = [];
  for (const r of recipes) {
    const o = oracleNonMain(r) || oracleSalad(r);
    const p = !isMainMealCandidate(r, APP);
    if (o && !p) oracleOnly.push(r.id);
    if (p && !o) predOnly.push(r.id);
  }
  // Oracle-only must be exactly the reviewed full meals.
  assert.deepEqual(oracleOnly.sort((a, b) => a - b), [...REVIEWED_MAINS.keys()].sort((a, b) => a - b));
  // Predicate-only must be explicit, documented overrides (no hidden logic).
  for (const id of predOnly) assert.ok(NON_MAIN_OVERRIDES[id], `unexplained exclusion: ${id}`);
});

test('corpus: the 11 borderline recipes are classified as documented', () => {
  const expected = {
    626: 'breakfast', 644: 'snack', 617: 'breakfast', 487: 'snack', 632: 'snack', 642: 'snack', 655: 'snack',
    621: 'main', 627: 'main', 251: 'main', 645: 'main',
  };
  for (const [id, cls] of Object.entries(expected)) assert.equal(mealClassOf(byId.get(Number(id))), cls, id);
});

test('corpus: budget corpus is untouched by the new guard', () => {
  assert.equal(budgetRecipes.filter(r => !isMainMealCandidate(r, GEN)).length,
               budgetRecipes.filter(r => !legacyGen(r)).length);
});

test('corpus: app pool size is sane (not collapsed, not unfiltered)', () => {
  const n = recipes.filter(r => isMainMealCandidate(r, APP)).length;
  assert.ok(n > 400 && n < recipes.length - 150, `app pool = ${n}`);
});

// ── 3. 52 simulated weeks of published plans ────────────────────────────────
test('52 weeks: no dessert, bread, breakfast, snack or side at lunch/dinner', () => {
  const hits = [];
  for (const w of WEEKS) for (const s of simulate(w, undefined)) {
    assert.ok(s.r, `plan ${s.plan} week ${w} picked an id that does not resolve`);
    if (isOracleViolation(s.r)) hits.push(`w${w} ${s.plan} ${s.slot}: ${s.r.name.en} [${s.r.category?.en}]`);
  }
  assert.deepEqual(hits, []);
});

test('52 weeks: the oracle catches the legacy guard (proves it has teeth)', () => {
  let legacyHits = 0;
  for (const w of WEEKS) for (const s of simulate(w, legacyGen)) if (isOracleViolation(s.r)) legacyHits++;
  console.log(`  legacy guard: ${legacyHits} wrong picks over 52 weeks`);
  assert.ok(legacyHits > 100, `legacy hits = ${legacyHits}`);
});

test('52 weeks: every plan still fills all its slots with distinct recipes', () => {
  for (const w of WEEKS) for (const p of PLANS) {
    if (p.isBudget) continue;
    const m = autoPlanMeals(p, { week: w, recipes, budgetRecipes, recipesMeta });
    const n = p.weekend ? 2 : 7;
    assert.equal(m.lunchIds.length, n, `${p.id} w${w} lunches`);
    assert.equal(m.dinnerIds.length, n, `${p.id} w${w} dinners`);
    assert.equal(new Set([...m.lunchIds, ...m.dinnerIds]).size, n * 2, `${p.id} w${w} duplicates`);
  }
});

test('52 weeks: generator keeps salads available to salad-friendly plans', () => {
  let salads = 0;
  for (const w of WEEKS) for (const s of simulate(w, undefined)) if (oracleSalad(s.r)) salads++;
  assert.ok(salads > 0, 'salads never picked — allowSalad wiring broken');
});

test('generator fallback: tiny corpus still fills 14 slots without non-mains', () => {
  const mk = (id, cat, tip = 'meat') => ({ id, name: { en: 'R' + id }, origin: { en: 'Nowhere' }, category: { en: cat }, tipType: tip });
  const corpus = [
    ...Array.from({ length: 5 }, (_, i) => mk(i + 1, 'Dinner')),
    ...Array.from({ length: 20 }, (_, i) => mk(i + 100, 'Dessert', 'dessert')),
  ];
  const plan = { id: 'mediteranean', weekend: false };  // cuisine filter matches nothing
  const m = autoPlanMeals(plan, { week: 0, recipes: corpus, budgetRecipes: [], recipesMeta: {} });
  const all = [...m.lunchIds, ...m.dinnerIds];
  assert.equal(all.length, 14);
  assert.ok(all.every(id => id < 100), 'a dessert was used as filler');
});
