# RECIPE_CONFLICTS

**Status:** Phase 8A — Data Hygiene
**Scope:** Catalogue of duplicate, near-duplicate, overlap-risk, and misnamed recipes in `public/js/recipes.js`. Pair with `CUISINE_CANONICAL_MAP.md`.

This file is the source of truth for "which existing rows are problematic and what should happen to them." It does NOT make destructive changes on its own — entries marked **DEFERRED** require explicit approval before deletion/rename because they alter recipe URLs and the static page count.

---

## 1. Hard duplicates (same dish, two rows)

### 1.1 Kottbullar (id=119) === Swedish Meatballs (id=27) — RESOLVED (Wave 2)

Both rows are Swedish meatballs in beef-pork blend with cream gravy. Both share `origin.en = 'Sweden'`. Köttbullar IS the Swedish word for "Swedish Meatballs". The two recipes differ in technique detail (id=119 has the proper "panada" breadcrumb soak and soy-darkened gravy — closer to the IKEA-style canon; id=27 uses soaked bread instead of breadcrumbs and a simpler gravy) but they are the same dish.

| | id=27 Swedish Meatballs | id=119 Kottbullar |
|---|---|---|
| `origin.en` | Sweden | Sweden |
| Slug | swedish-meatballs | kottbullar |
| Meat | 500 g 50/50 pork+beef | 400 g beef + 200 g pork |
| Tenderizer | Bread + milk | Breadcrumbs + milk (panada) |
| Spices | Allspice + nutmeg | Allspice + nutmeg + white pepper |
| Gravy | Beef stock + double cream | Stock + cream + flour roux + soy sauce |
| Image | yes | **no** |

**Resolution applied (Phase 8A Wave 2):** id=119 deleted from `recipes.js`. The `kottbullar.webp` local image renamed to `swedish-meatballs.webp` so the now-canonical Swedish Meatballs page picks up the better local thumbnail instead of the Spoonacular fallback. 14 × 308 permanent redirects added in `vercel.json` (`/<lc>/<dir>/kottbullar` → `/<lc>/<dir>/swedish-meatballs/`) so any existing inbound links resolve correctly. Stale recipe directories deleted across all 14 locales. Net: –14 pages.

Follow-up (Phase 8B-eligible, not blocking): merge the better technique notes (panada step, soy-darkened gravy) from the deleted id=119 content into id=27's `howIsMade` block as a content-quality pass.

---

### 1.2 Lamb Tagine (id=167) ≈ Tagine (id=118) — RESOLVED (Wave 2)

Both rows are Moroccan meat tagines. id=118's `name.en = 'Tagine'` but its ingredients list "1 kg bone-in lamb shoulder, cut into 4 cm cubes (or chicken thighs)" — so it's effectively a lamb tagine with chicken as a noted alternative. id=167 is a dedicated lamb tagine with more elaborate marination and spice work.

| | id=118 Tagine | id=167 Lamb Tagine |
|---|---|---|
| `origin.en` | Morocco | Morocco |
| Slug | tagine | lamb-tagine |
| Meat | Lamb shoulder (chicken alt) | Lamb shoulder only |
| Spices | Ras el hanout + cumin + cinnamon + turmeric | Same + coriander + paprika + ginger + saffron |
| Distinct? | No — same dish family | No — same dish family |

**Resolution applied (Phase 8A Wave 2):** id=118 renamed to `Chicken Tagine` across 14 locales. `ingredients` rewritten to a Djaj M'qalli profile (chicken thighs + preserved lemons + green olives + saffron, no dried fruit / chickpeas / honey). `howIsMade` rewritten for the chicken-specific 40-45 min cooking procedure. `originText` second paragraph rewritten to explicitly call out the Djaj M'qalli variant distinction from the dried-fruit/ras-el-hanout lamb tagines. Morocco now has two genuinely different dishes: id=118 Chicken Tagine (preserved lemons + olives) and id=167 Lamb Tagine (dried fruit + ras el hanout). 14 × 308 redirects added (`tagine` → `chicken-tagine`).

---

## 2. Soft duplicates (intent overlap, may coexist with care)

### 2.1 Ramen family — RESOLVED (Wave 2: rename only, no deletion)

Japan has 4 ramen recipes: id=28 `Ramen`, id=181 `Tonkotsu Ramen`, id=182 `Shoyu Ramen`, id=183 `Miso Ramen`. The three sub-styles are legitimately distinct (different broth + tare). The generic `Ramen` (id=28) overlapped with `Shoyu Ramen` (id=182) by ingredient profile (chicken/pork stock + soy + mirin = shoyu).

**Resolution applied (Phase 8A Wave 2):** id=28 renamed to `Classic Japanese Ramen` across 14 locales. **All three subtype pages stay.** Semantic hierarchy preserved: generic "Classic Japanese Ramen" is the broad / high-volume entity that captures the canonical ramen search intent, while Tonkotsu / Shoyu / Miso ramen are the specific subtype pages. 14 × 308 redirects added (`ramen` → `classic-japanese-ramen`). `ramen.webp` local image renamed to `classic-japanese-ramen.webp`.

---

### 2.2 Ceviche family — KEEP

- id=65 `Ceviche` (Peru) — the classic
- id=103 `Shrimp Ceviche` (Ecuador) — shrimp-only with tomato base

These are culturally distinct ceviche traditions (Peru's leche de tigre vs Ecuador's tomato-based shrimp version). Already disambiguated by `name.en` adjective. **No fix needed.** Future Mexican/Chilean ceviches must continue the pattern (always with a country/style modifier).

### 2.3 Shakshuka vs Chakchouka — KEEP (with caveat)

- id=44 `Shakshuka` (Israel) — Levantine spelling
- id=179 `Chakchouka` (Tunisia) — Maghreb spelling

Same dish, two transliterations, two regional traditions. Acceptable to coexist because each cuisine hub has a legitimate claim. **Caveat:** never add a third (Morocco/Algeria/Libya) — those would be true duplicates. The Algerian id=77 `Chakhchoukha` is a *different* dish (torn-flatbread stew) — spelling looks similar but content is not.

### 2.4 Pierogi (Poland id=33) vs Piragi (Latvia id=125) — KEEP

Different dishes (pierogi are filled dumplings; piragi are baked yeasted buns with bacon). Slug Levenshtein distance is 2 — visually similar but content is distinct. No action required.

### 2.5 Hangi (New Zealand id=53) vs Manti (Uzbekistan id=115) — KEEP

Levenshtein 2 but completely different cuisines and dishes. No action required.

### 2.6 Pho (Vietnam id=21) vs Plov (Uzbekistan id=152) — KEEP

Levenshtein 2 but completely different. No action required.

---

## 3. Misattribution / wrong cuisine

### 3.1 Pork schnitzel (id=155) — RESOLVED (Wave 2)

`origin.en = 'Poland'` and `name.en = 'Pork schnitzel'`. The technique IS authentically Polish (kotlet schabowy: milk soak + flour-egg-breadcrumb breading + lard frying), but the English `name.en` collides conceptually with id=17 `Schnitzel` (Germany). The German row uses veal/pork pounded thin + breaded; the Polish row uses pork loin chops with the milk-soak step that distinguishes the Polish version. Same English name, two cuisines.

**Resolution applied (Phase 8A Wave 2):** id=155 renamed to `Kotlet schabowy` across 14 locales. Origin stays Poland. New URL slug is `kotlet-schabowy`. 14 × 308 redirects added (`pork-schnitzel` → `kotlet-schabowy`). `pork-schnitzel.webp` local image renamed to `kotlet-schabowy.webp`.

---

## 4. Regional/continental origin reassignment — APPLIED

These were resolved in Phase 8A. Recorded here for the audit trail; the fix is already in `recipes.js`.

| id | Dish | Old `origin.en` | New `origin.en` | Hub effect |
|---|---|---|---|---|
| 20 | Fish and Chips | `UK` | `United Kingdom` | Joins id=168 Shepherd's Pie; promotes United Kingdom to a hub (2 recipes). |
| 130 | Coconut Rice | `Asia` | `Thailand` | Strengthens existing Thailand hub (3 → 4 recipes). Pandan + lemongrass + jasmine rice profile = Thai-coded. |
| 95 | Lentil Soup | `Middle East` | `Lebanon` | Joins id=64 Tabbouleh; promotes Lebanon to a hub (2 recipes). Cumin/coriander/turmeric red-lentil profile = classic shorbat adas. |

Also resolved in 8A:

| id | Dish | Field | Fix |
|---|---|---|---|
| 152 | Plov | `origin.pt` missing | Added `pt: 'Uzbequistão'`. |

---

## 5. Missing language coverage (`hi` gap) — RESOLVED (Wave 2)

CLAUDE.md flags that older recipes are routinely missing the Hindi (`hi`) language code. The audit originally found 44 recipes missing `name.hi` and 40 missing `origin.hi`.

**Resolution applied (Phase 8A Wave 2):** all 43 remaining recipes (after id=20 was handled in Wave 1) had their `name.hi` and/or `origin.hi` backfilled via curated Hindi translations (`fix_phase8a_hi_backfill.py`). Verification:

```
Total recipes: 174
Recipes missing any language code on name:   0
Recipes missing any language code on origin: 0
```

Every recipe in the corpus now carries all 14 mandated language codes (`ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko`) on both `name` and `origin`. This unblocks Phase 8B (new recipes can be added confident that the multilingual schema is uniform).

---

## 6. Missing recipe thumbnails — RESOLVED (audit error)

The original Phase 8A audit reported 22 recipes as "missing thumbnail" because it only checked the `recipeImages[id]` mapping in `public/js/recipe-images.js`. **That audit was wrong.** The actual image resolution order in `scripts/generate-content.mjs:resolveRecipeImage()` is:

1. `public/images/<slug>.webp` (local file — same-origin, optimal)
2. `public/images/<slug>.jpg`
3. `public/images/<slug>.png`
4. `recipeImages[id]` (Spoonacular / Wikipedia external URL)
5. `cover2.jpg` fallback

Local files take precedence. Re-running the audit with the full resolution chain:

```
TRULY_MISSING (no local file AND no recipeImages entry): 0
```

All 174 recipes have a working thumbnail. The 22 entries flagged in the first audit (Dhal, Poutine, Hangi, Svíčková, Fårikål, Crni Rizot, etc.) all have corresponding `.webp` files in `public/images/`. **No action required for thumbnails.** This entry remains in the doc as a record of the original audit error.

Note for Phase 8B safety rules (§11.6): "Every new recipe MUST have a thumbnail" stays in force, but the rule is satisfied by EITHER a local file OR a `recipeImages` entry — both render the thumbnail correctly.

---

## 7. Related-recipes image failures — INVESTIGATE

`recipePage()` (in `generate-content.mjs`) emits a related-recipes strip per recipe. If any related recipe in that strip is one of the 22 thumbnail-less recipes from §6, the strip renders a placeholder card. No images are 404-ing per se — the card simply has no image source — but the visual impact is a placeholder in the user-facing strip.

**Recommended fix:** §6's image backfill resolves this automatically. No code change needed in the related-recipes logic.

---

## 8. Broken internal links — NO BROKEN LINKS DETECTED

Phase 8A inspected:

- **Slug collisions** (between recipe slugs and cuisine-hub slugs): the build-time guard at `generate-content.mjs:3612` already enforces this. Zero collisions on the current corpus.
- **Cross-recipe links** in `featureCards` / `howIsMade` / `tips`: no hardcoded internal URLs found in recipe bodies (links are computed at render time from id-based references).
- **Sitemap consistency:** 3236 HTML pages exactly match 3236 sitemap URLs.

**No action required.** The only "link" risk on this branch is the deferred deletions/renames in §1, §2.1, §3 — those would create 404s if applied without a redirects pass.

---

## 9. Mixed-language rendering — NO RUNTIME ISSUES DETECTED

The 44 `hi`-missing entries (§5) cause the recipe page in the `/hi/` locale to fall back to `en` (per the standard pattern `r.name?.[code] || r.name?.en || r.name?.ro`). This is a graceful degradation — Hindi visitors see the English dish name instead of a placeholder — but it IS the "mixed-language rendering" the user flagged. Resolving §5 closes this issue.

No other locale has missing-coverage runtime fallbacks beyond the single Plov `pt` field (now fixed in §4).

---

## 10. Route inconsistencies when switching locale — NO INCONSISTENCIES DETECTED

The locale-switcher per-page is driven by hreflang maps (`recipeHreflangs`, `cuisineHubHreflangs`, etc.) which iterate the same `RECIPE_LANG` table. After Phase 8A renormalizations:

- Newly-promoted hubs (`united-kingdom`, `lebanon`) get all 14 locale variants automatically since `CUISINE_HUB_LANG` covers every language.
- Demoted regional buckets (`asia`, `middle-east`) had no hub URLs to begin with (each had 1 recipe, below `CUISINE_MIN_RECIPES=2`), so no language-switch routes are broken.
- Thailand was already a hub at 3 recipes; adding Coconut Rice does not change its URL.

**No action required.**

---

## 11. Safety rules for Phase 8B generation

These rules are derived from the conflicts catalogued above and MUST be enforced when new recipes are introduced:

### 11.1 Semantic-distance floor

Within a single cuisine hub, no two recipes may share **all three** of: (a) primary protein, (b) primary carbohydrate, (c) primary cooking technique. If they do, they are the same dish from a user-search perspective and one must be reframed.

Acceptable: `Bún Chả` (grilled pork, vermicelli, grill) and `Bún bò Huế` (beef, vermicelli, soup) — same carb, different protein and technique.
Forbidden: a second "grilled-pork-and-rice" recipe in Vietnam.

### 11.2 No duplicate carb/protein variants unless culturally distinct

A second pasta-with-eggs recipe in Italy ≠ allowed unless it is a named regional dish (e.g. Pasta alla Gricia ≠ Carbonara even though both are pork+pasta — the cheese, sauce, and Lazio sub-region distinguish them).

A second "lamb tagine" in Morocco ≠ allowed (see §1.2).

### 11.3 No generic/AI-style names

Forbidden `name.en` values:
- Single nouns that describe a category, not a dish: `Curry`, `Soup`, `Stew`, `Bread`, `Salad`, `Rice Bowl`, `Pasta`, `Noodle Bowl`.
- Generic adjective + noun without a real-world referent: `Spicy Chicken Stir-Fry`, `Hearty Vegetable Soup`, `Healthy Protein Bowl`, `Quick Tomato Pasta`.
- AI-filler patterns: `Authentic Country-Style X`, `Traditional Mom's X`, `Grandma's X`, `Best Ever X`.

Required: a `name.en` must match a real dish you can find on Wikipedia or in a published cookbook for that cuisine. If a casual search ("what is X") doesn't surface the dish from the target culture, the dish is not real and the recipe should be rejected.

### 11.4 No placeholder cuisine hubs

A cuisine appearing for the first time in the recipes corpus MUST:
1. Have an entry in `CUISINE_CANONICAL_MAP.md §1`.
2. Have an entry in `CUISINE_ATMOSPHERE` and `COUNTRY_FLAG` in `generate-content.mjs`.
3. Reach `CUISINE_MIN_RECIPES = 2` in the same batch — never introduce a single-recipe new cuisine that creates an orphan with no hub.

### 11.5 Origin discipline

- `origin.en` must be in the canonical list from `CUISINE_CANONICAL_MAP.md §1`. Forbidden values from §3 of that doc are hard-rejected.
- All 14 language codes must be populated for both `name` and `origin`. No exceptions.
- Slug collisions are checked at build time but the author should pre-check (`slug(name.en)` must not already exist among recipes, and must not equal any country slug).

### 11.6 Image requirement

Every new recipe MUST have a thumbnail in `public/js/recipe-images.js`. Recipes without images create the placeholder problem documented in §6. Run the image-add script in the same PR.

### 11.7 Cross-cuisine duplicate rule

If a dish has parallel cultural claims (see `CUISINE_CANONICAL_MAP.md §5`), only one hub gets the canonical `name.en`. Sibling variants in other hubs require a disambiguating adjective in the English name (`Ceviche Mexicano`, `Hyderabadi Biryani`, `Couscous Tunisien`, `Pierogi Ruskie`).

---

## 12. Phase 8A summary

### Wave 1 (cuisine renormalization)
- 3 cuisine renormalizations (UK → United Kingdom; Asia → Thailand; Middle East → Lebanon) — 3 recipes touched.
- 1 missing language field added (Plov `origin.pt`; Fish and Chips `name.hi` + `origin.hi`).
- Net hub count: 44 → 46 (United Kingdom and Lebanon newly eligible).

### Wave 2 (deferred items, fully resolved)
- **Kottbullar (id=119) deleted.** Swedish Meatballs (id=27) is now the canonical Swedish-meatball page. `kottbullar.webp` renamed to `swedish-meatballs.webp` as a thumbnail upgrade.
- **Tagine (id=118) renamed and rewritten** to `Chicken Tagine` (Djaj M'qalli style: preserved lemons + olives + saffron). Substantively differentiated from id=167 Lamb Tagine across ingredients (14 langs), howIsMade (14 langs), and originText (14 langs).
- **Ramen (id=28) renamed** to `Classic Japanese Ramen`. Three sub-style pages (Tonkotsu / Shoyu / Miso) preserved — semantic hierarchy maintained.
- **Pork schnitzel (id=155) renamed** to `Kotlet schabowy`. `pork-schnitzel.webp` renamed to `kotlet-schabowy.webp`.
- **43 Hindi (`hi`) backfills.** All 174 recipes now carry the full 14-language coverage on `name` and `origin`.
- **56 permanent (308) redirects** added to `vercel.json` (4 slug moves × 14 locales) so old URLs resolve to new ones for inbound link preservation.
- **Stale recipe directories deleted** across all 14 locales for the 4 renamed/removed slugs (kottbullar, tagine, ramen, pork-schnitzel).

### Final state
- Total recipes: **174** (was 175 — net –1 from Kottbullar deletion).
- Distinct cuisines: **87** (was 90 — net –3 from absorbing UK/Asia/Middle East).
- Eligible hubs (≥2 recipes): **46** (was 44).
- HTML pages: **3250** (within CI 3200-3400 envelope).
- Sitemap URLs: **3250** (within CI 3200-3400 envelope).
- Recipes missing any language code: **0**.
- Slug collisions: **0**.
- Forbidden regional origins (`Asia`, `Middle East`, etc.): **0**.
- Curly quotes in `recipes.js`: **0**.
- Stripe live keys / hardcoded service-role keys: **0**.

### Not actioned (genuinely out of scope or rejected as wrong)
- **22 "missing thumbnail" recipes (§6)** — original audit was wrong. Local-file precedence means all 174 recipes already have working thumbnails. No action needed.

Phase 8B (recipe expansion to 10 recipes per hub) is now unblocked. All §11 safety rules remain binding for new recipe creation.
