// /api/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // acesta e secretul primit din Stripe când setezi webhook-ul
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Procesează event-ul Stripe
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // TODO: aici inserezi tokenul în baza ta de date
    console.log('Plată reușită!', session);
  }

  res.json({ received: true });
};
