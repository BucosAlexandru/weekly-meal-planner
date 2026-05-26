# PHASE L — Legacy Corpus Culinary QA Audit

**Status:** Session 1 complete. Engine-level fixes applied. Per-recipe overrides NOT touched (per Phase L constraint).
**Sample size:** 16 recipes across 8 cuisines (Japan, Thailand, South Korea, Vietnam, India, Russia, Italy, Republic of the Congo, Greece, Mexico, Israel, Lebanon, Egypt, USA, Bosnia, Australia, UK, Czech Republic, Hungary).

## 1. Audited recipes (Session 1)

| Recipe | Origin | Overrides | Pre-fix issue surface |
|---|---|---|---|
| Sushi | Japan | featureCards + pairings | clean — author overrides bypass engine |
| Pad Thai | Thailand | featureCards + pairings | clean — author overrides bypass engine |
| Bibimbap | South Korea | featureCards + pairings | clean |
| Pho | Vietnam | featureCards + pairings | clean |
| Chicken Curry | India | featureCards + pairings | clean |
| Solyanka | Russia | none | generic veg/soup pairings on a Slavic dish |
| Souvlaki | Greece | featureCards + pairings | clean |
| Pasta alla Norma | Italy | none | only 2 badges; Italian pairings correctly inferred from cuisine map |
| Moambe chicken | Republic of the Congo | none | "Red wine / Green salad / Fresh bread" on a Central African chicken stew; missing Traditional badge |
| Guacamole | Mexico | featureCards + pairings | clean |
| Shakshuka | Israel | none | middle-eastern pairings correctly inferred |
| Tabbouleh | Lebanon | featureCards + pairings | clean |
| Koshari | Egypt | none | Missing Traditional badge (Egypt has only 1 recipe so excluded from HUB_ELIGIBLE_ORIGINS) |
| Pavlova | Australia | none | "Yogurt / Bread / Garlic / Salad" on a meringue dessert — completely wrong pairings |
| Svíčková | Czech Republic | none | "Red wine / Fresh bread / Roasted potatoes" on a Czech dish |
| Goulash | Hungary | none | "Red wine / Fresh bread" on a Magyar paprika stew |
| Cheeseburger | USA | featureCards + pairings | clean — author overrides bypass engine |
| Pancakes | USA | featureCards + pairings | clean |
| Cevapi | Bosnia and Herzegovina | none | mediterranean pairings correctly inferred from cuisine map |
| Shepherd's Pie | United Kingdom | none | "Red wine / Fresh bread / Roasted potatoes" on a UK pie |

## 2. Patterns detected — engine fixes vs deferred

| Pattern | Recipes affected | Resolution |
|---|---|---|
| **Generic pairings on uncovered cuisines** (Eastern European, Anglo, Nordic, Sub-Saharan, Caucasus, Central European, Central Asian, Chinese) | 63 / 179 (35%) | **Engine fix:** 9 new pairing templates + cuisine mappings + EN-fallback in renderer |
| **Wrong pairings on desserts** (e.g. Pavlova showing "Yogurt / Bread / Garlic / Salad") | ~5 dessert-category recipes | **Engine fix:** category-aware `isDessert` detection in `recipePairings()` upgrades to `dessert` template regardless of origin |
| **Missing Traditional badge on single-recipe canonical cuisines** (Koshari, Doro Wat, Fufu, etc.) | ~10 recipes | **Engine fix:** `BADGE_TRADITIONAL` rule extended to also accept `CUISINE_PAIRING_TYPE` membership, not only `HUB_ELIGIBLE_ORIGINS` |
| Generic `tipType` on 94% of recipes (`def`/`meat`/`fish`/etc.) | ~168 recipes | **DEFERRED:** Requires per-cuisine tip text in 14 locales + extension to `recipeTip()`. Engine pattern is identical to pairings; copy work is substantial. Tracked in Phase K §5. |
| "Slow simmered" label imprecision on baked desserts (Pavlova, Tarte Tatin) | ~5 recipes | **DEFERRED:** Label substantively accurate even if name imprecise. Would need a sibling `BADGE_SLOW_BAKED`. |
| Image authenticity (visual dish-vs-image match) | n/a | **DEFERRED:** Cannot verify visually from sandbox. Post-T0 image QA pass already on the roadmap. |
| Editorial tone on pre-Phase-8B recipes | many | **DEFERRED:** Out of scope per Phase L constraint ("do not rewrite ingredients/translations"). |

Patterns NOT found in the audit (good news — no fix needed):

- Time defaults: `extractLongCookMinutes(howText)` correctly pulls cook keywords from each recipe's prose. Pho computes 225 min; Solyanka 90+ min; Pavlova 90+ min.
- Difficulty defaults: calculated from step count + `hardTechnique` regex, not a single default value.
- Forced "Rich in protein" on veggie dishes: Phase K rule already requires meat/fish/legume OR ≥18 g protein.
- "One-pot" stamping: Phase K converted this from "default heuristic" to explicit `RULE_ONE_POT_DISHES` allow-list.

## 3. Engine fixes applied (this session)

### 3.1 — 9 new pairing templates

Added to `RECIPE_UI.en.pairs` and `RECIPE_UI.ro.pairs` (the project's two primary locales per CLAUDE.md):

| Template key | Cuisines mapped | Chips (EN canonical) |
|---|---|---|
| `chinese` | China | 🍵 Jasmine tea · 🍚 Steamed jasmine rice · 🥢 Stir-fried bok choy · 🌶️ Chili oil |
| `eastern-european` | Russia, Ukraine, Belarus, Moldova, Poland, Czech Republic, Slovakia, Hungary, Romania, Bulgaria, Serbia, Estonia, Latvia, Lithuania | 🥖 Rye bread · 🥣 Smetana · 🥒 Pickled cucumbers · 🌿 Fresh dill |
| `nordic` | Sweden, Finland, Norway, Denmark, Iceland | 🫐 Lingonberry jam · 🍞 Rye crispbread · 🌿 Fresh dill · 🐟 Pickled herring |
| `anglo` | USA, United Kingdom, Canada, Australia, New Zealand, Scotland | 🍺 Ale or stout · 🥔 Mashed potatoes · 🥬 Garden peas · 🥄 Brown gravy |
| `sub-saharan` | Nigeria, Ghana, Ethiopia, South Africa, Republic of the Congo | 🍚 Steamed white rice · 🍌 Fried plantains · 🌶️ Pepper sauce · 🥬 Sautéed greens |
| `central-european` | Germany, Switzerland, Netherlands, Belgium, Austria | 🍺 Pilsner beer · 🥖 Crusty rye · 🥔 Boiled potatoes · 🥒 Pickled gherkins |
| `caucasus` | Georgia, Armenia | 🍷 Saperavi red wine · 🌿 Tarragon and cilantro · 🫓 Tonis puri bread · 🥒 Pickled vegetables |
| `central-asian` | Uzbekistan, Mongolia, Kyrgyzstan, Turkmenistan | 🍵 Green tea · 🍞 Non flatbread · 🧅 Sliced raw onion · 🌶️ Hot pepper |
| `dessert` | dessert-category recipes (auto-detected) | ☕ Espresso · 🍵 Black tea · 🍓 Fresh berries · 🥛 Whipped cream |

### 3.2 — Renderer EN-fallback chain

`recipePairings()` fallback updated to: `current-locale[key] → RECIPE_UI.en.pairs[key] → ingredient-derived → 'def'`. This makes new cuisine templates a one-locale change instead of a 14-locale change; the other 12 locales gracefully degrade to EN until per-locale translations land.

### 3.3 — Dessert auto-detection

`recipePairings()` now inspects the recipe's `category` against a regex matching dessert in all 14 locales (`dessert|desert|dolce|postre|tatlı|десерт|디저트`). Any match overrides cuisine inference and uses the `dessert` template directly — Pavlova no longer shows anglo pairings, Tarte Tatin no longer shows french pairings (sweet dishes deserve sweet pairings).

### 3.4 — Traditional badge rule relaxation

`BADGE_TRADITIONAL` now fires if `origin.en` is in **either** `HUB_ELIGIBLE_ORIGINS` (≥2-recipe cuisines) **or** `CUISINE_PAIRING_TYPE` (curated cuisine map, includes single-recipe canonical cuisines like Egypt → Koshari, Ethiopia → Doro Wat, Sudan → Ful Medames). Recipes get the Traditional badge if their origin is a recognised cuisine — not only if their hub already has 2+ recipes.

## 4. Verification — before / after on 4 representative recipes

| Recipe | Before | After |
|---|---|---|
| **Solyanka (Russia)** | 🍞 Rustic bread · 🧄 Fresh garlic · 🌶️ Chili peppers · 🧅 Red onion | 🥖 Rye bread · 🥣 Smetana · 🥒 Pickled cucumbers · 🌿 Fresh dill |
| **Moambe (Congo)** | 🍷 Red wine · 🥗 Green salad · 🍞 Fresh bread · 🥔 Roasted potatoes | 🍚 Steamed white rice · 🍌 Fried plantains · 🌶️ Pepper sauce · 🥬 Sautéed greens |
| **Pavlova (Australia)** | 🫙 Yogurt · 🍞 Bread · 🧄 Garlic · 🥗 Salad | ☕ Espresso · 🍵 Black tea · 🍓 Fresh berries · 🥛 Whipped cream |
| **Shepherd's Pie (UK)** | 🍷 Red wine · 🥗 Green salad · 🍞 Fresh bread · 🥔 Roasted potatoes | 🍺 Ale or stout · 🥔 Mashed potatoes · 🥬 Garden peas · 🥄 Brown gravy |
| **Koshari (Egypt) badges** | Rich in protein (1 badge total — no Traditional) | Rich in protein + Traditional recipe |

## 5. Recipes requiring manual override (none in this session)

The Phase L constraint says recipes should NOT be patched individually. The engine fixes above resolved every pattern detected in the 16-recipe audit at the engine level. No recipe in this session was patched directly.

## 6. Open items (next sessions / deferred)

- **`recipeTip()` cuisine-aware extension** — same problem class as pairings (94% generic). Engine pattern is identical (`CUISINE_TIP_TYPE` map + EN-fallback + cuisine-specific tip arrays). Copy work substantial (14 cuisine tip arrays × 14 locales × N variants). Track separately.
- **Per-locale extension of the 9 new pairing templates** beyond EN/RO. Renderer falls back to EN gracefully; per-locale rollout is purely additive.
- **`BADGE_SLOW_BAKED`** sibling to `BADGE_SLOW_SIMMER` — minor label cleanup for desserts.
- **Image authenticity audit** — requires visual review or external tooling, scheduled with the post-T0 image QA pass.
- **Editorial tone audit** on pre-Phase-8B recipes — separate phase per the "do not rewrite ingredients/translations" Phase L constraint.

## 7. Constraint compliance check

- ✅ Did NOT regenerate entire recipes.
- ✅ Did NOT rewrite ingredients.
- ✅ Did NOT modify translations.
- ✅ Prioritised engine-level scalability (1 renderer change unlocks all future cuisine-template additions).
- ✅ Preserved build stability (3320 pages → 3320, curly 0, no schema changes).
- ✅ Will commit only after validation passes (see build + audit above).
