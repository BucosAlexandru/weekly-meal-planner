# PL-001 — Main-meal guard for lunch/dinner slots

## Problem
Published weekly plans (and the interactive planner) put desserts, breads,
breakfast dishes, snacks and side dishes into lunch/dinner slots, in all 14
languages. In the 2026-W47 build: Leche Flan, Makowiec, Sernik, Pączki,
Bakewell Tart, Eton Mess, Basler Läckerli, Obi Non, Damper, Birchermüesli,
Kartoffelsalat, Gomen and more.

Root cause: both guards compared `category.en` against a fixed list by exact
string:
- `public/js/app.js` `getGenerationPool()` — `NON_MAIN_MEAL`
- `scripts/generate-content.mjs` — `NON_MEAL_CATEGORIES` / `isMainMeal`

They missed (A) casing drift ("Side Dish" ×8) and (B) ~90 newer recipes with
free-text categories ("Hanukkah jam doughnuts", "Dense rye bread").

## Fix
`public/js/meal-category.js` — one pure ESM module used by both runtimes:
- `mealClassOf(r)` → `main | salad | dessert | breakfast | snack | appetizer | side`
  1. `tipType === 'dessert'` (covers every Dessert-category recipe + free-text sweets);
  2. `NON_MAIN_OVERRIDES` — explicit, id+English-name pinned list (below);
  3. normalized (case/whitespace-insensitive) category; free-text "… salad" = salad.
  Unknown/missing category ⇒ `main` (eligible) — excluding is opt-in.
- `isMainMealCandidate(r, { allowSalad })` — app passes `false`, generator `true`
  (salads are the meal in Mediterranean / summer-light plans).
- `filterMainMeals(pool)` — the app's pool, falling back to the unfiltered pool
  when fewer than 2 mains remain (unchanged behaviour).

`scripts/plan-picker.mjs` — `PLAN_PICK`, the seeded ordering and
`autoPlanMeals()` moved out of `generate-content.mjs` unchanged (verified: with
the legacy predicate it reproduces the published W47 plans 10/10), so tests can
simulate any week. `recipes.js` is not modified.

## Borderline recipes — classification and reasoning
| Recipe | Class | Why |
|---|---|---|
| Blini (626) | breakfast | Yeast pancakes served with sour cream/caviar; 310 kcal; tea-time/breakfast dish, not a lunch main. |
| Pumpkin Scones (644) | snack | Sweet scones with jam & cream; 260 kcal. |
| Chechebsa (617) | breakfast | Ethiopian breakfast flatbread served with coffee. |
| Elote (487) | snack | Street-food corn on the cob; 250 kcal. |
| Scotch Egg (632) | snack | Picnic/pub snack. |
| Chiko Roll (642) | snack | Recipe itself describes it as an iconic fried snack. |
| Bourekas (655) | snack | Filled puff pastry, breakfast/snack in Israel; no protein main. |
| Buffalo Wings (621) | main (ambiguous) | Classic appetizer, but 1.2 kg wings for 4, 30 g protein — a legitimate dinner. Kept eligible (do not remove possible full meals). |
| Pirozhki (627) | main (ambiguous) | 400 g beef + 500 g dough for 4, 420 kcal; eaten as a meal. Kept eligible. |
| Haemul Pajeon (251) | main | Seafood pancake eaten as a shared main in Korean homes. |
| Placki Ziemniaczane (645) | main | 1 kg potatoes for 4, served as a Polish lunch main. |

Also excluded via overrides: breads Cornbread (624), Damper (641), Zopf (651),
Ruisleipä (661), Obi Non (685); Birchermüesli (650, breakfast).
Reviewed and kept as mains despite bread/pancake keywords: Murtabak (597),
Fattah (610). Ambiguous ones stay eligible on purpose; revisit if users report them.

## Tests — `node --test tests/meal-category.test.mjs` (CI step 6c)
17 tests: predicate units, corpus-wide checks, the 11 borderline cases, budget
corpus untouched, 52 simulated weeks, salad behaviour, unknown categories,
app fallback, generator top-up fallback.
The 52-week checks use an **independent oracle** (category keywords + tipType),
not the predicate, and prove the oracle catches the legacy guard:
- legacy guard: **779** wrong picks over 52 weeks → new guard: **0**.
- Browser: 30 generated weeks in the planner, 420 slots, 0 non-mains, no JS errors.

## SEO impact (W47, MENU_WEEK=150)
8 plans changed (asia, est-european, mediteranean, vegetarian, rapid,
iarna-confort, vara-usoara, duminica-familie) × 14 languages + 14 plan indexes
= 126 pages, plus `plan-meals.generated.js`. URLs, page count (10767), sitemap
URLs (10766), canonical, hreflang and JSON-LD unchanged (checked on all 126).

## Remaining risks
- New recipes with sweet/bread free-text categories but a non-dessert tipType
  need an override; the corpus test fails if an oracle hit is not reviewed.
- Overrides are pinned to id + English name; renaming one fails the test (intended).
