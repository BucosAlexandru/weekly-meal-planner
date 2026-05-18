# Multilingual Pricing Navigation Fix

_Implemented: 2026-05-18_
_Commit: `d2316857e`_
_Owner: Claude Code (Lead Developer)_

---

## Problems Fixed

### Problem 1 — Localized app homepages did not link to their pricing pages

Every localized app homepage (`/ro/`, `/en/`, `/fr/`, etc.) was missing a navigation link
to its corresponding pricing page. A French user at `/fr/` had no nav path to `/fr/tarifs/`,
and a Romanian user at `/ro/` had no nav path to `/ro/premium/`.

### Problem 2 — Pricing pages had no language switcher

All 14 generated pricing pages (`/ro/premium/`, `/en/pricing/`, etc.) and the root `/pricing/`
page had no mechanism for users to switch to an equivalent pricing page in another language.
Switching language on a pricing page silently dropped the user onto the main homepage with
no way back to pricing — breaking the multilingual UX and the hreflang flow.

---

## Root Cause

The project has two separate nav systems that were unaware of each other:

| System | Powers | Language switching |
|--------|--------|-------------------|
| `app.js` — `updateContentNav()` | All app homepages (`/`, `/ro/`, `/en/`, …) | JS-driven, updates DOM on lang change |
| `makeNav(lc)` in `generate-content.mjs` | All generated pages (plans, recipes, pricing) | Static HTML baked at build time, no switcher |

**Problem 1 root cause:** `updateContentNav()` only knew about `#nav-plans` and `#nav-recipes`.
No `NAV_PRICING_LINKS` mapping existed. None of the 14 localized homepages had an `id="nav-pricing"`
anchor in the DOM.

**Problem 2 root cause:** `makeNav(lc)` outputs no `<select>` language switcher. Pricing pages
also don't load `app.js`, so no JS-driven switcher is available. The hreflang tags were correct
for Google but completely invisible to users.

---

## Files Changed

| File | Change |
|------|--------|
| `public/js/app.js` | Added `NAV_PRICING_LINKS` constant; extended `updateContentNav()` to update `#nav-pricing` href |
| `public/index.html` | No change — already had `id="nav-pricing"` pointing to `/pricing/` |
| `public/ro/index.html` — `public/ko/index.html` (14 files) | Added `<a class="nav-link" id="nav-pricing" href="/{lang}/{slug}/">⭐ Premium</a>` after `nav-recipes` |
| `scripts/generate-content.mjs` | Added `PRICING_LANG_NAMES` constant; added `makePricingNav(lc_code)` function; swapped `makeNav(lc)` → `makePricingNav(lc_code)` in `pricingPage()` only |
| `public/pricing/index.html` | Added static `<select>` language switcher to hand-coded nav |
| Generated: all 14 `/{lang}/{slug}/index.html` | Regenerated with `makePricingNav()` nav |

**Not touched:** `makeNav()`, recipe pages, plan pages, API, checkout, sitemap thresholds.

---

## Implementation Details

### Part A — `app.js`

**New constant** (added near `NAV_CONTENT_LINKS`):
```js
const NAV_PRICING_LINKS = {
  ro:'/ro/premium/', en:'/en/pricing/', es:'/es/precios/', fr:'/fr/tarifs/',
  de:'/de/preise/', pt:'/pt/precos/', ru:'/ru/tseny/', ar:'/ar/asaar/',
  zh:'/zh/jiage/', ja:'/ja/pricing/', hi:'/hi/pricing/', tr:'/tr/fiyatlar/',
  it:'/it/prezzi/', ko:'/ko/pricing/'
};
```

**Extended `updateContentNav()`** — 3 additive lines:
```js
const navPricing = document.getElementById('nav-pricing');
// ...
if (navPricing) {
  navPricing.href = NAV_PRICING_LINKS[currentLang] || '/pricing/';
}
```

Called on DOMContentLoaded (line 2414) and on lang-switcher change (line 2627+) — so the pricing
link always reflects the current language, even when the user switches language via the app selector.

**Localized homepages** — one `<a>` added to each, after `nav-recipes`, before `</nav>`:
```html
<a class="nav-link" id="nav-pricing" href="/ro/premium/">⭐ Premium</a>
```
The `href` is the correct locale URL as a sensible no-JS default. `updateContentNav()` updates
it immediately on DOMContentLoaded, so it is always correct at runtime.

### Part B — `generate-content.mjs`

**New constant** `PRICING_LANG_NAMES` — 14 native language names for the select options.

**New function** `makePricingNav(lc_code)`:
- Same base structure as `makeNav(lc)`: brand, nav-links (plans, recipes, App)
- Adds `⭐ Premium` as the third nav-link with `class="nav-link--active"` and `aria-current="page"`
- Adds a `<div class="nav-lang">` with a `<select class="lang-select">` containing all 14 pricing
  page URLs as options; the current language is pre-selected
- `onchange="location.href=this.value"` — zero-dependency inline navigation

`makeNav(lc)` is completely unchanged. Only `pricingPage()` uses `makePricingNav()`.

### `/pricing/index.html` (root, hand-coded)

Added a static `<select>` with 15 options:
- `/pricing/` — English (x-default, pre-selected)
- `/en/pricing/` — English (localised)
- 13 other locales

---

## Verification

### Page count and sitemap (unchanged)
```
Generated 2576 pages total.
sitemap.xml — 2620 URLs
```

### Localized homepages → pricing links

| Page | id="nav-pricing" href |
|------|-----------------------|
| `/ro/index.html` | `/ro/premium/` ✅ |
| `/en/index.html` | `/en/pricing/` ✅ |
| `/fr/index.html` | `/fr/tarifs/` ✅ |
| `/de/index.html` | `/de/preise/` ✅ |
| `/es/index.html` | `/es/precios/` ✅ |
| `/ar/index.html` | `/ar/asaar/` ✅ |
| `/ko/index.html` | `/ko/pricing/` ✅ |
| (all 14 verified) | ✅ |

### Pricing page language switcher

| Page | Current language selected | Switch to EN | Switch to FR |
|------|--------------------------|--------------|--------------|
| `/ro/premium/` | Română ✅ | → `/en/pricing/` ✅ | → `/fr/tarifs/` ✅ |
| `/de/preise/` | Deutsch ✅ | → `/en/pricing/` ✅ | → `/es/precios/` ✅ |
| `/en/pricing/` | English ✅ | — | → `/fr/tarifs/` ✅ |

### Active nav state on pricing pages

- `/ro/premium/` — `⭐ Premium` has `class="nav-link nav-link--active"` and `aria-current="page"` ✅
- `/en/pricing/` — same ✅

---

## Behaviour After Fix

**User at `/ro/`:**
- Sees nav: `📅 Meniuri · 🍽️ Rețete · ⭐ Premium`
- Clicks `⭐ Premium` → lands on `/ro/premium/` (Romanian pricing page) ✅
- Switches language to FR via lang-switcher → nav-pricing href updates to `/fr/tarifs/` ✅

**User at `/ro/premium/`:**
- Sees nav: `Meniuri Săptămânale · Rețete · ⭐ Premium (active)` + language select
- Changes select from `Română` to `Français` → navigates to `/fr/tarifs/` ✅
- Changes select from `Română` to `English` → navigates to `/en/pricing/` ✅

**User at `/de/preise/`:**
- Changes select from `Deutsch` to `Español` → navigates to `/es/precios/` ✅

---

## Risk Assessment

**Overall: Low.** All changes were additive:
- `app.js`: new constant + 3 lines in existing function; no logic removed
- Localized homepages: one `<a>` tag each; the `id` pattern mirrors the already-working root `/index.html`
- `generate-content.mjs`: new function isolated to `pricingPage()` only; `makeNav()` untouched
- No changes to API, auth, payments, recipes, sitemap counts, or CI thresholds
