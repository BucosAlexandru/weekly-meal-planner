// Phase 2A — Strict taxonomy validation.
//
// Fails hard (throws) on any structural problem. Never weaken a check to make
// bad data pass — fix the data instead. Returns { errors, warnings, stats };
// callers throw when errors.length > 0.
//
// Enforced (hard errors):
//   1. duplicate canonical IDs        (cuisine / ingredient / meal-type)
//   2. unknown cuisine IDs            (pilot.cuisineId not in registry)
//   3. unknown meal types            (pilot.mealType not in registry)
//   4. unknown ingredient IDs        (pilot.ingredientIds not in registry)
//   5. missing taxonomy references   (a pilot recipe lacks cuisine/meal/ingredients)
//   6. references to nonexistent recipe IDs  (pilot key not a real recipe)
//   7. missing required locale aliases (ingredient/meal-type missing a locale)
//   8. every recipe's origin.en resolves to a known cuisineId (for pilot recipes)
//
// Reported (warnings, non-fatal):
//   - alias collisions: the same surface form maps to 2+ ingredientIds in one
//     locale (intentional for genuinely ambiguous names, e.g. "ají" / a generic
//     "fish", but surfaced so they are a conscious choice, not an accident).
//   - registry ingredients never used by any pilot recipe (dead entries).

import { ALIAS_LOCALES, INGREDIENTS, INGREDIENT_IDS } from './ingredients.mjs';
import { CUISINE_IDS, cuisineIdForOrigin } from './cuisines.mjs';
import { MEAL_TYPE_SET, MEAL_TYPE_LABELS, MEAL_TYPE_IDS } from './meal-types.mjs';
import { PILOT } from './pilot.mjs';

function dupKeys(rawObjectSourceKeys) {
  // JS object literals silently drop duplicate keys, so we cannot detect a
  // duplicate after the fact from Object.keys(). This helper is kept for
  // registries authored as arrays; ingredient/meal ids are object-literal
  // keyed (unique by construction) so we assert that invariant explicitly.
  const seen = new Set();
  const dups = [];
  for (const k of rawObjectSourceKeys) {
    if (seen.has(k)) dups.push(k);
    seen.add(k);
  }
  return dups;
}

export function validateTaxonomy({ recipes }) {
  const errors = [];
  const warnings = [];

  const recipeById = new Map(recipes.map(r => [r.id, r]));

  // ── 1. duplicate canonical IDs ──────────────────────────────────────────
  // Object-literal registries can't hold duplicate keys, but a duplicate in
  // the MEAL_TYPE_IDS array (authored separately from the label object) is
  // possible, so check it directly.
  const mtDups = dupKeys(MEAL_TYPE_IDS);
  if (mtDups.length) errors.push(`duplicate meal-type ids: ${mtDups.join(', ')}`);
  // Cross-check: every id in the MEAL_TYPE_IDS array has a label and vice-versa.
  for (const id of MEAL_TYPE_IDS) {
    if (!MEAL_TYPE_LABELS[id]) errors.push(`meal-type '${id}' listed in MEAL_TYPE_IDS but has no label`);
  }
  for (const id of Object.keys(MEAL_TYPE_LABELS)) {
    if (!MEAL_TYPE_SET.has(id)) errors.push(`meal-type label '${id}' not in MEAL_TYPE_IDS`);
  }

  // ── 7. missing required locale aliases (ingredients) ────────────────────
  for (const [id, aliases] of Object.entries(INGREDIENTS)) {
    for (const lc of ALIAS_LOCALES) {
      const arr = aliases[lc];
      if (!Array.isArray(arr) || arr.length === 0) {
        errors.push(`ingredient '${id}' missing alias for locale '${lc}'`);
      }
    }
  }
  // ── 7b. missing required locale labels (meal types) ─────────────────────
  for (const [id, labels] of Object.entries(MEAL_TYPE_LABELS)) {
    for (const lc of ALIAS_LOCALES) {
      if (!labels[lc] || !String(labels[lc]).trim()) {
        errors.push(`meal-type '${id}' missing label for locale '${lc}'`);
      }
    }
  }

  // ── pilot-level checks (2,3,4,5,6,8) ────────────────────────────────────
  const usedIngredients = new Set();
  for (const [rawId, tax] of Object.entries(PILOT)) {
    const id = Number(rawId);

    // 6. references to nonexistent recipe IDs
    const recipe = recipeById.get(id);
    if (!recipe) {
      errors.push(`pilot references recipe id ${id} which does not exist in recipes.js`);
      continue;
    }

    // 5. missing taxonomy references
    if (!tax.cuisineId) errors.push(`recipe ${id} missing cuisineId`);
    if (!tax.mealType) errors.push(`recipe ${id} missing mealType`);
    if (!Array.isArray(tax.ingredientIds) || tax.ingredientIds.length === 0) {
      errors.push(`recipe ${id} missing ingredientIds`);
    }

    // 2. unknown cuisine IDs
    if (tax.cuisineId && !CUISINE_IDS.has(tax.cuisineId)) {
      errors.push(`recipe ${id} has unknown cuisineId '${tax.cuisineId}'`);
    }
    // 8. curated cuisineId must match the recipe's actual origin.en mapping
    const originCuisine = cuisineIdForOrigin(recipe.origin?.en);
    if (!originCuisine) {
      errors.push(`recipe ${id} origin.en '${recipe.origin?.en}' has no cuisineId mapping`);
    } else if (tax.cuisineId && tax.cuisineId !== originCuisine) {
      errors.push(`recipe ${id} cuisineId '${tax.cuisineId}' != origin-derived '${originCuisine}'`);
    }

    // 3. unknown meal types
    if (tax.mealType && !MEAL_TYPE_SET.has(tax.mealType)) {
      errors.push(`recipe ${id} has unknown mealType '${tax.mealType}'`);
    }

    // 4. unknown ingredient IDs + dedupe within a recipe
    const seenIng = new Set();
    for (const ing of (tax.ingredientIds || [])) {
      if (!INGREDIENT_IDS.has(ing)) {
        errors.push(`recipe ${id} references unknown ingredientId '${ing}'`);
      } else {
        usedIngredients.add(ing);
      }
      if (seenIng.has(ing)) warnings.push(`recipe ${id} lists ingredient '${ing}' more than once`);
      seenIng.add(ing);
    }
  }

  // ── warning: alias collisions across ingredients (per locale) ───────────
  for (const lc of ALIAS_LOCALES) {
    const surface = new Map(); // normalized alias -> [ingredientIds]
    for (const [id, aliases] of Object.entries(INGREDIENTS)) {
      for (const a of aliases[lc]) {
        const key = a.toLowerCase();
        if (!surface.has(key)) surface.set(key, []);
        surface.get(key).push(id);
      }
    }
    for (const [a, ids] of surface) {
      if (ids.length > 1) warnings.push(`alias collision [${lc}] "${a}" -> ${ids.join(', ')}`);
    }
  }

  // ── warning: registry ingredients unused by the pilot ───────────────────
  for (const id of INGREDIENT_IDS) {
    if (!usedIngredients.has(id)) warnings.push(`ingredient '${id}' is in the registry but unused by the pilot`);
  }

  const stats = {
    cuisines: CUISINE_IDS.size,
    mealTypes: MEAL_TYPE_SET.size,
    ingredients: INGREDIENT_IDS.size,
    ingredientsUsedByPilot: usedIngredients.size,
    pilotRecipes: Object.keys(PILOT).length,
    aliasLocales: ALIAS_LOCALES.length,
  };

  return { errors, warnings, stats };
}
