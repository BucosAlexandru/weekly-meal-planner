// api/generate-token.js
// INTERNAL endpoint — called only by the Stripe webhook or admin tooling.
// NEVER call this from the browser. NEVER remove the ADMIN_SECRET guard.
//
// Requires header: X-Admin-Secret: <value of ADMIN_SECRET env var>
// Set ADMIN_SECRET in Vercel Dashboard → Environment Variables (all environments).
//
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // SECURITY: Require a shared secret header to prevent unauthorized token creation.
  // Without this, anyone could grant themselves a premium token by POSTing any email.
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || req.headers['x-admin-secret'] !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });

  // Use crypto.randomUUID() — cryptographically secure.
  // Math.random() must NEVER be used for security tokens.
  const token = randomUUID();
  const expires_at = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days in seconds

  const { data, error } = await supabase
    .from('tokens')
    .insert([{ token, email, expires_at }])
    .select()
    .single();

  if (error) {
    // Do not leak database error details to callers
    console.error('[generate-token] Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to generate token' });
  }

  return res.status(200).json({ token: data.token });
}
