# DEPLOY VALIDATION — Preview Vercel `feature/planner-cards`

_Data: 2026-07-10 · Deployment: commit `55277bab` (Ready, Preview) ·
URL: weekly-meal-planner-git-fea-fa7a6b-…vercel.app · Zero modificări de cod._

**Metodă.** Payload-uri construite în pagină din modulele reale servite de deployment
(`recipes.js`, `recipes-meta.js`, `i18n.js`, `shopping-list.js` + PDF_LABELS/WEEK_OF/
DAY_ABBREV extrase din `app.js` deployat) — identice cu ce trimite clientul de producție,
cu email premium (lifetime, verificat prin `/api/check-access`) pentru PDF complet 7 zile +
shopping list. POST-uri reale către `/api/generate-pdf` pe instanța serverless, **în ordinea
worst-case: ru primul, tr imediat după** (scenariul care producea coruperea P0), apoi restul.
Verificare: extracție text per pagină (pdf.js) + randare vizuală pe canvas pentru limbile cu
scripturi complexe. Bundle-ul deployat confirmat cu fix-urile (`Pzt`, `pdf.tempUnavailable`).

## Tabel de validare

| Language | Export | Visual | Characters | Shopping List | Status |
|---|---|---|---|---|---|
| RU (primul, instanță rece→caldă) | 200 · 4 pag | ✓ | weekLabel + 14/14 rețete ✓ | 7/7 grupe · cant. 12/12 | **PASS** |
| TR (imediat după RU — testul P0) | 200 · 4 pag | ✓ vizual: „Haftalık", „Hafta 10 Temmuz", „Kırmızı dolmalık biber 200 g" | intacte ✓ · zile **Pzt/Sal/Çar/Per/Cum/Cmt/Paz** 7/7 unice | „Alışveriş Listesi" ✓ · cant. 12/12 | **PASS** |
| RO | 200 · 4 pag | ✓ | 7/7 zile · 14/14 | 7/7 · 12/12 | **PASS** |
| EN | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| ES | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| FR | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| DE | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| PT | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| ZH | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| JA | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| HI | 200 · 4 pag | ✓ randat pe canvas: Devanagari corect, zile सोम…रवि | text-match 5/7 = artefact de extracție pdf.js pe Devanagari (vizual corect) | etichete ✓ · cant. 12/12 | **PASS** |
| IT | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| KO | 200 · 4 pag | ✓ | 7/7 · 14/14 | 7/7 · 12/12 | **PASS** |
| **AR** | **422** `pdf_unavailable_for_language` (guard server ✓) | UI: buton `disabled` + `aria-disabled` + opacity .55 ✓ | mesaj complet în arabă, vizibil: „تصدير PDF غير متاح مؤقتًا لهذه اللغة — نعمل على إصلاح ذلك…" | — | **PASS (blocat prin design)** |

**Rezultat: 13/13 export PASS + AR blocat corect = 14/14 conform specificației.**

## Verificări acoperite

- Export: 13× status 200, 4 pagini fiecare, nicio pagină goală/trunchiată (min. 783 caractere/pagină)
- Caractere: weekLabel intact în toate limbile INCLUSIV tr după ru pe aceeași instanță caldă
  (bug-ul P0 nu se mai reproduce pe deploy); scripturi native corecte (chirilice, CJK, Devanagari)
- Zile: 7/7 în toate limbile; tr fără duplicate (Cum≠Cmt, Pzt≠Paz)
- Cantități: eșantion 12/12 regăsite per limbă (agregate, cu unități)
- Shopping list: eticheta secțiunii + grupele + itemii regăsiți per limbă
- Rupere pagini: verificat textual (pagini echilibrate) + vizual pe tr/hi; nota SFAT sub listă

## Observații (nu blochează, nu s-a modificat nimic)

1. **Contrast slab al mesajului ar**: nota `pdf-lang-note` (text #8f3a23) apare pe cardul
   verde închis al secțiunii PDF — funcțională dar greu lizibilă acolo. Fix de 1 rând
   (culoare deschisă când e pe fundal închis). P2, la următorul lot.
2. Scorurile sub 7/7 la hi (extracție) și o grupă tr sunt artefacte cunoscute de
   ToUnicode/extracție — randarea vizuală, verificată pe canvas, e corectă.
3. Validat cu emailul premium al producătorului (server-side entitlement); gating-ul free
   (2 zile, fără shopping list) rămâne neschimbat și re-verificat server-side.
4. Reminder operațional: **Deployment Protection a fost dezactivată temporar** pentru
   validare — de reactivat (Settings → Deployment Protection → Require Log In → ON).

## Concluzie

Implementarea P0 funcționează pe infrastructura reală exact ca în verificarea locală:
izolarea fonturilor per limbă elimină coruperea între cereri pe instanțe calde, zilele
turcești sunt corecte, iar araba e blocată comercial, cu mesaj nativ, fără să afecteze
restul produsului. **Branch-ul e gata de merge în main din perspectiva P0.**
