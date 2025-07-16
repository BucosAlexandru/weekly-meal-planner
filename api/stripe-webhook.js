import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Acceptă doar POST!
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook Error:', err.message); // debug
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Loghează întreaga sesiune Stripe pentru debug!
  console.log('SESSION OBJECT:', JSON.stringify(event.data.object, null, 2));

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Încearcă să extragi email-ul din mai multe posibile chei
    const email =
      session.customer_email ||
      (session.customer_details && session.customer_details.email) ||
      null;

    console.log('EMAIL EXTRACTED:', email);

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 zile

    if (email) {
      const { error } = await supabase
        .from('tokens')
        .upsert([{ email, token: generateToken(), expires_at: expiresAt }]);
      if (error) {
        console.log('SUPABASE ERROR:', error);
      } else {
        console.log('Token upserted in Supabase');
      }
    } else {
      console.log('NO EMAIL FOUND in Stripe session!');
    }
  }

  res.status(200).json({ received: true });
}

function generateToken() {
  return Math.random().toString(36).substr(2, 12);
}
