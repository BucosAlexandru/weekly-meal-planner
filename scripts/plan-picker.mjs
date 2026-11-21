// scripts/plan-picker.mjs
// Deterministic weekly-plan recipe picker, extracted from generate-content.mjs
// (PL-001) so tests can simulate any MENU_WEEK without regenerating 10k pages.
// generate-content.mjs is the only production caller; behaviour is unchanged
// apart from the shared main-meal predicate (public/js/meal-category.js).
import { isMainMealCandidate } from '../public/js/meal-category.js';

// Recipes that are never a lunch/dinner main and must not land in a plan:
// desserts (Tiramisu, Papanași…), breakfast items, snacks, appetizers, sides,
// breads. Salads stay eligible — they ARE the meal in the Mediterranean /
// summer-light plans. Same predicate as the app's runtime guard (which passes
// allowSalad: false) — see public/js/meal-category.js.
export const isMainMealDefault = r => isMainMealCandidate(r, { allowSalad: true });

export const PLAN_PICK = {
  // Cuisine-based themes → pick from recipes whose origin is in the list.
  mediteranean:       { cuisines: ['Italy','Greece','France','Spain','Morocco','Lebanon','Turkey','Tunisia','Portugal','Israel','Cyprus','Algeria','Egypt'] },
  asia:               { cuisines: ['Japan','South Korea','North Korea','Vietnam','Thailand','India','Indonesia','China','Malaysia','Philippines','Cambodia','Singapore','Sri Lanka','Nepal','Pakistan'] },
  'est-european':     { cuisines: ['Russia','Georgia','Hungary','Poland','Romania','Ukraine','Moldova','Bulgaria','Czech Republic','Lithuania','Latvia','Estonia','Serbia','Croatia','Bosnia and Herzegovina','Slovenia','Armenia'] },
  latin:              { cuisines: ['Mexico','Peru','Brazil','Cuba','Argentina','Colombia','Venezuela','El Salvador','Chile','Ecuador','Guatemala','Dominican Republic'] },
  'iarna-confort':    { cuisines: ['France','Russia','Georgia','Hungary','Poland','Germany','Romania','Ukraine','Czech Republic','Switzerland','Belgium','Netherlands','Finland','Sweden','Norway','Denmark','United Kingdom','Ireland','Italy','Austria'] },
  'duminica-familie': { cuisines: ['France','Italy','Spain','Greece','United Kingdom','USA','Portugal','Morocco','Germany','Belgium'] },
  // Attribute-based themes.
  'tur-mondial':      { diverse: true },               // one recipe per distinct country
  vegetarian:         { tags: ['vegetarian','vegan'] },
  rapid:              { tags: ['quick'] },
  'vara-usoara':      { tags: ['healthy'] },
  // buget: left to its own isBudget slice (already automatic from budgetRecipes).
};

// FNV-1a 32-bit — small, fast, deterministic string hash for seeded ordering.
export function planHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Stable per-plan ordering: shuffle-like but reproducible (seed = plan id + recipe id).
export const planSeedSort = (planId, arr, salt = '') =>
  arr.slice().sort((a, b) => planHash(planId + salt + ':' + a.id) - planHash(planId + salt + ':' + b.id));


export function autoPlanMeals(plan, { week, recipes, budgetRecipes, recipesMeta, isMainMeal = isMainMealDefault }) {
  const sel = PLAN_PICK[plan.id];
  // Rotation-aware seed: same plan, different week ⇒ different picks.
  const seed = plan.id + 'w' + week;
  const originEn = r => (r.origin?.en || r.origin?.ro || '').trim();
  const tagsOf   = r => (recipesMeta?.[r.id]?.tags) || [];
  // Budget rotates from its own cheaper corpus; everything else from recipes.
  const topupSrc = plan.isBudget ? budgetRecipes : recipes;

  let pool;
  if (plan.isBudget) {
    pool = budgetRecipes.filter(isMainMeal);
  } else if (!sel) {
    return null;
  } else if (sel.diverse) {
    const seen = new Set(); pool = [];
    for (const r of planSeedSort(seed, recipes)) {
      const o = originEn(r);
      if (o && isMainMeal(r) && !seen.has(o)) { seen.add(o); pool.push(r); }
    }
  } else if (sel.cuisines) {
    pool = recipes.filter(r => isMainMeal(r) && sel.cuisines.includes(originEn(r)));
  } else if (sel.tags) {
    pool = recipes.filter(r => isMainMeal(r) && tagsOf(r).some(t => sel.tags.includes(t)));
  } else {
    pool = recipes.filter(isMainMeal);
  }
  pool = planSeedSort(seed, pool);

  // Safety: guarantee 14 distinct meals even if a pool is short — top up
  // deterministically from the corpus (budget stays within budget recipes),
  // still excluding non-meal categories so no dessert slips in as filler.
  if (pool.length < 14) {
    const have = new Set(pool.map(r => r.id));
    for (const r of planSeedSort(seed, topupSrc, '#')) {
      if (!have.has(r.id) && isMainMeal(r)) { pool.push(r); have.add(r.id); }
      if (pool.length >= 14) break;
    }
  }
  // Small corpus (e.g. the budget set): once the distinct top-up is exhausted,
  // cycle the available recipes so all 14 slots are filled instead of leaving
  // empty days. Repeats are unavoidable below 14 distinct recipes and vanish
  // as the set grows.
  if (pool.length && pool.length < 14) {
    const base = pool.slice();
    for (let i = 0; pool.length < 14; i++) pool.push(base[i % base.length]);
  }
  // Weekend plans cover only Saturday + Sunday → 2 lunches + 2 dinners.
  const nDays = plan.weekend ? 2 : 7;
  // Single selection → derive both display names and recipe IDs from the
  // SAME picked recipes, so "Open in app" (which consumes the IDs) loads
  // exactly the meals this page renders (which consumes the names).
  const picked = pool.slice(0, nDays * 2).filter(r => r.name?.en || r.name?.ro);
  const names  = picked.map(r => r.name?.en || r.name?.ro);
  const ids    = picked.map(r => r.id);
  return {
    lunches:  names.slice(0, nDays), dinners:   names.slice(nDays, nDays * 2),
    lunchIds: ids.slice(0, nDays),   dinnerIds: ids.slice(nDays, nDays * 2),
  };
}

