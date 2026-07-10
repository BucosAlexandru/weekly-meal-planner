# PRODUCT RELEASE AUDIT — Product Hardening

_Data: 2026-07-10 · Audit: toate cele 6 zone × 14 limbi · Zero modificări de cod._
_Metodă: verificări automate pe cod/HTML generat/i18n/engine (node), randare PDF locală pe
calea de producție (13/14 limbi), QA vizual în Chrome (homepage ro/en/ar/zh, planner
desktop+390px+RTL, pricing, checkout Stripe live deschis și abandonat — fără plăți)._

**Întrebarea auditului: e pregătit produsul pentru primele vânzări?**

**Răspuns scurt: DA pentru 12 din 14 limbi, cu 2 fix-uri de încredere la plată (P1 §2.3-2.4).
NU pentru ar și tr fără fix-urile P0 — ambele au PDF-ul (produsul plătit) defect sau blocat.**

---

## 1. Ce este perfect (verificat, nu presupus)

**i18n** — paritate 100%: 95 chei × 14 limbi, zero chei lipsă, zero valori netraduse
(singurele „identice cu EN" sunt cuvinte legitim comune în fr).

**Homepage (14/14)** — `lang` corect, `dir="rtl"` pe ar, zero `undefined`/`NaN`/template-uri
sparte, link-uri interne valide, header mobil fără overflow la 390px. Vizual: ro/en/ar/zh
impecabile pe desktop; ar complet oglindit (nav, hero, mockup telefon în arabă).

**Generator/Planner** — toate interacțiunile trec (QA Ziua 4b): reroll cu toast+delta,
remove, undo, picker modal/bottom-sheet, search nume+ingredient cu badge, hint duplicate,
navigare tastatură cu focus-return, recalculare instant (cost zi, overview, shopping, 74
itemi). Breakpoint exact la 700px; RTL cu acțiuni pe stânga; nume lungi de/ru pe 2 rânduri
fără overflow; plan persistent la schimbare de limbă/mod. Zero erori de consolă.

**Shopping List (14/14)** — engine determinist: 7 categorii, 81 itemi, agregare identică în
toate limbile, zero crash, zero duplicate, etichete de categorie localizate (verificat fr:
„Légumes & herbes | Viandes & poissons…"). Cantitățile agregate corect (staples fără
cantitate = prin design). Checkbox-uri prezente și funcționale.

**Premium/Pricing (14/14)** — €3 consistent pe toate paginile, pagină curată, flux de
activare prin email prezent, gating PDF free (2 din 7 zile) re-verificat server-side
(clientul nu poate păcăli — `requirePremium` pe `/api/generate-pdf`).

**Checkout (cod + live)** — CTA → sesiune Stripe live creată corect (3,00 EUR/lună, card +
Revolut Pay). Webhook robust: `email_hash` HMAC (zero PII), tolerant sec/ms pe
`expires_at`. `check-access` evită capcana `.single()`. Portal cu `return_url` validat.

**PDF (12/14 limbi)** — export funcțional, encoding Unicode impecabil (zero U+FFFD, toate
scripturile native), rupere de pagini curată, SFAT poziționat corect, cantități agregate,
traduceri complete (ru/zh/ja/hi/ko/de/fr/es/pt/it/ro/en). Imaginile lipsesc **prin design**
(Phase 1 scaffold) — nu e defect.

**Infrastructură** — build verde (3962 pagini, sitemap 4006), CI complet, zero secrete în
sursă, smoke analytics 79/79.

---

## 2. De reparat ÎNAINTE de promovare

| # | Problemă | Sev. | Timp | Risc fix | Impact comercial |
|---|---|---|---|---|---|
| 2.1 | **ar: PDF-ul nu se poate exporta deloc** (crash bidi în @react-pdf/textkit, blocat intenționat client-side) și **alertul de blocare e în engleză** pentru utilizatori arabi | **P0** | mesaj localizat + ascundere buton: 2h · fix real: 0,5–2 zile (upgrade lib + re-audit toate limbile) | mesaj: minim · upgrade lib: mediu (atinge toate limbile) | Piața ar nu poate cumpăra produsul principal. Alternativă: lansare fără promovare pe ar |
| 2.2 | **tr: PDF cu caractere lipsă la randare** — „Hafta"→„afta", „kırmızı"→„ırmızı" (sursa corectă; bug renderer/font, captură în audit PDF) | **P0** | 0,5–1 zi (test versiune fontkit / font alternativ pt. tr) | mediu | Produs plătit vizibil defect pe tr = retururi + neîncredere |
| 2.3 | **Stripe checkout în limbă greșită**: chrome RO pentru user venit de pe /en/, descriere produs EN pentru toți — mix de limbi la pasul de plată | P1 | 1h (`locale` în create-checkout-session; opțional descrieri localizate) | mic | Pasul cel mai sensibil din funnel; limbă greșită = abandon |
| 2.4 | **Post-plată: aterizare pe rădăcină** (`/?success=true`), fără limba/contextul de unde a plecat; `successUrl` din client omite `session_id` | P1 | 1–2h (redirect `/{lang}/?success=true` + session_id) | mic | Momentul de maxim entuziasm al clientului nu trebuie să deruteze |
| 2.5 | **tr: zile ambigue în PDF** — trunchierea la 3 litere dă PAZ (luni ȘI duminică), CUM (vineri ȘI sâmbătă) | P1 | 1–2h (tabel abrevieri per limbă în loc de `slice(0,3)`) | minim | Planul săptămânal cu zile ilizibile pe tr |
| 2.6 | **hi: costul din hero PDF se rupe ca „~€-63"** — pare negativ | P1 | 1h (no-wrap pe stat) | minim | Prima cifră văzută în PDF pare eroare |
| 2.7 | **Shopping list zh/hi: unitate fuzionată în nume** („克rigatoni", „ग्राम guanciale") + instrucțiune de servire apărută ca item (zh: „上桌：…khobz…") | P1 | 2–4h în dicționarul engine-ului + re-rulat audit_uniqueness | mediu (engine partajat UI+PDF — necesită re-test) | Lista arată neprofesionist exact pe piețele CJK |
| 2.8 | **Fluxul de unlock prin email — netestat live** (cod corect, dar nimeni n-a rulat cap-coadă: plată reală → webhook → activare) | P1 (verificare, nu bug) | 30 min test manual de producător cu un abonament real + refund | — | Dacă unlock-ul nu merge, prima vânzare = primul refund |

**Total estimat pentru „gata de promovare": 2–4 zile de lucru** (2.1 în varianta mesaj-localizat; fix-ul real ar poate veni după).

---

## 3. Poate rămâne pentru versiunea următoare

| # | Problemă | Sev. | Timp | Risc | Impact |
|---|---|---|---|---|---|
| 3.1 | „min" netradus global (chips site + PDF, toate limbile) | P2 | 1–2h | minim | polish; vizibil dar universal înțeles |
| 3.2 | zh/ja/ko PDF fără bold real (Regular înregistrat ca 700) — ierarhie vizuală slabă | P2 | 1–2h (adăugat Noto Bold, ~3 fonturi) | mic (mărime bundle fonturi) | percepția „premium" pe CJK |
| 3.3 | tr: 12 rețete cu ingrediente ASCII-ficate („buyuk patlican") | P2 | 2–4h content | minim | calitate conținut tr |
| 3.4 | ~150–169 nume de rețete identice cu EN pe limbile latine — de separat editorial proper-nouns (Paella ✓) de netraduse („Chicken Tagine" în ro ✗) | P2 | trecere editorială incrementală (zile, în fundal) | minim | calitate percepută |
| 3.5 | Cratime inserate la rupere în coloane înguste PDF (ja „40-g") și rupturi fără cratimă în alte limbi — inconsistent | P2 | 1–2h (hyphenationCallback) | mic | tipografie |
| 3.6 | Moduri One Meal / One Day cu UI-ul vechi (tabel+inputuri) — contrast de calitate vs. plannerul nou | P2 (decizie produs) | de decis (unificare sau eliminare moduri) | — | poate deruta în testare; nu blochează vânzarea |
| 3.7 | `priceId` acceptat de la client fără allowlist server-side | P2 | 30 min | minim | igienă (doar prețurile contului pot fi folosite) |
| 3.8 | EN rezidual în ingrediente hi („extra-virgin olive oil") + proper-nouns brânzeturi în zh/hi | P2 | content, incremental | minim | calitate |
| 3.9 | Frame-uri de tranziție la toast/mutații rapide (cosmetic, greu de reprodus) | P2 | de urmărit pe device-uri lente | — | — |

---

## 4. Verdict

Nucleul produsului — planner, listă, gating, plată — funcționează și arată comercial în
**12 limbi**. Blocajele reale sunt concentrate în PDF (produsul plătit) pe **ar** (export
inexistent) și **tr** (text corupt), plus două fix-uri de o oră care protejează încrederea
exact la plată (2.3, 2.4) și un test manual de 30 de minute (2.8) fără de care prima
vânzare e o loterie.

**Recomandare:** fix 2.2–2.8 + mesaj localizat pentru 2.1 → promovare pe 13 limbi
(ar cu PDF anunțat „temporar indisponibil" în arabă), cu fix-ul bidi ar urmărit separat.
Niciun element din §3 nu justifică amânarea primelor vânzări.

_Capturile problemelor PDF: `outputs/pdfaudit/` (tr-hi-res-1.png — caractere lipsă + zile
duplicate; hi-hi-res-1.png — „€-63"; zh-4.png — itemi „克rigatoni")._
