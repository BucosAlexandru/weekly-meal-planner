# Duplicate Recipe Slugs Audit — Phase E

_Audited: 2026-05-18_
_Owner: Claude Code (Lead Developer)_
_Status: Audit only — no files modified_

---

## Executive Summary

`recipes.js` contains **2 pairs of recipes with identical English names**, causing the slug function to produce the same output for both entries in each pair. The generator writes them sequentially, so the **second entry silently overwrites the first**. Result: only 173 unique recipe directories are created instead of 175 across all 14 language recipe directories.

Additionally, each duplicate slug appears **twice in `public/sitemap.xml`** per language (28 occurrences each instead of 14), producing duplicate `<loc>` entries — a sitemap quality issue.

---

## How the Overwrite Happens

```js
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g,'');
// Recipe pages generated as: slug(recipe.name?.en || recipe.name?.ro)
```

The generator iterates through `recipes.js` in index order and writes each page. When two recipes produce the same slug, the **last one written wins** — the earlier entry's page is permanently overwritten with no warning.

---

## Pair 1 — `swedish-meatballs`

### Entry A — id: 27 (line 2452) — **LOSER** (written first, overwritten)

| Field | Value |
|-------|-------|
| Line | 2452 |
| `id` | 27 |
| `name.ro` | `"Chifteluțe suedeze"` |
| `name.en` | `"Swedish Meatballs"` |
| `origin` | Sweden |
| `category` | Lunch |
| `servings` | 4 |
| `tipType` | `'meat'` |
| `pairingsType` | `'meat'` |
| Ingredient count (EN) | 9 items with full quantities |
| Instructions | Detailed multi-step (400+ words per language) |
| Translation quality | Fully localized in all 14 languages, proper native names |

**Sample EN ingredients:** `"500g mixed ground pork and beef (50/50)"`, `"1 slice white bread, crusts removed, soaked in 3 tbsp milk"`, `"250ml beef stock"`, `"150ml double cream"` — with exact measurements, authentic lingonberry jam serving suggestion.

### Entry B — id: 119 (line 10733) — **WINNER** (written last, page served)

| Field | Value |
|-------|-------|
| Line | 10733 |
| `id` | 119 |
| `name.ro` | `"Köttbullar"` |
| `name.en` | `"Swedish Meatballs"` |
| `origin` | Sweden |
| `category` | Lunch |
| `servings` | `undefined` |
| `tipType` | `undefined` |
| `pairingsType` | `undefined` |
| Ingredient count (EN) | 7 generic items, no quantities |
| Instructions | One-sentence stub per language |
| Translation quality | `name.hi` missing; `name.tr`, `name.it`, `name.ko` use untranslated `"Swedish Meatballs"` |

**Sample EN ingredients:** `"minced meat"`, `"eggs"`, `"breadcrumbs"`, `"onion"`, `"cream"`, `"pepper"`, `"salt"` — no measurements, no allspice, no nutmeg, no stock.

### Quality verdict

**id: 27 is clearly the canonical entry.** It has full measurements, detailed instructions, proper localization in all 14 languages, and metadata (`servings`, `tipType`, `pairingsType`). id: 119 is an incomplete stub with missing fields and broken translations. Currently the stub's content is served at `/swedish-meatballs/` — this is a content quality regression.

**PLANS impact:** `'Swedish Meatballs'` appears in PLANS at line 174 (world-tour dinners). After Phase A, plan pages correctly look up by EN name `"Swedish Meatballs"` and link to `/swedish-meatballs/`. The link itself is correct — but the destination currently serves the stub content (id: 119).

---

## Pair 2 — `pasticada`

### Entry A — id: 59 (line 5446) — **LOSER** (written first, overwritten)

| Field | Value |
|-------|-------|
| Line | 5446 |
| `id` | 59 |
| `name.ro` | `"Pasticada"` |
| `name.en` | `"Pasticada"` |
| `origin` | Croatia |
| `category` | Dinner |
| `servings` | `undefined` |
| `tipType` | `undefined` |
| Ingredient count (EN) | 7 items (no dried plums — inconsistency with instructions) |
| Instructions | 1–2 sentence stub; mentions "dried plums" but not in ingredients |

### Entry B — id: 144 (line 12769) — **WINNER** (written last, page served)

| Field | Value |
|-------|-------|
| Line | 12769 |
| `id` | 144 |
| `name.ro` | `"Pašticada"` |
| `name.en` | `"Pasticada"` |
| `origin` | Croatia |
| `category` | Dinner |
| `servings` | `undefined` |
| `tipType` | `undefined` |
| Ingredient count (EN) | 8 items (includes "dried plums" and "spices") |
| Instructions | 1–2 sentence stub; matches ingredient list better |
| `zh` display name | `"克罗地亚炖牛肉"` (more descriptive than id:59's `"牛肉炖菜"`) |

### Quality verdict

Both are low-quality stubs compared to a full recipe entry. id: 144 is marginally better — its ingredient list includes the characteristic `"dried plums"` that define an authentic Pasticada, and `name.ro` uses the authentic Croatian spelling `"Pašticada"`. id: 59 has an internal inconsistency (mentions dried plums in instructions but omits them from ingredients). The current winner (id: 144) is the better entry for the existing URL.

---

## Current Disk State

| Slug | Disk path | Sitemap entries | Content served |
|------|-----------|----------------|----------------|
| `swedish-meatballs` | ✅ `/ro/retete/`, `/en/recipes/`, +12 langs | 28 (duplicate — should be 14) | id: 119 stub |
| `pasticada` | ✅ `/ro/retete/`, `/en/recipes/`, +12 langs | 28 (duplicate — should be 14) | id: 144 |

---

## Recommended Fix

### Fix 1 — Swedish Meatballs (id: 119, line 10752)

**Change:** One field only — `name.en` on line 10752.

| | Value |
|--|-------|
| **Old** | `en: "Swedish Meatballs"` |
| **New** | `en: "Kottbullar"` |
| **Reason** | `"Kottbullar"` is the standard ASCII romanization of `"Köttbullar"` (already the `name.ro` of this entry). It is correct and self-consistent. `slug("Kottbullar")` = `"kottbullar"` — clean, no diacritics. |
| **New slug** | `kottbullar` |
| **New URLs** | `/ro/retete/kottbullar/`, `/en/recipes/kottbullar/`, `/es/recetas/kottbullar/` … (14 langs) |
| **Redirect needed?** | **No** — `kottbullar` is a brand-new URL that has never existed. Not in sitemap. |

**Effect on existing URL:** `/swedish-meatballs/` will now serve id: 27 content (full, high-quality recipe) instead of the id: 119 stub. This is a content improvement at a stable URL. No redirect needed — same URL, better content.

**Effect on PLANS:** The plan page lookup for `'Swedish Meatballs'` continues to find id: 27 (`name.en === "Swedish Meatballs"`) and link to `/swedish-meatballs/`. Users now land on the quality recipe. ✅

---

### Fix 2 — Pasticada (id: 59, line 5465)

**Change:** One field only — `name.en` on line 5465.

| | Value |
|--|-------|
| **Old** | `en: "Pasticada"` |
| **New** | `en: "Dalmatinska Pasticada"` |
| **Reason** | The full authentic name is "Dalmatinska pašticada" (Dalmatian-style braised beef). Using "Dalmatinska Pasticada" as the EN name is factually correct, distinguishes this entry, and generates a clean slug. |
| **New slug** | `dalmatinska-pasticada` |
| **New URLs** | `/ro/retete/dalmatinska-pasticada/`, `/en/recipes/dalmatinska-pasticada/` … (14 langs) |
| **Redirect needed?** | **No** — `dalmatinska-pasticada` is a brand-new URL that has never existed. Not in sitemap. |

**Effect on existing URL:** `/pasticada/` continues to serve id: 144 content (the marginally better entry). No change in content at the existing URL. ✅

---

## Expected Outcome After Fix

| Metric | Before | After |
|--------|--------|-------|
| Recipe dirs per language | 173 unique | **175 unique** |
| Duplicate `<loc>` in sitemap | 28 per dup slug | **14 per slug** (clean) |
| Sitemap total URL count | 2,620 | **2,620** (unchanged — same entries, now distinct) |
| Generator output | 2,576 pages | **2,576 pages** (unchanged) |
| `/swedish-meatballs/` content | id:119 stub | **id:27 full recipe** ✅ |
| `/pasticada/` content | id:144 (unchanged) | **id:144** (unchanged) ✅ |
| New URLs created | — | `kottbullar` (14 langs) + `dalmatinska-pasticada` (14 langs) = **28 new pages** |

---

## Exact Files to Change

| File | Line | Field | Old value | New value |
|------|------|-------|-----------|-----------|
| `public/js/recipes.js` | 10752 | `name.en` of id:119 | `"Swedish Meatballs"` | `"Kottbullar"` |
| `public/js/recipes.js` | 5465 | `name.en` of id:59 | `"Pasticada"` | `"Dalmatinska Pasticada"` |

**Only 2 lines change. No other fields touched.**

---

## Risk Assessment

| Risk | Level | Notes |
|------|-------|-------|
| Breaking existing URL `/swedish-meatballs/` | 🟢 None | URL stays — content improves from stub to full recipe |
| Breaking existing URL `/pasticada/` | 🟢 None | URL content unchanged |
| New URL content quality | 🟡 Low | `kottbullar` and `dalmatinska-pasticada` serve stub-quality entries — acceptable since they're new pages not indexed anywhere |
| PLANS links breaking | 🟢 None | `'Swedish Meatballs'` in PLANS still finds id:27 correctly |
| Sitemap duplicate entries | 🟢 Fixed | 28 → 14 per slug, distinct entries |
| Redirect requirement | 🟢 None | No existing inbound links to new URLs |
| Unrelated recipe impact | 🟢 None | Only 2 fields in 2 entries change |

---

## Approval Checkpoint

**No code has been changed.**

Proposed changes require approval:
1. ✅ / ❌ Change `public/js/recipes.js` line 10752: `en: "Swedish Meatballs"` → `en: "Kottbullar"`
2. ✅ / ❌ Change `public/js/recipes.js` line 5465: `en: "Pasticada"` → `en: "Dalmatinska Pasticada"`

After approval, implementation will:
1. Make the 2 surgical line edits.
2. Run `npm run content`.
3. Verify page count, sitemap count, and that 28 new recipe dirs appeared.
4. Verify `/swedish-meatballs/` now serves id:27 full recipe content.
5. Verify `/pasticada/` content unchanged.
6. Verify no unrelated recipe pages changed.
7. Run `npm run build`.
8. Commit and push only if CI green.
