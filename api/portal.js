// public/js/portal.js (client)
async function openPortal({ customerId, email }) {
  const res = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: customerId || null,
      email: email || null,
      returnUrl: window.location.origin + '/account'
    })
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
  else alert(data.error || 'Nu am putut deschide portalul.');
}

// Legare la butonul tău
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'manage-subscription') {
    openPortal({
      email: window.currentUserEmail || document.querySelector('#email-input')?.value?.trim() || null,
      customerId: window.currentStripeCustomerId || null
    });
  }
});
