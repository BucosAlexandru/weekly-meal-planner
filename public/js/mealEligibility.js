// Shared meal-slot eligibility — the ONLY place generator/runtime code may
// decide whether a recipe may fill a given slot. Consumed by both
// public/js/app.js (browser planner) and scripts/generate-content.mjs
// (static weekly-plan generation), so the two can never drift the way the
// old NON_MAIN_MEAL (app.js) / NON_MEAL_CATEGORIES (generate-content.mjs)
// denylists did.
//
// `recipe.mealSlots` (set in Stage 2D, see scripts/verify-meal-taxonomy.mjs)
// is the controlled taxonomy. `recipe.category` stays free-text display/SEO
// copy forever and must never be read here.
//
// HARD constraint only: pool membership. No caller may fall back past this
// boundary — if slot-eligibility leaves no candidates, that is the answer.

export const MEAL_SLOTS = Object.freeze([
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'side', 'drink',
]);

// lunch and dinner are independent slots (some recipes are lunch-eligible
// only — see Stage 2D counts) and must always be checked separately, never
// collapsed into one generic "main" test.
export function isEligibleForSlot(recipe, slot) {
  return !!recipe && Array.isArray(recipe.mealSlots) && recipe.mealSlots.includes(slot);
}

export function filterEligible(recipeList, slot) {
  return (recipeList || []).filter(r => isEligibleForSlot(r, slot));
}

// d{n}l / d{n}c input-id convention used throughout the planner UI
// (d1l = day 1 lunch, d1c = day 1 "cină" = dinner). Centralizing this tiny
// mapping here means both the reroll and picker paths derive the slot the
// same way they already derive it for analytics (`inputId.endsWith('l')`).
export function slotForInputId(inputId) {
  return inputId.endsWith('l') ? 'lunch' : 'dinner';
}
