# Stale Generated Pages Audit

_Audited: 2026-05-18_
_Owner: Claude Code (Lead Developer)_
_Status: Audit only — no files deleted, no code changed_

---

## Executive Summary

**32 stale recipe page directories** exist in `public/ro/retete/` that are no longer produced by the current generator. They carry old content (`og:type=website`, `© 2025`, no Premium nav, Phase 1 fixes not applied).

**Root cause:** Recipe slugs changed from Romanian-name-based to English-name-based when recipes were renamed in `recipes.js`. The `PLANS` meal list in `generate-content.mjs` still uses old Romanian meal names (e.g. `"Spaghete Carbonara"`, `"Pui Gong Bao"`), causing plan pages across all 14 languages to generate links to the old RO slugs — which now point to stale pages rather than the current English-slug recipe pages.

**No other language** has stale pages (all non-RO languages show 173 dirs = 175 recipes − 2 duplicate EN slugs).

---

## Root Cause Detail

The slug function `slug(name)` is deterministic:
```js
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g,'');
```

**Recipe page generator** uses: `slug(recipe.name?.en || recipe.name?.ro)` → English-based slug.
**Plan page generator** uses: `slug(mealName)` where `mealName` comes from `PLANS[].lunches/dinners` — which contain old Romanian meal names.

Result: plan pages link to `/ro/retete/spaghete-carbonara/` while the live recipe page is at `/ro/retete/spaghetti-carbonara/`.

This affects **all 14 language plan pages** — they all build recipe links from the Romanian PLANS meal names regardless of language, because `recipeBase` for non-RO languages also points to `/ro/retete/` (confirmed by `recipeBase:'/ro/retete/'` in LANG_CONFIGS for es, fr, de, etc.).

---

## Scope

- **Stale pages found:** 32 (all in `/ro/retete/` only)
- **In sitemap:** 0 (none of the stale pages appear in `public/sitemap.xml`)
- **Linked from active plan pages:** 11 of the 32
- **Fully orphaned (no links anywhere):** 11 of the 32
- **Stale-to-stale links only:** 10 of the 32

---

## Duplicate slug issue (bonus finding)

`recipes.js` contains **2 pairs of recipes with identical EN slugs**, causing 2 of 175 recipes to silently overwrite each other in all 14 language recipe directories (actual count: 173 dirs instead of 175):

| Duplicate slug | First recipe | Second recipe |
|---------------|-------------|--------------|
| `swedish-meatballs` | EN:"Swedish Meatballs" | (another entry) |
| `pasticada` | EN:"Pasticada" | (another entry) |

These are a separate data-quality issue in `recipes.js` — the second entry overwrites the first with no warning during generation.

---

## Full Stale Page Inventory

### Group A — Active plan links (high risk: fix root cause before deleting)

These 11 pages are linked from currently-active plan pages across all 14 languages. Deleting them without fixing the PLANS data first would break recipe links on plan pages.

| Stale path | Active plan links | Current replacement | Old recipe name |
|------------|-----------------|---------------------|----------------|
| `/ro/retete/spaghete-carbonara/` | 26 | `/ro/retete/spaghetti-carbonara/` | Spaghete Carbonara |
| `/ro/retete/pui-gong-bao/` | 26 | `/ro/retete/kung-pao-chicken/` | Pui Gong Bao |
| `/ro/retete/curry-de-pui/` | 26 | `/ro/retete/chicken-curry/` | Curry de pui |
| `/ro/retete/bors/` | 13 | `/ro/retete/borscht/` | Bors |
| `/ro/retete/ciorb-de-burt/` | 13 | `/ro/retete/tripe-soup/` | Ciorbă de burtă |
| `/ro/retete/chiftelu-e-suedeze/` | 13 | `/ro/retete/swedish-meatballs/` | Chifteluțe suedeze |
| `/ro/retete/fasole-cu-c-rna-i/` | 13 | `/ro/retete/beans-with-sausages/` | Fasole cu cârnați |
| `/ro/retete/gula/` | 13 | `/ro/retete/goulash/` | Gulaș |
| `/ro/retete/kotlet-schabowy/` | 13 | `/ro/retete/pork-schnitzel/` | Kotlet schabowy |
| `/ro/retete/pui-kiev/` | 13 | `/ro/retete/chicken-kiev/` | Pui Kiev |
| `/ro/retete/zeam/` | 13 | `/ro/retete/zeama/` | Zeamă |

**Active plan links** = links from currently-generated (non-stale) plan pages. A plan page user clicking a recipe link lands on the stale page, not the current recipe page.

---

### Group B — Stale-to-stale links only (medium risk: safe to delete, no active broken links introduced)

These 10 pages cross-link only among themselves. Deleting them causes no broken links in active content.

| Stale path | Links from | Current replacement |
|------------|-----------|---------------------|
| `/ro/retete/k-ttbullar/` | stale `kanelbulle`, `chiftelu-e-suedeze` | `/ro/retete/swedish-meatballs/` |
| `/ro/retete/kanelbulle/` | stale `k-ttbullar`, `chiftelu-e-suedeze` | `/ro/retete/cinnamon-bun/` |
| `/ro/retete/karjalanpaisti/` | stale `karjalanpiirakka`, `lohikeitto` | `/ro/retete/karelian-stew/` |
| `/ro/retete/karjalanpiirakka/` | stale `karjalanpaisti`, `lohikeitto` | `/ro/retete/karelian-pie/` |
| `/ro/retete/lohikeitto/` | stale `karjalanpaisti`, `karjalanpiirakka` | `/ro/retete/salmon-soup/` |
| `/ro/retete/tajine/` | stale `tagine-cu-miel` | `/ro/retete/tagine/` |
| `/ro/retete/tagine-cu-miel/` | stale `tajine` | `/ro/retete/lamb-tagine/` |
| `/ro/retete/soupe-l-oignon/` | stale `fricass-e-de-poulet` | `/ro/retete/french-onion-soup/` |
| `/ro/retete/fricass-e-de-poulet/` | stale `soupe-l-oignon` | `/ro/retete/chicken-fricass-e/` |
| `/ro/retete/pui-dulce-acri-or/` | stale `pui-gong-bao` (Group A) | `/ro/retete/sweet-and-sour-chicken/` |

---

### Group C — Fully orphaned (low risk: safe to delete immediately)

These 11 pages have zero links from anywhere — not from active plan pages, not from other stale pages.

| Stale path | Current replacement |
|------------|---------------------|
| `/ro/retete/b-nh-x-o/` | `/ro/retete/banh-xeo/` |
| `/ro/retete/carbonade-flamande/` | `/ro/retete/stoofvlees/` |
| `/ro/retete/ceviche-de-camar-n/` | `/ro/retete/shrimp-ceviche/` |
| `/ro/retete/cl-tite-americane/` | `/ro/retete/pancakes/` |
| `/ro/retete/curry-japonez/` | `/ro/retete/japanese-curry-rice/` |
| `/ro/retete/musaca-greceasc/` | `/ro/retete/moussaka/` |
| `/ro/retete/orez-cu-lapte-de-cocos/` | `/ro/retete/coconut-rice/` |
| `/ro/retete/pa-ticada/` | `/ro/retete/pasticada/` |
| `/ro/retete/pl-cint-a-ciobanului/` | `/ro/retete/shepherd-s-pie/` |
| `/ro/retete/pui-moambe/` | `/ro/retete/moambe-chicken/` |
| `/ro/retete/sup-de-linte/` | `/ro/retete/lentil-soup/` |

---

## Risk Assessment

| Risk | Description | Affected pages |
|------|-------------|----------------|
| 🔴 Broken internal links | Plan pages actively link to Group A stale slugs — users navigate to outdated content | 11 Group A pages |
| 🟠 Potential Google index | Stale pages are linked from plan pages (which are in the sitemap) — Googlebot may have crawled them | Group A (13–26 inbound links each) |
| 🟡 Duplicate slug data bug | Two recipe pairs share EN slug — one entry silently wins, the other is lost | 2 pairs in `recipes.js` |
| 🟢 Group B stale content | Only reachable via other stale pages — minimal user/bot exposure | 10 Group B pages |
| 🟢 Group C orphaned pages | Zero links — effectively invisible, no user/bot impact | 11 Group C pages |

**Sitemap status:** 0 stale pages appear in `public/sitemap.xml`. The sitemap is clean and only references current recipe slugs. This limits Google's ability to discover stale pages through the sitemap, but does not prevent discovery through link-following from plan pages.

---

## Recommended Cleanup Plan

### Phase A — Fix root cause (before any deletion)

**File:** `scripts/generate-content.mjs`

Update the `PLANS` array `lunches` and `dinners` entries to use English recipe names instead of Romanian names for the recipes that have changed slugs. This will cause plan pages to generate links to the correct current English-slug recipe pages.

Affected PLANS entries include (not exhaustive):
- `'Spaghete Carbonara'` → `'Spaghetti Carbonara'`
- `'Pui Gong Bao'` → `'Kung Pao Chicken'`
- `'Curry de pui'` → `'Chicken Curry'`
- `'Bors'` → `'Borscht'`
- `'Ciorbă de burtă'` → `'Tripe Soup'`
- `'Chifteluțe suedeze'` → `'Swedish Meatballs'` (or `'Köttbullar'`)
- `'Fasole cu cârnați'` → `'Beans with Sausages'`
- `'Gulaș'` → `'Goulash'`
- `'Kotlet schabowy'` → `'Pork Schnitzel'`
- `'Pui Kiev'` → `'Chicken Kiev'`
- `'Zeamă'` → `'Zeama'`

After updating: run `npm run content`, verify plan pages now link to current recipe slugs.

### Phase B — Delete Group C (11 fully orphaned pages)

Safe to do immediately without any prerequisite. No Vercel redirects needed (not in sitemap, no links).

```bash
cd public/ro/retete
rm -rf b-nh-x-o carbonade-flamande ceviche-de-camar-n cl-tite-americane curry-japonez \
       musaca-greceasc orez-cu-lapte-de-cocos pa-ticada pl-cint-a-ciobanului \
       pui-moambe sup-de-linte
```

### Phase C — Delete Group B (10 stale-to-stale pages)

Safe after Phase B (since some Group B pages link to other Group B pages, deleting them all together eliminates all broken cross-links simultaneously). No Vercel redirects needed.

```bash
cd public/ro/retete
rm -rf k-ttbullar kanelbulle karjalanpaisti karjalanpiirakka lohikeitto \
       tajine tagine-cu-miel soupe-l-oignon fricass-e-de-poulet pui-dulce-acri-or
```

### Phase D — Delete Group A (11 active-linked pages)

**Must be done after Phase A.** Once the PLANS data is fixed and plan pages regenerated, Group A stale pages will have zero inbound links and can be safely deleted. No Vercel redirects needed (plan pages will already point to current slugs; no external sitemap entry exists).

```bash
cd public/ro/retete
rm -rf spaghete-carbonara pui-gong-bao curry-de-pui bors ciorb-de-burt \
       chiftelu-e-suedeze fasole-cu-c-rna-i gula kotlet-schabowy pui-kiev zeam
```

### Phase E — Fix duplicate slugs in recipes.js (separate task)

Investigate the 2 duplicate EN slug pairs (`swedish-meatballs`, `pasticada`) in `recipes.js` and resolve which entry is canonical or rename one.

---

## Do Vercel Redirects Need to Be Added?

**No** — with one caveat:

The stale pages are **not in the sitemap** and will have **zero inbound links** after Phase A fixes the plan pages. No redirect is needed for:
- SEO purposes (Google has no sitemap signal pointing to stale URLs)
- User navigation (plan pages will link to correct current slugs after Phase A)

**Caveat:** If any external site or a previously-sent email/social share linked directly to a stale URL like `/ro/retete/spaghete-carbonara/`, visitors will receive a 404 after deletion. Given the site's age and the specificity of these URLs, this risk is assessed as low. A lightweight Vercel redirect config for the 11 Group A URLs is an option but is not required.

---

## Does Sitemap Need Changes?

**No** — the sitemap is already correct. It only contains current recipe slugs. No stale URLs are present in `public/sitemap.xml`.

---

## Summary Table

| Group | Count | In sitemap | Active plan links | Action | Priority |
|-------|-------|-----------|------------------|--------|----------|
| A — Active-linked | 11 | 0 | 13–26 each | Fix PLANS data → regenerate → delete | Phase A+D |
| B — Stale-to-stale | 10 | 0 | 0 | Delete (no prerequisites) | Phase C |
| C — Orphaned | 11 | 0 | 0 | Delete immediately | Phase B |
| **Total** | **32** | **0** | — | — | — |

---

_End of audit. No files were deleted. No code was changed._
