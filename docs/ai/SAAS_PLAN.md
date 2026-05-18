# SaaS Plan — weekly-meal-planner

_Last updated: 2026-05-18_

## Architecture Overview

```
Browser (Static HTML/CSS/JS)
    ↓
Vercel CDN (public/ folder)
    ↓
Vercel Serverless Functions (api/*.js)
    ↓
Supabase (auth + user data)
Stripe (payments)
OpenAI (AI features)
```

## API Endpoints (current)

| Endpoint | File | Purpose |
|----------|------|---------|
| POST /api/chat | api/chat.js | AI recipe chat (OpenAI) |
| GET /api/check-access | api/check-access.js | Verify premium access |
| POST /api/check-token | api/check-token.js | Validate session token |
| POST /api/coach | api/coach.js | AI nutrition coach (OpenAI) |
| POST /api/create-checkout-session | api/create-checkout-session.js | Stripe checkout |
| POST /api/create-portal-session | api/create-portal-session.js | Stripe customer portal |
| POST /api/generate-token | api/generate-token.js | Create session token |
| POST /api/stripe-webhook | api/stripe-webhook.js | Stripe events handler |

## Subscription Tiers

### Free
- Browse all 175 recipes
- Create weekly meal plans
- Generate shopping lists
- Download 1 PDF per week
- No account required for basic features

### Premium (Stripe subscription)
- Everything in Free
- Unlimited PDF downloads
- AI chat assistant (recipe suggestions, substitutions)
- AI nutrition coach
- Saved meal plans (Supabase)
- Priority recipe content

## Supabase Schema (current + proposed)

### Existing (inferred from code)
```sql
-- Users managed by Supabase Auth
-- Subscription status likely stored in user metadata or custom table
```

### Proposed additions
```sql
-- Track PDF downloads for free tier limit
CREATE TABLE pdf_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  week_key text NOT NULL, -- e.g. "2026-W20"
  count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_key)
);

-- User favorites
CREATE TABLE user_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  recipe_id integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Saved meal plans
CREATE TABLE saved_meal_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  week_key text NOT NULL,
  plan_data jsonb NOT NULL, -- {mon: recipeId, tue: recipeId, ...}
  created_at timestamptz DEFAULT now()
);

-- Subscription tracking (mirror of Stripe)
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL, -- active, canceled, past_due, trialing
  plan text NOT NULL, -- premium
  current_period_end timestamptz,
  updated_at timestamptz DEFAULT now()
);
```

## Stripe Events to Handle

| Event | Action |
|-------|--------|
| checkout.session.completed | Create subscription record in Supabase, grant access |
| customer.subscription.updated | Update status and period_end in Supabase |
| customer.subscription.deleted | Set status = canceled, revoke premium access |
| invoice.payment_succeeded | Extend period_end |
| invoice.payment_failed | Set status = past_due, notify user |

## Security Rules

1. **All premium checks must happen server-side** — never trust client JS
2. Stripe webhook signature must be verified with `stripe.webhooks.constructEvent()`
3. Supabase RLS (Row Level Security) must be enabled on all user tables
4. OpenAI API key must never be exposed to client
5. Rate limiting on AI endpoints (prevent abuse):
   - `/api/chat` — max 20 requests/hour per user
   - `/api/coach` — max 10 requests/hour per user

## Environment Variables Required

| Variable | Used By |
|----------|---------|
| SUPABASE_URL | All API endpoints with Supabase |
| SUPABASE_ANON_KEY | Client-side Supabase init |
| SUPABASE_SERVICE_ROLE_KEY | Server-side Supabase operations |
| STRIPE_SECRET_KEY | Stripe API calls |
| STRIPE_WEBHOOK_SECRET | Webhook signature verification |
| STRIPE_PRICE_ID | Premium plan price ID |
| OPENAI_API_KEY | AI chat + coach |

_See `.env.local` for actual values — never commit this file._

## Known Issues / TODOs
- [ ] Verify free PDF limit is enforced server-side (not just client-side)
- [ ] Confirm `check-access.js` handles expired subscriptions correctly
- [ ] Add rate limiting middleware to AI endpoints
- [ ] Verify webhook handles `customer.subscription.deleted` event
- [ ] Test portal session with real Stripe test subscription
