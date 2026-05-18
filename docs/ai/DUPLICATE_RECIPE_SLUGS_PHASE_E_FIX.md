# Duplicate Recipe Slugs — Phase E Fix

_Implemented: 2026-05-18_
_Owner: Claude Code (Lead Developer)_
_Audit doc: `docs/ai/DUPLICATE_RECIPE_SLUGS_AUDIT.md`_

---

## Changes Made

Exactly **2 lines changed** in `public/js/recipes.js`. No other fields touched.

| File | Line | Recipe id | Field | Old value | New value |
|------|------|-----------|-------|-----------|-----------|
| `public/js/recipes.js` | 5465 | id: 59 | `name.en` | `"Pasticada"` | `"Dalmatinska Pasticada"` |
| `public/js/recipes.js` | 10752 | id: 119 | `name.en` | `"Swedish Meatballs"` | `"Kottbullar"` |

### Slug changes

| Recipe id | Old EN name | New EN name | Old slug | New slug |
|-----------|------------|------------|----------|----------|
| id: 119 | `"Swedish Meatballs"` | `"Kottbullar"` | ~~`swedish-meatballs`~~ (collision) | `kottbullar` |
| id: 59 | `"Pasticada"` | `"Dalmatinska Pasticada"` | ~~`pasticada`~~ (collision) | `dalmatinska-pasticada` |

---

## Effect on Existing URLs

### `/swedish-meatballs/` — content improvement

With id: 119 no longer competing for the slug, id: 27 now wins and its full, high-quality recipe is served.

| | Before | After |
|-|--------|-------|
| Content served | id: 119 stub (7 generic ingredients, one-line instructions) | id: 27 full recipe (9 precise ingredients, detailed multi-step instructions) |
| Key ingredients present | ❌ No allspice, no lingonberry, no measurements | ✅ Allspice, nutmeg, beef stock, double cream, lingonberry jam |
| Redirect needed | — | **No** — same URL, better content |

### `/pasticada/` — unchanged

id: 144 continues to be the sole writer for this slug. Content identical to before.

### New URLs created

| New path | Content | In sitemap |
|----------|---------|------------|
| `/ro/retete/kottbullar/` | id: 119 (Köttbullar stub) | ✅ Yes (14 lang entries) |
| `/en/recipes/kottbullar/` | id: 119 | ✅ Yes |
| + 12 other language recipe dirs | id: 119 | ✅ Yes |
| `/ro/retete/dalmatinska-pasticada/` | id: 59 (Pasticada stub) | ✅ Yes (14 lang entries) |
| `/en/recipes/dalmatinska-pasticada/` | id: 59 | ✅ Yes |
| + 12 other language recipe dirs | id: 59 | ✅ Yes |

No redirects needed for new URLs — they never existed before.

---

## Verification Results

| Check | Result |
|-------|--------|
| `public/js/recipes.js` diff | Exactly 2 lines changed ✅ |
| Recipe dirs per language (5 spot-checked) | **175** (was 173) ✅ |
| `/ro/retete/swedish-meatballs/` serves id:27 content (allspice, lingonberry) | ✅ |
| id:119 stub absent from `/swedish-meatballs/` | ✅ |
| `/ro/retete/kottbullar/` exists | ✅ |
| `/en/recipes/kottbullar/` exists | ✅ |
| `/ro/retete/pasticada/` serves id:144 (Pašticada, dried plums) | ✅ |
| `/ro/retete/dalmatinska-pasticada/` exists | ✅ |
| `swedish-meatballs` in sitemap | 14 entries (was 28 — duplicates gone) ✅ |
| `pasticada` in sitemap | 14 entries (was 28 — duplicates gone) ✅ |
| `kottbullar` in sitemap | 14 entries ✅ |
| `dalmatinska-pasticada` in sitemap | 14 entries ✅ |
| Sitemap total URLs | **2,620** (unchanged) ✅ |
| Generator output | **2,576 pages** (unchanged) ✅ |
| Plan links to `/swedish-meatballs/` | 2 per language ✅ |
| `npm run build:js` | ✅ |
| `npm run build:css` | ✅ |

---

## Page Count Explanation

The generator still reports **2,576 pages total** — this number counts file-write operations, not unique output directories. The change is visible in the filesystem:

| Metric | Before | After |
|--------|--------|-------|
| Recipe dirs per language | 173 unique | **175 unique** |
| Filesystem `index.html` count | 2,592 | **2,620** (+28: 2 new slugs × 14 langs) |
| Generator output | 2,576 | **2,576** (unchanged) |
| Sitemap URLs | 2,620 | **2,620** (same count, now all distinct) |

---

## Stale Pages Cleanup — Final Status

All phases of the stale pages cleanup are now complete:

| Phase | Action | Commit |
|-------|--------|--------|
| Phase A | Fix PLANS[] recipe links root cause | `f4705fce6` |
| Phase B/C/D | Delete 32 stale `/ro/retete/` pages | `340e59058` |
| Phase E | Fix duplicate EN slug pairs in `recipes.js` | this commit |

`/ro/retete/` now contains exactly **175 current recipe directories** with no stale pages and no slug collisions.
