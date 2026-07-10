// /api/stripe-webhook.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funnel analytics: pseudonymous, deterministic email id so subscription_active
// rows can join the anonymous client funnel without ever storing the raw email.
function hashEmail(email) {
  if (!email) return null;
  const salt = process.env.ANALYTICS_HASH_SALT || '';
  return crypto.createHmac('sha256', salt).update(String(email).trim().toLowerCase()).digest('hex');
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Converts a Unix timestamp (seconds) to milliseconds for expires_at column
function toMs(unixSeconds) {
  if (!unixSeconds) return null;
  return unixSeconds * 1000;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig   = req.headers['stripe-signature'];
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whsec) return res.status(400).send('Missing signature or secret');

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err) {
    console.error('❌ Webhook signature failed:', err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Stripe event:', event.type);

  try {
    switch (event.type) {

      // ─────────────────────────────────────────────────────────────
      // 1. Checkout completed → insert/update row with customer info
      //    Then fetch subscription to get the real expiry date
      // ─────────────────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session    = event.data.object;
        const customerId = session.customer || null;
        // Anonymous funnel id set by create-checkout-session.js (no PII) — lets
        // the subscription_active row below join the client-side funnel.
        const anonId     = session.client_reference_id || null;

        let email =
          session.customer_email ||
          session?.customer_details?.email ||
          null;

        if (!email && customerId) {
          try {
            const c = await stripe.customers.retrieve(customerId);
            if (!c.deleted) email = c.email || null;
          } catch {}
        }

        // Fetch the subscription right away to get current_period_end
        let expiresAt = null;
        let subId     = session.subscription || null;
        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            expiresAt = toMs(sub.current_period_end); // milliseconds
          } catch (e) {
            console.warn('Could not fetch subscription:', e.message);
          }
        }
        // REVENUE GUARD (real-payment validation, finding F1): check-access
        // treats a null expires_at as LIFETIME. If the subscription fetch
        // fails (or yields no period end), writing null grants permanent
        // access for a single month's payment — observed in production on
        // 2026-07-10. Fall back to month + grace; the customer.subscription.*
        // sync events (and every renewal) overwrite it with the exact date.
        if (subId && !expiresAt) {
          expiresAt = Date.now() + 35 * 24 * 60 * 60 * 1000;
          console.error('[webhook] expires_at fallback used — subscription fetch failed; verify Stripe webhook event config (customer.subscription.*)');
        }

        if (customerId) {
          // First try to update an existing row that already has this customer id
          const { data: existing } = await supabase
            .from('tokens')
            .update({
              email,
              stripe_subscription_id: subId,
              subscription_status: 'active',
              expires_at: expiresAt,
            })
            .eq('stripe_customer_id', customerId)
            .select('id');

          if (!existing?.length) {
            // No row for this customer yet — check if a row exists for the email
            // (could be a manually created legacy row)
            let merged = false;
            if (email) {
              const { data: byEmail } = await supabase
                .from('tokens')
                .update({
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subId,
                  subscription_status: 'active',
                  expires_at: expiresAt,
                })
                .eq('email', email)
                .is('stripe_customer_id', null) // only merge unlinked rows
                .select('id');
              merged = !!(byEmail?.length);
            }

            if (!merged) {
              // Brand new customer — insert fresh row
              await supabase.from('tokens').insert({
                email,
                stripe_customer_id: customerId,
                stripe_subscription_id: subId,
                subscription_status: 'active',
                expires_at: expiresAt,
              });
            }
          }

          console.log(`checkout.session.completed → email=${email}, expires_at=${expiresAt}`);
        } else {
          console.warn('checkout.session.completed: missing customerId');
        }

        // Funnel analytics — final step. Recorded server-side (no raw email).
        // Wrapped so a telemetry failure can never break billing. Dedupe in
        // queries via props.stripeEventId if Stripe re-delivers the event.
        try {
          await supabase.from('events').insert({
            event: 'subscription_active',
            anon_id: anonId ? String(anonId).slice(0, 64) : null,
            email_hash: hashEmail(email),
            props: {
              plan: 'subscription',
              amount: session.amount_total ?? null,
              currency: session.currency ?? null,
              expiresAt: expiresAt,
              stripeEventId: event.id,
            },
          });
        } catch (e) {
          console.warn('analytics subscription_active insert failed:', e?.message);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 2. Subscription created / updated → sync expiry date
      //    This fires on every renewal too, keeping expires_at fresh
      // ─────────────────────────────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub  = event.data.object;
        const item = sub.items?.data?.[0] || null;

        const payload = {
          stripe_subscription_id: sub.id,
          subscription_status:    sub.status,
          // expires_at = end of current billing period (ms)
          expires_at:             toMs(sub.current_period_end),
          current_period_start:   sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end:     sub.current_period_end   ? new Date(sub.current_period_end   * 1000).toISOString() : null,
          cancel_at_period_end:   !!sub.cancel_at_period_end,
          canceled_at:            sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
          price_id:               item?.price?.id   || null,
          product_id:             item?.price?.product || null,
        };

        const { data: updated } = await supabase
          .from('tokens')
          .update(payload)
          .eq('stripe_customer_id', sub.customer)
          .select('id');

        // Fallback: row might not exist yet (subscription event arrived before checkout event)
        if (!updated?.length) {
          try {
            const c = await stripe.customers.retrieve(sub.customer);
            if (!c.deleted) {
              await supabase.from('tokens').upsert(
                { email: c.email || null, stripe_customer_id: sub.customer, ...payload },
                { onConflict: 'stripe_customer_id' }
              );
            }
          } catch {}
        }

        console.log(`${event.type} → expires_at=${payload.expires_at}, status=${payload.subscription_status}`);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 3. Subscription deleted (cancelled and period ended)
      //    Set expires_at to now so access is immediately revoked
      // ─────────────────────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object;

        // If cancel_at_period_end was true, current_period_end is the correct cutoff.
        // Otherwise revoke now.
        const expiresAt = sub.current_period_end
          ? toMs(sub.current_period_end)
          : Date.now();

        await supabase
          .from('tokens')
          .update({
            subscription_status: 'canceled',
            expires_at: expiresAt,
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', sub.customer);

        console.log(`subscription.deleted → expires_at=${expiresAt}`);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // 4. Invoice paid → renewal: refresh expires_at for next period
      // ─────────────────────────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.billing_reason !== 'subscription_cycle') break;

        const subId = invoice.subscription;
        if (!subId) break;

        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          await supabase
            .from('tokens')
            .update({
              expires_at:           toMs(sub.current_period_end),
              current_period_end:   new Date(sub.current_period_end * 1000).toISOString(),
              subscription_status:  sub.status,
            })
            .eq('stripe_customer_id', invoice.customer);

          console.log(`invoice.payment_succeeded (renewal) → new expires_at=${toMs(sub.current_period_end)}`);
        } catch (e) {
          console.warn('invoice renewal update failed:', e.message);
        }
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('❌ Webhook handler error:', e);
    return res.status(500).send('Internal webhook handler error');
  }
}

export const config = { api: { bodyParser: false } };
