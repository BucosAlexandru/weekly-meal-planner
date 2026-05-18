# Security Fix — Phase 1

_Implemented: 2026-05-18_
_Owner: Claude Code (Lead Developer)_

---

## Scope

Seven targeted fixes. Zero UI redesign, zero recipe changes, zero Supabase schema changes.

---

## Files Changed

| File | Change | Risk |
|------|--------|------|
| `api/generate-token.js` | Add `X-Admin-Secret` header guard; convert to ESM; use `crypto.randomUUID()` | Low |
| `api/check-access.js` | Replace `.single()` with array query; add `found`/`until` fields | Low |
| `api/_lib/requirePremium.js` | New shared helper — validates active premium subscription | Zero |
| `api/_lib/rateLimiter.js` | New shared helper — in-memory sliding-window rate limiter | Zero |
| `api/chat.js` | Add `requirePremium`; rate limit 20/hr; input validation; `max_tokens: 500` | Medium |
| `api/coach.js` | Add `requirePremium`; rate limit 10/hr; input validation on mode + messages | Medium |
| `public/js/app.js` | Replace direct Supabase query with `fetch('/api/check-access')` | Low |

---

## Fix 1 — `api/generate-token.js` (Critical)

**Problem:** Any HTTP client could call `POST /api/generate-token` with any email and receive a
30-day premium token. No payment verification. Uses `Math.random()` (not crypto-secure). CommonJS
while all other API files use ESM.

**Fix:**
- Require `X-Admin-Secret` header matching `ADMIN_SECRET` env var — returns 401 otherwise
- Convert to ESM (`import`/`export default`)
- Replace `Math.random()` with `crypto.randomUUID()`
- Error responses no longer leak database details

**Action required:** Add `ADMIN_SECRET` in Vercel Dashboard → Environment Variables (all
environments). Generate a random 32-char string. Update `api/stripe-webhook.js` to pass this
header when it calls `generate-token` internally.

---

## Fix 2 — `api/check-access.js` (Bug fix)

**Problem:** `.single()` throws PGRST116 if a user has 2+ token rows (e.g. renewed subscription).
Valid premium users denied access.

**Fix:**
- Remove `.single()` — query returns array; iterate to find highest expiry
- New response fields: `found` (account exists) and `until` (max expiry in ms)
- `found: false` = no account, `found: true, active: false` = expired

---

## Fix 3 — `api/_lib/requirePremium.js` (New file)

Shared auth helper for chat and coach. Reads `email` from `req.body`, queries Supabase `tokens`
table for an active subscription, returns email on success or sends 401/403 and returns `null`.

Vercel `_lib/` prefix: not exposed as a public route.

---

## Fix 4 — `api/_lib/rateLimiter.js` (New file)

**⚠️ Soft protection — per-Vercel-instance only, not global.**

In-memory sliding-window rate limiter using a `Map<email, timestamp[]>`. Does NOT coordinate
across Vercel instances and resets on cold starts (~15–30 min inactivity).

**What it catches:** sustained bot loops hitting the same warm instance, frontend bugs that
accidentally loop, casual manual abuse from a single session.

**What it does NOT catch:** distributed abuse across multiple instances, slow drip attacks
across cold-start boundaries.

**Applied limits:**
- `/api/chat` — 20 requests / 60 minutes per email → HTTP 429 + `Retry-After` header
- `/api/coach` — 10 requests / 60 minutes per email → HTTP 429 + `Retry-After` header

**For true global rate limiting (Phase 2):** integrate Upstash Redis or add a Supabase
`api_requests(email, endpoint, window_key, count)` table.

---

## Fix 5 — `api/chat.js` and `api/coach.js` (High priority)

**Problem:** Zero auth, zero validation, zero rate limiting. Any bot could consume OpenAI quota.

**Fix — auth:** `requirePremium` checks active subscription before any OpenAI call.

**Fix — rate limiting:** `checkRateLimit(email, limit, windowMs)` applied at handler entry.
Returns HTTP 429 + `Retry-After: N` header.

**Fix — input validation (chat.js):**
- `messages` must be an array (400 if not)
- Max 20 messages per request (400 if exceeded)
- Each message must have string `role` and `content` (400 if malformed)
- Each `content` max 2000 characters (400 if exceeded)

**Fix — input validation (coach.js):**
- `mode` must be one of `general`, `recipes`, `fitness` (400 if invalid)
- Same `messages` array validation as chat

**Cost cap:** `max_tokens: 500` on the OpenAI call in `chat.js` (was commented out before).

---

## Fix 6 — `public/js/app.js` (Medium)

**Problem:** Browser directly queries Supabase `tokens` table. Any user can mock the response in
DevTools and set `window.hasUnlimited = true`.

**Fix:** Replace the Supabase client init block and direct `from('tokens').select()` with a call
to `fetch('/api/check-access?email=...)`. The server performs the lookup; the browser only sees
`{ active, found, until }`.

**Remaining exposure (inherent):** `window.hasUnlimited` is still set client-side because PDF
generation is client-side. A DevTools user can still set it manually. This is the Phase 2 problem.

---

## ⛔ What Phase 1 Deliberately Does NOT Fix

### PDF free-tier enforcement — deferred to Phase 2

**Decision (2026-05-18):** Option B chosen. No Supabase schema change at this time.

**Why enforcement is impossible without schema or account system:**

Free users are fully anonymous — no email, no session, no account. The weekly "1 PDF" limit is
currently enforced only by `localStorage.pdfCount`. This is 100% bypassable (`localStorage.clear()`
in DevTools).

To enforce server-side, one of the following must exist:
1. **Free user identity** — email or session cookie linked to a server-side record
2. **Server-side PDF generation** — the server controls what gets generated
3. **New Supabase table** — `pdf_downloads(email, week_key, count)` with per-email tracking

None of these exist in the current architecture.

**Current state:** `localStorage` is the real gate (bypassable). `window.hasUnlimited` controls
whether 2-day or 7-day PDFs are generated. Both remain as-is.

**Comment added in `app.js`:** explains this is UI-only enforcement.

**Phase 2 options (choose one):**
- Option A: Require email for free download → track in `pdf_downloads` table → enforce server-side
- Option B: Move PDF generation server-side (Puppeteer/headless on Vercel) → server controls output
- Option C: Remove the free PDF limit (simplify product, reduce complexity)

### Other known open issues

- No rate limiting on `GET /api/check-access` (probe-able, but read-only)
- Per-email sharing: a premium email shared between users bypasses per-user limits
- `api/stripe-webhook.js` must be updated to pass `X-Admin-Secret` when calling `generate-token`
- Rate limiter is not global — see Fix 4 above

---

## Build Verification

```bash
npm run build:js   # must exit 0
npm run build      # must exit 0, produce 2562 pages
```

---

## Env Vars Required in Vercel

| Variable | Value | Environments |
|----------|-------|-------------|
| `ADMIN_SECRET` | random 32-char string | All |
