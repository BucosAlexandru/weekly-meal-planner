# DISCOVERY ARCHITECTURE AUDIT — Phase 7, Step 1

**Date:** 2026-05-24
**Branch:** `claude/phase-7-discovery-audit-5Fgi9`
**Status:** Planning / architecture only. **No UI implementation in this phase.**

This document is the audit + proposal that gates the rest of Phase 7. It answers:
1. What metadata already exists, and which discovery sections we can build with *zero* new data.
2. What's missing and what risks that creates for localization and SEO.
3. Which discovery section types are safe and reusable.
4. How internal linking should change to lift pages/session and crawl depth without spam.
5. Recommended PR order for the next steps.

---

## 1. Existing data — what we can use today

### 1.1 Recipe schema (`public/js/recipes.js`)

183 recipe IDs (1–183), 175 active recipe objects. Per-recipe fields:

| Field           | Type                | Multilingual | Notes |
|-----------------|---------------------|--------------|-------|
| `id`            | int                 | n/a          | Sequential 1–183. Some IDs removed (e.g. 12, 39 — see `recipe-images.js`). |
| `name`          | object              | **14/14**    | Full coverage. Source for slug via `name.en \|\| name.ro`. |
| `origin`        | object              | **14/14**    | Country string. 73 distinct cuisines. |
| `originText`    | object              | **14/14**    | Long backstory paragraph. |
| `category`      | object              | **14/14**    | Enum-ish: `Lunch`, `Dinner`, `Breakfast`, `Snack`. |
| `featureCards`  | object              | 13/14        | `hi` missing in recipes 1–~80. |
| `pairings`      | object              | 13/14        | Same gap as featureCards. |
| `pairingsType`  | string              | n/a          | Enum: `pasta`, `soup`, `meat`, `veg`, `def`, `japanese`, `seafood`, … |
| `tipType`       | string              | n/a          | Mirrors `pairingsType` taxonomy. |
| `ingredients`   | object of arrays    | **14/14**    | Free-text strings, quantities embedded. **No structured ingredient IDs.** |
| `howIsMade`     | object              | **14/14**    | Procedural text. |
| `nutrition`     | `{cal,prot,carb,fat,fib}` | n/a    | All numeric. Suitable for "high-protein" filters. |
| `servings`      | int                 | n/a          | 100% present. |

### 1.2 Recipe metadata sidecar (`public/js/recipes-meta.js`)

Keyed by recipe ID. Applied at runtime in `app.js`, **not** baked into recipes.js. The static HTML generator (`generate-content.mjs`) does read `recipes.js` directly but the sidecar fields are also available because the generator imports it.

| Field      | Type        | Coverage  | Notes |
|------------|-------------|-----------|-------|
| `time`     | int (min)   | 175/175   | Range ~10–4320 min (some cures span days). |
| `costRon`  | float       | 175/175   | RON / serving. Range ~12–45 RON. |
| `tags`     | string[]    | 175/175   | **Closed taxonomy of 9**: `quick`, `budget`, `vegetarian`, `vegan`, `high-protein`, `family`, `healthy`, `spicy`, `one-pot`. Labels for all 14 langs in `recipes-meta.js:6–21`. |
| `desc`     | object      | 175/175   | Short multilingual description (~70 char), 14 langs. |

This is the single most important file for discovery — `tags` is already a clean, multilingual closed-vocab.

### 1.3 Budget recipe set (`public/js/recipes-budget.js`)

200 separate entries (`budget_001`–`budget_200`). Schema is **different** from `recipes.js`:

- `id` is a string, not int → cannot collide / merge cleanly.
- `title` (not `name`), `country` (not `origin`), `time: {prepMin, cookMin}`, no `nutrition`, no `tipType`.
- Tags: `budget`, `cheap`, `crisis`, `simple`, `world`.
- **Not currently referenced by `generate-content.mjs`** — does not appear on any static page. Loaded only lazily by `app.js`.

**Risk:** if we surface budget recipes in discovery sections, we must either (a) keep them planner-only and exclude from static pages, or (b) write a normalization layer. Recommend (a) for Phase 7.

### 1.4 Images (`public/js/recipe-images.js`)

Auto-generated. Maps `id → URL` (Spoonacular + Wikipedia, 312×231). Some IDs intentionally have no image. Already used by recipe detail and cuisine hub pages.

### 1.5 Pages already generated (`scripts/generate-content.mjs`)

~3,236 URLs in sitemap.xml. Page types:

| Page                 | URL pattern                                  | Languages  | Count |
|----------------------|----------------------------------------------|------------|-------|
| Homepage             | `/`, `/{lc}/`                                | 14         | 15 |
| Plan index           | `/{lc}/{slug}/` (per-lang slug)              | 14         | 14 |
| Plan detail          | `/{lc}/{slug}/{plan-slug}/`                  | 14 × 8     | 112 |
| Recipe index         | `/{lc}/recipes/` (per-lang slug)             | 14         | 14 |
| **Recipe detail**    | `/{lc}/recipes/{recipe-slug}/`               | **ro + en only** | ~350 |
| Cuisine hub          | `/{lc}/recipes/{country-slug}/`              | 14 × 44    | 616 |
| Pricing              | `/{lc}/pricing/`                             | 14         | 14 |

**Critical finding:** recipe detail pages exist only in `ro` and `en`. The other 12 languages have cuisine hubs but no recipe-level pages. Any discovery section that deep-links to a recipe must be locale-aware about which detail page actually exists.

### 1.6 Current internal linking (where it ends today)

| From → To                         | Edges generated by `generate-content.mjs` |
|-----------------------------------|-------------------------------------------|
| Homepage → 6 featured cuisine hubs | 6 × 14 = 84 (via `injectCuisineHomeSection`, generate-content.mjs:3921) |
| Plan index → cuisine hubs (6 featured) | 6 × 14 = 84 (generate-content.mjs:1830–1842) |
| Plan detail → cuisine hubs (6) + sibling plans (7) | 13 × 112 = ~1,456 |
| Recipe index → 44 cuisine hubs    | 44 × 14 = 616 |
| Cuisine hub → up to 4 recipes (in ro/en where pages exist) | ~1,400 |
| Recipe detail → up to 5 same-origin recipes + cuisine hub | ~875 + 350 |
| Pricing → none recipe/cuisine     | **0 (dead end)** |

**Gaps confirmed:**

1. Pricing pages link only to other pricing locales — zero recipe/cuisine outbound.
2. Plan detail's "Other plans" list (7 sibling plans) is the only post-plan navigation; no link to specific recipes referenced in that plan.
3. Recipe-to-recipe discovery is **only** same-origin — no cross-cuisine bridging by tag/meal-type/time.
4. Cuisine hubs cap at 4 recipes shown; if a cuisine has 6+ recipes (Mexico=7, Japan=7) the rest are unreachable from the hub.
5. Recipe details have no hreflang for the 12 languages that lack a translated page (acceptable but worth flagging).

---

## 2. What can be built **without new data**

Using only existing `recipes.js` + `recipes-meta.js` + `recipe-images.js`:

| Discovery axis            | Field used                  | Confidence |
|---------------------------|-----------------------------|------------|
| By cuisine / country      | `origin`                    | High |
| By meal type              | `category` (Lunch/Dinner/Breakfast/Snack) | High |
| By tag (9 closed values)  | `tags[]`                    | High |
| By prep time              | `time` (minutes)            | High |
| By cost                   | `costRon`                   | High (RON-only; presentation still works in every locale) |
| By protein content        | `nutrition.prot`            | Medium — needs a threshold; combines well with `high-protein` tag |
| By dish kind              | `pairingsType` / `tipType`  | Medium — taxonomy is implicit; values like `pasta`, `soup`, `seafood`, `japanese` are usable but inconsistent |
| By difficulty             | — (not stored)              | **Cannot build** without new data |
| By dietary label (gluten-free, dairy-free, …) | — (not stored beyond `vegetarian`/`vegan`) | Limited |
| By ingredient             | `ingredients[]` strings     | **Not reliable** — free-text, no normalized IDs |

---

## 3. What is missing / blocked

1. **Difficulty.** Not in any file. Can be inferred from time + step count later, but Phase 7 should not invent it.
2. **Dietary labels beyond vegetarian/vegan.** No `gluten-free`, `dairy-free`, `keto`, etc. Adding them = batch retag, out of scope for Phase 7 Step 1.
3. **Structured ingredients.** Free-text only. A "find recipes with chickpeas" feature would need a new normalization pass.
4. **`hi` (Hindi) gaps** in `featureCards` / `pairings` for recipes 1–~80. Already a known issue (CLAUDE.md). Not blocking discovery, but any new field we add must include `hi`.
5. **Recipe detail pages only in ro + en.** A discovery card that links to a recipe must, for the other 12 langs, link to the cuisine hub instead.
6. **Budget recipes orphaned from static pages.** Including them in discovery means either skipping (recommended) or building a normalization layer.
7. **No `MealPlan` JSON-LD.** Plans pages have no structured data; out of scope for Phase 7 but worth noting.

---

## 4. Proposed discovery section types

Each section is a reusable component with explicit selection rules. **No UI implementation in this step** — these are specifications for Phase 7 Step 2 / future PRs.

### 4.1 `popular-cuisines`
- **Source:** `origin` field across `recipes.js`.
- **Rule:** Top N cuisines by recipe count, with a hand-curated tie-break for "marquee" cuisines (Mexico, Japan, France, Italy, India, Greece).
- **Max items:** 6 (existing homepage already shows 6 — be consistent).
- **Fallback:** None needed; data always present.
- **Locales:** All 14 (links to cuisine hubs which exist in all 14 langs).
- **Surfaces:** homepage ✓ (already exists), plan detail ✓ (already exists), recipe index (NEW), pricing footer (NEW, light).

### 4.2 `quick-dinners`
- **Source:** `tags` contains `quick` AND `category[lc] in {Dinner, Lunch}` AND `time ≤ 30`.
- **Max items:** 8.
- **Fallback:** If <4 matches in a locale, relax to `time ≤ 40`.
- **Locales:** All 14 (link to cuisine hub if recipe page absent).
- **Surfaces:** homepage, recipe index, cuisine hub (when context fits).

### 4.3 `comfort-food`
- **Source:** `tipType in {soup, pasta, meat}` OR `tags` contains `family` OR `one-pot`.
- **Max items:** 8.
- **Fallback:** Same-origin family-tagged recipes.
- **Locales:** All 14.
- **Surfaces:** homepage, recipe index.

### 4.4 `world-soups`
- **Source:** `tipType === 'soup'` OR `pairingsType === 'soup'` OR `name.en` matches `/soup|stew|broth|ramen|pho/i`.
- **Max items:** 8.
- **Cross-cuisine rule:** at most 1 per `origin` (forces global spread).
- **Locales:** All 14.
- **Surfaces:** homepage, recipe index.

### 4.5 `rice-and-noodles`
- **Source:** `pairingsType in {'japanese', 'asian'}` OR ingredient string match `/rice|noodle|udon|soba|pasta|risotto/i`. (Acknowledge the ingredient match is fuzzy — it's why we picked a generous net.)
- **Max items:** 8.
- **Locales:** All 14.
- **Surfaces:** recipe index, plan detail.

### 4.6 `high-protein-meals`
- **Source:** `tags` contains `high-protein` OR `nutrition.prot ≥ 30`.
- **Max items:** 8.
- **Locales:** All 14.
- **Surfaces:** homepage, recipe index, plan detail.

### 4.7 `budget-friendly`
- **Source:** `tags` contains `budget` OR `costRon ≤ 18` (median is ~24 RON).
- **Max items:** 8.
- **Locales:** All 14. Cost label translated; RON figure presented universally for now.
- **Surfaces:** recipe index, plan detail, pricing footer.
- **Note:** Does **not** pull from `recipes-budget.js` in Phase 7 (different schema, planner-only).

### 4.8 `from-this-cuisine` (recipe-detail upsell)
- **Source:** Same `origin` as current recipe, excluding self.
- **Rule:** Up to 5 (already implemented, lines 3038–3058) — **keep as-is**.
- **Status:** Already exists. Note: when `origin` has >5 candidates, we currently cap silently; consider a "see all in X" link (already exists via the section header, line 3151).

### 4.9 `similar-tag-mix` (recipe-detail bridge)
- **Source:** Intersection of `tags` with current recipe's tags, sorted by overlap count, **different `origin`**.
- **Max items:** 4.
- **Rule:** Used to bridge cuisines — a Thai curry recipe links to an Indian curry via the `spicy` tag.
- **Locales:** Link to cuisine hub if recipe detail doesn't exist in the locale.
- **Surfaces:** recipe detail (NEW — this is the key cross-cuisine bridge).

**Total: 9 section types (above the 5–8 floor). Step 2 of Phase 7 will commit final names + final config in a small spec file before any HTML emits.**

---

## 5. Internal linking map

Goal: lift pages/session and crawl depth without spammy density. Targeted **net new** internal edges per locale:

### 5.1 Homepage `/{lc}/`
- Already: 6 cuisine cards, planner widget, plans/recipes/pricing nav.
- **Add:** one `quick-dinners` strip (8 cards) AND one `comfort-food` OR `world-soups` strip (rotate seasonally or by hash of `lc` to keep variety). **Net new edges per locale:** ~16.
- Risk: keep below the fold for performance; lazy-load images. Don't break LCP on the existing hero.

### 5.2 Recipe index `/{lc}/recipes/`
- Already: 44 cuisine hub tiles.
- **Add:** sections `popular-cuisines` (already implicit — keep), `quick-dinners`, `comfort-food`, `world-soups`, `high-protein`, `budget-friendly`. Order by user value, not alphabetical.
- **Net new edges per locale:** ~40 (8 × 5 new sections).

### 5.3 Cuisine hub `/{lc}/recipes/{country}/`
- Already: up to 4 recipes in that country + back-to-all.
- **Issue:** caps at 4 even when 7 recipes exist (Mexico, Japan). **Fix as part of Phase 7:** raise cap to 8 OR add "more from this cuisine" pagination, before any decorative sections.
- **Add:** a `related-cuisines` strip (geographic / culinary neighbors — small hand-curated map in `generate-content.mjs`, e.g. `Japan → {Korea, China, Vietnam}`, `Mexico → {Peru, Spain, USA}`).
- **Add:** one tag-bridged strip (e.g. "Quick dishes from X" if any of the cuisine's recipes have `quick` tag).
- **Net new edges per hub per locale:** ~6.

### 5.4 Recipe detail `/{lc}/recipes/{slug}/` (ro+en only)
- Already: same-cuisine related (5), cuisine hub link, app CTA, breadcrumb.
- **Add:** `similar-tag-mix` (4 cards) — the cross-cuisine bridge.
- **Add:** a one-line "Try this with" pairing card if `pairings[lc]` exists (this is already-stored data, currently underused). Light, in-content, not a section.
- **Net new edges per recipe:** ~5.

### 5.5 Plan detail `/{lc}/{plan-slug}/{plan}/`
- Already: 6 cuisines + 7 sibling plans.
- **Add:** `recipes-in-this-plan` strip linking to the recipes this plan references (where pages exist). This is the missing reverse-link from plan → recipe. **Net new edges per plan per locale:** ~7.

### 5.6 Pricing `/{lc}/pricing/`
- Currently a dead end for recipes.
- **Add a small "Explore recipes" footer block** (4 cuisine cards + 4 recipe cards) so the page isn't a crawl cul-de-sac.
- Risk: don't dilute the conversion goal. Keep it visually small, **below** the pricing tiers + FAQ.
- **Net new edges per locale:** ~8.

### 5.7 Anti-spam guardrails
- No single page emits more than ~50 net new internal links beyond what it already has.
- Every new strip caps at 8 items.
- Same recipe should not appear in >2 strips on the same page (dedupe pass).
- Strips render server-side; no JS-injected link farms.
- `rel="nofollow"` is **not** needed — these are first-party, editorial links.

---

## 6. Risks

### 6.1 Localization
- **`hi` gaps** in `featureCards` / `pairings` for recipes 1–~80. Any new multilingual field MUST ship with all 14 langs (CLAUDE.md invariant #3).
- **12 langs have no recipe detail pages.** Discovery cards in those langs must degrade to cuisine-hub links. Generator code already has the slug→hub helper (`recipeCuisineHubHref`, line 3066) — reuse it.
- **Curly quotes** in `recipes.js` break JS parsing (CLAUDE.md invariant #1). Anything we add to recipes/data files must be ASCII-safe or pre-checked.

### 6.2 SEO
- **Crawl budget:** Adding 5–10 links per page across 3,236 pages = 15k–30k new internal edges. Healthy as long as anchor text varies and pages aren't churned every build. **Risk:** if every discovery strip uses identical anchors ("View recipe"), that's a thin-anchor signal. Vary anchor text using `name[lc]`.
- **Duplicate content:** A `popular-cuisines` strip on homepage + recipe index + every plan detail is fine *if* it's not the primary content. Keep it as a secondary section under the page's main content. Don't replicate the same strip on every cuisine hub.
- **Page size:** Each recipe card is ~400 bytes of HTML + image preload. 8 cards × 5 strips × 14 langs across the page set could noticeably bloat `index.html` files. Hold to ≤8 cards/strip, single image per card.
- **Hreflang:** Recipe details emit only `x-default/ro/en` (line 10 of generated pages). Phase 7 should leave this alone unless we add real translations.

### 6.3 Build & CI
- HTML page count guard: 3200–3400 (CLAUDE.md). Adding discovery sections doesn't change page count; **safe**.
- Sitemap count guard: same; **safe**.
- No `sk_live_` / no service-role-key changes; **safe**.
- `node --check` API handler list: not touched in Phase 7 Step 1.

### 6.4 Performance
- Existing homepage already injects a cuisine section. Adding 2 more strips below the fold is acceptable; **must lazy-load images** (existing pattern in `generate-content.mjs` already uses `loading="lazy"` for recipe tiles).
- Plan detail pages are heavier (full plan table + shopping list). Add at most 1 new strip there.

---

## 7. Recommended next-PR order

Order PRs from lowest risk → highest, each independently shippable.

### **PR 1 — Spec file + helper functions (no UI emit)**
- Add `scripts/discovery-config.mjs` exporting the 9 section type configs (selection rules, max items, surfaces).
- Add helper functions in `generate-content.mjs`: `selectByTag()`, `selectByOrigin()`, `selectByTimeMax()`, `selectByTagMix()`, dedupe pass.
- **Tests:** none configured; rely on `npm run content` outputting normal page counts.
- **Files changed:** `scripts/discovery-config.mjs` (new), `scripts/generate-content.mjs` (+helpers, no HTML changes).
- **Estimated complexity:** S (1 session).

### **PR 2 — Cuisine hub: raise cap to 8 + add "related cuisines" strip**
- The cap fix is a real bug (Mexico/Japan have 7 recipes, hub shows 4).
- Hand-curate `RELATED_CUISINES` map in `generate-content.mjs` for the top ~20 cuisines.
- **Files changed:** `scripts/generate-content.mjs` only.
- **Estimated complexity:** S.

### **PR 3 — Recipe detail: `similar-tag-mix` cross-cuisine bridge**
- Adds one strip of 4 recipes to ~350 recipe pages (ro+en).
- High SEO leverage; minimal risk.
- **Files changed:** `scripts/generate-content.mjs` only.
- **Estimated complexity:** S.

### **PR 4 — Recipe index: add `quick-dinners`, `world-soups`, `high-protein`, `budget-friendly`**
- 4 strips on 14 index pages = lots of new edges from a high-PR page.
- Test locally that LCP / page weight stays sane.
- **Files changed:** `scripts/generate-content.mjs` only.
- **Estimated complexity:** M.

### **PR 5 — Homepage: 1 more strip (`quick-dinners` or `comfort-food`)**
- Carefully, below the fold. Lazy-loaded images. Verify hero LCP not regressed.
- **Files changed:** `scripts/generate-content.mjs` only (function `injectCuisineHomeSection` extended or new sibling).
- **Estimated complexity:** M.

### **PR 6 — Plan detail: `recipes-in-this-plan` strip + pricing footer "Explore recipes" block**
- Plan detail gets the reverse-link to recipes it references.
- Pricing gets a small outbound block to break the cul-de-sac.
- **Files changed:** `scripts/generate-content.mjs` only.
- **Estimated complexity:** S.

### **PR 7 (optional, hold) — Visual polish / animation pass**
- Only after PRs 1–6 ship cleanly. Animations are explicitly deferred per the brief.

**Stop after each PR, verify `npm run build` clean, page count 3200–3400, sitemap count 3200–3400, no curly quotes.**

---

## 8. Files likely to change (Phase 7 total)

| File                                     | Why |
|------------------------------------------|-----|
| `scripts/discovery-config.mjs` (new)     | Reusable section configs. |
| `scripts/generate-content.mjs`           | All HTML emit + helpers + `RELATED_CUISINES` map. **Single chokepoint.** |
| `public/css/style.css`                   | Minor styles for new strip variants (reuse existing card styles where possible). |
| `public/js/i18n.js`                      | New section header strings × 14 langs (`Quick dinners`, `Comfort food`, …). |
| `public/index.html`                      | Only if homepage strips need a new SPA-side variant; ideally avoided. |

**Files explicitly NOT touched in Phase 7:** anything under `api/`, `public/js/app.js`, `public/js/recipes.js`, `public/js/recipes-meta.js`, `public/js/checkout.js`, `public/js/portal.js`, Stripe / Supabase / OpenAI integrations, PDF generation.

---

## 9. Estimated complexity

| PR  | Size | Risk | Reversibility |
|-----|------|------|---------------|
| PR 1 | S | Low | Trivial (no HTML emit) |
| PR 2 | S | Low | Trivial |
| PR 3 | S | Low–Med | Trivial (regen erases) |
| PR 4 | M | Med | Trivial |
| PR 5 | M | Med (LCP) | Trivial |
| PR 6 | S | Low | Trivial |

Total ≈ 1–2 weeks of focused work if shipped sequentially. Every PR is reversible by reverting one file (`generate-content.mjs`) and re-running `npm run content`.

---

## 10. Open questions for product before PR 1

1. Section ordering on the recipe index — by user value (Quick → Comfort → Soups → Protein → Budget) or by data freshness?
2. Should `budget-friendly` strip include `recipes-budget.js` entries via a normalization layer, or stay planner-only? **Recommendation:** planner-only for Phase 7; revisit in Phase 8.
3. Pricing page footer block — yes/no? Concern is conversion dilution.
4. Anchor text policy: use recipe `name[lc]` only, or also include a verb prefix ("Try …", "Cook …")? Affects SEO anchor distribution.

---

**End of audit. Awaiting approval before any PR 1 work.**
