# Stale Pages Cleanup — Phase A: Plan Links Fix

_Implemented: 2026-05-18_
_Owner: Claude Code (Lead Developer)_

---

## Problem

Plan pages across all 14 languages linked to stale `/ro/retete/` recipe slugs that no longer exist because recipe names were renamed from Romanian to English.

Two bugs combined to cause this:

**Bug 1 — Wrong meal names in `PLANS[]`:**
`PLANS[].lunches` and `PLANS[].dinners` contained 13 old Romanian meal names (e.g. `'Spaghete Carbonara'`, `'Pui Gong Bao'`). These names matched the old Romanian-slug recipe pages, not the current EN-slug pages.

**Bug 2 — Slug direction in `planPage()` (root cause):**
The recipe link URL was built as:
```js
`${lc.recipeBase}${slug(lRec.name.ro || lRec.name.en)}/`
```
This preferred the **Romanian** name for the slug, while recipe pages are generated with:
```js
slug(recipe.name?.en || recipe.name?.ro)
```
which prefers **English**. Even if the lookup found the correct recipe, the generated URL used the RO name and pointed to a stale/missing page.

**Bug 3 — Budget plan dead links:**
The budget plan used `r.name?.ro||r.name?.en` for meal names (all Romanian). Budget recipes have **no generated recipe pages**, so any link would 404 regardless of slug format.

---

## Scope

- **File changed:** `scripts/generate-content.mjs` only
- **PLANS[] entries changed:** 13 static meal name strings + slug direction fix
- **Budget plan:** Option B implemented — no recipe links at all
- **Pages regenerated:** 2,576

---

## Changes Made

### 1 — PLANS[] name corrections (13 strings)

| Plan | Array | Old name (broken) | New name (correct EN) |
|------|-------|-------------------|-----------------------|
| mediterranean | lunches | `'Spaghete Carbonara'` | `'Spaghetti Carbonara'` |
| mediterranean | dinners | `'Musaca grecească'` | `'Moussaka'` |
| mediterranean | dinners | `'Tajine'` | `'Tagine'` |
| asian-fusion | dinners | `'Curry de pui'` | `'Chicken Curry'` |
| asian-fusion | dinners | `'Pui Gong Bao'` | `'Kung Pao Chicken'` |
| eastern-european | lunches | `'Ciorbă de burtă'` | `'Tripe Soup'` |
| eastern-european | lunches | `'Bors'` | `'Borscht'` |
| eastern-european | lunches | `'Fasole cu cârnați'` | `'Beans with Sausages'` |
| eastern-european | lunches | `'Gulaș'` | `'Goulash'` |
| eastern-european | dinners | `'Pui Kiev'` | `'Chicken Kiev'` |
| eastern-european | dinners | `'Kotlet schabowy'` | `'Pork schnitzel'` |
| eastern-european | dinners | `'Zeamă'` | `'Zeama'` |
| world-tour | dinners | `'Chifteluțe suedeze'` | `'Swedish Meatballs'` |
| quick-easy | lunches | `'Spaghete Carbonara'` | `'Spaghetti Carbonara'` |
| quick-easy | dinners | `'Pui Gong Bao'` | `'Kung Pao Chicken'` |
| quick-easy | dinners | `'Curry de pui'` | `'Chicken Curry'` |
| vegetarian | dinners | `'Musaca grecească'` | `'Moussaka'` |

Note: Some names appear in multiple plans; each occurrence was replaced individually.
Note: `'Kotlet schabowy'` maps to `en: 'Pork schnitzel'` (lowercase s) — exact match required.

### 2 — Slug direction fix in `planPage()` (root cause)

**Before:**
```js
const lSlug = lRec?.name?.ro || lRec?.name?.en ? `${lc.recipeBase}${slug(lRec.name.ro||lRec.name.en)}/` : '#';
const dSlug = dRec?.name?.ro || dRec?.name?.en ? `${lc.recipeBase}${slug(dRec.name.ro||dRec.name.en)}/` : '#';
```

**After:**
```js
const lSlug = (!plan.isBudget && (lRec?.name?.en || lRec?.name?.ro)) ? `${lc.recipeBase}${slug(lRec.name?.en||lRec.name?.ro)}/` : '#';
const dSlug = (!plan.isBudget && (dRec?.name?.en || dRec?.name?.ro)) ? `${lc.recipeBase}${slug(dRec.name?.en||dRec.name?.ro)}/` : '#';
```

Two changes in one line:
- **EN-first slug:** `slug(lRec.name?.en||lRec.name?.ro)` matches how recipe pages are generated
- **Budget guard:** `!plan.isBudget` forces `'#'` for budget plan → no `<a>` tag rendered (Option B)

The existing link render template already handles `'#'` correctly — it skips the `<a>` wrapper and renders just the text:
```js
`${lSlug!=='#'?`<a href="${lSlug}" class="recipe-link">`:''}${esc(lDispName)}${lSlug!=='#'?'</a>':''}`
```

---

## Verification Results

| Check | Result |
|-------|--------|
| Old broken slugs in any plan page | 0 ✅ |
| `spaghetti-carbonara` — RO:2 EN:2 plan pages | ✅ |
| `kung-pao-chicken` — RO:2 EN:2 plan pages | ✅ |
| `chicken-curry` — RO:2 EN:2 plan pages | ✅ |
| `moussaka` — RO:2 EN:2 plan pages | ✅ |
| `tagine` — RO:1 EN:1 plan pages | ✅ |
| `tripe-soup` — RO:1 EN:1 plan pages | ✅ |
| `borscht` — RO:1 EN:1 plan pages | ✅ |
| `beans-with-sausages` — RO:1 EN:1 plan pages | ✅ |
| `goulash` — RO:1 EN:1 plan pages | ✅ |
| `chicken-kiev` — RO:1 EN:1 plan pages | ✅ |
| `pork-schnitzel` — RO:1 EN:1 plan pages | ✅ |
| `zeama` — RO:1 EN:1 plan pages | ✅ |
| `swedish-meatballs` — RO:1 EN:1 plan pages | ✅ |
| Group A stale slugs in plan pages (11 slugs) | 0 each ✅ |
| Budget plan `recipe-link` count | 0 (plain text) ✅ |
| Budget plan meal names visible | ✅ (with ingredient hints) |
| Generator output | 2,576 pages ✅ |
| Sitemap URLs | 2,620 ✅ (unchanged) |
| `npm run build:js` | ✅ |
| `npm run build:css` | ✅ |

---

## What This Enables

With Phase A complete, all 11 Group A stale pages now have **zero inbound links** from active plan pages. They can be safely deleted (Phase D). The stale pages are still on disk — no deletions happened in this phase.

---

## Remaining Stale Page Work

| Phase | Action | Status |
|-------|--------|--------|
| Phase A | Fix plan links root cause | ✅ Done (this commit) |
| Phase B | Delete Group C (11 orphaned pages) | Pending |
| Phase C | Delete Group B (10 stale-to-stale pages) | Pending |
| Phase D | Delete Group A (11 formerly active-linked pages) | Pending (unblocked by Phase A) |
| Phase E | Fix duplicate EN slugs in recipes.js | Pending (separate task) |

---

## Files Changed

| File | Changes |
|------|---------|
| `scripts/generate-content.mjs` | PLANS[] string replacements (13 names) + slug direction fix + budget guard |
| `public/**/*.html` (2,576 files) | Regenerated plan pages with correct recipe links |
