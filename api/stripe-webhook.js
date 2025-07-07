const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // Stripe sends raw buffer, not JSON!
  let rawBody = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => { rawBody += chunk; });
    req.on('end', resolve);
  });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // 1. Generate a random token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // 2. Extract user email (if you have collect email enabled in Stripe Checkout)
    const email = session.customer_details?.email || null;

    // 3. Calculate expiration time (now + 30 days)
    const expires_at = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    // 4. Insert into Supabase database
    try {
      const { error } = await supabase
        .from('tokens')
        .insert([
          { token, email, expires_at }
        ]);
      if (error) {
        console.error('Error inserting token into Supabase:', error);
      } else {
        console.log('Token successfully inserted into Supabase:', token);
      }
    } catch (err) {
      console.error('Error communicating with Supabase:', err);
    }
  }

  res.json({ received: true });
};

