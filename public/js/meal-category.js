// public/js/meal-category.js
// Single source of truth for "can this recipe fill a lunch/dinner slot?".
//
// Shared by the browser planner (public/js/app.js → getGenerationPool) and the
// static SEO generator (scripts/generate-content.mjs → autoPlanMeals), so the
// planner and the published weekly plans can never disagree. Pure ESM leaf
// module: no imports, no DOM, no Node APIs — loads as-is in both runtimes.
//
// Why not just compare `category.en` to a fixed list (the old guard):
//   (A) casing drift — "Side Dish" vs "Side dish" slipped through;
//   (B) ~90 newer recipes carry free-text descriptive categories
//       ("Hanukkah jam doughnuts", "Dense rye bread") that match no list.
// So the predicate layers three signals, most reliable first:
//   1. tipType === 'dessert' — curated on every recipe, and covers every
//      category "Dessert" recipe plus the free-text sweets;
//   2. explicit per-recipe overrides for breads / breakfast / snacks that
//      only a human can classify (NON_MAIN_OVERRIDES below, justified);
//   3. the normalized (case/whitespace-insensitive) category name.
// Recipes with no category, or an unknown one, stay ELIGIBLE: excluding is
// opt-in, so a new recipe is never silently dropped from every plan.

const norm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

// Normalized category.en → meal class. Anything not listed counts as a main.
const CATEGORY_CLASS = new Map([
  ['dessert', 'dessert'],
  ['breakfast', 'breakfast'],
  ['snack', 'snack'],
  ['appetizer', 'appetizer'],
  ['side dish', 'side'],
  ['salad', 'salad'],
]);

// Hand-classified recipes whose free-text category gives no usable signal.
// Keyed by main-corpus id AND pinned to the English name, so an id reused by
// another corpus (recipes-budget.js has its own id space) never matches.
// Borderline dishes that can legitimately be a full lunch/dinner (Buffalo
// Wings, Pirozhki, Haemul Pajeon, Placki Ziemniaczane) are deliberately NOT
// listed — see docs/ai/PL-001_MEAL_CATEGORY_GUARD.md for every decision.
export const NON_MAIN_OVERRIDES = Object.freeze({
  // Breads — served alongside a meal, never the meal itself.
  624: { name: 'Cornbread', cls: 'side' },
  641: { name: 'Damper', cls: 'side' },
  651: { name: 'Zopf', cls: 'side' },
  661: { name: 'Ruisleipä', cls: 'side' },
  685: { name: 'Obi Non', cls: 'side' },
  // Breakfast dishes.
  650: { name: 'Birchermüesli', cls: 'breakfast' },
  617: { name: 'Chechebsa', cls: 'breakfast' },
  626: { name: 'Blini', cls: 'breakfast' },
  // Snacks / tea-time / street snacks.
  644: { name: 'Pumpkin Scones', cls: 'snack' },
  487: { name: 'Elote', cls: 'snack' },
  632: { name: 'Scotch Egg', cls: 'snack' },
  642: { name: 'Chiko Roll', cls: 'snack' },
  655: { name: 'Bourekas', cls: 'snack' },
});

/**
 * Meal class of a recipe:
 * 'main' | 'salad' | 'dessert' | 'breakfast' | 'snack' | 'appetizer' | 'side'.
 */
export function mealClassOf(r) {
  if (!r) return 'main';
  if (r.tipType === 'dessert') return 'dessert';
  const o = NON_MAIN_OVERRIDES[r.id];
  if (o && (r.name?.en === o.name)) return o.cls;
  const cat = norm(r.category?.en);
  if (!cat) return 'main';
  const cls = CATEGORY_CLASS.get(cat);
  if (cls) return cls;
  // Free-text salads ("Festive mayonnaise salad") behave like category Salad.
  if (/\bsalad\b/.test(cat)) return 'salad';
  return 'main';
}

/**
 * True when the recipe may fill a lunch/dinner slot.
 * allowSalad: the SEO generator keeps salads (they ARE the meal in the
 * Mediterranean / summer-light plans); the interactive planner excludes them.
 */
export function isMainMealCandidate(r, { allowSalad = false } = {}) {
  const cls = mealClassOf(r);
  return cls === 'main' || (allowSalad && cls === 'salad');
}

/**
 * The planner's lunch/dinner pool: main-meal candidates only, but falls back
 * to the unfiltered pool when fewer than 2 candidates remain (e.g. a narrow
 * filter chip), so Generate never comes back empty.
 */
export function filterMainMeals(pool, { allowSalad = false } = {}) {
  const list = Array.isArray(pool) ? pool : [];
  const mainOnly = list.filter(r => isMainMealCandidate(r, { allowSalad }));
  return mainOnly.length >= 2 ? mainOnly : list;
}
