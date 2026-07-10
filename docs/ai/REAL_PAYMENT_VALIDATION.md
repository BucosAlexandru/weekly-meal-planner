# REAL PAYMENT VALIDATION — flux de plată real în producție

_Data: 2026-07-10 · meal-planner.ro (main @ f5347a18) · Plată reală: 3,00 EUR, card Visa,
email test `bucosalexandrubogdan+test1@gmail.com` (alias nou — baseline `found:false`),
anulat + refund la final. Acțiunile financiare (plata, anularea, refund-ul) executate de
producător; verificările, de Claude. Capturi în conversația de validare._

## Tabel PASS/FAIL

| # | Pas | Verificare | Rezultat | Status |
|---|---|---|---|---|
| 1 | Checkout (site → Stripe) | „Get Premium" pe /en/pricing/ → sesiune live `cs_live_…` creată | pagina Stripe: 3,00 EUR/lună, Card + Apple/Google Pay + Revolut | **PASS** |
| 2 | Stripe payment | plată reală cu card, email alias | acceptată; chitanță emisă | **PASS** |
| 3 | Webhook | `check-access` alias: înainte `found:false` → după plată | `active:true, found:true` în <60s | **PASS** |
| 4 | Unlock | email în „Already paid?" → Verify Email | „✅ Access granted", badge „Active" în nav, butoane Download PDF / Manage subscription | **PASS** |
| 5 | Premium restore | reload complet al paginii | `hasUnlimited:true`, badge Active, email restaurat din localStorage | **PASS** |
| 6 | PDF generation | POST cu emailul alias | 200, 4 pagini, **toate 7 zilele** (fără gating), shopping list inclusă | **PASS** |
| 7 | Customer portal | „Manage subscription" | billing.stripe.com: abonament 3 EUR/lună, next billing 10 aug, factură „Plătită", card ••••8400 | **PASS** |
| 8 | Anulare abonament | din portal (producător) | executată în Stripe | **PASS** |
| 9 | Refund | din dashboard (producător) | executat în Stripe | **PASS** |
| 10 | Post-refund access | `check-access` alias după cancel+refund | `active:true` — accesul rămâne (vezi F2) | PASS cu constatări |

**Concluzie: lanțul de monetizare funcționează cap-coadă în producție.** Un client real
poate plăti, primi acces, genera PDF-ul complet și gestiona abonamentul. Constatările de
mai jos nu blochează plata — dar două dintre ele merită fixate înainte de trafic plătit.

## Constatări (descoperite DOAR datorită testului real)

**F1 — `expires_at` rămâne NULL pentru abonamente lunare (risc de venit).**
Rândul scris de webhook la plată are `until:null` = tratat ca LIFETIME de `check-access`.
Anularea abonamentului nu l-a corectat → **clientul de test are acces permanent după
refund**. Cauza probabilă (dublă): (a) fetch-ul subscription din `checkout.session.completed`
a picat silențios → fallback `null`; (b) endpoint-ul webhook din Stripe **nu pare abonat**
la `customer.subscription.created/updated/deleted` (anularea n-a produs niciun update).
De verificat de producător (2 min): Stripe Dashboard → Developers → Webhooks → endpoint →
„Events to send". Fix de cod planificat în P1: fallback `now + 35 zile` în loc de `null`
la eșecul fetch-ului. _Cleanup: rândul `+test1` din `tokens` trebuie expirat/șters manual
în Supabase._

**F2 — Refund-ul nu revocă accesul** (rândul din `tokens` nu e atins). Pentru refund-uri
de bunăvoință e OK; combinat cu F1 devine acces gratuit permanent. Se rezolvă implicit
prin F1 + evenimentele de subscription.

**F3 — Post-plată: utilizatorul aterizează pe homepage FĂRĂ nicio confirmare** (confirmat
live). `successUrl=/?success=true` → redirectul rădăcină → `/en/` **pierde parametrul** →
mesajul de succes nu apare niciodată, iar clientul proaspăt plătit trebuie să-și dea singur
seama că trebuie să introducă emailul în „Already paid?". Cel mai mare gol de încredere
din funnel. Fix în P1: `successUrl=/{lang}/?success=true&session_id={CHECKOUT_SESSION_ID}`.

**F4 — Stripe Checkout în limbă mixtă** (reconfirmat): chrome RO pentru vizitator EN,
descriere produs EN. Fix P1: `locale` transmis la crearea sesiunii.

**F5 — „Activate" de pe pricing pierde emailul tastat**: e un link către formularul de pe
homepage, câmpul sosește gol. Fricțiune mică, fix mic (P1-trust).

## Verdictul pasului 3 din plan

Fluxul de plată e **confirmat în producție** → se poate trece la implementarea P1,
cu F1+F3 promovate în lotul P1 ca fix-uri de încredere/venit descoperite la validare.
