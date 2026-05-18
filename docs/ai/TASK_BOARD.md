# Task Board — weekly-meal-planner

_Last updated: 2026-05-18_
_Lead: Claude Code | See AGENTS.md for role assignments_

---

## Status Legend
- `[ ]` To do
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

---

## SPRINT 1 — Foundation & Recipe Quality

### Recipe Refactor (Claude Code — batch by batch)
- [x] Batch 1-6: IDs 1-10, 12-14, 16-17, 19-24, 26-28, 30-34
- [x] Batch 7: Souvlaki (11), Pancakes (15), Feijoada (18), Empanadas (29), Shakshuka... _see git log_
- [x] Batch 8: Tabbouleh (25), Tzatziki (30), French Onion Soup (31), Goulash (32), Koshari (33)
- [x] Batch 9: Baklava (35), Chili (36), Sweet & Sour Chicken (37), Pavlova (38), Poutine (39)
- [~] Batch 10: Pierogi (40), Nasi Goreng (41), Fondue (42), Masgouf (43), Shakshuka (44) — IN PROGRESS
- [ ] Batches 11-36: ~125 remaining recipes (IDs 45-175)

### CI/CD (Codex / Claude Code)
- [ ] Create `.github/workflows/build-check.yml`
  - Install dependencies
  - Run `npm run build`
  - Assert page count == 2562
  - Assert sitemap URL count == 2605
  - Block merge if any check fails
- [ ] Create `.github/workflows/link-check.yml`
  - Scan all generated HTML for broken internal links
- [ ] Document all required env vars in `docs/ai/DEPLOYMENT_PLAN.md`

---

## SPRINT 2 — Homepage & Conversion

### Homepage Polish (Frontend Builder — Cursor)
- [ ] Hero section: clearer value prop ("Plan a week of meals in 2 minutes")
- [ ] Add social proof (recipe count, language count)
- [ ] CTA buttons: "Start Free" vs "See Pricing" — A/B test copy
- [ ] Mobile hero — reduce font size, increase tap targets
- [ ] Sticky header with language switcher improvement

### Pricing Page (Frontend Builder + SaaS Architect)
- [ ] Create `/en/pricing/index.html` (and all 14 language equivalents)
- [ ] Feature comparison table (Free vs Premium)
- [ ] FAQ section (what happens to my plan if I cancel?)
- [ ] Integrate Stripe checkout button directly

---

## SPRINT 3 — SEO & Multilingual

### SEO (SEO Growth Agent — ChatGPT + Claude Code)
- [ ] Audit all 175 recipe pages for missing `<title>` and `<meta description>`
- [ ] Add Recipe structured data (schema.org/Recipe) to recipe pages
- [ ] Add BreadcrumbList schema to recipe pages
- [ ] Verify `hreflang` tags on all 2562 pages
- [ ] Submit updated sitemap to Google Search Console
- [ ] Fix: originText sentences currently end without period in some languages

### Internal Linking
- [ ] Each recipe page should link to 3-5 related recipes
- [ ] Homepage should feature "Recipe of the week" with internal link
- [ ] Meal plan pages should link to individual recipe pages

---

## SPRINT 4 — SaaS & Monetization

### Supabase (SaaS Architect — Claude Code)
- [ ] Audit `check-access.js` — document exactly what it checks
- [ ] Verify subscription status check is consistent across all premium endpoints
- [ ] Add user favorites table: `user_favorites (user_id, recipe_id, created_at)`
- [ ] Add PDF download count table: `pdf_downloads (user_id, week_key, count, created_at)`
- [ ] Ensure free tier limit is enforced server-side, not just client-side

### Stripe (SaaS Architect — Claude Code)
- [ ] Audit webhook: ensure `customer.subscription.deleted` removes access
- [ ] Audit webhook: ensure `invoice.payment_failed` suspends access
- [ ] Add `customer.subscription.updated` handler for plan changes
- [ ] Test checkout flow end-to-end in Stripe test mode
- [ ] Verify portal session correctly shows billing history

---

## SPRINT 5 — Features

### Recipe Filters (Frontend Builder)
- [ ] Filter by category (Breakfast, Lunch, Dinner, Dessert, Snack)
- [ ] Filter by diet (Vegetarian, Vegan — based on ingredient analysis)
- [ ] Filter by origin country
- [ ] Client-side search (fuzzy match on recipe name)
- [ ] "Surprise me" button (random recipe)

### User Account
- [ ] Saved meal plans in Supabase (premium)
- [ ] Favorite recipes stored per user
- [ ] Account page showing subscription status + renewal date

---

## Recurring Tasks

| Task | Frequency | Owner |
|------|-----------|-------|
| Recipe refactor batch | Per session | Claude Code |
| QA review of changed pages | After each batch | QA Critic (ChatGPT) |
| Sitemap verification | After content changes | Claude Code |
| Stripe webhook test | Monthly | SaaS Architect |
| Search Console check | Weekly | SEO Agent |

---

## Notes
- Git workflow: commit directly to `main`, no branches
- Build verification: always run `npm run content` after recipe changes, `npm run build` after JS/CSS changes
- Curly quote check: always run before committing recipes.js
