// /api/delete-my-data.js
// GDPR Article 17 (right to erasure) — self-service deletion.
//
// Auth model: matches the rest of the site. There is no password/session
// system anywhere (check-access.js, create-portal-session.js and
// requirePremium.js all already act on "whoever can type this email" as the
// identity proof), so gating deletion the same way is consistent with the
// existing trust level, not a new weakness.
//
// Safety: refuses to delete while a subscription is still active/paying —
// deleting the tokens row would leave Stripe still charging the card with
// no record here to verify or manage it. Directs the caller to cancel via
// the billing portal first.
//
// Scope: deletes the plaintext `tokens` row(s) for this email, AND the
// pseudonymous `events` rows linked to it via the same salted HMAC-SHA256
// hash stripe-webhook.js writes (email is never stored in `events` itself —
// see hashEmail() there). Nothing else in the schema references email.
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { checkRateLimit } from './_lib/rateLimiter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RATE_LIMIT_MAX    = 5;             // requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 60 minutes in ms
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Must match hashEmail() in api/stripe-webhook.js exactly (same salt, same
// normalization) so the computed hash lines up with what was stored there.
function hashEmail(email) {
  const salt = process.env.ANALYTICS_HASH_SALT || '';
  return crypto.createHmac('sha256', salt).update(String(email).trim().toLowerCase()).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const email = (req.body?.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  const { allowed, retryAfterSec } = checkRateLimit(`del:${email}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({ error: `Too many requests. Try again in ${retryAfterSec}s.` });
  }

  try {
    const { data: rows, error } = await supabase
      .from('tokens')
      .select('expires_at, subscription_status')
      .eq('email', email);

    if (error) {
      console.error('[delete-my-data] lookup error:', error.message);
      return res.status(500).json({ error: 'Database error.' });
    }

    // Nothing to delete — report success either way so this endpoint can't
    // be used to probe which emails exist in the system.
    if (!rows || rows.length === 0) {
      return res.status(200).json({ deleted: true, hadData: false });
    }

    const now = Date.now();
    const hasActive = rows.some(row => {
      if (row.subscription_status === 'canceled') return false;
      if (!row.expires_at) return true; // lifetime — no expiry set
      let exp = Number(row.expires_at);
      if (exp < 1e12) exp = exp * 1000; // seconds → milliseconds
      return exp > now;
    });

    if (hasActive) {
      return res.status(409).json({
        error: 'You have an active subscription. Cancel it first from "Manage subscription", then request deletion again.',
        requiresCancellation: true,
      });
    }

    const { error: delTokensError } = await supabase.from('tokens').delete().eq('email', email);
    if (delTokensError) {
      console.error('[delete-my-data] tokens delete error:', delTokensError.message);
      return res.status(500).json({ error: 'Database error.' });
    }

    // Best-effort: also remove the pseudonymous analytics trail. Never lets
    // an analytics hiccup block the (already-committed) tokens deletion.
    try {
      await supabase.from('events').delete().eq('email_hash', hashEmail(email));
    } catch (e) {
      console.warn('[delete-my-data] events cleanup failed:', e?.message);
    }

    return res.status(200).json({ deleted: true, hadData: true });
  } catch (e) {
    console.error('[delete-my-data] handler error:', e);
    return res.status(500).json({ error: 'Internal error.' });
  }
}
