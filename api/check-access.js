// api/check-access.js
// Returns { active: boolean, found: boolean, until: number|null }
//
// 'found'  — false means no account at all (show "buy" CTA)
// 'active' — true means premium is valid right now
// 'until'  — highest expiry timestamp in milliseconds (null = lifetime)
//
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  let { email } = req.query;
  const { session_id: sessionId } = req.query;

  // P1 (session_id propagation): right after Stripe redirects back, the buyer
  // has a session_id in the URL but has never typed their email ON THE SITE
  // (Stripe collected it). Resolve email from the Checkout Session so the
  // success page can auto-unlock instead of asking them to re-enter it.
  // Server-side only, read-only, and the entitlement check below still runs
  // against OUR tokens table — a forged session_id grants nothing.
  if (!email && sessionId && /^cs_(live|test)_[A-Za-z0-9]+$/.test(String(sessionId))) {
    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(String(sessionId));
      email = session?.customer_details?.email || session?.customer_email || null;
    } catch (e) {
      console.warn('[check-access] session_id lookup failed:', e.message);
    }
  }

  if (!email) return res.status(400).json({ error: 'Missing email' });

  // IMPORTANT: Do NOT use .single() here.
  // A user can have multiple rows (e.g. renewed subscription) and .single()
  // returns a PGRST116 error in that case, incorrectly blocking valid users.
  const { data: rows, error } = await supabase
    .from('tokens')
    .select('expires_at')
    .eq('email', email)
    .order('expires_at', { ascending: false });

  if (error) {
    console.error('[check-access] Supabase error:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  // When the email was resolved from a Checkout Session, echo it back so the
  // client can store it for future restores (it never typed it on-site).
  const echoEmail = sessionId ? (email || undefined) : undefined;

  if (!rows || rows.length === 0) {
    return res.status(200).json({ active: false, found: false, until: null, email: echoEmail });
  }

  const now = Date.now();
  let maxExpiry = null;

  for (const row of rows) {
    // null/undefined expires_at = lifetime subscription
    if (!row.expires_at) {
      return res.status(200).json({ active: true, found: true, until: null, email: echoEmail });
    }
    let exp = Number(row.expires_at);
    if (exp < 1e12) exp = exp * 1000; // convert seconds → milliseconds
    if (maxExpiry === null || exp > maxExpiry) maxExpiry = exp;
  }

  return res.status(200).json({
    active: maxExpiry > now,
    found: true,
    until: maxExpiry,
    email: echoEmail
  });
}
