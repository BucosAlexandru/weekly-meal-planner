-- supabase/migrations/0001_events_table.sql
-- Funnel Analytics MVP — first-party, no third-party tools, no cookies, no PII.
--
-- ⚠️  RUN MANUALLY in the Supabase SQL editor. This file is NOT executed by
--     the app, the build, or any cron. It is committed for review/repro only.
--
-- Stores the 5 funnel events:
--   page_view, plan_generated, pdf_click, checkout_started  (from api/event.js)
--   subscription_active                                      (from api/stripe-webhook.js)
--
-- The client never sends an email. The only way to correlate a session with a
-- paying user is `email_hash` = HMAC-SHA256(lowercased email, ANALYTICS_HASH_SALT),
-- computed server-side and set ONLY on the subscription_active row.

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  event       text        not null,
  ts          timestamptz not null default now(),
  anon_id     text,                                   -- anonymous localStorage id (NOT email)
  email_hash  text,                                   -- HMAC-SHA256(email); only set by the Stripe webhook
  lang        text,
  path        text,
  props       jsonb       not null default '{}'::jsonb
);

create index if not exists events_event_ts_idx   on public.events (event, ts desc);
create index if not exists events_email_hash_idx on public.events (email_hash);
create index if not exists events_anon_idx        on public.events (anon_id);

-- Writes happen exclusively through the service-role key used by api/event.js
-- and api/stripe-webhook.js. Enable RLS and define NO anon/authenticated
-- policies, so the public anon key in client JS can neither read nor write here.
alter table public.events enable row level security;
