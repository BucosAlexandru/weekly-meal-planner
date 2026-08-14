// Phase 3A — structural validation of the FULL generated taxonomy.
//   node scripts/migrate/validate-full.mjs
// 0 errors required. Never weakened to pass.

import { recipes } from '../../public/js/recipes.js';
import { CUISINE_IDS } from '../taxonomy/cuisines.mjs';
import { MEAL_TYPE_SET } from '../taxonomy/meal-types.mjs';
import { ALIAS_LOCALES } from '../taxonomy/ingredients.mjs';
import { buildTaxonomy } from './build-taxonomy.mjs';

export function validateFull() {
  const { registry, taxonomy } = buildTaxonomy();
  const errors = [];
  const recipeIds = new Set(recipes.map(r => r.id));

  // every real recipe is taxonomized
  for (const id of recipeIds) if (!taxonomy[id]) errors.push(`recipe ${id} missing from taxonomy`);
  if (Object.keys(taxonomy).length !== recipeIds.size) errors.push(`taxonomy has ${Object.keys(taxonomy).length} recipes, expected ${recipeIds.size}`);

  for (const [rid, t] of Object.entries(taxonomy)) {
    if (!recipeIds.has(Number(rid))) errors.push(`taxonomy references non-existent recipe ${rid}`);
    if (!t.cuisineId || !CUISINE_IDS.has(t.cuisineId)) errors.push(`recipe ${rid} bad cuisineId '${t.cuisineId}'`);
    if (!t.mealType || !MEAL_TYPE_SET.has(t.mealType)) errors.push(`recipe ${rid} bad mealType '${t.mealType}'`);
    if (!Array.isArray(t.ingredientIds) || t.ingredientIds.length === 0) errors.push(`recipe ${rid} has no ingredientIds`);
    for (const ing of (t.ingredientIds || [])) {
      if (!registry.has(ing)) errors.push(`recipe ${rid} references unknown concept '${ing}'`);
    }
    if (new Set(t.ingredientIds).size !== t.ingredientIds.length) errors.push(`recipe ${rid} has duplicate ingredientIds`);
  }

  // every concept has at least one usable (validated/candidate) alias somewhere
  for (const [id, e] of registry) {
    const hasAny = ALIAS_LOCALES.some(lc => { const a = e.aliases?.[lc]; return a && (a.tier === 'VALIDATED' || a.tier === 'CANDIDATE') && a.text.length; });
    if (!hasAny) errors.push(`concept '${id}' has no usable alias in any locale`);
  }

  return { errors, stats: { recipes: Object.keys(taxonomy).length, concepts: registry.size } };
}

if (process.argv[1]) {
  const { errors, stats } = validateFull();
  if (errors.length) {
    console.error(`✗ FULL taxonomy validation FAILED (${errors.length}):`);
    for (const e of errors.slice(0, 40)) console.error('  • ' + e);
    process.exit(1);
  }
  console.log(`✓ FULL taxonomy valid: ${stats.recipes} recipes, ${stats.concepts} concepts, 0 structural errors.`);
}
