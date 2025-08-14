// public/js/checkout.js
const PRICE_RON = 'price_1Ris0OH2AzHMl4LgMbe1X3Xz';
const PRICE_EUR = 'price_1RvvfCH2AzHMl4LgJDB1QS8O';
const PRICE_BY_CURRENCY = { RON: PRICE_RON, EUR: PRICE_EUR };

let selectedCurrency = 'EUR'; // default cum e în <select>

function getSelectedPriceId() {
  return PRICE_BY_CURRENCY[selectedCurrency];
}

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
  const currencySel = document.getElementById('currency-select');
  const payBtn      = document.getElementById('pay-btn');

  if (currencySel) {
    selectedCurrency = currencySel.value || 'EUR';
    currencySel.addEventListener('change', () => {
      selectedCurrency = currencySel.value || 'EUR';
    });
  }

  if (payBtn) {
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const priceId = getSelectedPriceId();
      const email = document.querySelector('#emailInput')?.value?.trim() || null;
      const customerId = window.currentStripeCustomerId || null; // dacă îl setezi cândva
      await startSubscriptionCheckout({ email, priceId, customerId });
    });
  }
});
