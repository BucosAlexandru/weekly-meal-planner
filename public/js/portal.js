// public//portal.js (client)
async function openPortal({ customerId, email }) {
  try {
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customerId || null,
        email: email || null,
        // Return to the page the user was on (not /account — no such route).
        return_url: window.location.origin + window.location.pathname
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Portal session failed');

    if (data?.url) window.location.href = data.url;
    else alert('Nu am putut deschide portalul.');
  } catch (e) {
    console.error('Portal error:', e);
    alert(e.message || 'Eroare la deschiderea portalului.');
  }
}

// Legare la buton
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'manage-subscription') {
    const email =
      window.currentUserEmail ||
      document.querySelector('#emailInput')?.value?.trim() || // ← corectat ID-ul
      null;

    openPortal({
      email,
      customerId: window.currentStripeCustomerId || null
    });
  }
});

