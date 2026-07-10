// api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { email, priceId, customerId, successUrl, cancelUrl, anonId, locale } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

    const origin = req.headers.origin || 'http://localhost:3000';

    // Stripe Checkout locale — whitelist against the locales Stripe actually
    // supports from our 14 (hi is not supported → 'auto'). Without this the
    // checkout rendered in a language unrelated to the page the buyer came
    // from (observed: RO chrome for an EN visitor — trust killer at the most
    // sensitive step). See docs/ai/REAL_PAYMENT_VALIDATION.md F4.
    const STRIPE_LOCALES = new Set(['ro','en','es','fr','de','pt','ru','ar','zh','ja','tr','it','ko','auto']);
    const safeLocale = (typeof locale === 'string' && STRIPE_LOCALES.has(locale)) ? locale : 'auto';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      locale: safeLocale,
      // dacă ai deja customerId, îl treci; altfel pasezi email:
      customer: customerId || undefined,
      customer_email: customerId ? undefined : (email || undefined),
      line_items: [{ price: priceId, quantity: 1 }],
      // Pseudonymous funnel id (random UUID, no PII) so stripe-webhook.js can
      // join subscription_active back to the anonymous client funnel. Stripe
      // caps client_reference_id at 200 chars; omit when absent.
      client_reference_id: (typeof anonId === 'string' && anonId) ? anonId.slice(0, 200) : undefined,
      success_url: (successUrl || `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: cancelUrl || `${origin}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
