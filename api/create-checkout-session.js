// api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { email, priceId, customerId, successUrl, cancelUrl } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

    const origin = req.headers.origin || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // dacă ai deja customerId, îl treci; altfel pasezi email:
      customer: customerId || undefined,
      customer_email: customerId ? undefined : (email || undefined),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: (successUrl || `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: cancelUrl || `${origin}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
