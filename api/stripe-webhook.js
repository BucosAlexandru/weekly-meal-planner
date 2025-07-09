// api/stripeWebhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Foloseşte Service Role Key ca să poţi upserta fără restricţii RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  // Stripe trimite payload-ul raw, nu JSON
  let buf = '';
  await new Promise((r) => {
    req.on('data', (c) => (buf += c.toString()));
    req.on('end', r);
  });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Când Checkout Session e completată, inserăm token-ul
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details.email;
    // token random
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    // expiră peste 30 zile (în secunde UNIX)
    const expires_at = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    const { error } = await supabase
      .from('tokens')
      .insert([{ token, email, expires_at }]);

    if (error) {
      console.error('Error upserting token in Supabase:', error);
    } else {
      console.log('✅ Token saved for', email, '->', token);
    }
  }

  res.json({ received: true });
};
