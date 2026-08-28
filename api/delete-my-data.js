// /api/delete-my-data.js
// GDPR Article 17 (right to erasure) — self-service deletion.
//
// NOT a full legal implementation of Article 17 on its own — Article 17(3)
// carves out exceptions (e.g. compliance with a legal obligation, such as
// accounting/tax retention of payment records) that this code cannot decide
// on its own. What this endpoint deletes is the ACCESS/ENTITLEMENT cache in
// our own Supabase `tokens` table; Stripe remains the authoritative,
// independently-retained record of any actual payment/invoice, and is
// unaffected by this endpoint. Whether that split is sufficient, and what
// the privacy policy should promise, is a legal call for the site owner —
// this code should not be read as having settled that question.
//
// Auth model: matches the rest of the site. There is no password/session
// system anywhere (check-access.js, create-portal-session.js and
// requirePremium.js all already act on "whoever can type this email" as the
// identity proof), so gating deletion the same way is the existing trust
// level, not a new weakness — EXCEPT that this is the first DESTRUCTIVE,
// irreversible action gated that way, which is a materially different risk
// than a read-only check. Known residual risk: anyone who knows a target's
// email and that target has NO active subscription can delete their
// historical (inactive) row. Active/lifetime subscriptions are protected
// (see below) — the high-value target can't be touched this way — but this
// is still not "impeccable" and should be treated as a known trade-off, not
// a solved problem. Hardening this further (an emailed confirmation link
// before deletion actually runs) is the standard fix, but there is
// currently NO working transactional-email sender anywhere in this codebase
// — nodemailer is in package.json but unused/unconfigured, no SMTP or
// provider credentials exist — so that hardening is a real infrastructure
// decision (pick a provider, add credentials) still to be made, not
// something to silently assume works.
//
// Every attempt is logged (see logAttempt() below) so an abuse pattern or a
// user's dispute ("I never asked for this") can actually be investigated
// after the fact — the endpoint's only defense in depth today besides the
// active-subscription block and the per-email rate limit.
//
// Safety: refuses to delete while a subscription is still active/paying —
// deleting the tokens row would leave Stripe still charging the card with
// no record here to verify or manage it. Directs the caller to cancel via
// the billing portal first.
//
// Scope: deletes the plaintext `tokens` row(s) for this email, AND the
// pseudonymous `events` rows linked to it via the same salted HMAC-SHA256
// hash stripe-webhook.js writes (email is never stored in `events` itself —
// see hashEmail() there), except the audit row this endpoint itself writes,
// which is deliberately kept (see logAttempt()). Nothing else in the schema
// references email.
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

// Audit trail for a destructive, email-only-gated endpoint — this table is
// what makes it possible to actually investigate an abuse report or dispute
// later, instead of the deletion being invisible after the fact. Keyed by
// the same hash as the row it acted on (never the plaintext email), same
// pattern stripe-webhook.js already uses for subscription_active. Best
// effort: a logging hiccup must never block the deletion itself.
async function logAttempt(email, outcome) {
  try {
    await supabase.from('events').insert({
      event: 'data_deletion_requested',
      props: { email_hash: hashEmail(email), outcome },
    });
  } catch (e) {
    console.warn('[delete-my-data] audit log failed:', e?.message);
  }
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
    await logAttempt(email, 'rate_limited');
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
      await logAttempt(email, 'no_data');
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
      await logAttempt(email, 'blocked_active_subscription');
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
    // an analytics hiccup block the (already-committed) tokens deletion. Runs
    // AFTER logAttempt('deleted') so the audit row itself isn't the thing
    // that gets swept by this same query (both are keyed by email_hash).
    await logAttempt(email, 'deleted');
    try {
      await supabase.from('events').delete().eq('email_hash', hashEmail(email)).neq('event', 'data_deletion_requested');
    } catch (e) {
      console.warn('[delete-my-data] events cleanup failed:', e?.message);
    }

    return res.status(200).json({ deleted: true, hadData: true });
  } catch (e) {
    console.error('[delete-my-data] handler error:', e);
    return res.status(500).json({ error: 'Internal error.' });
  }
}
