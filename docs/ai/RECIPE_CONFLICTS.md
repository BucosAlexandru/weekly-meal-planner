# RECIPE_CONFLICTS

**Status:** Phase 8A — Data Hygiene
**Scope:** Catalogue of duplicate, near-duplicate, overlap-risk, and misnamed recipes in `public/js/recipes.js`. Pair with `CUISINE_CANONICAL_MAP.md`.

This file is the source of truth for "which existing rows are problematic and what should happen to them." It does NOT make destructive changes on its own — entries marked **DEFERRED** require explicit approval before deletion/rename because they alter recipe URLs and the static page count.

---

## 1. Hard duplicates (same dish, two rows)

### 1.1 Kottbullar (id=119) === Swedish Meatballs (id=27) — DEFERRED

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

**Recommended fix:** keep id=27 (English title, has image, more SEO weight), delete id=119, merge the better technique notes (panada, soy-darkened gravy) into id=27's `howIsMade` content in a follow-up content pass.

**Why deferred:** removing id=119 deletes `/<lc>/recipes/kottbullar/` × 14 locales (–14 pages, –14 sitemap entries). External backlinks would 404. Needs sign-off.

---

### 1.2 Lamb Tagine (id=167) ≈ Tagine (id=118) — DEFERRED

Both rows are Moroccan meat tagines. id=118's `name.en = 'Tagine'` but its ingredients list "1 kg bone-in lamb shoulder, cut into 4 cm cubes (or chicken thighs)" — so it's effectively a lamb tagine with chicken as a noted alternative. id=167 is a dedicated lamb tagine with more elaborate marination and spice work.

| | id=118 Tagine | id=167 Lamb Tagine |
|---|---|---|
| `origin.en` | Morocco | Morocco |
| Slug | tagine | lamb-tagine |
| Meat | Lamb shoulder (chicken alt) | Lamb shoulder only |
| Spices | Ras el hanout + cumin + cinnamon + turmeric | Same + coriander + paprika + ginger + saffron |
| Distinct? | No — same dish family | No — same dish family |

**Recommended fix:** rename id=118 to `Chicken Tagine` (and rewrite its ingredient list to make chicken the primary protein, not the alternative) so it's a genuinely different recipe. Keep id=167 as `Lamb Tagine`. This gives Morocco two distinct dishes instead of one duplicated dish.

**Why deferred:** id=118's slug currently is `tagine`. Renaming changes the URL to `chicken-tagine`. Old URL 404s. Needs sign-off + a content rewrite (not a pure label change).

---

## 2. Soft duplicates (intent overlap, may coexist with care)

### 2.1 Ramen family — DEFERRED

Japan has 4 ramen recipes: id=28 `Ramen`, id=181 `Tonkotsu Ramen`, id=182 `Shoyu Ramen`, id=183 `Miso Ramen`. The three sub-styles are legitimately distinct (different broth + tare). The generic `Ramen` (id=28) overlaps with `Shoyu Ramen` (id=182) — id=28's broth uses chicken/pork stock + soy + mirin, which IS the shoyu profile.

**Recommended fix:** delete id=28 (the generic). The three sub-style pages give the user a more useful editorial map of ramen and don't double-count. Alternative: rename id=28 to `Yokohama Iekei Ramen` or another regional variant.

**Why deferred:** removing id=28 deletes `/<lc>/recipes/ramen/` × 14 locales. "Ramen" is a high-search-volume slug and the Japan hub already had 7 entries that lean ramen-heavy — losing the canonical `Ramen` URL is potentially the biggest SEO hit on this list. Recommend renaming over deleting.

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

### 3.1 Pork schnitzel (id=155) — DEFERRED

`origin.en = 'Poland'` and `name.en = 'Pork schnitzel'`. The technique IS authentically Polish (kotlet schabowy: milk soak + flour-egg-breadcrumb breading + lard frying), but the English `name.en` collides conceptually with id=17 `Schnitzel` (Germany). The German row uses veal/pork pounded thin + breaded; the Polish row uses pork loin chops with the milk-soak step that distinguishes the Polish version. Same English name, two cuisines.

**Recommended fix:** rename id=155 → `Kotlet schabowy` across all 14 `name.*` fields. Origin stays Poland. URL slug becomes `kotlet-schabowy`.

**Why deferred:** changes the URL slug (`/<lc>/recipes/pork-schnitzel/` → `/<lc>/recipes/kotlet-schabowy/`) across 14 locales. Old URLs 404. Needs sign-off, and ideally paired with a redirects pass.

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

## 5. Missing language coverage (`hi` gap) — DEFERRED

CLAUDE.md flags that older recipes are routinely missing the Hindi (`hi`) language code. The audit found:

- **44 recipes missing `name.hi`** (ids: 1, 2, 4, 5, 9, 12, 14, 16, 19, 20, 21, 22, 23, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60, 115, 118, 124, 126, 132, 133, 134, 135, 138, 181, 182, 183)
- **40 recipes missing `origin.hi`** (subset of the same set)

Phase 8A fixed `hi` for id=20 only (since the origin was being rewritten anyway). The other 43 need a dedicated translation pass — punted to a follow-up because:

1. Translating 44 recipe display names + country names to Hindi requires either a translation service or a Hindi-speaking reviewer. The CI does not currently fail on a missing `hi` field, so this is a quality/coverage issue rather than a blocker.
2. Doing it inline with this audit would inflate the diff to thousands of lines and dilute the review.

**Recommended fix:** spawn a separate task `phase-8a-fill-hindi.mjs` that walks the 43 remaining recipes and adds `name.hi` + `origin.hi` from a curated translation map. Before Phase 8B (new recipes), every existing recipe should have all 14 codes.

---

## 6. Missing recipe thumbnails — DEFERRED

22 recipes have no entry in `public/js/recipe-images.js`. Each one renders the placeholder hero. List:

| id | Dish | Origin |
|---|---|---|
| 12 | Dhal | India |
| 39 | Poutine | Canada |
| 53 | Hangi | New Zealand |
| 56 | Svíčková | Czech Republic |
| 57 | Fårikål | Norway |
| 59 | Crni Rizot | Croatia |
| 81 | Zeama | Moldova |
| 84 | Smørrebrød | Denmark |
| 87 | Bún bò Huế | Vietnam |
| 98 | Oka i'a | Samoa |
| 104 | La Bandera | Dominican Republic |
| 114 | Lok Lak | Cambodia |
| 119 | Kottbullar | Sweden (likely deletion candidate — see §1.1) |
| 125 | Piragi | Latvia |
| 127 | Causa Limeña | Peru |
| 129 | Beshbarmak | Kyrgyzstan |
| 132 | Rösti | Switzerland |
| 137 | Ichlekli | Turkmenistan |
| 140 | Chicken Fricassée | France |
| 164 | Lángos | Hungary |
| 168 | Shepherd's Pie | United Kingdom |
| 177 | Karelian stew | Finland |

**Recommended fix:** run the existing batch-image tooling (`scripts/batch-image-add.mjs` / `add-recipe-image.mjs`) against this 22-row shortlist. `public/js/recipe-images.js` is auto-generated — do not hand-edit. Do NOT block Phase 8B on this; thumbnails can be added in parallel.

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

**Applied:**
- 3 cuisine renormalizations (UK → United Kingdom; Asia → Thailand; Middle East → Lebanon) — 3 recipes touched.
- 1 missing language field added (Plov `origin.pt`; Fish and Chips `name.hi` + `origin.hi`).
- Net hub count: 44 → 46 (United Kingdom and Lebanon newly eligible).
- Net page count change: +28 (2 new hubs × 14 locales).

**Deferred (require sign-off before action):**
- 4 hard/soft duplicate resolutions (Kottbullar, Lamb Tagine, generic Ramen, Pork schnitzel rename).
- 43 remaining `hi`-language backfills.
- 22 missing recipe thumbnails.

**No issues found:**
- Curly quotes in `recipes.js`: 0.
- Slug collisions: 0.
- Broken internal links: 0.
- Cross-locale route inconsistencies: 0.
- Mixed-language rendering: only the `hi`-fallback (graceful) — resolved by §5 fix.

Phase 8B (recipe expansion to 10/hub) may proceed only after the deferred items in §1, §2.1, §3 are explicitly accepted or rejected. The safety rules in §11 are binding from this point forward.
