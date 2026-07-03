// public/js/checkout.js
const PRICE_EUR = 'price_1RvvfCH2AzHMl4LgJDB1QS8O';

async function startSubscriptionCheckout({ email, priceId, customerId, anonId }) {
  const r = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      email, priceId, customerId, anonId,
      successUrl: window.location.origin + '/?success=true',
      cancelUrl: window.location.origin + '/'
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
