// api/_lib/rateLimiter.js
// In-memory sliding-window rate limiter.
//
// ⚠️  SOFT PROTECTION ONLY — per-Vercel-instance, not global.
//
// Limitations (by design — acceptable for current scale):
//   - State lives in process memory; resets on cold start (~15-30 min inactivity on Vercel)
//   - Multiple warm instances do NOT share state — a heavy user hitting different
//     instances could exceed the stated limit
//   - Not a substitute for a global rate limit (Vercel KV, Upstash Redis, Supabase)
//
// What it DOES catch:
//   - Sustained bot loops hitting the same warm instance repeatedly
//   - Frontend bugs that accidentally call the AI endpoint in a loop
//   - Casual manual abuse from a single browser tab
//
// For true global rate limiting, add a Supabase `api_requests` table or
// integrate Upstash Redis (see docs/ai/SECURITY_FIX_PHASE_1.md — Phase 2).

/** @type {Map<string, number[]>} email -> array of request timestamps (ms) */
const store = new Map();

/**
 * Check whether a key (email) is within its rate limit using a sliding window.
 *
 * @param {string} key        - Unique request identifier, typically email
 * @param {number} limit      - Maximum requests allowed inside the window
 * @param {number} windowMs   - Window size in milliseconds
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Retrieve existing timestamps, discard any outside the current window
  const timestamps = (store.get(key) || []).filter(t => t > windowStart);

  if (timestamps.length >= limit) {
    // The oldest timestamp in the window tells us when a slot opens up
    const retryAfterMs = timestamps[0] + windowMs - now;
    return { allowed: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
  }

  // Record this request and persist
  timestamps.push(now);
  store.set(key, timestamps);

  // Probabilistic cleanup (~1% of calls) to prevent unbounded memory growth
  if (Math.random() < 0.01) {
    for (const [k, ts] of store.entries()) {
      const active = ts.filter(t => t > now - windowMs);
      if (active.length === 0) store.delete(k);
      else store.set(k, active);
    }
  }

  return { allowed: true, retryAfterSec: 0 };
}
