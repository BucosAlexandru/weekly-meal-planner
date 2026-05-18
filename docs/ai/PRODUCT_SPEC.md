# Product Spec — weekly-meal-planner

_Last updated: 2026-05-18_

## What the product is

A multilingual web app that helps users plan their meals for the week and generate a shopping list automatically. No installation required — runs in the browser as a static site with serverless API endpoints for premium features.

## Current live URL
- Primary: via Vercel deployment (BucosAlexandru/weekly-meal-planner)
- 14 language subfolders: /en/, /ro/, /es/, /fr/, /de/, /pt/, /ru/, /ar/, /zh/, /ja/, /hi/, /tr/, /it/, /ko/

## Core Features (live)

| Feature | Status | Notes |
|---------|--------|-------|
| 175 recipes in 14 languages | Live | Batch refactor in progress (45/175 done) |
| Weekly meal plan generator | Live | Interactive JS, no backend |
| Shopping list auto-generation | Live | Client-side from meal plan |
| PDF download (free) | Live | 1 PDF per week limit for free users |
| PDF download (premium) | Live | Unlimited via Stripe subscription |
| Stripe checkout | Live | `api/create-checkout-session.js` |
| Stripe customer portal | Live | `api/create-portal-session.js` |
| Stripe webhook | Live | `api/stripe-webhook.js` |
| Supabase auth | Live | Token-based access check |
| AI chat assistant | Live | `api/chat.js` (OpenAI) |
| AI nutrition coach | Live | `api/coach.js` (OpenAI) |
| Token system | Live | `api/generate-token.js`, `api/check-token.js` |
| Access control | Live | `api/check-access.js` |
| Sitemap (2605 URLs) | Live | Auto-generated |
| Recipe schema markup | Partial | Needs audit |

## Subscription Tiers (current understanding)

| Tier | Features |
|------|----------|
| Free | Plan meals, 1 PDF/week, browse all recipes |
| Premium | Unlimited PDFs, AI chat, AI coach, advanced filters |

_Note: Exact tier limits need verification in `api/check-access.js` and Supabase._

## Target Users
- Home cooks who want to reduce decision fatigue
- Health-conscious users planning balanced meals
- Budget-conscious families
- International audience (14 languages = global reach)

## User Flows

### Free user
1. Lands on homepage → sees meal planner
2. Picks recipes for each day of the week
3. Generates shopping list
4. Downloads 1 PDF
5. Prompted to upgrade if tries to download more

### Premium user
1. Subscribes via Stripe checkout
2. Gets unlimited PDF downloads
3. Access to AI chat for recipe suggestions
4. Access to AI nutrition coach

## Priority Feature Backlog

### P0 — Critical (blocks monetization or trust)
- [ ] Finish recipe refactor (130 remaining out of 175)
- [ ] Verify Stripe webhook handles all events correctly
- [ ] Supabase session persistence (auth state lost on refresh?)
- [ ] Mobile UX audit — meal planner on small screens

### P1 — High value
- [ ] Recipe filter by diet (vegetarian, vegan, gluten-free)
- [ ] Recipe filter by cooking time
- [ ] Favorite recipes saved in Supabase per user
- [ ] Homepage hero redesign — clearer value proposition
- [ ] Pricing page with clear feature comparison

### P2 — Growth
- [ ] Recipe search (client-side, no backend)
- [ ] Print-friendly meal plan view
- [ ] Email capture for free PDF (lead generation)
- [ ] Social sharing for weekly meal plan
- [ ] Recipe ratings (Supabase)

### P3 — Nice to have
- [ ] Dark mode
- [ ] Calorie/macro display per recipe
- [ ] Seasonal recipe highlights
- [ ] Blog/content section for SEO

## Acceptance Criteria for Recipe Refactor
A recipe is considered "done" when it has:
- [ ] At least 7 ingredients with exact quantities (e.g. "400g", "3 tbsp", "2 large eggs")
- [ ] `howIsMade` with timing cues, temperature, texture descriptors
- [ ] `hi` (Hindi) field in all multilingual objects
- [ ] Correct `tipType` (def/soup/fish/meat/pasta/dessert)
- [ ] Correct `pairingsType` (def/korean/japanese/meat/fish/soup/pasta/veg)
- [ ] `servings: 4` override if ingredient count >= 9
