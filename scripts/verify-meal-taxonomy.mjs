// CI meal-slot taxonomy invariant.
//
//   node scripts/verify-meal-taxonomy.mjs
//
// Added alongside the Stage 2 (editorial taxonomy) rollout. Its entire job is
// to stop the original production bug — a recipe silently becoming eligible
// for a meal slot it was never reviewed for — from being able to reopen as
// the catalogue grows (225 -> 701 main recipes in under three months of this
// repo's history; nothing suggests that growth stops).
//
// `mealSlots` is the ONLY field generator code may read for slot eligibility
// (see CLAUDE.md). `category` stays free-text display/SEO copy forever —
// this script does not and must not read it for eligibility.
//
// Checks, each one independently fatal:
//   1. Every main recipe (public/js/recipes.js) and every budget recipe
//      (public/js/recipes-budget.js) carries a `mealSlots` array.
//   2. That array is non-empty.
//   3. Every value in it is one of the eight controlled slots.
//   4. No recipe id is duplicated within its own corpus (a copy/paste bug
//      would silently shadow one recipe's classification with another's).
//   5. The set of ids actually carrying `mealSlots` is exactly the set of
//      ids in the corpus — none missing, nothing stale left over from an id
//      that was renumbered or removed.

import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';

const MEAL_SLOT_ENUM = new Set([
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'side', 'drink',
]);

let errors = [];

function checkCorpus(label, items, idField = 'id') {
  const seenIds = new Set();
  for (const r of items) {
    const id = r[idField];
    const tag = `${label} id=${id} "${r.name?.en || r.name?.ro || '(unnamed)'}"`;

    if (seenIds.has(id)) errors.push(`${tag}: duplicate id within ${label}`);
    seenIds.add(id);

    if (!('mealSlots' in r)) { errors.push(`${tag}: missing mealSlots`); continue; }
    if (!Array.isArray(r.mealSlots) || r.mealSlots.length === 0) {
      errors.push(`${tag}: mealSlots is empty or not an array (${JSON.stringify(r.mealSlots)})`);
      continue;
    }
    for (const slot of r.mealSlots) {
      if (!MEAL_SLOT_ENUM.has(slot)) {
        errors.push(`${tag}: invalid mealSlots value "${slot}" (allowed: ${[...MEAL_SLOT_ENUM].join(', ')})`);
      }
    }
  }
  return seenIds;
}

const mainIds = checkCorpus('recipes.js', recipes);
const budgetIds = checkCorpus('recipes-budget.js', budgetRecipes);

console.log('Meal-slot taxonomy invariant:');
console.log(`  main recipes checked:   ${recipes.length} (distinct ids: ${mainIds.size})`);
console.log(`  budget recipes checked: ${budgetRecipes.length} (distinct ids: ${budgetIds.size})`);

const lunchOrDinner = r => Array.isArray(r.mealSlots) && (r.mealSlots.includes('lunch') || r.mealSlots.includes('dinner'));
const mainEligible = [...recipes, ...budgetRecipes].filter(lunchOrDinner).length;
console.log(`  total lunch/dinner-eligible: ${mainEligible} of ${recipes.length + budgetRecipes.length}`);

if (errors.length) {
  console.error(`\nFAILED: ${errors.length} taxonomy violation(s):`);
  for (const e of errors.slice(0, 50)) console.error('  - ' + e);
  if (errors.length > 50) console.error(`  ... and ${errors.length - 50} more`);
  process.exit(1);
}

console.log('\n✓ Meal-slot taxonomy OK — every recipe carries a valid mealSlots array.');
