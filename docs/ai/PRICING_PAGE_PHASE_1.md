# Pricing Page — Phase 1

_Implemented: 2026-05-18_
_Owner: Claude Code (Lead Developer)_

---

## Summary

Created a standalone, SEO-indexable pricing page at `/pricing/` and added a nav link on the
homepage. No backend or JS logic was changed.

---

## Problem

The pricing section already existed as a JS-rendered component inside the homepage
(`renderPricingSection()` in `app.js`, lines 2446–2609). It has full 14-language support, Free vs
Premium comparison cards, and a working Stripe CTA. However:

- **No standalone URL** — the pricing section can't be linked from ads, emails, or social
- **Not crawlable by Google** — JS-rendered content is not reliably indexed as structured data
- **No direct entry point** for users arriving with commercial intent

---

## Files Changed

| File | Change | Risk |
|------|--------|------|
| `public/pricing/index.html` | New standalone pricing page | Zero — new file |
| `public/index.html` | One nav link added (`⭐ Premium → /pricing/`) | Very low — static `<a>` tag |
| `docs/ai/PRICING_PAGE_PHASE_1.md` | This document | Zero |

**Not changed:** `app.js`, `checkout.js`, `checkout.min.js`, any API, recipes, `generate-content.mjs`, `style.css`.

---

## Pricing Page: `/pricing/index.html`

### Design decisions

**No `app.js` loaded.** The full app bundle is 2.4 MB and designed for the interactive meal
planner. The pricing page is static HTML — it only needs `checkout.min.js` (759 bytes) for the
pay button.

**Reuses existing CSS.** All `.pricing-card`, `.pcard-*`, `.btn-upgrade`, `.app-header`, and
`.app-footer` classes come from `style.min.css`. No new CSS framework was added.

**`id="pay-btn"` matches `checkout.min.js`.** The existing `checkout.min.js` listens for clicks
on `#pay-btn` and calls `POST /api/create-checkout-session` with the hardcoded `PRICE_EUR` price
ID. Zero changes to checkout logic.

**`id="emailInput"` present (optional).** `checkout.min.js` reads `#emailInput` optionally to
pre-fill the Stripe checkout session. If left blank, Stripe's own checkout form collects the email.

### Page structure

```
/pricing/
  ├── <head>: canonical, OG tags, JSON-LD Product with two Offers
  ├── Header: same nav as homepage + ⭐ Premium link (aria-current="page")
  ├── Hero: "Simple, honest pricing / Start free. Upgrade when you need more."
  ├── Pricing cards (reuses .pricing-card--free / .pricing-card--premium CSS)
  │     Free:    €0/month — meal planner, shopping list, 175 recipes, 1 PDF/day
  │     Premium: €3/month — full 7-day PDF, budget menu, AI chat, AI coach, unlimited
  ├── "Already subscribed?" mini-form — email input + link to /#access-card
  ├── FAQ section (5 questions covering billing, activation, languages)
  ├── "Back to Meal Planner" link
  └── Footer: same as homepage
```

### JSON-LD structured data

The page includes a `schema.org/Product` block with two `Offer` entries (Free at €0, Premium at
€3/month with `UnitPriceSpecification`). This makes the pricing eligible for Google's Rich Results
and enables price display in search snippets.

---

## Nav Link: `public/index.html`

Added one `<a>` tag inside `#content-nav`:

```html
<a class="nav-link" id="nav-pricing" href="/pricing/">⭐ Premium</a>
```

**Why this is safe:** `updateContentNav()` in `app.js` only updates elements by the IDs
`nav-plans` and `nav-recipes`. The new `nav-pricing` element is not touched by any JS.

---

## Checkout Flow Verification

The pricing page CTA uses the **identical checkout path** as the homepage:

```
User clicks "Get Premium →" (#pay-btn)
  → checkout.min.js fires startSubscriptionCheckout()
  → POST /api/create-checkout-session { email, priceId: PRICE_EUR }
  → Stripe hosted checkout page
  → successUrl: window.location.origin + '/?success=true'
  → cancelUrl: window.location.origin + '/'
```

No changes to `api/create-checkout-session.js` or `checkout.js`.

---

## What Phase 1 Does NOT Include

- The pricing page nav links on generated recipe/plan pages are not localised — those navs
  are built by `makeNav()` and do not currently include a pricing link. Deferred to Phase 3.

---

## Multilingual Pricing — Implemented (commit `ba36ca76e`)

_Implemented: 2026-05-18_

### What was added

`scripts/generate-content.mjs` now generates 14 localised pricing pages at build time.

**New constants:**

| Constant | Purpose |
|----------|---------|
| `PRICING_SLUGS` | Maps each lang code to its localised URL slug |
| `PRICING_COPY` | Full copy for all 14 languages (title, features, FAQ, CTA labels) |
| `PRICING_HREFLANGS` | Pre-built hreflang block injected into every generated page |
| `pricingPage(lc_code)` | Template function returning a complete HTML page |

**URLs generated:**

| Language | URL |
|----------|-----|
| Romanian | `/ro/premium/` |
| English | `/en/pricing/` |
| Spanish | `/es/precios/` |
| French | `/fr/tarifs/` |
| German | `/de/preise/` |
| Portuguese | `/pt/precos/` |
| Russian | `/ru/tseny/` |
| Arabic | `/ar/asaar/` |
| Chinese | `/zh/jiage/` |
| Japanese | `/ja/pricing/` |
| Hindi | `/hi/pricing/` |
| Turkish | `/tr/fiyatlar/` |
| Italian | `/it/prezzi/` |
| Korean | `/ko/pricing/` |

**Arabic page** uses `dir="rtl"` (detected via `lc.dir_attr`).

**Page count:** 2562 → 2576 (+14)
**Sitemap:** 2605 → 2620 URLs (+15: `/pricing/` + 14 localised)

### hreflang strategy

Every localised pricing page includes 15 `<link rel="alternate" hreflang>` tags:
- `x-default` → `https://meal-planner.ro/pricing/` (English root)
- One tag per language pointing to its own localised URL

`/pricing/index.html` also received the matching 15 hreflang tags (bidirectional).

### Design decisions

- `checkout.min.js` only — no `app.js` loaded (same as `/pricing/`)
- "Already subscribed?" link → `/#access-card` on the root homepage (the email
  verification form lives only on `/`, not on per-language app pages)
- Inline `<style>` per page (no new CSS file) — identical to `/pricing/`
- `makeNav(lc)` and `makeFooter(lc)` reused — nav links are language-aware via existing helpers
- FAQ is fully localised in each language

---

## Phase 3 Options

| Item | Effort | Impact |
|------|--------|--------|
| Add pricing link to `makeNav(lc)` in generate-content.mjs | Low | Medium — visible from all recipe/plan pages |
| A/B test pricing copy (€3 vs €4, monthly vs annual) | Medium | High conversion |
| Add testimonials / social proof section | Low | Medium conversion |
| Trust badges (Stripe, SSL) below CTA | Low | Medium conversion |
| Localised OG images per language | Medium | Low-Medium SEO |
