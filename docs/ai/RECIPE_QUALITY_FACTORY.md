# Recipe Quality Factory — Status Board

Tracks implementation status for the Tier A recipe quality programme.
Audit details live in `RECIPE_QUALITY_PHASE_1_AUDIT.md`.

---

## Phase 1 — Tier A Pilot (10 recipes)

| ID | Recipe | Audit | Impl | Commit | Notes |
|---|---|---|---|---|---|
| 1 | Spaghetti Carbonara | ✅ | ✅ | `2c4e9fc6` | 10 fixes: 3 struct fields, 2 name locales, 3 originText grammar, time 20→30, desc 14 langs |
| — | Tacos | ⬜ | — | — | Pending |
| — | Pad Thai | ⬜ | — | — | Pending |
| — | Bibimbap | ⬜ | — | — | Pending |
| — | Butter Chicken | ⬜ | — | — | Not found in recipes.js under this name — needs ID lookup |
| — | Chili con Carne | ⬜ | — | — | Pending |
| — | Shakshuka | ⬜ | — | — | Pending |
| — | Fish and Chips | ⬜ | — | — | Pending |
| — | Shoyu Ramen | ⬜ | — | — | Pending |
| — | Mapo Tofu | ⬜ | — | — | Pending |

---

## ID 1 — Spaghetti Carbonara — Change Log

**Branch:** `claude/remote-control-setup-kYqCw`  
**Commit:** `2c4e9fc6`  
**Date:** 2026-05-18  

### Changes made

#### `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `servings` | missing | `4` |
| `tipType` | missing | `'pasta'` |
| `pairingsType` | missing | `'pasta'` |
| `name.zh` | `"培根意大利面"` | `"意式培根蛋面"` |
| `name.ko` | `"Spaghetti Carbonara"` | `"스파게티 카르보나라"` |
| `originText.fr` | `"…de Italie."` | `"…d'Italie."` |
| `originText.ru` | `"…из Италия."` | `"…из Италии."` |
| `originText.it` | `"…una risotta tradizionale di Italia."` | `"…una ricetta tradizionale italiana."` |

#### `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `20` | `30` |
| `desc` (all 14 langs) | "bacon / parmesan / 20 min" | "guanciale / Pecorino Romano / eggs / 30 min" |

### Validation
- `npm run content` ✅ — 2576 pages generated, no errors
- `npm run build` ✅ — JS bundle, CSS bundle, content all clean
- `/ro/retete/spaghetti-carbonara/` ✅ — guanciale, Pecorino Romano present; pasta tip active
- `/en/recipes/spaghetti-carbonara/` ✅ — guanciale, Pecorino Romano present; recipeYield=4
- `/it/ricette/spaghetti-carbonara/` ✅ — "ricetta tradizionale italiana" confirmed
- `/ko/recipes/spaghetti-carbonara/` ✅ — "스파게티 카르보나라" confirmed
- `/zh/shipu/spaghetti-carbonara/` ✅ — "意式培根蛋面" confirmed
- Korean/zh cascade pages ✅ — recipe index and related-recipe cards updated in both locales

### Not changed (confirmed correct)
- `ingredients` (all 14 languages) — already Tier A quality
- `howIsMade` (all 14 languages) — technically correct, no changes needed
- `name.en` / slug — untouched
- `category`, `origin`, `costRon`, `tags` — untouched

---

## Tier A Quality Standard (reference)

| Criterion | Requirement |
|---|---|
| Ingredients | Every item has a specific quantity. No "some"/"a little" except final seasoning. |
| Steps | Each step has a time or visual doneness cue. |
| Timing | `recipesMeta.time` = realistic wall-clock time (water boil included). |
| Servings | `servings` field present in `recipes.js`. |
| Tip/Pairing types | `tipType` and `pairingsType` present in `recipes.js`. |
| Names | All locales use their own script (no raw English in non-Latin locales). |
| originText | Grammatically correct in every language. |
| desc | Names the correct hero ingredients — no ingredient substitution. |
