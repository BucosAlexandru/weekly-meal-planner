# Planner Premium — Implementation Checklist (faza de implementare)

_Data: 2026-07-10 · Branch: `feature/planner-cards` · Specificații ÎNGHEȚATE:_
_PREMIUM_PRODUCT_SPEC_V1.md · PLANNER_BRAIN_SPEC.md · PLANNER_RESPONSIVE_SPEC.md · FUNNEL_ANALYTICS_PLAN.md (v2)_

**Regulă:** ✅ = există în cod pe main/branch, verificat la 2026-07-10 (audit pre-implementare,
cu referință de commit/linie). ⬜ = de făcut. ⚠️ = există, dar necesită re-verificare.
Nu se reimplementează nimic bifat ✅ — ar încălca principiul 5 (simplu înainte de puternic).

---

## Audit pre-implementare (2026-07-10)

Zilele 1-3 au fost implementate în sesiunile din 8-9 iulie și sunt **merged în main
și în producție** (main == origin/main). `feature/planner-cards` era cu 14 commit-uri
în urmă; a fost sincronizat fast-forward la `bd49e7e6` (2026-07-10). Implementarea
rămasă = Ziua 4 (re-verificare, pentru că după QA-ul inițial au intrat commit-uri noi:
plan persistence `2291d`, plan cart `5ff14`, favorites `29bf4`), Ziua 5, și
Analytics Plan v2 (neimplementat deloc — whitelist-ul are tot cele 7 evenimente vechi).

---

## Ziua 1 — UI static ✅ (implementat, în producție)

- [x] Layout carduri pe zi (înlocuiește tabelul) — `app.js` ~392-530 („Week mode — 7 day cards")
- [x] Week Overview strip (mese, timp mediu, cost, aria-live) — `app.js` ~478, ~531
- [x] Responsive: 1 col <700px / 2 col ≥700px — `style.css` @media 700px/699px
- [x] Aliniere carduri (flex column, meal flex:1) — Responsive Spec §2
- [x] RTL (ar): proprietăți logice `inset-inline-end`, `margin-inline` — `style.css` ~2512, ~2675
- [x] Chei i18n ×14 (`pw.*` verificate cu grep: 14/14 pe fiecare cheie)

## Ziua 2 — Mutații ✅ (implementat, în producție)

- [x] 🎲 Reroll (filtru activ, zero duplicate, ±15min/±10RON) — `rerollMeal()` ~655
- [x] ✕ Remove → slot gol — `removeMealSlot()` ~687
- [x] Toast schimbare + Undo un pas (inclusiv mutații în masă §2b: Generate = plan nou cu undo integral, „Golește planul") — `showChangeToast()`, `_pwUndo` ~750
- [x] Recalculare instant (cost zi, overview, shopping list, PDF payload) — lanțul ~2296, BRAIN §7
- [x] Pool epuizat = puls + tooltip, nu alert — BRAIN §1

## Ziua 3 — Picker ✅ (implementat, în producție)

- [x] Modal centrat ≥700px / bottom sheet <700px — `ensurePwPicker()` ~921, `pw-picker--sheet`
- [x] Search după nume (începe-cu > conține), diacritice normalizate — `pwSearchRecipes()` ~882
- [x] Search după ingredient (tier 3, `byIngredient` + badge „conține…") — ~890
- [x] Recomandări: „Potrivite cu planul tău" (replace) / „Rapide și ieftine" (add) — `pwRecommendations()` ~901
- [x] Keyboard: Esc / ↑↓ / Enter, focus trap, focus revine pe slot — `pwPickerKeydown()` ~1156
- [x] Duplicate manuale permise cu hint „• deja luni" — BRAIN §5

## Ziua 4 — QA ⚠️ (re-rulat automat 2026-07-10 pe `9e2bcffb`; partea manuală rămâne)

### 4a. QA automatizabil — RULAT 2026-07-10, TOATE PASS ✅

- [x] i18n: 26 chei `pw.*`, fiecare prezentă în toate cele 14 limbi (verificat per-limbă, nu doar count)
- [x] RTL: zero `right/left` fizice în zona `pw-` (singurul `left:50%` = centrare toast, simetric)
- [x] Touch targets: `.pw-btn` 44px bază / 30px doar pe `(hover:hover) and (pointer:fine)`;
      `.pw-pick-item` min-height 44px; `.pw-clear-plan` 44px pe `pointer:coarse`
- [x] Breakpoints: 1 col → 2 col la 700px; overview 2×2 → 4-across (spec §1)
- [x] Fără ellipsis/nowrap pe numele rețetei (spec §2 — wrap, nu ascundem)
- [x] Hover-reveal atenuat (opacity .55 → 1), nu opacity 0 (amendament 8 iul)
- [x] Analytics: toate cele 7 evenimente vechi prezente în bundle-urile minificate;
      `data-page-type` pe paginile generate (recipe ✓, pricing ✓)
- [x] Accesibilitate statică: 19 aria-label în app.js, aria-modal/selected/live/activedescendant prezente
- [x] `@media print` există (planul se poate printa)
- [x] Integrare: smoke-analytics 79/79 PASS; build verde: 3962 pagini (CI: 3800-4050),
      sitemap 4006 URL-uri, node --check OK, 0 curly quotes, 0 secrete
- [x] Min-files byte-identice cu sursele (zero drift)

### 4b. QA manual (fișă pentru producător — nu se poate automatiza de aici)

- [ ] Safari macOS + iOS: bottom sheet, tastatura nu acoperă rezultatele, focus după închidere
- [ ] Chrome: Lighthouse fără regresii vs. main; CLS la încărcare
- [ ] Firefox + Edge: smoke vizual (planner, picker, toast)
- [ ] RTL (ar) vizual: acțiunile pe partea corectă, sheet simetric — https://meal-planner.ro/ar/
- [ ] Nume lungi de/ru la 320px lățime de card (cele mai lungi: „Rumänische gegrillte
      Hackfleischröllchen" 40ch / „Салата де беф…" 53ch) — wrap acceptat, fără overflow orizontal
- [ ] Test pe telefon real: ținte 44px simțite, scroll blocat sub picker

## Ziua 5 — Preview + testare ⚠️ (parțial: producția e deja live)

- [ ] Preview deployment pe branch (Vercel preview la push pe `feature/planner-cards`)
- [ ] Checklist final = Quality Checklist din PRODUCT SPEC §10 (8 casete)
- [x] Protocol testare utilizatori — există: `docs/ai/USER_TEST_GUIDE.md` + SPEC §10
  („planifică-ți mesele săptămânii viitoare" + tăcere; 4/5 la întrebarea de încredere)
- [ ] Fișa de observație tipărită/pregătită pentru 5 testeri (min. 2 necunoscuți)

## Analytics Plan v2 ⬜ (spec înghețat, ZERO implementat — în afara Zilelor 1-5)

- [ ] `ALLOWED` client + `CLIENT_EVENTS` server: +7 evenimente (împreună! lecția `75f2b959`)
- [ ] Hook-uri: `rerollMeal`, `removeMealSlot`, `pwPickItem` ×2, checkbox agregat
      + flush `visibilitychange`, CTA premium, `exportShoppingListToPDF` outcome
- [ ] `scripts/smoke-analytics.mjs` actualizat
- [ ] Views SQL `weekly_return_v` / `plan_completed_v` în Supabase (manual)

_Se implementează DOAR cu acordul explicit al producătorului (regula: „nu modifica
funnel-ul decât dacă implementarea îl cere")._

---

## Ordinea de lucru rămasă (incremental, commit per etapă)

1. **Etapa 0** — sync branch ✅ + acest checklist + FUNNEL_ANALYTICS_PLAN.md commitate + build verde + smoke → commit + raport
2. **Etapa 1 (Ziua 4a)** — QA automatizabil: grep i18n ×14, build, count, node --check, curly quotes, smoke analytics → raport cu ce a picat
3. **Etapa 2 (Ziua 4b)** — fix-urile găsite la 4a (dacă există), unul per commit
4. **Etapa 3 (Ziua 4c)** — fișă QA manual (browsere/device-uri) pentru producător
5. **Etapa 4 (Ziua 5)** — push branch → preview deployment + Quality Checklist §10 + fișa de testare
6. **Etapa 5 (opțional, la decizia producătorului)** — Analytics v2

Fiecare etapă: build verde → smoke → commit → raport (implementat / testat /
lipsește / riscuri / conformitate cu spec).
