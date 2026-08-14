// Phase 2B — 20-recipe pilot curation (MAIN recipes only).
//
// Maps recipe id -> canonical taxonomy. This is the ONLY hand-curated
// per-recipe data in Phase 2; the remaining 205 recipes are deliberately not
// canonicalised yet.
//
// ingredientIds describe ingredient CONCEPTS (see ingredients.mjs), never
// quantities or prep prose. Minor seasonings/garnishes present only for taste
// (plain salt, water, sugar, baking powder, vanilla, black pepper as
// seasoning) are intentionally omitted from the pilot — they add search noise
// without helping a user find a dish. Principal, searchable ingredients only.
//
// Selection rationale (why these 20) lives in the Phase 2 report, not here.
// cuisineId must exist in cuisines.mjs, mealType in meal-types.mjs, every
// ingredientId in ingredients.mjs, and every key must be a real recipe id —
// all enforced by validate.mjs.

export const PILOT = Object.freeze({
  // id: { cuisineId, mealType, ingredientIds }
  1:   { cuisineId: 'italy',          mealType: 'lunch',
         ingredientIds: ['spaghetti', 'guanciale', 'egg', 'pecorino', 'parmesan'] },
  5:   { cuisineId: 'japan',          mealType: 'dinner',
         ingredientIds: ['rice', 'nori', 'salmon', 'avocado', 'cucumber', 'soy_sauce', 'ginger'] },
  9:   { cuisineId: 'india',          mealType: 'dinner',
         ingredientIds: ['chicken', 'onion', 'tomato', 'ginger', 'garlic', 'cumin', 'coriander', 'chili', 'yogurt'] },
  13:  { cuisineId: 'mexico',         mealType: 'snack',
         ingredientIds: ['avocado', 'lime', 'onion', 'tomato', 'chili', 'coriander'] },
  15:  { cuisineId: 'usa',            mealType: 'breakfast',
         ingredientIds: ['flour', 'milk', 'egg', 'butter'] },
  20:  { cuisineId: 'united_kingdom', mealType: 'dinner',
         ingredientIds: ['white_fish', 'potato', 'flour'] },
  23:  { cuisineId: 'south_korea',    mealType: 'lunch',
         ingredientIds: ['rice', 'beef', 'zucchini', 'carrot', 'spinach', 'bean_sprouts', 'mushroom', 'egg', 'gochujang', 'sesame_oil', 'soy_sauce', 'garlic'] },
  24:  { cuisineId: 'syria',          mealType: 'snack',
         ingredientIds: ['chickpeas', 'tahini', 'lemon', 'garlic', 'olive_oil'] },
  25:  { cuisineId: 'lebanon',        mealType: 'side',
         ingredientIds: ['parsley', 'bulgur', 'tomato', 'spring_onion', 'mint', 'lemon', 'olive_oil'] },
  30:  { cuisineId: 'greece',         mealType: 'snack',
         ingredientIds: ['yogurt', 'cucumber', 'garlic', 'olive_oil', 'dill', 'lemon'] },
  32:  { cuisineId: 'hungary',        mealType: 'dinner',
         ingredientIds: ['beef', 'potato', 'onion', 'bell_pepper', 'paprika', 'tomato'] },
  35:  { cuisineId: 'turkey',         mealType: 'dessert',
         ingredientIds: ['phyllo', 'butter', 'walnut', 'pistachio', 'cinnamon', 'honey', 'lemon'] },
  40:  { cuisineId: 'poland',         mealType: 'dinner',
         ingredientIds: ['flour', 'egg', 'potato', 'white_cheese', 'onion', 'butter', 'bacon'] },
  44:  { cuisineId: 'israel',         mealType: 'breakfast',
         ingredientIds: ['olive_oil', 'onion', 'bell_pepper', 'garlic', 'cumin', 'paprika', 'chili', 'tomato', 'egg', 'parsley'] },
  65:  { cuisineId: 'peru',           mealType: 'appetizer',
         ingredientIds: ['white_fish', 'lime', 'onion', 'chili', 'garlic', 'ginger', 'coriander', 'corn', 'sweet_potato'] },
  112: { cuisineId: 'thailand',       mealType: 'lunch',
         ingredientIds: ['prawn', 'lemongrass', 'galangal', 'chili', 'mushroom', 'fish_sauce', 'lime', 'coriander', 'spring_onion'] },
  183: { cuisineId: 'japan',          mealType: 'lunch',
         ingredientIds: ['miso', 'ramen_noodles', 'pork', 'corn', 'butter', 'egg', 'nori', 'spring_onion', 'bean_sprouts'] },
  187: { cuisineId: 'mexico',         mealType: 'dinner',
         ingredientIds: ['chili', 'almond', 'peanut', 'tomato', 'onion', 'garlic', 'cinnamon', 'tortilla', 'chocolate', 'chicken'] },
  199: { cuisineId: 'italy',          mealType: 'dinner',
         ingredientIds: ['flour', 'tomato', 'mozzarella', 'basil', 'olive_oil'] },
  202: { cuisineId: 'italy',          mealType: 'dessert',
         ingredientIds: ['mascarpone', 'egg', 'coffee', 'chocolate'] },
});

export const PILOT_IDS = Object.freeze(Object.keys(PILOT).map(Number));
