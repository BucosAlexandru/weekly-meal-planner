// public/js/checkout.js
const PRICE_EUR = 'price_1RvvfCH2AzHMl4LgJDB1QS8O';

// ── Locale plumbing (P1, real-payment validation findings F3/F4) ──────────
// The old successUrl ('/?success=true') hit the root redirect, which DROPPED
// the query string: paying users landed on /en/ with no confirmation at all
// (observed live). We now return the buyer to THEIR language's homepage with
// success + session_id intact, cancel back to the exact page they left, and
// tell Stripe which locale to render Checkout in (it showed RO chrome to EN
// visitors before).
const MP_LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko'];
// Stripe Checkout locales — everything we support except 'hi' (not offered
// by Stripe; those buyers get 'auto' = Stripe's own detection).
const STRIPE_LOCALES = { ro:'ro', en:'en', es:'es', fr:'fr', de:'de', pt:'pt',
                         ru:'ru', ar:'ar', zh:'zh', ja:'ja', tr:'tr', it:'it', ko:'ko' };
function mpUiLang() {
  const seg = (window.location.pathname.split('/')[1] || '').toLowerCase();
  if (MP_LANGS.includes(seg)) return seg;
  try {
    const saved = localStorage.getItem('lastLang');
    if (MP_LANGS.includes(saved)) return saved;
  } catch (_) {}
  return 'ro'; // the bare root serves the RO app
}

async function startSubscriptionCheckout({ email, priceId, customerId, anonId }) {
  const lang = mpUiLang();
  const r = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      email, priceId, customerId, anonId,
      locale: STRIPE_LOCALES[lang] || 'auto',
      // {CHECKOUT_SESSION_ID} is substituted BY STRIPE at redirect time; the
      // success handler in app.js uses it to auto-restore premium without
      // asking the buyer to re-type their email.
      successUrl: `${window.location.origin}/${lang}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: window.location.origin + window.location.pathname,
    }),
  });
  const data = await r.json();
  if (data?.url) { window.location.href = data.url; return true; } // redirecting
  alert(data.error || 'Nu am putut crea sesiunea de checkout.');
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  const payBtn = document.getElementById('pay-btn');

  if (payBtn) {
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Guard: an impatient double-click must not fire two checkout_started
      // events or create two Stripe sessions. Once a redirect to Stripe starts
      // the button stays locked (page is unloading); it is only released if
      // session creation failed, so the user can retry.
      if (payBtn._checkoutInFlight) return;
      payBtn._checkoutInFlight = true;
      let redirecting = false;
      try {
        const email = document.querySelector('#emailInput')?.value?.trim() || null;
        const customerId = window.currentStripeCustomerId || null;
        // Hint for premium auto-restore after Stripe success: lets app.js
        // silently re-verify the user instead of forcing manual activation.
        if (email) { try { localStorage.setItem('mp:lastEmail', email); } catch (_) {} }
        // Anonymous funnel id (random UUID, no PII) → carried into the Stripe
        // session so the webhook can join subscription_active to this funnel.
        const anonId = (typeof window.mpAnonId === 'function') ? window.mpAnonId() : null;
        // source reuses analytics.js' corrected page-type detection so
        // /ro/premium/ and every localized pricing slug reports 'pricing'.
        let source = 'planner';
        try {
          if (typeof window.mpPageType === 'function') {
            source = window.mpPageType() === 'pricing' ? 'pricing' : 'planner';
          } else if (/\/(pricing|premium|precios|precos|tarifs|preise|tseny|asaar|jiage|fiyatlar|prezzi)(?:\/|$)/i.test(location.pathname)) {
            source = 'pricing';
          }
        } catch (_) {}
        // Plan-type / budget context comes from the planner globals (app.js
        // sets them); on a standalone pricing page they fall back to defaults.
        if (window.mpTrack) window.mpTrack('checkout_started', {
          priceId: PRICE_EUR,
          filter: window._activeFilter || 'all',
          isBudget: !!window.isBudgetMenu,
          source: source,
        });
        redirecting = await startSubscriptionCheckout({ email, priceId: PRICE_EUR, customerId, anonId });
      } finally {
        if (!redirecting) payBtn._checkoutInFlight = false;
      }
    });
  }
});
