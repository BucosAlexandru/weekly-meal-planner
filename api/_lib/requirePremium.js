// api/_lib/requirePremium.js
// Shared premium-access validator — NOT exposed as a route (Vercel ignores _lib/).
//
// Usage in any API handler:
//   import { requirePremium } from './_lib/requirePremium.js';
//   const email = await requirePremium(req, res);
//   if (!email) return; // requirePremium already sent 401 or 403
//
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Validates that the request body contains an `email` with an active premium
 * subscription in the Supabase `tokens` table.
 *
 * On failure: sends 401 or 403 JSON response and returns null.
 * On success: returns the validated email string.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {Promise<string|null>}
 */
export async function requirePremium(req, res) {
  const email = req.body?.email?.trim() || null;
  if (!email) {
    res.status(401).json({ error: 'Missing email. Premium access required.' });
    return null;
  }

  // Query all token rows for this email — do NOT use .single() (fails if 2+ rows)
  const { data: rows, error } = await supabase
    .from('tokens')
    .select('expires_at')
    .eq('email', email)
    .order('expires_at', { ascending: false });

  if (error || !rows || rows.length === 0) {
    res.status(401).json({ error: 'No subscription found for this email.' });
    return null;
  }

  const now = Date.now();
  const hasActive = rows.some(row => {
    if (!row.expires_at) return true; // lifetime — no expiry set
    let exp = Number(row.expires_at);
    if (exp < 1e12) exp = exp * 1000; // convert seconds → milliseconds
    return exp > now;
  });

  if (!hasActive) {
    res.status(403).json({ error: 'Subscription expired. Please renew your plan.' });
    return null;
  }

  return email;
}

/**
 * Non-throwing premium check. Returns a boolean and NEVER writes a response —
 * for handlers that must degrade gracefully (e.g. serve a free preview)
 * instead of rejecting the request when the email isn't premium.
 *
 * Fails CLOSED: a missing email, missing/expired row, or any backend error
 * resolves to `false` (treated as non-premium), so a Supabase outage or
 * misconfiguration can never accidentally unlock premium content.
 *
 * @param {string|null|undefined} email
 * @returns {Promise<boolean>}
 */
export async function isPremiumEmail(email) {
  const e = typeof email === 'string' ? email.trim() : '';
  if (!e) return false;
  try {
    const { data: rows, error } = await supabase
      .from('tokens')
      .select('expires_at')
      .eq('email', e)
      .order('expires_at', { ascending: false });

    if (error || !rows || rows.length === 0) return false;

    const now = Date.now();
    return rows.some(row => {
      if (!row.expires_at) return true; // lifetime — no expiry set
      let exp = Number(row.expires_at);
      if (exp < 1e12) exp = exp * 1000; // seconds → milliseconds
      return exp > now;
    });
  } catch (_) {
    return false; // fail closed
  }
}
