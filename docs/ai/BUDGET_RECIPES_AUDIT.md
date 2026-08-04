# Budget Recipes — Phase 1 Audit (read-only)

**Scope:** rebuild `public/js/recipes-budget.js` to the quality standard of `public/js/recipes.js`.
**This document:** Phase 1 only — audit, quality contract, rules, classification. **No recipe data was modified.**
**Date:** 2026-08-03 · **Branch:** `budget-recipes-rebuild`

---

## 0. Executive summary

The "200 budget recipes" are **not 200 recipes**. They are **10 template dishes cloned 20× each**, each clone relabeled with a different (often nonsensical) country. Every entry shares:

- **Identical boilerplate instructions** — all 200 have the exact same `howIsMade` (99 chars):
  `"Prep the ingredients.. Cook over medium heat using simple methods.. Season to taste and serve warm."`
  (note the `..` double-period join bug). Not cookable.
- **No quantities** — 0 of 1140 ingredient lines carry a number or unit; every quantity is the generic phrase `"as needed"` / `"după nevoie"`.
- **No nutrition, no cost** — those fields do not exist anywhere in the file.
- **One boilerplate tag-set** for all 200: `[budget, cheap, crisis, simple, world]`.
- **Fabricated origins** — e.g. "Rice with vegetables" is attributed to România, Coreea, Egipt, Ungaria, Sri Lanka, Japonia, Canada, Polonia, Nepal, China, SUA, Ucraina, Filipine, India, Chile, Rusia, Indonezia, Turcia, Peru, Etiopia.

**Conclusion:** this is a *data-integrity* problem, not a polish problem. The correct move is **not** to "fix 200 entries" — it is to collapse to the ~10 real concepts, rebuild them to the `recipes.js` standard, and grow a genuinely distinct set from there. The current file also ships **dead adapter code** (`BUDGET_RECIPES_COMPAT`) that is defined but never exported/used.

---

## 1. Method

Read-only. Two lenses:
1. **Mapped output** — imported the module's exported `recipes` (`BUDGET_RECIPES_MAPPED`), i.e. exactly what `app.js` serves.
2. **Raw source** — text-scanned the file for field presence (`"number"`, `"nutrition"`, `"cost"`, `"as needed"`, country distribution) and read representative recipe objects in full.

Analysis script kept out of the repo (scratchpad) — the *formal* validator is Phase 2.

---

## 2. Standard vs. current (schema & quality)

`recipes.js` (the bar) — per recipe:

| Field | `recipes.js` (standard) | `recipes-budget.js` (current, mapped) |
|---|---|---|
| `name` (14 langs) | ✅ | ✅ present & translated |
| `origin` (14 langs) | ✅ truthful | ⚠️ present but **fabricated** (10 dishes spread over 41 countries) |
| `ingredients` (14 langs) | ✅ **`"400g spaghetti"`, `"1 tsp black pepper"`** — number + unit + name, parser-ready | ❌ **bare names** (`"Rice"`, `"Oil"`) — **0% have a quantity** |
| `howIsMade` (14 langs) | ✅ rich, sequential, cookable prose | ❌ **identical 3-step boilerplate** for all 200 |
| `nutrition` `{cal,prot,carb,fat,fib}` | ✅ | ❌ absent |
| cost (`costRon` via `recipes-meta.js`) | ✅ | ❌ absent; `recipes-meta.js` has **0** `budget_` keys |
| `servings` | ✅ | ⚠️ in raw, but **dropped by the map** (mapped output has none) |
| `time` `{prepMin,cookMin}` | ✅ (meta) | ⚠️ in raw, but **dropped by the map**; meta absent |
| `featureCards` / `pairings` (14 langs) | ✅ | ❌ absent |
| `tipType` / `pairingsType` | ✅ | ❌ absent |
| image (`recipe-images.js`) | ✅ (numeric id) | ❌ `budget_NNN` ids are not in the image map → emoji fallback (💰) |
| `tags` | ✅ meaningful subset | ❌ same boilerplate `[budget,cheap,crisis,simple,world]` for all |

**Structural bug:** the raw ingredient `qty` is a per-language *text* object (`{ro:"după nevoie", en:"as needed", …}`), but the mapping code reads `qty.number` / `qty.unit` (which never exist). Net effect: the "as needed" text is discarded **and** no quantity is emitted — ingredients reach the app as bare nouns, so the shopping list can never aggregate amounts for a budget plan.

---

## 3. Findings (numbers)

- **200** entries → **10** distinct dish titles, **×20** each.
- **0 / 1140** ingredient lines have a leading quantity. `"as needed"` appears **1140** times.
- `howIsMade` (en) length across all 200: min = median = max = **99** → identical text.
- **0** `nutrition` blocks, **0** `cost` fields in the file.
- **1** distinct tag-set across all 200.
- Names translated in all 14 languages: **200/200** (this part is fine).
- Ingredient names differ ro vs en (translated): **200/200** (also fine).
- Dead code present: `BUDGET_RECIPES_COMPAT` (defined after the exports, unused).

The 10 concepts (all legitimate cheap dishes worth keeping as *ideas*):
`Orez cu legume` · `Paste cu sos de roșii și usturoi` · `Supă rapidă de linte` · `Cartofi fierți cu sos de usturoi` · `Fasole simplă la tigaie` · `Năut cu condimente (rapid)` · `Omletă simplă` · `Varză călită` · `Orez cu lapte` · `Mămăligă simplă`.

---

## 4. Quality contract (production-ready budget recipe)

A budget recipe is production-ready only if it satisfies **all** of the following. Same bar as `recipes.js`; budget recipes may be simpler dishes but must be **complete and truthful**.

1. **Identity** — stable `id`; `name` in all 14 languages; `origin` that is **truthful** (the dish's real culinary home, or an honest generic like "World / Pantry" — never a fabricated country).
2. **Ingredients** — array per language; every line a **parseable string** `"<qty> <unit> <name>[, prep]"` with a **real amount** (see rules §5.1–5.2). No `"as needed"` as the only quantity. Ingredient names translated per language.
3. **Instructions** (`howIsMade`) — real, sequential, cookable steps per language; **unique to the dish**; no shared boilerplate; no `..` artifacts.
4. **servings** — integer (default 2 for the budget set; 4 allowed). Quantities must match servings.
5. **time** — `{prepMin, cookMin}`, realistic for the dish.
6. **cost** — estimated cost per serving in RON, **flagged as an estimate**; must be plausibly "budget" (the set targets a full week under 150 RON for 2).
7. **nutrition** — `{cal, prot, carb, fat, fib}` per serving, **flagged as approximate**.
8. **tags** — a meaningful subset of the project's real tag vocabulary (`recipes-meta.js` `TAG_LABELS`: quick, budget, vegetarian, vegan, high-protein, family, healthy, spicy, one-pot) — not the fixed boilerplate.
9. **metadata parity** — carried through the mapping so the app actually receives servings/time/cost/nutrition (today the map drops them), OR added to `recipes-meta.js` for each budget id.
10. **image** — a real photo wired for the budget id (separate `budget-images` map; see the earlier homepage work), or an explicit, honest fallback.

**Hard rules:** quality over quantity · no invented confidence (flag uncertain culinary/nutritional values) · no fabricated origins · no boilerplate reuse · no bulk auto-generation.

---

## 5. Rules

### 5.1 Exact quantities
Every ingredient needs a real amount for the recipe's `servings`. Allowed: metric weights/volumes (`g`, `kg`, `ml`, `l`), spoons (`tbsp`, `tsp`), and countable units (`1 onion`, `2 eggs`, `3 cloves garlic`). "To taste" is allowed **only** for salt/pepper/spices, never as the sole quantity of a main ingredient.

### 5.2 Parseable English ingredient strings
The English line must survive `parseIngredient()` in `shopping-list.js`:
- Pattern: `"<number> <unit> <name>"` (e.g. `"200 g rice"`, `"1 tbsp oil"`, `"1 onion, finely chopped"`).
- Prep notes go **after a comma** (`", finely chopped"`) — the parser strips them.
- A weight in parentheses is honored (`"(about 250 g)"`).
- Avoid leading quantifier phrases as the only qty (`"a handful of"`), colons, and `" — "` editorial dashes mid-line (the parser truncates at them).
- Acceptance test: every rebuilt EN line must parse to a non-null `{name, qty, unit}` (Phase 2 validator + a parser round-trip test).

### 5.3 Servings / time / cost / nutrition
- `servings`: integer, default 2. · `time`: `{prepMin, cookMin}` realistic.
- `cost`: RON/serving, estimate — flag low-confidence items.
- `nutrition`: per serving `{cal, prot, carb, fat, fib}`, approximate — flag low-confidence items.

### 5.4 Instructions
3–8 sequential steps that actually cook the dish; specific to the ingredients and amounts; no shared template; join without `..`.

### 5.5 Translations
All 14 languages (`ro,en,es,fr,de,pt,ru,ar,zh,ja,hi,tr,it,ko`) for `name`, `origin`, `ingredients`, `howIsMade`, `tags` labels. Natural localized text, not machine filler.

### 5.6 Tags & metadata
Meaningful tags from the real vocabulary; `budget` implied but not the whole set. Metadata (servings/time/cost/nutrition/image) must reach the app (fix the mapping or extend `recipes-meta.js`).

---

## 6. Classification (all 200)

Because the file is 10 dishes × 20 clones, the classification collapses cleanly:

| Group | Count | Verdict | Reason |
|---|---|---|---|
| First instance of each of the 10 dishes | 10 | **REBUILD** | legitimate cheap-dish concept; data (qty/steps/nutrition/cost/origin/tags) is weak and must be rebuilt |
| Remaining clones (19 per dish) | 190 | **REMOVE** | exact duplicates with fabricated country labels; no unique value |
| `BUDGET_RECIPES_COMPAT` dead adapter | — | **REMOVE** | defined but unused |
| — | 0 | **KEEP** | nothing meets the contract as-is |

**Recommendation beyond the current file:** 10 distinct dishes is too thin for a weekly budget menu (the plan page needs 14 distinct meals). After rebuilding the 10, **expand** with genuinely distinct cheap recipes (soups, egg dishes, legume mains, pasta/rice variations, bakes) to a real target — suggest **~30–40** distinct budget recipes — instead of re-inflating with clones.

---

## 7. Impact on the planned pilot (Phase 3)

The user's plan selects "3 strong / 4 medium / 3 poor" for a 10-recipe pilot. **That tiering does not exist here** — all 200 are the same template quality. Proposed adjustment (needs approval):

- **Option A (recommended):** the pilot = rebuild the **10 unique dish concepts** to the contract. Clean mapping to "10 recipes," removes the 190 clones as a side effect, and immediately yields a coherent (if small) real budget set.
- **Option B:** rebuild 10 **new** distinct budget recipes (broader variety) and keep the 10 legacy concepts for a later batch.

Either way: after the pilot, run the Phase 2 validator + existing build + `npm run content` + a shopping-list parse test on every pilot recipe, then stop and report.

---

## 8. Risks & open questions (for approval before Phase 2/3)

1. **ID / plan coupling** — the budget plan page (`generate-content.mjs`, `buget` plan) selects `budgetRecipes.slice(0,7)` / `.slice(7,14)`. Removing clones and renaming ids **will change which meals the plan shows**. The plan definition must be updated in lockstep (flagged; no app-behavior change without approval).
2. **Metadata delivery** — decide: fix the mapping to carry servings/time/cost/nutrition, **or** add budget ids to `recipes-meta.js`. Affects Phase 2 schema.
3. **Images** — budget ids need a real image source (curated Commons URLs or reuse of matching main-recipe photos) via a `budget-images` map; not part of the data rebuild but required for parity.
4. **Cost & nutrition confidence** — these will be human estimates; every value ships flagged, not asserted as fact.
5. **Target size** — how many distinct budget recipes to build (10 now, ~30–40 eventually?) — your call.
6. **Duplicate-name policy in the validator** — Phase 2 must reject duplicate ids **and** duplicate names, so clones can never return.

---

## 9. Phase gate

Phase 1 is **audit only** — no recipe data changed. **Awaiting approval** on:
- pilot selection (Option A vs B),
- metadata delivery (mapping fix vs `recipes-meta.js`),
- target size.

Next (on approval): **Phase 2** — `scripts/validate-budget-recipes.mjs` enforcing this contract (strict; not weakened to pass the current file).
