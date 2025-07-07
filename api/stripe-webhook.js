const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Database = require('better-sqlite3');
const db = new Database('tokens.db'); // Ai grijă să pui calea corectă

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // Stripe trimite datele ca buffer/raw, nu JSON!
  let rawBody = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => {
      rawBody += chunk;
    });
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
    // 1. Generezi un token random (exemplu simplu):
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    // 2. Extragi emailul userului din sesiune (dacă ai adăugat collect email la Stripe Checkout)
    const email = session.customer_details?.email || null;
    // 3. Calculezi data de expirare (timpul curent + 30 zile)
    const expires_at = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    // 4. Inserezi în baza de date:
    try {
      db.prepare(`INSERT INTO tokens (token, email, expires_at) VALUES (?, ?, ?)`)
        .run(token, email, expires_at);
      // (opțional) Trimite tokenul pe email către client sau afișează-l după plată
      console.log('Token inserat:', token);
    } catch (err) {
      console.error('Eroare la inserarea tokenului:', err);
    }
  }

  res.json({ received: true });
};
