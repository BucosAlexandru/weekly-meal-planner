# PHASE M — Pre-Generation Quality Gates

**Status:** Complete. All 5 gates passing. Pre-conditions for resuming T0/T1 recipe generation are met.

This document records the four systemic quality risks identified after the rebase, and the engine-level fixes (or explicit deferrals) applied for each.

---

## 1. `recipeTip()` quality — dish-name registry

### Before
- 100% of recipes rendered a tip.
- ~94% of those tips were one of six generic strings (soup / meat / fish / pasta / dessert / def). Filler by the Phase K/L invariant: "a missing tip is better than a fake tip."
- 168 of 179 recipes resolved to a generic placeholder.

### After
- Tips render only when a per-locale `TIP_REGISTRY` rule matches the recipe's dish name (or a clear dish-specific ingredient cue).
- Generic placeholder `tipType` values (`soup` / `meat` / `fish` / `pasta` / `dessert` / `veg` / `def`) on recipes are now treated as fall-throughs — the renderer consults the registry instead.
- Author overrides (`overrides.tip` free-form text, OR `overrides.tipType` pointing to a non-generic cuisine-specific key) still win.
- If no rule fires: tip section hidden (the existing conditional render `${tip ? ... : ''}` already handled this).
- Per-locale: registry authored in **EN** and **RO** (the project's two primary locales per CLAUDE.md). For the other 12 locales the function returns `null` — showing an English tip on a French/Spanish/German page would be mixed-language rendering, which is worse than showing nothing. Per-locale extension is purely additive.

### Generic-rate before / after

| Locale | Pre-Phase-M | Post-Phase-M | Δ |
|---|---|---|---|
| EN | 179/179 tips rendered, ~94% generic filler | 53/179 tips rendered, **0% generic** (all dish-specific) | filler eliminated |
| RO | 179/179 tips rendered, ~94% generic filler | 47/179 tips rendered, **0% generic** | filler eliminated |
| 12 other locales | 179/179 tips rendered, ~94% generic filler | 0/179 tips rendered | per-locale registry extension is open work |

### Sample of the new tips (EN)

| Dish | Tip |
|---|---|
| Sushi | Use rice that's body-temperature warm, not hot or cold — cold rice cracks the nori; hot rice steams the topping. |
| Tempura | Mix the batter ice-cold with chopsticks and stop at five to eight strokes — the lumpy batter is what makes the crust crisp. |
| Pavlova | Bake low and slow, then turn the oven off and let the meringue cool inside — sudden temperature changes crack the shell. |
| Mole Poblano | Fry the blended paste in hot lard for the full 10–15 minutes, stirring constantly — this 'fries the mole' and is what separates real mole from thin sauce. |
| Cheeseburger | Don't press the patty after it's on the heat — every drop of juice you squeeze out is flavour lost. |
| Borscht | Stir in a spoonful of vinegar or lemon juice at the end — the acid locks in the beet's deep red colour, otherwise it fades to brown. |
| Goulash | Take the pan off the heat before adding the paprika; toasted in hot fat it turns bitter and acrid. |
| Bouillabaisse | Add the firmer fish first and the delicate fish at the end — each species needs its own brief cook time. |

55 EN entries + 55 RO entries. Coverage will grow incrementally as new recipes pass through Phase 8B's reference-quality bar.

---

## 2. "Slow simmered" label scope

### Before
Rule `BADGE_SLOW_SIMMER`: `totalMins >= 90` → render. Fired on **Pavlova** (low-oven bake), Tarte Tatin (slow bake), any recipe with a long marinade / proof / rest time, regardless of whether the dish actually simmered.

### After
New reject regex `RULE_NEVER_SLOW_SIMMER` covers:
- Desserts (dessert, dolce, postre, tatlı, 디저트, десерт, pavlova, meringue, soufflé, tiramisu, cheesecake, panna cotta, crème brûlée, flan, profiterole, éclair, donut, cake, tarte, pie, cookie, brownie, baklava, kunafa, halva, crêpe, pancake, waffle, churros, tres leches)
- Fried / grilled / raw / cold / assembled dishes (tempura, sushi, sashimi, ceviche, tartare, carpaccio, gravlax, yakitori, gyros, souvlaki, tlayudas, tacos, cheeseburger, sandwich, bruschetta, salads in all 14 locales, fried, grilled, kebab, raw, cold, smørrebrød, tartine, guacamole, hummus, tabbouleh, bibimbap, onigiri, kimbap, spring roll, nasi goreng, pad thai, chakchouka, shakshuka, menemen, piragi, chilaquiles)

Rule now: `totalMins >= 90 AND !RULE_NEVER_SLOW_SIMMER.test(nameStr || catStr)`.

### Verification (sample audit included in the build pipeline)

Recipes that **must not** show "Slow simmered" (verified):
- ✓ Pavlova
- ✓ Sushi
- ✓ Tempura
- ✓ Onigiri
- ✓ Yakitori
- ✓ Chilaquiles
- ✓ Bibimbap

Recipes that **should** still show "Slow simmered" (verified):
- ✓ Solyanka
- ✓ Goulash
- ✓ Boeuf Bourguignon
- ✓ Lamb Tagine

(Pho carries an explicit `featureCards` override; its rendered badge set is author-controlled and bypasses the engine entirely — outside Phase M's scope.)

---

## 3. `recipeImages` best-guess URL risk list

The five Phase 8B recipes (ids 184–188) have best-guess Wikipedia Commons URLs added at the time of authoring, with confidence flagged at ~70–75 %. They have **not** been visually verified — any of them may 404 in production, in which case the page falls back to `cover2.jpg`.

### List of recipes with unverified image URLs

| id | Recipe | Origin | Image URL | Confidence | Local file? |
|---|---|---|---|---|---|
| 184 | Tempura | Japan | `…/Tempura_001.jpg/330px-Tempura_001.jpg` | ~75% | none |
| 185 | Onigiri | Japan | `…/Onigiri.jpg/330px-Onigiri.jpg` | ~70% | none |
| 186 | Yakitori | Japan | `…/Yakitori_001.jpg/330px-Yakitori_001.jpg` | ~70% | none |
| 187 | Mole Poblano | Mexico | `…/Mole_poblano.jpg/330px-Mole_poblano.jpg` | ~75% | none |
| 188 | Chilaquiles | Mexico | `…/Chilaquiles_rojos.jpg/330px-Chilaquiles_rojos.jpg` | ~70% | none |

### Handling

- **No blind replacement.** Each URL is flagged here and (in commit history) at the time it was added.
- **No claim of image confidence in user-facing copy.** The recipe pages don't say "verified image" anywhere; the URLs are inline `<img src="…">` and either render or fall back to the cover image via the existing `onerror="this.remove()"` handler.
- **Local-file precedence preserved.** Drop a verified `<slug>.webp` into `public/images/` (e.g. via the `add-recipe-image.mjs` tool when sources are available) and the local file automatically wins over the unverified Wikipedia URL.
- **Visual QA pass scheduled.** When the image-add tooling reaches a network-enabled environment (or when image sources are supplied locally), the five entries here are the targets for the QA pass.

### Going forward (binding for new recipes)

When adding a recipe under the FULL RECIPE INTEGRATION STANDARD with a best-guess image URL:
1. Note the confidence level in the per-recipe self-QA (not in user-facing copy).
2. List the recipe id in this section so the future image QA pass has a single source of truth.
3. Prefer reusing an existing local image when one is available (cuisine-appropriate fallback is acceptable until a dish-specific photo is sourced).

---

## 4. Locale fallback transparency

### What falls back

| Pipeline | Per-locale coverage | Renderer behaviour | Acceptable? |
|---|---|---|---|
| 9 new cuisine pairing templates (`chinese`, `eastern-european`, `nordic`, `anglo`, `sub-saharan`, `central-european`, `caucasus`, `central-asian`, `dessert`) | EN + RO (2/14 locales) | 12 other locales fall back to **EN chips** via the renderer chain `current-locale[key] → RECIPE_UI.en.pairs[key] → ingredient-derived → 'def'` | **Acceptable temporarily.** Food terms travel well (Smetana, Lingonberry, Tonis puri are recognised across locales). Mixed-language is a small UX hit but better than the pre-Phase-L "Red wine / Fresh bread" generic chips. Per-locale extension is purely additive. |
| `TIP_REGISTRY` (55 dish-specific tips) | EN + RO (2/14 locales) | 12 other locales render **no tip** — the renderer hides the section | **Acceptable.** Tips are full sentences (not short chip labels); showing English sentences on a Spanish/French/German page is more jarring than showing none. Hide-by-design matches the Phase M principle. |

### Where to extend

When extending either pipeline to a new locale:

**Pairing templates** — add the 9 new keys to that locale's `RECIPE_UI[lc].pairs` block in `scripts/generate-content.mjs` (around lines 2135–2711). Each key needs 4 chips with `{e:'<emoji>', n:'<localized name>'}`. Once a key exists in the locale's dict, the EN-fallback step is bypassed automatically.

**Tip registry** — add the locale code as a new top-level key in `TIP_REGISTRY` (around the `recipeTip()` definition). Mirror the EN/RO structure: `{ match: <regex>, tip: '<localized tip>' }`. Once `TIP_REGISTRY[lc]` exists, `recipeTip()` consults it. Partial coverage is acceptable — non-matching dishes still fall through to `null` (hidden tip), not to an EN fallback.

### What is NOT acceptable

- **Mixed-language tips** (EN tip rendered on FR/ES/DE page) — explicitly rejected. Either translate or hide.
- **EN-fallback for tips** without translation — same reason.
- **Generic filler tips** for any locale — banned by Phase M. The old `t.meat`/`t.def`/etc. tips remain in the dict for safety, but the new selector skips them when used as `tipType` placeholders.

---

## 5. Validation results

### Build

```
npm run build → "Done! Generated 3276 pages total"  ✓
public HTML pages: 3320                              ✓ (within CI 3200-3400)
sitemap.xml URLs:  3320                              ✓ (exact match to HTML)
recipes.js curly quotes: 0                           ✓
```

### Image / srcset regression check

```
public/en/recipes/moussaka/index.html              0 srcset attrs   ✓
public/ro/retete/japanese-curry-rice/index.html    0 srcset attrs   ✓
public/en/recipes/japan/index.html                 0 srcset attrs   ✓
```

Main's srcset fix from `b2d374555` preserved.

### Badge distribution (Phase K/L still firing)

| Badges shown | Recipes |
|---|---|
| 4 (cap) | 84 |
| 3 | 42 |
| 2 | 50 |
| 1 | 3 |
| 0 | 0 |

Total recipe pages with feature-row: 179. Distribution matches Phase K/L baseline — validation engine still enforces "no fake badge".

### Pairing sanity (Phase L cuisine inference still firing)

| Recipe | Origin | Rendered chips |
|---|---|---|
| Solyanka | Russia | Rye bread · Smetana · Pickled cucumbers · Fresh dill |
| Pavlova | Australia | Espresso · Black tea · Fresh berries · Whipped cream |
| Shepherd's Pie | UK | Ale or stout · Mashed potatoes · Garden peas · Brown gravy |

No generic "Red wine / Fresh bread" regression.

### Tip generic-rate before / after

| Locale | Pre-M generic share | Post-M generic share | Recipes with tip |
|---|---|---|---|
| EN | ~94% | **0%** | 53/179 (29%) |
| RO | ~94% | **0%** | 47/179 (26%) |
| 12 others | ~94% | n/a (no tips rendered) | 0/179 |

---

## 6. Constraint compliance

- ✅ No new recipes generated. (Phase M is a pre-generation gate.)
- ✅ No recipe data modified. All fixes are in `scripts/generate-content.mjs`.
- ✅ No translation churn. New EN/RO tips added; existing locale strings untouched.
- ✅ Build green, all gates pass.
- ✅ Branch ready for resume of Phase T0/T1 recipe generation under the now-validated metadata + tip pipeline.

---

## 7. Open items (for tracking, not blocking)

- Per-locale translation of `TIP_REGISTRY` to the 12 remaining locales (es/fr/de/pt/ru/ar/zh/ja/hi/tr/it/ko).
- Per-locale translation of the 9 new cuisine pairing templates.
- Visual QA + verification of the 5 best-guess Phase 8B image URLs (Tempura / Onigiri / Yakitori / Mole Poblano / Chilaquiles).
- Image audit for the broader corpus when network access becomes available.

These are additive; none of them blocks T0/T1 resumption.
