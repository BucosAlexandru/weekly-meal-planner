// api/event.js
// Funnel Analytics MVP — ingestion endpoint for the 4 CLIENT-side funnel events.
//
//   page_view · plan_generated · pdf_click · checkout_started
//
// `subscription_active` is intentionally NOT accepted here — it is written
// server-side by api/stripe-webhook.js, the only place the (hashed) email is
// available. The client never sends an email, so this endpoint stores no PII.
//
// Transport: navigator.sendBeacon (Blob, application/json) from analytics.js,
// with a fetch keepalive fallback. Vercel's default body parser turns that
// into req.body; we also tolerate a raw JSON string defensively.
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_lib/rateLimiter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CLIENT_EVENTS = new Set([
  'page_view',
  'plan_generated',
  'pdf_click',
  'checkout_started',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing body' });
  }

  const { event, anon_id, lang, path, props } = body;
  if (!CLIENT_EVENTS.has(event)) {
    // subscription_active or anything unknown is rejected on purpose.
    return res.status(400).json({ error: 'Unknown or disallowed event' });
  }

  // Soft, per-instance rate limit keyed by anon id (falls back to IP). Blunts
  // accidental client loops and casual abuse; not a global guarantee.
  const key = String(anon_id || req.headers['x-forwarded-for'] || 'anon').slice(0, 100);
  const { allowed } = checkRateLimit('event:' + key, 120, 60_000);
  if (!allowed) return res.status(429).json({ error: 'Too many requests' });

  const safeProps = (props && typeof props === 'object' && !Array.isArray(props)) ? props : {};
  // Optional coarse geo from the Vercel edge header — country only, never raw IP.
  const country = req.headers['x-vercel-ip-country'];

  const row = {
    event,
    anon_id: anon_id ? String(anon_id).slice(0, 64) : null,
    lang:    lang ? String(lang).slice(0, 8) : null,
    path:    path ? String(path).slice(0, 300) : null,
    props:   country ? { ...safeProps, country: String(country).slice(0, 4) } : safeProps,
    // `ts` from the client is ignored; the DB default now() is the source of truth.
  };

  const { error } = await supabase.from('events').insert(row);
  if (error) {
    console.error('[event] insert failed:', error.message);
    return res.status(500).json({ error: 'Store failed' });
  }
  return res.status(202).json({ ok: true });
}
