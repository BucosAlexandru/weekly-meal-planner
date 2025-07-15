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
  if (data.expires_at && data.expires_at > now) {
    return res.status(200).json({ active: true, until: data.expires_at });
  }
  return res.status(200).json({ active: false });
}
