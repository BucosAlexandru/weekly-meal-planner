# PRODUCT RELEASE CHECKLIST — meal-planner.ro

_Data: 2026-07-10 · Întrebarea unică: **putem trimite cu încredere utilizatori reali și
trafic plătit către meal-planner.ro?**_

**Răspuns scurt: DA, pe 13 limbi, după deploy-ul lotului P1 (commit `9abce3db`, așteaptă
push) + 3 acțiuni de 10 minute ale producătorului listate la §Riscuri. Araba se lansează
fără promovare (PDF blocat elegant, restul funcțional).**

---

## 1. Status P0 — ✅ COMPLET, VALIDAT ÎN PRODUCȚIE

| Item | Status | Dovadă |
|---|---|---|
| TR: caractere corupte în PDF | ✅ fixat (izolare fonturi per limbă) | pixel-identic solo vs. secvență, 13/13 limbi; validat pe preview ȘI producție (ru→tr instanță caldă) |
| TR: zile ambigue (PAZ×2, CUM×2) | ✅ fixat (Pzt/Sal/Çar/Per/Cum/Cmt/Paz) | vizual în PDF-ul de producție |
| AR: export PDF crăpa + polua instanțele calde | ✅ blocat comercial (422 server + buton dezactivat + mesaj nativ arab) | validat în producție |
| Cauza-rădăcină (otrăvirea stării fontkit între cereri) | ✅ eliminată structural | `DEPLOY_VALIDATION.md` |

## 2. Status P1 — ✅ IMPLEMENTAT (commit `9abce3db`), NECESITĂ DEPLOY + VERIFICARE

| Item | Status | Verificare post-deploy (5 min) |
|---|---|---|
| Stripe Checkout în limba utilizatorului | ✅ cod | deschide checkout din /en/ → chrome EN |
| Întoarcere post-plată pe /{lang}/ cu `?success=true` păstrat | ✅ cod | (parametrul nu mai trece prin redirectul rădăcinii) |
| `session_id` propagat + **auto-unlock fără re-tastarea emailului** | ✅ cod | următoarea plată reală sau test cu sesiunea din istoricul Stripe |
| Guard de venit: `expires_at` null → fallback +35 zile | ✅ cod | logs la următoarea plată |
| Mesaj ar lizibil (chip deschis pe cardul verde) | ✅ cod | vizual /ar/ |
| Pricing „Activate" păstrează emailul tastat | ✅ cod (+14 pagini regenerate) | tastează email pe pricing → Activate → sosește verificat |
| Fluxul complet de plată (checkout→webhook→unlock→restore→PDF→portal→refund) | ✅ **VALIDAT CU BANI REALI** | `REAL_PAYMENT_VALIDATION.md` — 10/10 pași |

Build verde: 3962 pagini, smoke 79/79, node --check, 0 curly quotes.

## 3. P2 cunoscute (nu blochează lansarea)

„min" netradus global (chips + PDF) · zh/ja/ko PDF fără bold real · 12 rețete tr cu
ingrediente ASCII · ~150 nume de rețete identice cu EN pe limbile latine (trecere
editorială) · itemi shopping „克rigatoni"/„ग्राम guanciale" (unitate fuzionată, zh/hi) ·
instrucțiune de servire ca item în lista zh · „~€-63" în hero PDF hi · cratime
inconsistente la rupere în coloane înguste · `priceId` fără allowlist server-side ·
UI vechi pe modurile One Meal/One Day · ToUnicode incomplet la extracția de text din PDF
(copy/paste, nu vizual) · frame-uri de tranziție la toast-uri pe device-uri lente.

## 4. Datorie tehnică

1. **Bug-ul upstream @react-pdf bidi (ar)** — de urmărit release-urile; la fix: scoate
   guard-urile (marcate în cod) + re-audit PDF complet.
2. **Izolarea fonturilor per limbă** = workaround corect dar neortodox; documentat în cod
   ca să nu fie „simplificat" înapoi.
3. **CLAUDE.md învechit** (praguri CI vechi ~3250 vs. reale ~3962; „commit direct pe main"
   vs. fluxul actual pe branch).
4. **Rate-limiter in-memory** (per instanță, nu global) — suficient acum, de mutat în
   Upstash/KV la scală.
5. Testare pe device-uri reale (iOS Safari — tastatura vs bottom sheet) încă nefăcută.
6. Analytics v2 — spec înghețat, neimplementat (următorul lot, după P1 în producție).

## 5. Recomandare de lansare

**GO pe 13 limbi** (toate minus ar ca piață promovată), condiționat de:

1. `git push origin main` cu lotul P1 + verificarea de 5 min din §2;
2. cele 3 acțiuni ale producătorului din §6 (10 min total).

Produsul are: funnel funcțional dovedit cu bani reali, PDF corect în 13 limbi,
gating server-side care nu poate fi păcălit, portal de self-service. Nimic din §3
nu justifică amânarea; toate sunt reparabile incremental sub trafic.

## 6. Riscuri înainte de promovare (+ acțiunile care le închid)

| Risc | Severitate | Acțiune (producător) |
|---|---|---|
| **Webhook-ul Stripe nu pare abonat la `customer.subscription.*`** → expirările nu se sincronizează niciodată (anularea din testul real n-a produs update); fallback-ul +35z limitează dauna, dar sincronizarea corectă cere evenimentele | **MARE** | Stripe Dashboard → Developers → Webhooks → endpoint → Add events: `customer.subscription.created/updated/deleted` (2 min) |
| Rândul de test `+test1` are acces permanent după refund | mică (1 rând) | Supabase → `tokens` → șterge/expiră rândul `bucosalexandrubogdan+test1@gmail.com` (2 min) |
| Deployment Protection pe preview-uri a rămas (posibil) dezactivată | medie (igienă) | Vercel → Settings → Deployment Protection → ON (1 min) |
| Prima plată post-P1 nevalidată cu noul flux (locale + auto-unlock) | mică | prima vânzare reală e și testul; alternativ un test de 3 € repetat |
| Volum: rate-limit per instanță + funcție PDF ~3s/render | mică la scara actuală | monitorizare; vezi §4.4 |

---

_Referințe: PRODUCT_RELEASE_AUDIT.md (auditul complet 6 zone × 14 limbi) ·
DEPLOY_VALIDATION.md (PDF 13/13 pe preview) · REAL_PAYMENT_VALIDATION.md (plata reală
10/10 pași + constatările F1–F5) · PLANNER_IMPLEMENTATION_CHECKLIST.md (QA planner)._
