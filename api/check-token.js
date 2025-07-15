// /api/check-token.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // Anon e ok pentru citire
);

module.exports = async (req, res) => {
  const token = req.query.token || req.body?.token;
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token missing' });
  }

  const { data, error } = await supabase
    .from('tokens')
    .select('expires_at')
    .eq('token', token)
    .single();

  if (error || !data) {
    return res.json({ valid: false });
  }
  const valid = data.expires_at * 1000 >= Date.now();
  res.json({ valid });
};
