# QA Checklist — weekly-meal-planner

_Last updated: 2026-05-18_
_Owner: QA Critic (ChatGPT) + Claude Code for fixes_

---

## Run this checklist after every significant change

### Build Verification
- [ ] `npm run build` exits with code 0
- [ ] `npm run content` generates exactly **2562 pages**
- [ ] `sitemap.xml` contains exactly **2605 URLs**
- [ ] No curly quotes (U+2018/U+2019) in `public/js/recipes.js`
- [ ] `public/js/app.min.js` is newer than `public/js/app.js`

### Recipe Quality (per recipe, sample 10 random)
- [ ] Ingredients list has at least 7 items
- [ ] Every ingredient has a quantity (number + unit)
- [ ] `howIsMade` includes at least one temperature or time cue
- [ ] `howIsMade` includes at least one texture descriptor
- [ ] `hi` (Hindi) field present in: origin, name, category, ingredients, howIsMade, originText
- [ ] `tipType` is one of: def, soup, fish, meat, pasta, dessert
- [ ] `pairingsType` is one of: def, korean, japanese, meat, fish, soup, pasta, veg
- [ ] Recipes with 9+ ingredients have explicit `servings: 4`

### Multilingual Consistency
- [ ] No language key is missing from any recipe field
- [ ] Romanian text doesn't appear in non-Romanian pages
- [ ] `originText` sentences end with a period in all languages
- [ ] Language switcher on pages links to correct equivalent page

### Payments & Access (manual test with Stripe test mode)
- [ ] Free user can download 1 PDF per week
- [ ] Free user is blocked from downloading a 2nd PDF same week
- [ ] Premium checkout redirects to correct success page
- [ ] Stripe webhook: subscription.created → user gets access
- [ ] Stripe webhook: subscription.deleted → user loses access
- [ ] Customer portal opens and shows correct plan info
- [ ] Cancellation in portal actually revokes access after period ends

### AI Features
- [ ] Chat endpoint returns a coherent recipe suggestion
- [ ] Coach endpoint returns nutrition advice
- [ ] AI endpoints return 401 for unauthenticated requests
- [ ] AI endpoints return 429 after rate limit exceeded

### Mobile UX
- [ ] Homepage hero is readable on 375px width
- [ ] Meal planner drag-and-drop works on touch
- [ ] Recipe pages have readable font size (>= 16px)
- [ ] CTAs are at least 44px tall (iOS tap target)
- [ ] No horizontal scroll on any page

### SEO
- [ ] Every page has a unique `<title>` tag
- [ ] Every page has a `<meta name="description">` tag
- [ ] Recipe pages have `<script type="application/ld+json">` with Recipe schema
- [ ] `<link rel="canonical">` is correct on each page
- [ ] `<link rel="alternate" hreflang="...">` present for all 14 languages
- [ ] `sitemap.xml` is accessible at `/sitemap.xml`
- [ ] No `noindex` accidentally set on recipe pages

### Performance
- [ ] Homepage Lighthouse performance score >= 80
- [ ] LCP (Largest Contentful Paint) < 2.5s on desktop
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Images have `width` and `height` attributes (prevent CLS)

### Security
- [ ] No secrets in any committed file (grep for "sk_live", "SUPABASE_SERVICE", "OPENAI_API")
- [ ] Stripe webhook verifies signature (`stripe.webhooks.constructEvent`)
- [ ] Supabase RLS enabled on custom tables
- [ ] No `console.log` with sensitive data in API files

---

## Known Issues (open)

| Issue | Severity | Status |
|-------|----------|--------|
| ~130 recipes still have generic/vague content | High | In progress (batch refactor) |
| Mobile meal planner UX not audited | Medium | To do |
| Recipe schema.org not verified | Medium | To do |
| hreflang tags not audited | Medium | To do |
| Free PDF limit possibly client-side only | High | To investigate |
| Stripe subscription.deleted handler not tested | High | To test |

---

## Red Lines (never acceptable)
- Build fails and change is committed
- Curly quotes in recipes.js break JavaScript
- Premium content accessible without valid subscription
- Stripe webhook secret not verified
- User data leaked in API response
