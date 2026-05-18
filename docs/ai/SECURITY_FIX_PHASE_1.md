# Security Fix — Phase 1

_Implemented: 2026-05-18_
_Owner: Claude Code (Lead Developer)_

---

## Scope

Four targeted fixes with zero UI redesign, zero recipe changes, zero Supabase schema changes.

---

## Files Changed

| File | Change | Risk |
|------|--------|------|
| `api/generate-token.js` | Add `X-Admin-Secret` header guard; convert to ESM; use `crypto.randomUUID()` | Low — endpoint was already broken/unused by frontend |
| `api/check-access.js` | Replace `.single()` with array query; add `found` field to response | Low — behavioural improvement, no schema change |
| `api/_lib/requirePremium.js` | New shared helper — validates active premium subscription | Zero risk — new file |
| `api/chat.js` | Add `requirePremium` guard; add `max_tokens: 500` | Medium — breaks unauthenticated callers (bots) |
| `api/coach.js` | Add `requirePremium` guard at handler entry | Medium — breaks unauthenticated callers (bots) |
| `public/js/app.js` | Replace direct Supabase client query with `fetch('/api/check-access')` | Low — same data, different transport |

---

## Fix 1 — `api/generate-token.js` (Critical)

**Problem:** Any HTTP client could call `POST /api/generate-token` with any email and receive a premium token. No payment verification. Uses `Math.random()` (not crypto-secure). Uses CommonJS while all other API files use ESM.

**Fix:**
- Require `X-Admin-Secret` header matching `ADMIN_SECRET` env var
- Convert to ESM (`import`/`export default`)
- Replace `Math.random()` with `crypto.randomUUID()`
- Remove details from error responses

**Note:** Add `ADMIN_SECRET` in Vercel Dashboard → Environment Variables. Generate a random 32-char string. Update Stripe webhook handler (`stripe-webhook.js`) to pass this header when calling `generate-token`.

---

## Fix 2 — `api/check-access.js` (Bug fix)

**Problem:** `.single()` throws PGRST116 if a user has 2+ token rows (e.g. renewed subscription). Valid premium users denied access.

**Fix:**
- Remove `.single()` — query returns array
- Return `found: false` when no rows (vs. `found: true, active: false` for expired)
- Return the highest `until` value across all rows

---

## Fix 3 — `api/_lib/requirePremium.js` (New)

**What it does:** Shared helper for chat.js and coach.js. Reads `email` from `req.body`, checks Supabase `tokens` table for an active row. Returns email on success or sends 401/403 and returns `null`.

**Vercel routing:** The `_` prefix in `_lib/` means Vercel does NOT expose this as a route.

---

## Fix 4 — `api/chat.js` and `api/coach.js` (High)

**Problem:** Any unauthenticated user (bot, scraper, competitor) can call these endpoints at the owner's OpenAI expense. Zero auth, zero rate limiting.

**Fix:** Import `requirePremium` and call it at the top of each handler. Also adds `max_tokens: 500` to `chat.js` as a cost cap.

**Impact on legitimate users:** Frontend must include `email` in POST body (already collected via verifyBtn flow — stored in app scope).

---

## Fix 5 — `public/js/app.js` (Medium)

**Problem:** Browser directly queries Supabase `tokens` table with hardcoded anon key. Any user can open DevTools, call the same query, inspect all tokens, and set `window.hasUnlimited = true` manually.

**Fix:** Replace the Supabase client block + direct query with `fetch('/api/check-access?email=...')`. The server does the Supabase lookup. The anon key stays in the codebase (it IS safe for client use per Supabase design) but the auth logic is no longer bypassable via DevTools.

**What remains client-side (intentional):** `window.hasUnlimited` flag — this is inherent to any client-side PDF generation. A determined user could still override it in DevTools. Full protection requires server-side PDF generation (Phase 2).

---

## What Phase 1 Does NOT Fix (Phase 2)

- PDF generation is still client-side — `window.hasUnlimited` can be overridden in DevTools
- No rate limiting on `/api/check-access` (could be probed)
- No per-request token validation for chat/coach (email can be shared)
- `stripe-webhook.js` needs to be updated to pass `X-Admin-Secret` when calling `generate-token`

---

## Build Verification

After implementing:
```bash
npm run build:js   # minify app.js → app.min.js
# Check output for syntax errors
# Verify verifyBtn still works in browser
```

---

## Env Vars to Add in Vercel

| Variable | Value | Where |
|----------|-------|-------|
| `ADMIN_SECRET` | random 32-char string | All environments |
