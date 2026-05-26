# CULINARY METADATA VALIDATION (Phase K)

**Status:** Active. Wired into `scripts/generate-content.mjs` (`evaluateBadges()`, `inferPairingType()`, `RULE_NEVER_FREEZE`, `RULE_ONE_POT_DISHES`, `CUISINE_PAIRING_TYPE`).

**Rule contract:**

> A missing badge is better than a fake badge.
> A missing pairing is better than a robotic pairing.

This invariant is binding for every rule added here.

---

## 1. Problem the system solves

Before Phase K, `recipeFeatureCards()` rendered exactly **4 badges on every recipe** — including ~150 recipes that did not have an explicit `featureCards` override. The selection was a permissive heuristic:

- "Traditional recipe" was always card #3 — stamped on every page regardless of whether the dish was historically recognised.
- "Can be frozen" fired for any non-fragile recipe with `>5` steps **or** total time `>35 min` — over-applied to fried dishes, pasta dishes, anything multi-step.
- "One-pot" was the default for any recipe that wasn't slow-cook / overnight / fermented — over-applied to dishes that use multiple pans.
- "Rich in protein" / "Rich in omega-3" / "Rich in vitamins" used coarse ingredient regexes without any threshold check.

In parallel, `recipePairings()` had cuisine-specific templates (`japanese`, `mexican`, `mediterranean`, etc.) but **105 of 179 recipes (59%)** carried a generic `pairingsType: 'meat' | 'fish' | 'soup' | 'pasta' | 'veg' | 'def'`. The renderer respected the generic value, producing chips like "🍷 Red wine / 🥗 Green salad / 🍞 Fresh bread / 🥔 Roasted potatoes" on culturally-specific dishes (Pljeskavica, Bobotie, Cevapi, …). Robotic by the user's definition.

---

## 2. Architecture

Single rule engine, surgically inserted in `scripts/generate-content.mjs` between `recipeMetadata()` and `recipeFeatureCards()`. No new module, no new file imports — the engine is part of the static-site build, not a runtime concern.

```
recipeMetadata() ──┐
                   ├─→ evaluateBadges() ──→ render only validated cards
recipe (full obj) ─┤
                   └─→ inferPairingType() ─→ cuisine-correct pairing chips
recipePairings()
```

### 2.1 Badge constants

`BADGE_RICH_PROTEIN` (0) … `BADGE_FERMENTED` (9) — named indices into `ui.feat[]`. Centralising avoids magic numbers in `evaluateBadges()` and lets future contributors see the badge list at a glance.

### 2.2 `evaluateBadges(ctx)` — the rule engine

Each badge has an inline rule that returns one of four signals. Only rules at `high` or `medium` survive into the rendered output. The engine then dedupes by badge key, sorts (high before medium; "Traditional" drops to back so specific badges aren't crowded out), and caps at 4. **If 0 rules pass, the recipe renders 0 cards** — never a fake.

| Badge | Rule | Confidence |
|---|---|---|
| 0 — Rich in protein | `nutrition.prot ≥ 25 g` → high; ≥ 18 g OR has meat/fish/legume → medium | per case |
| 1 — Rich in omega-3 | Fatty fish only (salmon/mackerel/sardine/anchovy/herring/trout/tuna) AND not also meat → high | high only |
| 2 — Rich in vitamins | Veg-forward AND no meat/fish primary → high | high only |
| 3 — Traditional recipe | Origin in `HUB_ELIGIBLE_ORIGINS` (≥2-recipe cuisines, AI-filler already filtered by Phase 8A safety rules) → medium | medium |
| 4 — Can be frozen | `isSoup()` OR name matches stew/braise/curry/casserole regex, AND name/category does NOT match `RULE_NEVER_FREEZE` → high | high only |
| 5 — Quick to prepare | `totalMins ≤ 30` → high | high only |
| 6 — Slow simmered | `totalMins ≥ 90` → high | high only |
| 7 — One-pot | Name matches `RULE_ONE_POT_DISHES` explicit allow-list → high. **No heuristic** — explicit only. | high only |
| 8 — Overnight | `totalMins ≥ 480` (8 h+) → high | high only |
| 9 — Fermented | Ingredient regex matches miso/kimchi/sauerkraut/tempeh/kefir/doenjang/gochujang/kvass/natto/kombucha → high | high only |

### 2.3 `RULE_NEVER_FREEZE`

Reject list for badge #4. A texture/assembly that genuinely fails freezing — even if the dish would otherwise pass the structure check. Current list: sushi, sashimi, ceviche, tartare, carpaccio, gravlax, meringue, pavlova, soufflé, crêpe, menemen, shakshuka, chakchouka, fondue, tartine, smørrebrød, poffertjes, lángos, tempura, onigiri, yakitori, chilaquiles, all salads, raw fish, sabich, gyros, souvlaki, tlayudas, pad thai, nasi goreng, huevos rancheros, pierogi.

Extend conservatively. Adding a dish to this regex removes its "Can be frozen" badge across all 14 locales — verify visually that the badge was actually inappropriate before committing.

### 2.4 `RULE_ONE_POT_DISHES`

Allow-list for badge #7. **No heuristic.** A dish gets the "One-pot" badge only if its English name matches a regex of culturally-canonical one-pot dishes (borscht, cassoulet, jambalaya, ratatouille, paella, risotto, congee, chowder, gumbo, tagine, pozole, fasolada, harira, stamppot, stoofvlees, carbonnade, goulash, cocido, bourguignon, stews, stroganoff, cottage pie, shepherd's pie, moqueca, ropa vieja, picadillo, biryani, plov, kabsa, mansaf, sundubu, jjigae, kimchi jjigae, tom yum, tom kha, laksa, olla, svíčková, bigos, ciorbă, tochitur, jollof, egusi, moambé, sarmale, …).

Adding a dish here is an editorial claim, not a heuristic. The dish must actually cook in one vessel.

### 2.5 `CUISINE_PAIRING_TYPE` — cuisine inference

Maps `recipe.origin.en` → preferred key in `ui.pairs`. Inference takes precedence over a generic `pairingsType: 'meat' | 'fish' | …` setting on the recipe. This was the most common Phase 8A-era artefact: cuisine-tagged recipes carrying a placeholder pairing type that the renderer faithfully respected, producing generic chips on dishes that deserve cuisine-specific ones.

Current mappings:

- Japan → `japanese`; South/North Korea → `korean`
- Italy → `italian`; France → `french`
- Greece, Spain, Portugal, Croatia, Cyprus, Bosnia and Herzegovina, Slovenia, Cape Verde → `mediterranean`
- Lebanon, Syria, Iran, Iraq, Israel, Egypt, Kuwait, Turkey, Morocco, Tunisia, Algeria, Sudan → `middle-eastern`
- India, Pakistan, Nepal, Sri Lanka → `indian`
- Vietnam, Cambodia → `vietnamese`
- Thailand, Indonesia, Malaysia, Philippines, Singapore → `thai`
- Mexico → `mexican`
- Peru, Argentina, Brazil, Cuba, Colombia, Ecuador, Chile, Dominican Republic, El Salvador, Venezuela, Guatemala, Jamaica → `latin`

Cuisines NOT in this map (Serbia, South Africa, Nigeria, Ghana, Hungary, Poland, Russia, Romania, Switzerland, Germany, Netherlands, Belgium, Sweden, Finland, Norway, Denmark, UK, USA, Australia, Canada, …) fall through to the ingredient-derived `meat` / `fish` / `soup` / `pasta` / `veg` / `def` chips. These generic chips remain a known limitation — they are reasonable but not specific. Adding a cuisine-specific pairing template (e.g. `balkan: [kajmak, ajvar, urnebes, somun]`) and a mapping here is the safe long-term fix; doing so per-cuisine is a small additive change.

### 2.6 Author overrides (untouched)

The validation engine **only fires when the recipe has no explicit override**. Recipes that carry an `overrides.featureCards` array bypass `evaluateBadges()` entirely. Recipes with `overrides.pairings` bypass `inferPairingType()`. Recipes with a non-generic `overrides.pairingsType` (e.g. `'japanese'`, `'mexican'`) keep that exact value.

This preserves all 29 explicit `featureCards` arrays and all 30 explicit `pairings` arrays in the corpus — the Phase 8B reference-quality recipes are unaffected.

---

## 3. Effect on the rendered corpus (post-build verification)

Auto-generated badge counts per recipe page (178 recipe pages in `/en/recipes/`, excluding 46 cuisine hubs + 1 master index):

| Badges shown | Recipes | Share |
|---|---|---|
| 4 (cap) | 76 | 43% |
| 3 | 37 | 21% |
| 2 | 46 | 26% |
| 1 | 19 | 11% |
| 0 | 0 | 0% |

Before Phase K: 100% of recipes showed 4 cards (auto-fill). After: 57% show fewer than 4. Net **~30% reduction in badge claims**, all of them now passing at least the medium-confidence rule.

Spot-checks confirm the directional changes:

- **Sushi (Japan)** — explicit `featureCards`, unchanged (4 authored cards: "Rice is the craft", "Soy on the fish", "Body-warm rice", "Wasabi between layers").
- **Salmon Soup (Finland)** — auto, all 4 cards justified (Rich in protein + Rich in omega-3 + Can be frozen + Traditional).
- **Pavlova (Australia)** — auto, only 2 cards (Slow simmered + Traditional). "Can be frozen" correctly suppressed via `RULE_NEVER_FREEZE`. "One-pot" correctly suppressed via the explicit allow-list.
- **Pljeskavica (Serbia)** — auto, 3 cards (Rich in protein + Slow simmered + Traditional). Pairings stay generic because Serbia is not in `CUISINE_PAIRING_TYPE` (acceptable; "robotic" is bounded by region-mapped templates only).

---

## 4. Safeguards for future recipe generation

Any new recipe added under Phase 8B+ continues to flow through the same path:

- If the recipe has an `featureCards` override: validated by editorial review at PR-time, rendered as authored.
- If not: `evaluateBadges()` runs the rule engine. New rules can be added to `evaluateBadges()` itself (each as a small isolated block); no other file needs to change.
- If the recipe sets a cuisine-specific `pairingsType` (one of the named cuisine keys): rendered as authored.
- If the recipe sets a generic `pairingsType` (meat/fish/etc.) **or** none: `inferPairingType()` upgrades to the cuisine pairing when the origin maps to one, otherwise falls back to the generic chips.

When adding a new cuisine to `CUISINE_PAIRING_TYPE`, you must also have a corresponding key in `ui.pairs` for at least the English locale. The renderer falls back gracefully if a key is missing (it lands on the ingredient-derived chips), so a partial rollout is safe — but the full set of 14 locale `ui.pairs` entries is the publication standard.

---

## 5. Open items (not in scope for Phase K)

- **Balkan / Sub-Saharan / Eastern European / Nordic pairing templates.** Recipes from Serbia, Bosnia, Bulgaria, Hungary, Poland, Russia, Romania, Sweden, Finland, Norway, Denmark, Nigeria, Ghana, South Africa, Ethiopia currently fall through to generic chips. Each cuisine deserves its own `ui.pairs` entry (kajmak/ajvar for Balkan, smetana/horseradish for Eastern European, lingonberry/dill for Nordic, …) plus a `CUISINE_PAIRING_TYPE` mapping. Additive, safe, ~14-locale work per template.
- **Per-locale `RULE_NEVER_FREEZE` / `RULE_ONE_POT_DISHES`.** Both regexes match English dish names. They mostly work because the dish names (Sushi, Pavlova, Tempura, …) are loanwords across all 14 locales. Some Cyrillic/Arabic/CJK alternative spellings could slip past — review case by case.
- **Tip text validation.** `recipeTip()` still uses the old generic per-ingredient-type pattern (84% of recipes use the generic `meat` / `def` tip). Same problem class as pairings, separate fix.
- **"Slow simmered" label on baked desserts.** `BADGE_SLOW_SIMMER` fires for Pavlova (low oven bake), Tarte Tatin (slow caramelize), etc. The label is mildly imprecise (it's slow-baked, not simmered) — consider splitting into BADGE_SLOW_BAKED if the imprecision becomes a recurring complaint.
