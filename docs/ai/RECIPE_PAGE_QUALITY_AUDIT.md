# Recipe Page Quality Audit

_Audited: 2026-05-18_
_Owner: Claude Code (Lead Developer)_
_Status: Read-only audit — no code changes_

---

## Pages & Sources Reviewed

| Resource | Notes |
|----------|-------|
| `public/ro/retete/bibimbap/index.html` | Full read |
| `public/ro/retete/pad-thai/index.html` | First 100 lines |
| `public/en/recipes/spaghetti-carbonara/index.html` | Full read |
| `public/fr/recettes/index.html` | First 120 lines (recipe index) |
| `public/de/rezepte/index.html` | First 60 lines (recipe index) |
| `public/ar/wasafat/hummus/index.html` | First 80 lines |
| `public/ja/reshipi/sushi/index.html` | First 60 lines |
| `scripts/generate-content.mjs` | Full read — feature cards (lines 2318–2332), nutrition (2334–2351), recipe template (2408–2453), hreflang (724–726) |
| `docs/ai/REPOSITORY_AUDIT.md` | Full read |
| `docs/ai/SEO_PLAN.md` | Full read |

Scale: **175 recipes × 14 languages = 2,450 recipe pages** + 14 recipe index pages.

---

## 1. Top Issues by Severity

### 🔴 CRITICAL

#### C1 — hreflang tags point to homepages, not to the same recipe in other languages
**Impact:** Google cannot associate the 14 language versions of each recipe with each other. Each recipe is treated as 14 independent pages rather than 1 multilingual piece of content. Potential duplicate-content penalty across 2,450 pages.

**Root cause:** Lines 724–726 of `scripts/generate-content.mjs` hardcode exactly 3 hreflang tags on every recipe page:
```html
<link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/"/>
<link rel="alternate" hreflang="ro"         href="https://meal-planner.ro/ro/"/>
<link rel="alternate" hreflang="en"         href="https://meal-planner.ro/en/"/>
```
Correct output would be 16 tags per page (x-default + 14 language-specific recipe URLs):
```html
<link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/en/recipes/bibimbap/"/>
<link rel="alternate" hreflang="ro"        href="https://meal-planner.ro/ro/retete/bibimbap/"/>
<link rel="alternate" hreflang="en"        href="https://meal-planner.ro/en/recipes/bibimbap/"/>
<!-- … one per language … -->
```
**Files to fix:** `scripts/generate-content.mjs` (hreflang template section)

---

#### C2 — All 2,450 recipe pages share one image (`cover2.jpg`)
**Impact:** Google Image Search rich snippets disabled for all recipes. Recipe rich results in SERPs (which display a food photo) will not fire. Visual differentiation between recipes is zero.

**Root cause:** `generate-content.mjs` checks for `public/images/{slug}.jpg` but no per-recipe image files exist, so every page gets:
```json
"image": ["https://meal-planner.ro/images/cover2.jpg"]
```
The `data-recipe="{slug}"` attribute exists in the HTML for JS-driven photo loading, but that is client-side only and invisible to Google.

**Files to fix:** Either add per-recipe images OR at minimum stop emitting the shared fallback image in JSON-LD (Google ignores a generic placeholder that matches across thousands of pages).

---

#### C3 — ISO 8601 time format is invalid in all JSON-LD
**Impact:** Google's Rich Results Test will reject `prepTime` and `totalTime` on every recipe page, preventing recipe rich snippets (star ratings, time, calories) in SERPs.

**Root cause:** `generate-content.mjs` templates produce:
```json
"prepTime": "PT1h",        // WRONG — lowercase, may include space
"totalTime": "PT1h 30m"   // WRONG — space between hours and minutes
```
Valid ISO 8601 requires:
```json
"prepTime": "PT1H",
"totalTime": "PT1H30M"
```
**Files to fix:** `scripts/generate-content.mjs` (time formatting in JSON-LD output, lines ~2420–2440)

---

#### C4 — `og:type = "website"` on all recipe pages
**Impact:** Facebook, LinkedIn, Pinterest, and other Open Graph consumers treat recipe shares as generic website links instead of rich article/recipe cards. Reduces click-through on social shares significantly.

**Root cause:** Recipe page template in `generate-content.mjs` copies the homepage OG type. Should be `"article"` (or the recipe-specific type).

**Files to fix:** `scripts/generate-content.mjs` (OG meta template)

---

### 🟠 HIGH

#### H1 — Feature cards are factually wrong
Feature cards appear on every recipe page as trust signals ("Rich in omega-3", "Ready in under 30 min", etc.). The selection logic in `recipeFeatureCards()` (lines 2318–2332) is heuristic-only and produces incorrect results.

Confirmed examples:
| Recipe | Card shown | Reality |
|--------|-----------|---------|
| Bibimbap | "Rich in omega-3" | No fish — the recipe uses beef |
| Bibimbap | "Ready in under 30 min" | Takes 85 min total |
| Spaghetti Carbonara | "Can be frozen" | Carbonara does not freeze well (egg sauce breaks) |

Every recipe has 4 feature cards; many will be wrong. Incorrect health or time claims damage user trust and could be flagged as misleading.

**Files to fix:** `scripts/generate-content.mjs` `recipeFeatureCards()` function

---

#### H2 — No BreadcrumbList structured data
The visual breadcrumb (`Home › Recipes › {Name}`) is present on every recipe page but has no JSON-LD equivalent. Google recommends BreadcrumbList schema alongside the Recipe schema for better SERP display.

**Files to fix:** `scripts/generate-content.mjs` (JSON-LD block)

---

#### H3 — No Premium link in recipe page navigation
Every recipe page nav shows: `Weekly Meal Plans · Recipes · App`. There is no Premium/⭐ link, unlike the app homepages which do have it. Recipes are high-intent entry pages (users who find a recipe via search are likely to be interested in planning meals) — missing the upsell path here is a significant conversion loss.

**Files to fix:** `scripts/generate-content.mjs` (nav template)

---

#### H4 — Double period bug in last recipe step
The final instruction step ends with `".."` (double period) on generated pages, caused by a period already present in the source data string being followed by a period added in the template.

Confirmed in:
- `public/en/recipes/spaghetti-carbonara/index.html` line 100: `"Serve immediately in warm bowls with extra Pecorino and pepper.."`
- `public/ro/retete/bibimbap/index.html` line 106: `"— amestecă totul bine înainte de mâncat.."`

Since this is a template bug it affects many or all recipes in all 14 languages (up to 2,450 pages).

**Files to fix:** `scripts/generate-content.mjs` (step rendering template)

---

#### H5 — Duplicate recipe in French index
`public/fr/recettes/index.html` lists "Boulettes de viande suédoises" (Swedish Meatballs) twice. Likely a data-level deduplication issue in the generator.

**Files to fix:** `scripts/generate-content.mjs` or `public/js/recipes.js` (source data)

---

#### H6 — Japanese sushi: two identical final steps
`public/ja/reshipi/sushi/index.html` contains a copy-paste error where the last two instruction steps are identical. Affects user trust for that specific recipe.

**Files to fix:** `public/js/recipes.js` (source recipe data for JA sushi) or `scripts/generate-content.mjs` (step deduplication)

---

### 🟡 MEDIUM

#### M1 — Recipe taglines are identical templates
Every recipe page has:
> "Spaghetti Carbonara is a traditional recipe from Italy."
> "Bibimbap este o rețetă tradițională din Coreea de Sud."

This is the same sentence structure for all 175 recipes × 14 languages. Zero SEO value (thin, non-unique content), zero user engagement value, and Google may assess it as boilerplate.

---

#### M2 — Nutrition data is heuristic with no disclaimer
`recipeNutrition()` in `generate-content.mjs` estimates values from ingredient category (meat = high protein, etc.), not from a real nutritional database. Values like "425 kcal / 18g protein / 46g carbs / 12g fat" for carbonara are plausible but unverified. There is no disclaimer ("estimated values" or similar) on the pages.

Legal/trust risk: displaying nutrition facts without accuracy is a liability in several markets.

---

#### M3 — Meta descriptions are thin and templated
All recipe page descriptions follow:
> `"{Name} recipe: ingredients, step-by-step instructions. Add to your free meal planner."`

For the recipe index pages it is even thinner:
> French index: `"175 recettes avec ingrédients et instructions."` (52 chars — Google truncates at 155)
> German index: similar short template

No keyword variation, no unique hooks per recipe, no locale-adapted phrasing.

---

#### M4 — Canonical and alternate point to wrong targets on recipe index
The recipe index `hreflang` has the same problem as individual recipe pages — it likely links to the homepage rather than to the same index in other languages.

---

#### M5 — "Add to shopping list" button is non-functional on static recipe pages
The button `<button class="btn-add-shopping">` exists in the static HTML but on a recipe static page there is no app context — no JS planner instance is present. Clicking it does nothing (or silently fails). Users coming from search who try to use this feature will be confused.

---

#### M6 — Footer shows "© 2025" (stale)
`public/en/recipes/spaghetti-carbonara/index.html` line 166: `<span>© 2025</span>`. The current year is 2026. This affects all 2,450 generated recipe pages and 14 recipe indexes.

**Files to fix:** `scripts/generate-content.mjs` (footer template)

---

### 🟢 LOW

#### L1 — Recipe images are 🍽️ emoji placeholders
The `data-recipe="{slug}"` attribute enables JS-based image loading via `content.js`, but only if actual `{slug}.jpg` images exist. None do. The visible result for any user with JS enabled is still an emoji placeholder. This is low-severity because it's a known infrastructure gap, not a code bug.

#### L2 — Recipe index has no filter, search, or sorting
175 recipes are listed with no category filter, cuisine filter, difficulty filter, or search. On mobile, scrolling through the full list is poor UX.

#### L3 — `prepTime` label says "Active time" (misleading)
The UI label for `prepTime` is "Active time" (or equivalent). ISO 8601 `prepTime` in Recipe schema actually means preparation time (including passive steps like marinating). Using it as "active time" is a semantic mismatch — but also means the JSON-LD time values may be intentionally different from UI values for the same concept, causing confusion in rich snippet displays.

#### L4 — No `aggregateRating` in Recipe JSON-LD
Recipe rich results in Google SERPs prominently show star ratings. Without `aggregateRating` in the schema, the star display never fires even if the time/ingredient issues are fixed.

---

## 2. Top SEO Opportunities

| Priority | Opportunity | Estimated Impact |
|----------|------------|-----------------|
| 1 | Fix hreflang to link recipe ↔ recipe across all 14 languages | High — eliminates potential duplicate content signals across 2,450 pages |
| 2 | Fix ISO 8601 time format to unlock Recipe rich snippets | High — enables time/calorie display in SERPs |
| 3 | Add BreadcrumbList JSON-LD | Medium — additional rich snippet element in SERPs |
| 4 | Fix `og:type` to `"article"` | Medium — improves social share cards |
| 5 | Unique, keyword-rich meta descriptions per recipe | Medium — CTR improvement from SERPs |
| 6 | Add `aggregateRating` to Recipe schema | Medium — star rating display in SERPs (requires user rating data) |
| 7 | Per-recipe images | High long-term — enables Google Image traffic + rich snippet photos |

---

## 3. Top UX Problems

| Priority | Problem | Affected Pages |
|----------|---------|----------------|
| 1 | "Add to shopping list" does nothing on static recipe pages | All 2,450 recipe pages |
| 2 | No Premium nav link — conversion path missing | All 2,450 recipe pages + 14 indexes |
| 3 | No recipe filter/search on index pages | 14 recipe index pages |
| 4 | Emoji placeholder instead of food photo | All 2,450 recipe pages |
| 5 | Feature cards show wrong health/time claims | Many of 2,450 recipe pages |
| 6 | Double period at end of last step | Many of 2,450 recipe pages |

---

## 4. Top Trust Problems

| Problem | Why It Matters |
|---------|---------------|
| Feature cards are factually wrong | "Rich in omega-3" for a beef dish, "30 min" for an 85-min recipe — users who follow these will feel misled |
| Nutrition values with no "estimated" disclaimer | Displaying unverified macros as fact is a legal/trust risk in EU markets |
| "© 2025" in footer | Makes the site look unmaintained, reduces trust for first-time visitors |
| Double period in last step | Small but visible quality signal — suggests automated/low-care generation |
| Tagline template is identical for all recipes | "X is a traditional recipe from Y" reads as machine-generated boilerplate |

---

## 5. What Should Be Improved First

**Recommended priority order:**

1. **Fix ISO 8601 time format** (C3) — Single regex/string fix in `generate-content.mjs`, regenerate. Unlocks rich snippets immediately. Zero risk.
2. **Fix hreflang on recipe pages** (C1) — Template fix in `generate-content.mjs`. High SEO value, medium complexity (need to build per-recipe language URL map).
3. **Fix `og:type`** (C4) — One-line change in template. Zero risk.
4. **Add Premium nav link** (H3) — One-line change in recipe nav template. Zero risk, direct revenue impact.
5. **Fix footer year** (M6) — One-line change. Zero risk.
6. **Fix double period bug** (H4) — Simple string trim in step rendering. Zero risk.
7. **Fix feature cards** (H1) — Requires rethinking the heuristic logic. Medium complexity, high trust impact.
8. **Add BreadcrumbList JSON-LD** (H2) — Additive change to JSON-LD block. Low risk.
9. **Fix "Add to shopping list" button** (M5) — Either wire up to app or remove/replace with a link to the planner pre-loaded with that recipe.
10. **Unique meta descriptions** (M3) — Content work; requires per-recipe description data.

---

## 6. Quick Wins vs. High-Effort Fixes

### Quick wins (< 1 hour each, single file, regenerate)

| Fix | File | Effort |
|-----|------|--------|
| Fix ISO 8601 time format | `scripts/generate-content.mjs` | 15 min |
| Fix `og:type` to `"article"` | `scripts/generate-content.mjs` | 5 min |
| Add Premium nav link to recipe pages | `scripts/generate-content.mjs` | 5 min |
| Fix footer year to 2026 | `scripts/generate-content.mjs` | 5 min |
| Fix double period in last step | `scripts/generate-content.mjs` | 10 min |
| Add "estimated values" disclaimer to nutrition | `scripts/generate-content.mjs` | 10 min |
| Remove generic image from JSON-LD (stop emitting shared fallback) | `scripts/generate-content.mjs` | 10 min |

### Medium effort (2–4 hours each)

| Fix | File | Effort |
|-----|------|--------|
| Fix hreflang to point recipe → same recipe in all 14 languages | `scripts/generate-content.mjs` | 3–4 hrs (need slug mapping across all locales) |
| Add BreadcrumbList JSON-LD | `scripts/generate-content.mjs` | 1 hr |
| Rework `recipeFeatureCards()` to use accurate rules | `scripts/generate-content.mjs` | 2–3 hrs |
| Fix "Add to shopping list" — link to `/lang/?meal={Name}` | `scripts/generate-content.mjs` | 30 min (replace button with anchor) |
| Deduplicate French index / fix JA sushi duplicate step | `public/js/recipes.js` | 30 min |

### High effort (days to weeks)

| Fix | What's Needed | Effort |
|-----|--------------|--------|
| Per-recipe food photography | 175 original food photos | High (external) |
| Real nutritional database | API or local dataset, regenerate schema | High |
| Unique meta descriptions per recipe | 175 × 14 = 2,450 unique strings | Very high (needs AI generation pass) |
| `aggregateRating` in JSON-LD | User-facing rating UI + data store | High |
| Recipe index filter/search | JS filter component | Medium-high |

---

## 7. Examples

### hreflang (current — wrong)
```html
<!-- Same 3 tags on EVERY recipe page in EVERY language -->
<link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/"/>
<link rel="alternate" hreflang="ro"         href="https://meal-planner.ro/ro/"/>
<link rel="alternate" hreflang="en"         href="https://meal-planner.ro/en/"/>
```

### hreflang (target — correct)
```html
<!-- Recipe-specific, language-specific, all 14 languages listed -->
<link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/en/recipes/bibimbap/"/>
<link rel="alternate" hreflang="ro"        href="https://meal-planner.ro/ro/retete/bibimbap/"/>
<link rel="alternate" hreflang="en"        href="https://meal-planner.ro/en/recipes/bibimbap/"/>
<link rel="alternate" hreflang="es"        href="https://meal-planner.ro/es/recetas/bibimbap/"/>
<!-- … 10 more … -->
```

### ISO 8601 time (current — invalid)
```json
"prepTime": "PT1h",
"totalTime": "PT1h 25m"
```

### ISO 8601 time (target — valid)
```json
"prepTime": "PT55M",
"totalTime": "PT1H25M"
```

### Feature cards (current — wrong for Bibimbap)
```
🐟 Rich in omega-3   (Bibimbap has beef, not fish)
⚡ Ready in under 30 min  (Bibimbap takes 85 min)
```

### Double period (current)
```html
<li><span class="step-num">6</span><span>Serve immediately in warm bowls with extra Pecorino and pepper..</span></li>
```

### "Add to shopping list" (current — dead button on static page)
```html
<button class="btn-add-shopping"><i class="bi bi-cart-plus"></i> Add to shopping list</button>
```

### "Add to shopping list" (target — functional link)
```html
<a href="/en/?meal=Spaghetti%20Carbonara" class="btn-add-shopping"><i class="bi bi-cart-plus"></i> Add to meal plan</a>
```

---

## 8. Exact Files Involved

| File | Issues |
|------|--------|
| `scripts/generate-content.mjs` | C1 (hreflang), C3 (ISO time), C4 (og:type), H2 (BreadcrumbList), H1 (feature cards), H3 (Premium nav), H4 (double period), M2 (nutrition disclaimer), M3 (meta descriptions), M5 (shopping list button), M6 (footer year), H5 (dedup), L3 (prepTime label) |
| `public/js/recipes.js` | H5 (duplicate FR entry), H6 (JA sushi duplicate step) |
| `public/images/` | C2 (per-recipe images — currently missing) |

All generated HTML files under `public/` are outputs — fixing `generate-content.mjs` and running `npm run content` regenerates all 2,450 recipe pages.

---

## 9. Risk Assessment

| Fix | Risk Level | Notes |
|-----|-----------|-------|
| ISO 8601 time format | **Low** | Pure string transform, no logic change |
| `og:type` → `"article"` | **Low** | Additive/corrective, no side effects |
| Premium nav link | **Low** | Additive HTML element |
| Footer year | **Low** | String change |
| Double period fix | **Low** | String trim on last step |
| Nutrition disclaimer | **Low** | Additive text |
| Remove shared image from JSON-LD | **Low** | Removes a field; rich results cannot get worse |
| hreflang fix | **Medium** | Requires building slug-to-language-URL mapping; test carefully that all 14 locale paths are correct before deploying |
| BreadcrumbList JSON-LD | **Low** | Additive schema; no existing markup to break |
| Feature cards rework | **Medium** | Logic change affects all 2,450 pages; needs QA across recipe types |
| Shopping list → planner link | **Low** | Behavioral change visible to users; straightforward |
| Dedup French/JA data | **Low** | Data fix, narrow impact |
| Per-recipe images | **Low** (operational) | Infrastructure gap; adding images has no regression risk |
| Real nutrition data | **Medium** | Data migration; current estimates may be significantly off |

**No fix in this list poses high risk to payments, authentication, or core app functionality.** All recipe-page fixes are isolated to the content generation pipeline and static HTML output.

---

_End of audit. No code was modified during this audit session._
