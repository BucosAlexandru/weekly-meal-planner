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
  const { email } = req.query;
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

  if (!rows || rows.length === 0) {
    return res.status(200).json({ active: false, found: false, until: null });
  }

  const now = Date.now();
  let maxExpiry = null;

  for (const row of rows) {
    // null/undefined expires_at = lifetime subscription
    if (!row.expires_at) {
      return res.status(200).json({ active: true, found: true, until: null });
    }
    let exp = Number(row.expires_at);
    if (exp < 1e12) exp = exp * 1000; // convert seconds → milliseconds
    if (maxExpiry === null || exp > maxExpiry) maxExpiry = exp;
  }

  return res.status(200).json({
    active: maxExpiry > now,
    found: true,
    until: maxExpiry
  });
}
