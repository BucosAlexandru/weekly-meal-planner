// api/stripe/create-portal-session.js (SERVER)
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { customerId, email, return_url } = req.body || {};
    let cid = customerId || null;

    // 1) Dacă n-ai primit customerId, caută-l în Supabase după email
    if (!cid && email) {
      const { data } = await supabase
        .from('tokens')
        .select('stripe_customer_id')
        .eq('email', email)
        .single();

      if (data?.stripe_customer_id) {
        cid = data.stripe_customer_id;
      }

      // 2) Fallback: caută în Stripe după email și preferă customerii cu abonament activ
      if (!cid) {
        const list = await stripe.customers.list({ email });
        let found = null;

        for (const customer of list.data) {
          const subs = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1,
          });

          if (subs.data.length > 0) {
            found = customer;
            break; // ieșim imediat după primul cu abonament activ
          }
        }

        if (found) {
          cid = found.id;
        } else if (list.data.length > 0) {
          // fallback absolut – luăm primul customer dacă nu are niciunul abonament activ
          cid = list.data[0].id;
        }
      }
    }

    if (!cid) {
      return res.status(400).json({ error: 'Missing customerId (and no match by email)' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: cid,
      return_url: return_url || `${req.headers.origin}/account`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-portal-session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
