// api/generate-token.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // cheia SECRETĂ
);

module.exports = async (req, res) => {
  const email = req.body?.email || null;
  // TODO: Validează plata Stripe aici înainte să continui!

  const token = Math.random().toString(36).substring(2, 16);
  const expires_at = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 zile în secunde

  const { data, error } = await supabase
    .from('tokens')
    .insert([{ token, email, expires_at }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to generate token', details: error });
  }

  res.status(200).json({ token });
};
