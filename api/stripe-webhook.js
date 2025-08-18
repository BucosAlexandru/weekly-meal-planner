// /api/stripe-webhook.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Citiți RAW body fără niciun parser
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // --- DIAGNOSTIC: vezi dacă ai semnătura + secret încărcat + content-type ---
  console.log('hdr stripe-signature?', !!req.headers['stripe-signature']);
  console.log('env whsec present?', !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log('content-type:', req.headers['content-type']);

  const sig = req.headers['stripe-signature'];
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whsec) {
    return res.status(400).send('Missing signature or secret');
  }

  let event;
  try {
    const raw = await readRawBody(req);
    console.log('raw length =', raw.length); // <— important
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err) {
    console.error('❌ Signature verify failed:', err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log('✅ Event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
  const session = event.data.object;
  const customerId = session.customer || null;

  let email =
    session.customer_email ||
    session?.customer_details?.email ||
    null;

  // încearcă să citești emailul de pe customer dacă nu a venit în sesiune
  if (!email && customerId) {
    try {
      const c = await stripe.customers.retrieve(customerId);
      if (!c.deleted) email = c.email || null;
    } catch {}
  }

  if (customerId) {
    // 👉 upsert pe stripe_customer_id (nu pe email)
    const { error } = await supabase
      .from('tokens')
      .upsert(
        {
          stripe_customer_id: customerId,
          email: email || null,
          stripe_subscription_id: session.subscription || null,
        },
        { onConflict: 'stripe_customer_id' }
      );

    if (error) console.error('SUPABASE upsert error:', error);
  } else {
    console.warn('Missing customerId in session');
  }
  break;
}

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const item = sub.items?.data?.[0] || null;
        const payload = {
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end:   sub.current_period_end   ? new Date(sub.current_period_end   * 1000).toISOString() : null,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          canceled_at:          sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
          price_id:   item?.price?.id || null,
          product_id: item?.price?.product || null,
          quantity:   item?.quantity ?? 1,
          trial_end:  sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        };

            let { data: updated } = await supabase
        .from('tokens')
        .update(payload)
        .eq('stripe_customer_id', sub.customer)
        .select('email');
          
      // ⬇️ AICI pui fallback-ul:
      if (!updated?.length) {
        try {
          const c = await stripe.customers.retrieve(sub.customer);
          if (!c.deleted) {
            await supabase.from('tokens').upsert(
              { email: c.email || null, stripe_customer_id: sub.customer, ...payload },
              { onConflict: 'stripe_customer_id' } // <- păstrează aceeași cheie
            );
          }
        } catch {}
      }
    
      break;
    }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('❌ Handler exception:', e);
    return res.status(500).send('Internal webhook handler error');
  }
}
export const config = { api: { bodyParser: false } };
