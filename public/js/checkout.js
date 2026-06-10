// public/js/checkout.js
const PRICE_EUR = 'price_1RvvfCH2AzHMl4LgJDB1QS8O';

async function startSubscriptionCheckout({ email, priceId, customerId }) {
  const r = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      email, priceId, customerId,
      successUrl: window.location.origin + '/?success=true',
      cancelUrl: window.location.origin + '/'
    }),
  });
  const data = await r.json();
  if (data?.url) window.location.href = data.url;
  else alert(data.error || 'Nu am putut crea sesiunea de checkout.');
}

document.addEventListener('DOMContentLoaded', () => {
  const payBtn = document.getElementById('pay-btn');

  if (payBtn) {
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.querySelector('#emailInput')?.value?.trim() || null;
      const customerId = window.currentStripeCustomerId || null;
      // Hint for premium auto-restore after Stripe success: lets app.js
      // silently re-verify the user instead of forcing manual activation.
      if (email) { try { localStorage.setItem('mp:lastEmail', email); } catch (_) {} }
      if (window.mpTrack) window.mpTrack('checkout_started', { priceId: PRICE_EUR });
      await startSubscriptionCheckout({ email, priceId: PRICE_EUR, customerId });
    });
  }
});
