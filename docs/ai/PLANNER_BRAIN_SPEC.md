# Planner Brain — Cum decide plannerul v1.0

_Data: 2026-07-08 · Părinte: PREMIUM_PRODUCT_SPEC_V1.md §4, PLANNER_RESPONSIVE_SPEC.md_
_Acest document răspunde la „cum gândește", nu la „cum arată". Interfața doar afișează deciziile de aici._

**Filosofia:** constructor de plan, nu generator. Generatorul pornește procesul; utilizatorul îl termină. Fiecare decizie de mai jos servește mantra: _„utilizatorul își construiește propriul plan în sub două minute."_

---

## 1. Reroll (🎲) — ce caută și de ce

**Criterii v1, în ordine:**
1. Respectă filtrul activ (`window._activeFilter`: all / asian / veg / budget / quick / family).
2. Nu e deja în planul curent (zero duplicate la reroll).
3. Din pool-ul rămas: preferă rețete cu **timp ±15 min și cost ±10 RON** față de rețeta înlocuită; dacă pool-ul „similar" e gol, cade pe aleator din pool-ul valid.

**Ce NU folosește v1 și de ce:** aceeași proteină / aceeași categorie / aceeași bucătărie — metadata nu există consistent în recipes.js (protein doar ca tag sporadic, cuisine parțial). Nu construim logică pe date pe care nu le avem (principiul 4). Se adaugă când metadata devine completă.

**Pool epuizat** (toate rețetele din filtru sunt în plan): butonul pulsează scurt + tooltip „Ai folosit toate rețetele din acest filtru" — nu alert, nu eroare.

## 2. Explicația + Undo (o singură componentă: toast-ul de schimbare)

După orice reroll sau selecție din picker:

```
Onigiri → Bibimbap   ·   +7 RON   ·   [Anulează]
```

- Delta de cost (și de timp dacă |Δ| ≥ 10 min) — calculabile, deci adevărate. NU afișăm motive pe care nu le-am folosit („mai gustos" etc.).
- **Undo = un pas înapoi** (ultima schimbare). Nu istoric multi-pas în v1. Toast vizibil ~6s; Undo restaurează rețeta anterioară și recalculează tot.
- Remove (✕) primește același toast: „Onigiri scos · −18 RON · [Anulează]".

Acesta e Nivelul 3 (încredere): utilizatorul vede exact ce s-a schimbat și poate repara instant orice greșeală.

## 2b. Mutații în masă — „lesa" generatorului (adăugat 8 iul, bug găsit de producător)

Problema: Generate peste un plan existent suprascria tot fără avertisment și fără undo, iar golirea planului nu exista ca gest (14 × ✕ sau refresh — inacceptabil).

Decizia — **orice mutație în masă primește același tratament ca una măruntă** (§2):
1. **Generate = săptămână NOUĂ, completă** — umple TOATE sloturile, nu doar cele goale (regula veche „păstrează editările manuale sărind sloturile pline" făcea regenerarea imposibilă: Generate pe plan plin nu făcea nimic). Protecția muncii manuale se face prin REVERSIBILITATE, nu prin evitare: toast „Plan nou generat · Anulează" restaurează integral planul anterior. Fără dialog de confirmare — confirmarea E undo-ul.
2. **„Golește planul"** — buton discret în header-ul plannerului, doar în modul săptămână, vizibil doar când planul are măcar o masă → golește tot + toast „Plan golit · Anulează".
3. Undo-ul rămâne un pas: o mutație nouă (măruntă sau în masă) înlocuiește snapshot-ul.

## 3. Search în picker — ordinea rezultatelor (decisă)

Trei niveluri de potrivire, afișate în această ordine, fără scoruri inventate:

1. **Numele începe cu** query-ul (în limba activă, fallback EN).
2. **Numele conține** query-ul.
3. **Un ingredient conține** query-ul (cu badge „conține pui").

În interiorul fiecărui nivel: sortare după **timp de gătit crescător** (proxy onest pentru „ușor de făcut azi"; avem datele). Diacriticele se normalizează (ș→s). NU sortăm după popularitate/rating — nu avem datele și nu le inventăm.

## 4. Recomandări în picker (înainte de search)

Când picker-ul se deschide pentru ÎNLOCUIRE (slot ocupat), înainte de listă apare secțiunea **„Potrivite cu planul tău"** — max 3 rețete:

- respectă filtrul activ, nu-s în plan, timp ±15 min și cost ±10 RON față de rețeta curentă;
- sortate după apropierea de cost;
- eticheta spune adevărul: potrivite cu *planul* (timp/cost), nu „pentru tine" (nu avem profil de gust încă).

Pentru slot GOL: recomandările devin „Rapide și ieftine" (top 3 după timp+cost din filtrul activ). Sub recomandări: „Toate rețetele" — lista completă cu search.

## 5. Duplicate (decis)

- **Reroll**: niciodată duplicate (§1).
- **Alegere manuală din picker**: PERMISĂ — dacă omul vrea aceleași paste de 3 ori, intenția lui bate regula noastră. Picker-ul arată un hint discret pe rețetele deja folosite: „• deja luni". Lista de cumpărături agregă corect cantitățile dublate (motorul face asta deja).

## 6. Costul (sursă și onestitate)

- Sursa: `costRon` din `recipes-meta.js` — estimare manuală per porție, prețuri RO (supermarket mediu). Nu per magazin, nu live.
- Afișare: întotdeauna cu `~`. RO: RON; alte limbi: `~€` la cursul fix 4.97 (logica existentă din `mealPayload`).
- Costul zilei = suma meselor; costul săptămânii (overview) = suma tuturor meselor. Un singur mod de calcul peste tot — pe ecran, în toast, în PDF — ca cifrele să bată între ele.
- Rețetele fără `costRon` nu contribuie la sume și nu afișează chip de cost (nu punem 0, nu inventăm).

## 7. Recalculare — când și ce (decis: totul, instant, fără reload)

Orice mutație a planului (reroll, pick, remove, add, generare) declanșează, sincron:

| Se actualizează | Sursa |
|---|---|
| Costul zilei | suma meselor zilei |
| Week Overview (mese, timp mediu, cost, bucătării) | agregare plan |
| Lista de cumpărături | `updateShoppingList()` → motorul de normalizare |
| Starea butonului PDF + payload | `buildPdfV2Payload()` la export (citește starea live) |
| Toast schimbare | delta vechi→nou |

Nimic nu așteaptă refresh. Nivelul 1 din straturi („pot să-mi fac planul?") depinde de fluiditatea acestei bucle.

## 8. Slotul gol (copy decis)

```
➕ Adaugă prânzul
   caută după rețetă sau ingredient
```

(două rânduri, al doilea discret; „prânzul"/„cina" localizat, cheile merg în toate cele 14 limbi)

## 9. Backlog explicit (NU în v1, în ordinea de după 22 iulie)

1. **Istoric / „Folosește planul de săptămâna trecută"** — cel mai puternic răspuns la „de ce revin luni dimineață?"; localStorage, ieftin. Primul după deadline.
1b. **Panou lateral de detaliu rețetă** (poză, ingrediente, Înlocuiește / Vezi rețeta — fără a părăsi plannerul). Schimbă centrul de greutate al aplicației de pe pagina de rețetă pe planner. Candidat puternic post-22, dar în v1 click pe nume = picker (acțiunea frecventă e înlocuirea → regula celor 2 secunde); detaliul e acțiune rară și își așteaptă rândul.
1c. **Swap/mutare între sloturi** (feedback producător, 8 iul ×2). Design în două straturi:
   - **Strat 1 — swap prin click** (~1 zi, merge pe touch și desktop identic): gest „mută" pe masă → sloturile devin ținte evidențiate → click pe destinație → mesele fac schimb + toast cu Anulează. Recalculare completă.
   - **Strat 2 — drag & drop ca îmbunătățire de desktop** (1-2 zile + QA): peste ACEEAȘI funcție de swap. Pe touch NU se face DnD nativ (conflict cu scroll, API HTML5 nefuncțional pe mobil) — telefonul rămâne pe click-swap.
   - **Validare întâi**: în testele cu utilizatori se observă dacă oamenii încearcă instinctiv să tragă cardurile (rând dedicat în fișa de observație). 3+/5 încearcă → prioritate; 0 → economisită o săptămână.
1d. **Generatorul disponibil oriunde — modelul „coș de plan"** (feedback producător, 8 iul ×2). NU se încorporează plannerul în paginile statice (scump arhitectural). În schimb: „Add to my meal plan" pe rețete/hub-uri adaugă rețeta într-un coș persistat (localStorage) FĂRĂ să părăsești pagina; badge plutitor „🥗 N" jos-dreapta (zona degetului mare); la deschiderea plannerului, coșul se varsă în primele sloturi libere (+ toast cu Anulează). Transformă cele ~3000 pagini SEO în puncte de culegere pentru planner. DnD de pe cardul de rețetă spre badge = polish de desktop, după. Post-22.

   **Regulile de intuitivitate (decise 8 iul)** — pattern-ul e coșul de e-commerce, singurul limbaj UI pe care îl știe deja toată lumea; NU se inventează metaforă nouă:
   - Feedback < 1s la adăugare: butonul devine „✓ În plan", pastila saltă, contorul crește. Fără feedback vizibil, gestul nu există.
   - Pastila NU apare când coșul e gol (informația își câștigă dreptul); prima apariție = momentul de învățare.
   - Tap pe pastilă → mini-listă (nume + ✕ per rețetă) + CTA „Construiește planul (N) →".
   - La sosirea în planner: intrare automată în sloturi libere, fără dialoguri — corectura se face cu gesturile existente (🎲/✕/swap); toast cu Anulează.
   - Criteriu de reușită la testare: nimeni nu întreabă „ce face asta?" — dacă pare cumpărături, e intuitiv.
2. Favorite ❤️ (localStorage; devine și sursă de date pentru recomandări reale).
3. kcal/proteine pe zi — după auditul câmpului `nutrition` din recipes.js (acoperire + corectitudine). Faza 2 din roadmap.
4. Reroll cu criterii de proteină/bucătărie — după completarea metadatei.
5. Undo multi-pas.

**Interzis până la date reale:** rating, stele, trending, popular, chef's choice, gourmet, funny — orice etichetă pe care n-o putem susține cu date.

---

## Răspunsurile scurte la semnele de întrebare

| Întrebare | Decizie |
|---|---|
| Ordinea în search? | începe-cu > conține > ingredient; în nivel: timp crescător (§3) |
| Duplicate? | reroll: nu; manual: da, cu hint (§5) |
| 🎲 ce caută? | filtru activ + fără duplicate + timp/cost similar când se poate (§1) |
| Costul de unde? | estimare manuală per porție, RO, afișată cu ~; un singur calcul peste tot (§6) |
| Lista se schimbă instant? | da, orice mutație → tot lanțul, sincron (§7) |
