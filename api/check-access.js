// api/check-access.js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return res.status(404).json({ active: false });

  const now = Date.now();
  let exp = data.expires_at;
  if (typeof exp === 'string') exp = Number(exp);
  if (exp && exp < 1e12) exp = exp * 1000; // sec -> ms

  return res.status(200).json({ active: !!exp && exp > now, until: exp || null });
}
