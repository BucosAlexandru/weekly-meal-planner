# Repository Audit — weekly-meal-planner

_Date: 2026-05-18_
_Auditor: Claude Code (Lead Developer & Architect)_
_Status: READ-ONLY analysis. No code was changed._

---

## 1. Current Architecture Score: **5.5 / 10**

| Dimension | Score | Reason |
|-----------|-------|--------|
| Static site architecture | 8/10 | Correct choice for scale, Vercel deploy is solid |
| Content generation pipeline | 7/10 | Works well, but has consistency issues |
| API / serverless layer | 5/10 | Works, but mixed ESM/CJS, no auth on AI endpoints |
| Security | 3/10 | PDF limit is client-side, AI endpoints unguarded, generate-token is unauthenticated |
| Multilingual system | 6/10 | Impressive breadth, but comment vs. code contradicts itself |
| SEO implementation | 6/10 | Schema.org present, but same image for all recipes is a silent SEO killer |
| Monetization logic | 4/10 | Critical client-side gating vulnerability |
| Code consistency | 5/10 | Mixed module formats, duplicated language configs in 3 places |
| Scalability | 7/10 | Static architecture scales perfectly; only single-file recipe data is a risk |
| CI/CD | 1/10 | No `.github/workflows/` folder exists at all |

---

## 2. Top 20 Technical Risks

### 🔴 CRITICAL (security / money)

**Risk 1 — PDF limit enforced only in localStorage (client-side)**
File: `public/js/app.js` lines 160–169, 2436
```
let pdfCount = +localStorage.getItem('pdfCount') || 0;
```
Any user can open DevTools → Console → `localStorage.setItem('pdfCount', '0')` and download unlimited PDFs for free. This is 100% bypassable. The free tier limit is a UX illusion, not a security boundary.

**Risk 2 — `generate-token.js` grants premium access to anyone**
File: `api/generate-token.js` lines 11–13
```js
// TODO: Validează plata Stripe aici înainte să continui!
const token = Math.random().toString(36).substring(2, 16);
```
This endpoint is live, unprotected, and requires no authentication. Anyone who discovers `POST /api/generate-token` with any email body gets a 30-day premium token. The TODO was never implemented. **This may already be exploited.**

**Risk 3 — AI endpoints have zero authentication**
Files: `api/chat.js`, `api/coach.js`
Neither endpoint checks if the caller is a premium user or even a known user. Any person, bot, or script can POST to `/api/chat` and run OpenAI API calls at the owner's expense. No rate limiting. No token check. This is an open billing exploit.

**Risk 4 — Supabase credentials hardcoded in public client JS**
File: `public/js/app.js` lines 2631–2633
```js
const supabase = window.supabase.createClient(
  'https://hwbzbidorkwtyvirozho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```
The project URL and anon key are hardcoded (not from ENV) and shipped in the public bundle. The anon key is technically designed to be public, **but only if RLS is correctly configured**. If the `tokens` table does not have Row Level Security enabled in Supabase, any visitor can query all users' premium status, enumerate paying customers, and find any user's `expires_at`.

**Risk 5 — Client directly queries Supabase `tokens` table**
File: `public/js/app.js` lines 2650–2653
```js
const { data, error } = await supabase
  .from('tokens')
  .select('*')
  .eq('email', email);
```
Premium access is determined entirely in the browser by querying Supabase directly. There is no server-side validation step. A sophisticated attacker can intercept or mock the Supabase response and set `window.hasUnlimited = true` manually without a valid subscription.

**Risk 6 — `invoice.payment_failed` webhook event not handled**
File: `api/stripe-webhook.js`
When a renewal payment fails, Stripe fires `invoice.payment_failed`. This event is not handled. The `customer.subscription.updated` event will eventually fire and update status to `past_due`, but there is a window where the user's subscription is failing but their `expires_at` still grants access until the period end. For monthly subscriptions this means up to 30 days of free access after a failed payment.

**Risk 7 — `generate-token.js` uses Math.random() for tokens**
File: `api/generate-token.js` line 13
```js
const token = Math.random().toString(36).substring(2, 16);
```
`Math.random()` is not cryptographically secure. Generated tokens are 14 characters from a 36-character alphabet = ~72 bits of entropy at best, in practice much less because Math.random() seeds are predictable in some JS engines. A production token should use `crypto.randomUUID()` or `crypto.randomBytes()`.

### 🟠 HIGH (functionality / reliability)

**Risk 8 — Mixed CommonJS and ESM module formats**
Files: `api/generate-token.js` (uses `require`, `module.exports`), all other API files (use `import`/`export default`)
Vercel handles both, but this inconsistency can cause silent build failures on Node version changes, and makes the codebase confusing for any AI agent or developer working on it.

**Risk 9 — No CI/CD pipeline exists**
No `.github/workflows/` folder. Every push to `main` goes live immediately with zero automated checks. A broken `recipes.js` with a JavaScript syntax error would deploy and break the site for all 14 languages before anyone notices.

**Risk 10 — All 175 recipe pages use the same image in schema.org JSON-LD**
File: `scripts/generate-content.mjs` line 1862
```js
"image":[`https://meal-planner.ro/images/cover2.jpg`]
```
Google's Recipe rich results require a distinct image per recipe. Using the same generic cover image on all 175 recipes will cause Google to either ignore the structured data or display it inconsistently. This silently kills rich snippets eligibility.

**Risk 11 — `generate-content.mjs` comment contradicts the code**
File: Line 7: `* Recipe pages: ro + en only (detailed ingredient/method pages)`
But the execution loop at line 2041 generates recipe pages for ALL 14 languages. This stale comment will mislead every AI agent and developer who reads it, causing wrong assumptions about what is generated.

**Risk 12 — Nutrition values are estimated heuristically, not calculated**
File: `scripts/generate-content.mjs` — `recipeNutrition()` function
Nutrition data (calories, protein, carbs, fat) is estimated from recipe category and ingredient count, not from actual nutritional databases. The values shown on recipe pages are plausible-sounding but scientifically inaccurate. This is a legal and trust risk, especially in markets with food labelling regulations.

**Risk 13 — `create-checkout-session.js` does not whitelist priceId**
File: `api/create-checkout-session.js` line 13
```js
const { email, priceId, customerId, successUrl, cancelUrl } = req.body || {};
if (!priceId) return res.status(400).json({ error: 'Missing priceId' });
```
Any `priceId` from the Stripe account is accepted. If the Stripe account has free trial prices, discounted prices, or other products, a user could theoretically pass any valid price ID. Should be validated against an allowed list.

**Risk 14 — Recipe ID gaps (8 missing IDs between 1 and 183)**
`python3` scan found IDs min=1, max=183 with 175 recipes — 8 IDs are missing. This suggests some recipes were deleted or added out of sequence. If any hardcoded references to these IDs exist elsewhere (in `recipes-meta.js`, `recipes-budget.js`, or templates), they will silently fail.

**Risk 15 — `recipes.js` is a 16,395-line single file loaded by both client and server**
This file is imported by `app.js` (client bundle) and by `generate-content.mjs` (build script). On the client, all 16k lines of recipe data are sent to every visitor on every page. This is the biggest performance bottleneck. The lazy-loading pattern already used for `recipes-budget.js` should be applied here.

### 🟡 MEDIUM (quality / maintainability)

**Risk 16 — Language configuration is duplicated in 3 separate places**
- `public/js/i18n.js` — UI translations
- `scripts/generate-content.mjs` — LANG_CONFIGS + RECIPE_LANG (build-time)
- `public/js/app.js` — NAV_CONTENT_LINKS (runtime)

Any new language requires updating all 3 locations. Adding a 15th language is a high-effort, high-risk operation with no single source of truth.

**Risk 17 — Batch 10 recipe edit is partially committed (Pierogi only)**
File: `public/js/recipes.js`
According to the git history and session context, Nasi Goreng (ID 41), Fondue (42), Masgouf (43), and Shakshuka (44) still have generic/vague ingredients without quantities. The `recipes.js` file has Pierogi done but the others pending. The file was not rebuilt after this partial edit.

**Risk 18 — `window.supabase` loaded via CDN script tag, not bundled**
The Supabase client is expected to be globally available as `window.supabase` (line 2631 of app.js). This means it is loaded via a `<script>` tag in the HTML, creating a hard external CDN dependency. If the CDN is down or blocked (firewalls, China), the entire premium flow breaks.

**Risk 19 — Breadcrumb in recipe pages does not include BreadcrumbList schema.org**
File: `scripts/generate-content.mjs` lines 1904–1906
The visual breadcrumb exists in HTML but there is no `BreadcrumbList` structured data in the JSON-LD block. Google requires this separately from the Recipe schema for breadcrumb rich results.

**Risk 20 — `success_url` for Stripe checkout hardcoded to root**
File: `public/js/checkout.js` line 11
```js
successUrl: window.location.origin + '/?success=true',
```
After a successful subscription, users are always redirected to the homepage regardless of what language they were on (`/es/`, `/fr/`, etc.). A French user who pays gets redirected to the Romanian homepage. This is a UX failure that likely increases confusion and churn.

---

## 3. Top 20 Safest Improvements

_(Low risk, high confidence, cannot break existing functionality)_

1. **Add `hi` field to all remaining recipes missing it** — mechanical edit, verified by build count
2. **Fix stale comment in generate-content.mjs line 7** — change "ro + en only" to "all 14 languages"
3. **Create `.github/workflows/build-check.yml`** — CI only, does not change production behavior
4. **Create `.github/workflows/link-check.yml`** — read-only check, no production impact
5. **Add `BreadcrumbList` JSON-LD to all recipe pages** — additive, improves SEO, no visual change
6. **Fix `success_url` to redirect to the correct language page** — fix in `checkout.js`, low risk
7. **Add `max_tokens` limit to `chat.js`** — currently commented out, reduces OpenAI cost risk
8. **Convert `generate-token.js` from CommonJS to ESM** — consistency, no behavior change
9. **Replace `Math.random()` tokens with `crypto.randomUUID()`** — drop-in replacement, more secure
10. **Document all ENV vars with descriptions** in `DEPLOYMENT_PLAN.md` — documentation only
11. **Fix originText sentences missing period** in translated recipes — content quality, no code change
12. **Add `invoice.payment_failed` handler to webhook** — additive event handler, no existing code breaks
13. **Audit and add `changefreq` and `priority` to sitemap more precisely** — sitemap only, SEO signal
14. **Whitelist `priceId` in `create-checkout-session.js`** against a constant — additive validation
15. **Add `alt` attributes to all images in generated pages** — accessibility, additive HTML
16. **Add `loading="lazy"` to recipe card images** — performance, additive attribute
17. **Move Supabase anon key to a consistent location** (still public, just organized)
18. **Add `<meta name="robots" content="index, follow">` where missing** — SEO, additive
19. **Add proper `<html lang="ar" dir="rtl">` verification** for Arabic pages
20. **Complete Batch 10 recipe edits** (Nasi Goreng, Fondue, Masgouf, Shakshuka) — content only

---

## 4. Top 10 Business-Impact Improvements

_(Ordered by direct revenue / conversion / trust impact)_

1. **🔴 Move PDF limit enforcement to server-side** — Currently 100% bypassable via DevTools. Every free user who knows about this is getting unlimited PDFs for free. Fix: create `/api/pdf-gate` that checks Supabase before allowing download, or at minimum check `check-access.js` before generating PDF.

2. **🔴 Add authentication to `/api/chat` and `/api/coach`** — Currently any bot can exhaust your OpenAI quota. Add token/email verification before processing. Potential monthly cost: unbounded.

3. **🔴 Disable or properly secure `/api/generate-token`** — This endpoint grants unlimited premium access to anyone. Either remove it entirely (if it serves no live purpose) or add admin authentication (e.g., a secret header only the admin knows).

4. **🟠 Build a proper pricing page** — Currently there is no dedicated `/pricing/` page. Users need to understand what they get before paying. A clear Free vs Premium comparison page is the single highest-conversion-rate page any SaaS can have.

5. **🟠 Redirect post-checkout to correct language homepage** — French user pays → lands on Romanian homepage → confused → possible churn or support request. Fix `successUrl` to use current language path.

6. **🟠 Add recipe images** — All 175 recipe pages show a generic emoji instead of a real food photo. Real images dramatically increase time-on-page, click-through from Google Images, and social sharing. Even AI-generated images per recipe category would be a major improvement.

7. **🟠 Add recipe filter system to the recipes index** — Users land on the recipe index and see 175 recipes in a wall of country-grouped links. No search, no filter by category/time/diet. Adding client-side filtering (already partially done in `app.js` for the meal planner) would dramatically improve discoverability and SEO engagement metrics.

8. **🟡 Add email capture for free users** — Currently a free user can use the full product without leaving an email. Adding an optional "Save your meal plan — enter email" step creates a lead list for upselling premium. Even 5% conversion on email list = real revenue.

9. **🟡 Show subscription renewal date in the UI** — The webhook stores `current_period_end` in Supabase. Currently this is never shown to the user. Showing "Your plan renews on June 18, 2026" in the UI increases trust and reduces cancellation from confusion.

10. **🟡 Add Google Analytics / Plausible** — There is currently no analytics. You have zero visibility into which recipes are popular, which languages convert, where users drop off. This data should drive all future content and feature decisions.

---

## 5. Immediate Critical Fixes

_(Must be done before any marketing push or traffic increase)_

### Fix A — Disable or secure `generate-token.js`
**Risk**: Anyone can grant themselves premium access for free.
**Action**: Add an admin secret header check. If `req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET` → return 401. Or remove the endpoint entirely if it has no current legitimate use.
**Files**: `api/generate-token.js`

### Fix B — Add token check to `/api/chat` and `/api/coach`
**Risk**: OpenAI costs are entirely unprotected.
**Action**: At minimum add: `const email = req.body?.email; if (!email) return res.status(401).json({error: 'Unauthorized'});` and then call `check-access.js` logic inline.
**Files**: `api/chat.js`, `api/coach.js`

### Fix C — Verify Supabase RLS on `tokens` table
**Risk**: All paying customer emails and subscription data may be publicly queryable.
**Action**: Log into Supabase Dashboard → Table Editor → `tokens` → Enable RLS → Add policy: `SELECT` is only allowed where `email = auth.email()`. If this breaks the current flow (since client queries without auth), it confirms the flow needs to move server-side.
**Files**: Supabase Dashboard (not code)

### Fix D — Run `npm run content` to finish Batch 10
**Risk**: `recipes.js` has Pierogi refactored but 2561 pages were not regenerated (the modified recipes.js was not committed/built).
**Action**: Complete Nasi Goreng, Fondue, Masgouf, Shakshuka → verify 2562 pages → commit.
**Files**: `public/js/recipes.js`

---

## 6. What Should NEVER Be Refactored Blindly

### DO NOT touch without a complete plan:

1. **`scripts/generate-content.mjs`** — One wrong change here breaks all 2562 pages simultaneously. Any edit must be followed by a full `npm run content` verification and page count assertion.

2. **`public/js/recipes.js`** — 16,395 lines. One broken JS token (unclosed bracket, stray curly quote U+2018) breaks the entire app for all languages simultaneously. Always check curly quotes with python3 before building.

3. **`api/stripe-webhook.js`** — The webhook state machine is the ground truth for subscription access. Wrong logic here means users lose access who should have it, or retain access who should not. Requires full Stripe test mode validation before any change.

4. **`public/js/i18n.js`** — Translation strings for all 14 languages. If a key is renamed or removed, every page that uses it silently falls back to the key name itself (e.g., the button shows "btn.download" instead of a translated string). Changes require testing all 14 languages.

5. **The `tokens` Supabase table schema** — The `expires_at` field has inconsistent formats (seconds vs milliseconds, handled by `parseExpiryToMs()`). Any schema migration must account for all existing rows and update the parsing logic in `check-access.js`, `check-token.js`, and `app.js` simultaneously.

6. **`vercel.json`** — Wrong rewrite rules will 404 all pages or expose raw files. Test in a preview deployment before merging to main.

7. **The `slug()` function in `generate-content.mjs`** — Recipe page URLs are derived from the English recipe name via this function. Any change to `slug()` will change ALL recipe URLs, breaking all existing Google-indexed pages (180+ per language = 2520 dead links).

---

## 7. Suggested Roadmap — Next 60 Days

### Days 1–7: Security Hardening (non-negotiable)
- [ ] Secure or remove `generate-token.js`
- [ ] Add authentication to `/api/chat` and `/api/coach`
- [ ] Verify Supabase RLS on `tokens` table
- [ ] Add `invoice.payment_failed` webhook handler
- [ ] Add `max_tokens: 500` to chat.js and coach.js
- [ ] Whitelist priceId in `create-checkout-session.js`

### Days 8–14: CI/CD Foundation
- [ ] Create `.github/workflows/build-check.yml` (build + page count + curly quote check)
- [ ] Create `.github/workflows/link-check.yml`
- [ ] Fix stale comment in generate-content.mjs
- [ ] Convert generate-token.js to ESM
- [ ] Replace Math.random() with crypto.randomUUID()

### Days 15–30: Content Quality
- [ ] Complete recipe refactor batches 10–20 (IDs 40–99)
- [ ] Fix `success_url` to redirect to correct language page
- [ ] Add distinct recipe images (at minimum per-category placeholder images)
- [ ] Fix `BreadcrumbList` schema.org on all recipe pages
- [ ] Verify `hreflang` tags are correct in all generated pages

### Days 31–45: SEO Sprint
- [ ] Fix recipe image in JSON-LD (use per-category images, not one generic cover)
- [ ] Audit title/description quality across 10 sample pages per language
- [ ] Submit updated sitemap to Google Search Console
- [ ] Add internal linking ("You might also like") to recipe pages
- [ ] Add `originText` period-ending consistency fix

### Days 46–60: Monetization & Growth
- [ ] Build pricing page (`/en/pricing/`, and 13 language equivalents)
- [ ] Move PDF limit to server-side check
- [ ] Add analytics (Plausible or GA4)
- [ ] Add subscription renewal date to UI
- [ ] Add email capture for free users
- [ ] Complete remaining recipe refactor batches 21–36 (IDs 100–175)

---

## 8. Project Maturity Level

**Level: Early Commercial — Prototype-to-Product Transition**

| Dimension | Level |
|-----------|-------|
| Core functionality | Working MVP ✅ |
| Content quality | 25% done (45/175 recipes refactored) |
| Security | Below minimum for commercial use ⚠️ |
| SEO | Structural foundation present, execution incomplete |
| Monetization | Partially implemented, with gating vulnerability |
| DevOps | Manual-only, no automation |
| Analytics | None |
| Testing | None |
| Documentation | Just created (AGENTS.md + docs/ai/) |
| Scalability | Architecture is correct, content pipeline is the ceiling |

**Honest assessment**: The product is technically live and functional, but is not yet safe to promote heavily. A marketing push before fixing the security issues (Risks 1–3) would result in: (a) users discovering and exploiting the PDF bypass, (b) uncontrolled OpenAI spend, and (c) potential premium access being granted to non-paying users.

**Time to "safe for growth"**: ~2 weeks of focused security + CI/CD work.
**Time to "ready for marketing"**: ~6 weeks (security + pricing page + analytics + image quality).

---

## 9. Biggest Monetization Weaknesses

1. **No pricing page** — Users can't understand the offer without discovering it accidentally in the homepage flow. This is the #1 conversion killer.

2. **PDF limit is bypassable** — Free tier effectively doesn't exist for technical users. The paid product's value proposition is undermined.

3. **No email capture on free tier** — Every free user who leaves is gone forever. A simple "Save your plan" email field would build a retargetable list.

4. **No upgrade prompt on recipe pages** — 2562 recipe pages have zero upsell. Adding "Plan your full week with this recipe — Go Premium" to each recipe page is a high-volume conversion opportunity.

5. **Single price point** — Only one Premium tier visible. No annual option (typically 30-40% of SaaS revenue), no family plan, no gift option. This leaves revenue on the table.

6. **No free trial** — The transition from free to paid has no bridge. A 7-day free trial of Premium dramatically increases conversion by letting users experience the value before paying.

7. **Checkout redirects to wrong language** — French/Spanish/German users who pay land on a Romanian-language success page. This creates confusion and reduces confidence in the product.

8. **AI features invisible until after payment** — The AI chat and coaching are premium-only but there's no way for free users to preview or understand what they're missing. Adding locked previews ("Try one AI suggestion — then upgrade") would convert better.

9. **No subscription renewal visibility** — Users don't know when they'll be charged next. This leads to surprise charges, chargebacks, and cancellations — all of which hurt Stripe reputation score.

10. **No referral or viral mechanism** — The shared meal plan PDF has no watermark or "Made with Meal-Planner.ro" footer that would drive word-of-mouth. Each PDF download is a missed acquisition opportunity.

---

## 10. Biggest SEO Weaknesses

1. **Same image (`cover2.jpg`) in ALL recipe JSON-LD** — Google requires unique, relevant images per recipe for rich results. All 175 recipes have identical structured data images. This prevents rich snippets from appearing in Google Search.

2. **No internal linking between recipe pages** — Each recipe page is an island. Google cannot efficiently crawl or understand content relationships. The only internal links are through the recipe index pages. Recipe pages should link to 3-5 related recipes.

3. **No Google Analytics / Search Console data being used** — Without knowing which keywords drive traffic, content improvements are guesswork. The Google Search Console verification file exists (google2065eaa42cd153ac.html) but there's no data-driven SEO strategy.

4. **`hreflang` tags not audited** — With 14 languages and 2562 pages, a single wrong `hreflang` across the template would affect all pages simultaneously. This has never been verified post-generation.

5. **BreadcrumbList schema.org missing from recipe pages** — The visual breadcrumb exists but there is no corresponding JSON-LD. Google needs both for breadcrumb rich results.

6. **Recipe index pages grouped by country, not category** — Users (and Google) looking for "Breakfast recipes" or "Dessert recipes" have no entry point. Category-based landing pages would capture high-intent search traffic.

7. **`originText` fields have inconsistent quality across languages** — Some end without a period. Some have broken grammar (e.g., "Путин — традиционный рецепт из Канада" — grammatically wrong Russian). Low-quality originText harms user experience and content uniqueness signals.

8. **130/175 recipes still have generic/vague content** — Recipes with "flour, eggs, potatoes" instead of "300g plain flour, 2 large eggs, 500g floury potatoes" have low content uniqueness. Google's HCU (Helpful Content Update) penalizes thin, low-specificity content.

9. **No blog or content hub** — The site has 2562 pages but zero editorial content (articles, guides, "how to meal plan" resources). This means zero topical authority signals beyond the recipe pages themselves.

10. **Sitemap `changefreq` logic is a single-line regex monster** — The sitemap generation at line 2085 of generate-content.mjs has a 300-character regex for changefreq. This is brittle, hard to audit, and may miscategorize pages. Recipe pages could benefit from `weekly` during the active refactoring phase.

---

## Summary Table

| Category | Current State | Priority |
|----------|--------------|----------|
| Security | ⚠️ Critical vulnerabilities | IMMEDIATE |
| Recipe content | 25% done | Ongoing |
| CI/CD | Not started | Week 1–2 |
| Pricing page | Missing | Week 2–3 |
| Analytics | Not started | Week 3 |
| Recipe images | Generic emoji | Week 4–6 |
| Internal linking | Missing | Week 4–6 |
| Server-side PDF gate | Not built | Week 1 |
| BreadcrumbList schema | Missing | Week 2 |
| Email capture | Not built | Week 5–6 |

---

_End of audit. No code was modified during this analysis._
