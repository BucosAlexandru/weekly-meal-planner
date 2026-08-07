#!/usr/bin/env node
/**
 * validate-budget-recipes.mjs — strict quality gate for budget recipes.
 *
 * Enforces the Phase-1 quality contract (docs/ai/BUDGET_RECIPES_AUDIT.md) on the
 * EXPORTED (app-facing) budget recipe objects. It is intentionally strict — the
 * legacy file is EXPECTED to fail; do NOT weaken the rules to make it pass.
 *
 * Target schema (post-rebuild, "fix the mapping" — metadata is self-contained):
 *   { id, name{14}, origin{14}, category{14}, servings, time (total minutes),
 *     costRon, nutrition{cal,prot,carb,fat,fib}, tags[], ingredients{14:[str]},
 *     howIsMade{14:str} }
 *
 * Ingredient EN lines must round-trip through parseIngredient() with a real
 * quantity (except seasonings that are legitimately "to taste").
 *
 * Run:  node scripts/validate-budget-recipes.mjs
 * Exit: 0 = all pass, 1 = one or more errors.
 */
import { parseIngredient } from '../public/js/shopping-list.js';

const mod = await import('../public/js/recipes-budget.js');
const RECIPES = mod.recipes || mod.default || [];

const LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko'];
const ALLOWED_TAGS = new Set(['quick','budget','vegetarian','vegan','high-protein','family','healthy','spicy','one-pot']);

// Ingredients that may legitimately carry no numeric quantity (EN name test).
const SEASONING = /\b(salt|pepper|black pepper|white pepper|seasoning|spices?|mixed herbs|herbs|to taste)\b/i;
// Known legacy boilerplate — instructions that match are rejected outright.
const BOILERPLATE = [
  /cook over medium heat using simple methods/i,
  /prep the ingredients\.\.?\s*cook/i,
];

// Plausibility ranges (per serving where relevant).
const R = {
  servings:  [1, 8],
  timeTotal: [5, 240],
  costRon:   [0.5, 40],      // budget: a week <150 RON for 2 ⇒ ~11 RON/serving avg
  cal:  [50, 2000], prot: [0, 150], carb: [0, 300], fat: [0, 200], fib: [0, 100],
  ingredients: [3, 15],
  howIsMadeMinChars: 150,
  howIsMadeMinSentences: 3,
};

const errors = [];   // { id, code, msg }
const add = (id, code, msg) => errors.push({ id, code, msg });

const isNum = v => typeof v === 'number' && Number.isFinite(v);
const inRange = (v, [lo, hi]) => isNum(v) && v >= lo && v <= hi;
const allLangs = obj => obj && typeof obj === 'object' && LANGS.every(l => typeof obj[l] === 'string' && obj[l].trim());
const sentences = s => (String(s).match(/[.!?。！？]/g) || []).length;

for (const r of RECIPES) {
  const id = r?.id || '(no-id)';

  // ── identity + translations ──
  if (!r?.id || typeof r.id !== 'string') add(id, 'missing-id', 'id missing or not a string');
  if (!allLangs(r?.name))   add(id, 'missing-translation', 'name missing one or more of 14 languages');
  if (!allLangs(r?.origin)) add(id, 'missing-translation', 'origin missing one or more of 14 languages');

  // ── numeric metadata (self-contained per the mapping fix) ──
  if (!inRange(r?.servings, R.servings)) add(id, 'invalid-servings', `servings=${r?.servings} (want ${R.servings.join('–')})`);
  // Canonical time is a NUMBER of total minutes (prep+cook), matching main
  // recipes (recipesMeta[id].time). mk() emits s.prep + s.cook.
  if (!isNum(r?.time) || !inRange(r.time, R.timeTotal))
    add(id, 'invalid-time', `time=${JSON.stringify(r?.time)} (expected finite total minutes in ${R.timeTotal[0]}–${R.timeTotal[1]})`);
  if (!inRange(r?.costRon, R.costRon)) add(id, 'invalid-cost', `costRon=${r?.costRon} (want ${R.costRon.join('–')})`);
  const n = r?.nutrition;
  if (!n || !inRange(n.cal, R.cal) || !inRange(n.prot, R.prot) || !inRange(n.carb, R.carb) || !inRange(n.fat, R.fat) || !inRange(n.fib, R.fib))
    add(id, 'invalid-nutrition', `nutrition=${JSON.stringify(n)}`);

  // ── tags ──
  const tags = Array.isArray(r?.tags) ? r.tags : [];
  if (!tags.length) add(id, 'invalid-tags', 'no tags');
  const badTags = tags.filter(t => !ALLOWED_TAGS.has(t));
  if (badTags.length) add(id, 'invalid-tags', `tags outside vocabulary: ${badTags.join(', ')}`);

  // ── ingredients (structure + parseable EN with real quantities) ──
  if (!r?.ingredients || !LANGS.every(l => Array.isArray(r.ingredients[l]))) {
    add(id, 'missing-translation', 'ingredients missing one or more of 14 language arrays');
  } else {
    const en = r.ingredients.en;
    if (!inRange(en.length, R.ingredients)) add(id, 'invalid-structure', `${en.length} ingredients (want ${R.ingredients.join('–')})`);
    // every language array must be the same length as EN (aligned translations)
    for (const l of LANGS) {
      if (r.ingredients[l].length !== en.length) { add(id, 'missing-translation', `ingredients[${l}] length ${r.ingredients[l].length} != en ${en.length}`); break; }
    }
    en.forEach((line, i) => {
      const p = parseIngredient(line);
      if (!p) { add(id, 'unparseable-ingredient', `EN line #${i+1} unparseable: "${line}"`); return; }
      const seasoning = SEASONING.test(line) || SEASONING.test(p.name || '');
      if (p.qty == null && !seasoning) add(id, 'vague-quantity', `EN line #${i+1} has no quantity: "${line}"`);
    });
  }

  // ── instructions ──
  if (!allLangs(r?.howIsMade)) {
    add(id, 'missing-translation', 'howIsMade missing one or more of 14 languages');
  } else {
    const en = r.howIsMade.en;
    if (en.length < R.howIsMadeMinChars) add(id, 'insufficient-instructions', `howIsMade(en) only ${en.length} chars`);
    if (sentences(en) < R.howIsMadeMinSentences) add(id, 'insufficient-instructions', `howIsMade(en) < ${R.howIsMadeMinSentences} sentences`);
    if (/\.\./.test(en)) add(id, 'insufficient-instructions', 'howIsMade(en) contains ".." join artifact');
    if (BOILERPLATE.some(re => re.test(en))) add(id, 'boilerplate', 'howIsMade(en) matches known boilerplate');
  }
}

// ── cross-recipe checks ──
const seenId = new Map(), seenName = new Map(), seenSteps = new Map();
for (const r of RECIPES) {
  const id = r?.id || '(no-id)';
  if (seenId.has(id)) add(id, 'duplicate-id', `duplicate id (also ${seenId.get(id)})`); else seenId.set(id, id);
  for (const l of ['ro','en']) {
    const nm = r?.name?.[l];
    if (nm) { const k = l+':'+nm.toLowerCase(); if (seenName.has(k)) add(id, 'duplicate-name', `duplicate ${l} name "${nm}" (also ${seenName.get(k)})`); else seenName.set(k, id); }
  }
  const steps = r?.howIsMade?.en;
  if (steps) { if (seenSteps.has(steps)) add(id, 'duplicate-instructions', `identical howIsMade(en) as ${seenSteps.get(steps)}`); else seenSteps.set(steps, id); }
}

// ── report ──
const byCode = {};
for (const e of errors) (byCode[e.code] ||= []).push(e);
const failing = new Set(errors.map(e => e.id));

console.log(`\nBudget recipe validation — ${RECIPES.length} recipes\n${'='.repeat(48)}`);
if (!errors.length) {
  console.log('✅ ALL PASS — every budget recipe meets the quality contract.');
  process.exit(0);
}
console.log(`❌ ${errors.length} errors across ${failing.size}/${RECIPES.length} recipes.\n`);
console.log('By error type:');
for (const [code, list] of Object.entries(byCode).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${code.padEnd(24)} ${String(list.length).padStart(4)}   e.g. ${list[0].id}: ${list[0].msg}`.slice(0, 160));
}
console.log(`\nExit 1 (strict gate). Fix data — do not weaken this validator.`);
process.exit(1);
