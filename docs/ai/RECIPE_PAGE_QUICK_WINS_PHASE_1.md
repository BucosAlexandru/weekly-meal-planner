# Recipe Page Quick Wins — Phase 1

_Implemented: 2026-05-18_
_Commit: `e1cfc4ee2`_
_Owner: Claude Code (Lead Developer)_

---

## Scope

6 low-risk surgical fixes to `scripts/generate-content.mjs` only.
No recipe data, no app.js, no pricing, no hreflang, no feature cards, no UI redesign.

Pages affected: **2,576 generated pages** (175 recipes × 14 languages + plan pages + index pages + pricing pages).
Page count after: **2,576** ✅ | Sitemap URLs: **2,620** ✅

---

## Fix 1 — Valid ISO 8601 JSON-LD Recipe times

**Audit reference:** C3 (Critical)

### Problem
`recipeMetadata()` used a human-readable `fmt()` helper and prepended `"PT"`:
```json
"prepTime": "PT1h",
"totalTime": "PT1h 25m"
```
Both are invalid ISO 8601. Google's Rich Results Test rejects them, preventing recipe rich snippets (time, calorie display) in SERPs.

### Fix
Added `fmtISO(m)` helper alongside existing `fmt(m)` inside `recipeMetadata()`, and returned two new fields (`isoTotalTime`, `isoPrepTime`). JSON-LD block updated to use these. User-visible time labels (e.g. "1h 25m" on the page) are **unchanged**.

```js
// Before (in recipeMetadata):
const fmt = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?' '+(m%60)+'m':''}` : `${m}m`;
// ...
"prepTime":`PT${meta.activeTime}`,   // → "PT1h" or "PT1h 25m"
"totalTime":`PT${meta.totalTime}`,   // → "PT1h 25m"

// After:
const fmt    = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?' '+(m%60)+'m':''}` : `${m}m`;
const fmtISO = m => m >= 60 ? `PT${Math.floor(m/60)}H${m%60>0?m%60+'M':''}` : `PT${m}M`;
// ...
"prepTime": meta.isoPrepTime,    // → "PT55M" or "PT1H"
"totalTime": meta.isoTotalTime,  // → "PT1H25M" or "PT1H30M"
```

### Verified examples

| Page | prepTime (before) | prepTime (after) | totalTime (before) | totalTime (after) |
|------|------------------|-----------------|-------------------|------------------|
| `/ro/retete/bibimbap/` | `PT55m` | `PT55M` | `PT1h 25m` | `PT1H25M` |
| `/en/recipes/spaghetti-carbonara/` | `PT1h` | `PT1H` | `PT1h 30m` | `PT1H30M` |
| `/ar/wasafat/hummus/` | `PT1h 20m` | `PT1H20M` | `PT1h 50m` | `PT1H50M` |
| `/ja/reshipi/sushi/` | `PT45m` | `PT45M` | `PT1h 15m` | `PT1H15M` |

---

## Fix 2 — `og:type="article"` on individual recipe pages

**Audit reference:** C4 (Critical)

### Problem
`HEAD()` helper hardcoded `content="website"` for all page types. Recipe pages shared the same value as plan and index pages — social platforms rendered recipe shares as generic website links.

### Fix
Added optional `ogType='website'` parameter to `HEAD()`. `recipePage()` passes `'article'`; all other callers (plan pages, recipe index pages) use the default `'website'`.

```js
// Before:
const HEAD = (title, desc, canonical, langCode='ro', dir='ltr') => `...
  <meta property="og:type" content="website"/>
...`

// After:
const HEAD = (title, desc, canonical, langCode='ro', dir='ltr', ogType='website') => `...
  <meta property="og:type" content="${ogType}"/>
...`

// In recipePage() call:
`${HEAD(rl.pageTitle(n), rl.pageDesc(n,o), `${rl.dir}/${rslug}/`, code, dir_attr, 'article')}`
```

### Verified
All 4 spot-checked pages: `og:type" content="article"` ✅
Recipe index pages correctly retain `"website"`.

---

## Fix 3 — Premium nav link on all generated content pages

**Audit reference:** H3 (High)

### Problem
`makeNav()` produced 3 links (Plans · Recipes · App) with no Premium/upsell path. Recipe pages are high-intent SEO entry points — missing the Premium link is a direct conversion loss.

### Fix
Added a 4th link to `makeNav()` using the already-defined `PRICING_SLUGS` map:

```js
// Before:
<div class="nav-links">
  <a href="${lc.dir}/" class="nav-link">${lc.sectionLabel}</a>
  <a href="${RECIPES_NAV[lc.code].href}" class="nav-link">${RECIPES_NAV[lc.code].label}</a>
  <a href="${appHref(lc)}" class="nav-link">${lc.appLabel}</a>
</div>

// After:
<div class="nav-links">
  <a href="${lc.dir}/" class="nav-link">${lc.sectionLabel}</a>
  <a href="${RECIPES_NAV[lc.code].href}" class="nav-link">${RECIPES_NAV[lc.code].label}</a>
  <a href="${appHref(lc)}" class="nav-link">${lc.appLabel}</a>
  <a href="/${lc.code}/${PRICING_SLUGS[lc.code]}/" class="nav-link">⭐ Premium</a>
</div>
```

Premium URL examples: `/ro/premium/`, `/en/pricing/`, `/fr/tarifs/`, `/ar/asaar/`, `/ja/pricing/`

### Verified
`⭐ Premium` present in all 4 spot-checked pages ✅

---

## Fix 4 — Footer year 2025 → 2026

**Audit reference:** M6 (Medium)

### Problem
`makeFooter()` had `<span>© 2025</span>` — stale on all generated pages.

### Fix
```js
// Before:
<span>© 2025</span>

// After:
<span>© 2026</span>
```

### Verified
`© 2026` in all 4 spot-checked pages ✅

**Note:** 30 pre-existing stale pages in `public/ro/retete/` (old slugs that the generator no longer overwrites) still show `© 2025`. These are a pre-existing issue from slug renames — not caused by Phase 1, not deleted to avoid breaking indexed URLs.

---

## Fix 5 — Double period at end of recipe steps

**Audit reference:** H4 (High)

### Problem
`recipePage()` step rendering always appended `.` after the step text:
```js
`<li>...<span>${esc(s)}.</span></li>`
```
Source data steps often already end with `.` (the last segment of a `.split(/\.\s+/)` retains its trailing period), producing `".."` in the rendered HTML.

### Fix
Strip trailing period(s) from `s` before the template appends its own:

```js
// Before:
${steps.map((s,i)=>`<li><span class="step-num">${i+1}</span><span>${esc(s)}.</span></li>`).join('\n        ')}

// After:
${steps.map((s,i)=>`<li><span class="step-num">${i+1}</span><span>${esc(s.trimEnd().replace(/\.+$/, ''))}.</span></li>`).join('\n        ')}
```

The `.replace(/\.+$/, '')` strips one or more trailing periods before the template's `.` is appended. Steps without trailing periods are unaffected. JSON-LD `recipeInstructions` uses the raw step array (unaffected).

### Verified
`grep -r '<span>[^<]*\.\.<' public/ --include="*.html"` → **0 matches** ✅

---

## Fix 6 — Localized nutrition disclaimer

**Audit reference:** M2 (Medium)

### Problem
`recipeNutrition()` estimates values heuristically from ingredient categories — no real nutritional database. Displaying unverified macros with no disclaimer is a trust and legal risk in EU markets.

### Fix
Added `nutritionDisc` string to all 14 entries in `RECIPE_UI`, then rendered it as a `<p class="nutrition-disclaimer">` below the nutrition table.

**Disclaimer strings:**
| Lang | Text |
|------|------|
| ro | `Valori nutriționale estimate.` |
| en | `Estimated nutritional values.` |
| es | `Valores nutricionales estimados.` |
| fr | `Valeurs nutritionnelles estimées.` |
| de | `Geschätzte Nährwertangaben.` |
| pt | `Valores nutricionais estimados.` |
| ru | `Приблизительная пищевая ценность.` |
| ar | `قيم غذائية تقريبية.` |
| zh | `营养数据仅供参考。` |
| ja | `栄養価は推定値です。` |
| hi | `अनुमानित पोषण मूल्य।` |
| tr | `Tahmini besin değerleri.` |
| it | `Valori nutrizionali stimati.` |
| ko | `영양 정보는 추정치입니다.` |

**Template change (recipePage):**
```html
<!-- Before: -->
</div>  <!-- end nutrition-list -->
<p class="recipe-pairings-h">...</p>

<!-- After: -->
</div>  <!-- end nutrition-list -->
<p class="nutrition-disclaimer">${ui.nutritionDisc}</p>
<p class="recipe-pairings-h">...</p>
```

### Verified
Correct localized disclaimers in all 4 spot-checked pages ✅

---

## Verification Summary

| Check | Result |
|-------|--------|
| Page count | 2,576 ✅ |
| Sitemap URLs | 2,620 ✅ |
| Old `PT[0-9]*[hm]` format in JSON-LD | 0 occurrences ✅ |
| Double period `..` in step spans | 0 occurrences ✅ |
| `og:type=article` on recipe pages (active) | 173/175 RO ✅ (2 index excluded) |
| `og:type=article` on plan/index pages | 0 (correctly kept as `website`) ✅ |
| `⭐ Premium` nav — spot-check (4 pages) | ✅ |
| `© 2026` — spot-check (4 pages) | ✅ |
| Nutrition disclaimer — spot-check (4 pages) | ✅ |

---

## Pre-existing Stale Files (not caused by Phase 1)

~30 pages in `public/ro/retete/` use old URL slugs (e.g. `cl-tite-americane` instead of `clatite-americane`). The generator no longer overwrites them because their active slugs changed. These files retain `og:type=website` and `© 2025` from before Phase 1. They are not deleted here to avoid breaking potentially-indexed URLs. A slug cleanup pass is recommended as a separate task.

---

## Files Changed

| File | Changes |
|------|---------|
| `scripts/generate-content.mjs` | All 6 fixes |
| `public/**/*.html` (2,576 files) | Regenerated output |

---

## What Remains (deferred to future phases)

- hreflang: point recipe pages to same recipe in all 14 languages (Phase 2)
- Feature card accuracy rework (Phase 2)
- BreadcrumbList JSON-LD (Phase 2)
- "Add to shopping list" → functional planner link
- Unique meta descriptions per recipe
- Per-recipe food images
- Stale slug cleanup (31 old pages in `/ro/retete/`)
