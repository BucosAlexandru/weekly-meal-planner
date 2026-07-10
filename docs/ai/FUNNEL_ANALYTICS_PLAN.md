# Funnel Analytics — Implementation Plan v2

> Extinde MVP-ul existent (`public/js/analytics.js` → `/api/event` → Supabase `events`)
> cu evenimentele de engagement ale noului planner, rafinarea funnel-ului Premium
> și cele două metrici-cheie derivate: **weekly_return** și **plan_completed**.
>
> Înlocuiește schița din `PREMIUM_PRODUCT_SPEC_V1.md` §7 ca document de referință
> pentru instrumentare. Principiu de selecție (aplicat fiecărui eveniment de mai jos):
> *„Dacă peste o lună acest eveniment are o valoare neașteptată, ce decizie concretă iau?"*
> Evenimentele fără un răspuns clar au fost respinse (vezi §8).

---

## 0. Starea actuală (implementat, în producție)

| Eveniment | Sursă | Props actuale |
|---|---|---|
| `page_view` | client, auto la load | `pageType` (home/recipe/plan/pricing/other), + `lang`, `path`, `country` pe rând |
| `plan_generated` | client, `app.js` ~2552 | `filter` (all/vegetarian/…) |
| `shopping_list_viewed` | client, IntersectionObserver ~5939 | `items` (număr) |
| `premium_viewed` | client, IntersectionObserver ~5954 | `source` (id-ul secțiunii) |
| `pdf_click` | client, `attachPdfListeners()` ~2597/2608 | `tier` (free/premium) |
| `email_submitted` | client ~5642 | — |
| `checkout_started` | client, `checkout.js` | `source` (mpPageType) |
| `subscription_active` | **server-only**, Stripe webhook | `email_hash` pe rând |

Infrastructură: whitelist dublu (client `ALLOWED` + server `CLIENT_EVENTS`),
sendBeacon, rate-limit per anon_id, fără cookies/PII, `anon_id` în localStorage
(`mp:anon`), join cu plata prin `client_reference_id` → `email_hash`.

**Acquisition (SEO) rămâne neatins.** `page_view` + `lang` + `path` + Search
Console acoperă tot ce trebuie. Nu se adaugă nimic aici.

---

## 1. Evenimente noi — Engagement (planner)

Toate au un singur punct de emisie fiecare, deja existent în cod. Nu se
instrumentează tastare, hover, deschidere de picker sau navigare internă.

### 1.1 `planner_reroll`
- **Hook:** `rerollMeal(inputId, btn)` — `app.js` ~655, după ce slotul chiar
  s-a schimbat (nu la click-uri fără efect: pool gol / aceeași rețetă).
- **Props:** `{ slot_type: 'lunch'|'dinner'|'breakfast' }` (derivat din `inputId`).
- **Decizie:** media reroll/plan ≈ 0,2 → generatorul nimerește; ≥ 3-4 → schimbăm
  algoritmul de generare (diversitate, timp, cost). Per `slot_type`: dacă doar
  cinele se rerollează, problema e pool-ul de cine, nu generatorul.

### 1.2 `planner_recipe_changed`
- **Hook:** `pwPickItem(idx)` — `app.js` ~1187, ramura `wasFilled === true`
  (mode 'replace'), doar dacă `newText !== prevValue`.
- **Props:** `{ slot_type, via_search: boolean, query_type?: 'recipe'|'ingredient' }`.
  `via_search` = input-ul `#pw-picker-search` era nevid la selecție;
  `query_type` = `byIngredient` din `pwSearchRecipes()` (~882) pe item-ul ales
  — **nu se salvează niciodată textul căutat**, doar tipul.
- **Decizie:** rată mare de înlocuiri manuale = „nu vreau aleator" → investim în
  preferințe/personalizare, nu în mai mult random.

### 1.3 `planner_recipe_removed`
- **Hook:** `removeMealSlot(inputId)` — `app.js` ~687.
- **Props:** `{ slot_type }`.
- **Decizie:** dacă un tip de masă e scos sistematic (ex. prânzurile), planul
  default are prea multe mese de acel tip → schimbăm structura default a săptămânii.

### 1.4 `planner_search` — **absorbit, nu eveniment separat**
Selecția după căutare se emite deja ca prop (`via_search`, `query_type`) pe
`planner_recipe_changed` / `planner_empty_slot_added` — același semnal, zero
evenimente în plus, imposibil de dublu-numărat. Nu se emite nimic la tastare
și nu se stochează query-ul.

### 1.5 `planner_empty_slot_added`
- **Hook:** `pwPickItem(idx)` — aceeași funcție, ramura `wasFilled === false`
  (mode 'add', slot gol umplut manual).
- **Props:** `{ slot_type, via_search, query_type? }`.
- **Decizie:** folosire mare a slotului gol = oamenii vor să-și construiască
  planul, nu doar să-l primească → prioritizăm plan cart / favorites în flux.

**Notă undo:** toast-ul cu undo (§2 din PLANNER_BRAIN_SPEC) poate anula oricare
din acțiunile de mai sus. Nu emitem eveniment de undo și nu retragem evenimentul
emis — la volumele actuale zgomotul e neglijabil, iar simetria (schimbat înapoi
= tot o interacțiune) e acceptabilă. Reevaluăm doar dacă testele arată undo masiv.

---

## 2. Evenimente noi — Shopping

### 2.1 `shopping_item_checked` — agregat, nu per click
- **Hook:** listener delegat pe `#shopping-list` pentru `.shopping-check`
  (checkbox-urile există deja, `app.js` ~2201). **Nu** se trimite la fiecare
  bifă: se acumulează local și se emite **o singură dată per vizită**, la
  `visibilitychange → hidden` (sendBeacon e făcut exact pentru asta) sau la
  regenerarea listei.
- **Props:** `{ checked: <max bifate simultan>, total: <itemi în listă> }`.
- **Decizie:** `checked/total` mare = lista e folosită la cumpărături reale →
  merită investiție (cantități editabile, persistență); aproape zero = lista e
  doar citită → PDF-ul e purtătorul de valoare, nu bifele.

### 2.2 `shopping_category_expanded` — **amânat**
Categoriile (`.shopping-group`) sunt permanent expandate în UI-ul actual — nu
există interacțiune de măsurat. Se adaugă doar dacă/când categoriile devin
colapsabile. (Exemplu de eveniment care ar fi fost „după inspirație".)

---

## 3. Rafinare — Premium

### 3.1 `premium_cta_clicked`
- **Hook:** click pe CTA-urile de upgrade (selectorii deja centralizați pentru
  checkout: `.btn-upgrade`, CTA-urile din pricing/preview — vezi `checkout.js`
  și comentariul din `app.js` ~4603). Se emite **înainte** de `checkout_started`
  (care rămâne = sesiune Stripe chiar creată).
- **Props:** `{ source: mpPageType(), placement: <id/clasă buton> }`.
- **Decizie:** separă „mulți văd, puțini apasă" (problemă de ofertă/copy →
  schimbăm mesajul) de „apasă dar nu ajung la checkout" (problemă tehnică/preț
  → reparăm fluxul). `premium_viewed → premium_cta_clicked → checkout_started`
  devine măsurabil pe fiecare treaptă.

### 3.2 `pdf_download_attempt` (evoluția lui `pdf_click`)
- **Hook:** dispatcher-ul unic `exportShoppingListToPDF()` + handler-ele
  existente din `attachPdfListeners()`.
- **Props:** `{ tier: 'free'|'premium', outcome: 'ok'|'blocked'|'error' }` —
  `blocked` = gating (limită free / email gate), `error` = endpoint-ul a eșuat.
- **Migrare:** `pdf_click` rămâne în whitelist ~30 zile în paralel (dashboard-ul
  vechi nu se rupe), apoi se scoate. Alternativ minim-invaziv: păstrăm numele
  `pdf_click` și adăugăm doar prop-ul `outcome`.
- **Decizie:** mulți `blocked` pe free = gate-ul e la locul potrivit (presiune
  reală spre premium); mulți `error` = pierdem conversii din motive tehnice.

### 3.3 `pdf_preview_started` — **doar dacă există un preview distinct**
Azi butonul generează direct PDF-ul; nu există etapă separată de preview în
fluxul plătit. Se adaugă abia odată cu experiența PDF v2 (preview înainte de
download, `PDF_EXPERIENCE_PLAN.md`), cu hook în componenta de preview.

### 3.4 Neschimbate
`checkout_started`, `subscription_active`, `email_submitted` rămân cum sunt.

---

## 4. Metrici derivate — NU evenimente client

Cele mai importante două numere din tot documentul **nu se instrumentează în
browser** — se calculează din datele existente. Zero cod client, zero risc.

### 4.1 `weekly_return` — KPI-ul principal
Definiție: un `anon_id` care generează/modifică un plan în două săptămâni
calendaristice diferite, la 5-14 zile distanță.

```sql
-- Utilizatori care au revenit săptămâna următoare (rulare săptămânală)
with plan_events as (
  select anon_id, date_trunc('week', ts) as wk, min(ts) as first_ts
  from events
  where event in ('plan_generated', 'planner_reroll',
                  'planner_recipe_changed', 'planner_empty_slot_added')
    and anon_id is not null
  group by 1, 2
)
select a.wk as cohort_week,
       count(distinct a.anon_id)                as active,
       count(distinct b.anon_id)                as returned_next_week,
       round(100.0 * count(distinct b.anon_id)
             / nullif(count(distinct a.anon_id), 0), 1) as pct
from plan_events a
left join plan_events b
  on b.anon_id = a.anon_id
 and b.wk = a.wk + interval '7 days'
group by 1
order by 1 desc;
```

Limită cunoscută: `anon_id` trăiește în localStorage → alt device / private
mode / clear = utilizator „nou". Subestimează retenția; acceptabil, e
consecvent în timp. **Acesta e numărul urmărit obsesiv — nu checkout, nu PDF.**

### 4.2 `plan_completed`
Definiție (derivată, nu emisă): un `anon_id` care în aceeași zi are
`plan_generated` **și** cel puțin o personalizare (reroll/changed/removed/
empty_slot) **și** `shopping_list_viewed`. Adică: a generat, a ajustat ce voia,
a ajuns la listă — „gata, planul e terminat".

```sql
select day, count(*) as plans_completed from (
  select anon_id, date_trunc('day', ts) as day
  from events
  where anon_id is not null
  group by 1, 2
  having bool_or(event = 'plan_generated')
     and bool_or(event in ('planner_reroll','planner_recipe_changed',
                           'planner_recipe_removed','planner_empty_slot_added'))
     and bool_or(event = 'shopping_list_viewed')
) t group by 1 order by 1 desc;
```

De ce derivat și nu eveniment: definiția „complet" va mai fi ajustată (poate
intră și PDF-ul, poate iese personalizarea). O definiție în SQL se schimbă
într-un minut, retroactiv pe toate datele; un eveniment client greșit e
zgomot permanent. Dacă după 2-3 luni definiția se stabilizează, promovăm.

---

## 5. Funnel-ul complet (țintă)

```
SEO Visit (page_view)
      │
      ▼
Generate Plan (plan_generated)
      │
      ▼
Customize Plan ──── planner_reroll
      │        ├─── planner_recipe_changed   (via_search ⇒ „search")
      │        ├─── planner_recipe_removed
      │        └─── planner_empty_slot_added
      ▼
Shopping List (shopping_list_viewed, shopping_item_checked)
      │
      ▼
Plan Completed (derivat SQL §4.2)
      │
      ├── premium_viewed
      ├── premium_cta_clicked
      ├── pdf_download_attempt
      ▼
Checkout (checkout_started)
      │
      ▼
Subscription (subscription_active)
      │
      ▼
Returned Next Week (derivat SQL §4.1 — KPI principal)
```

---

## 6. Modificări tehnice (checklist de implementare)

1. **`public/js/analytics.js`** — extinde `ALLOWED` cu:
   `planner_reroll`, `planner_recipe_changed`, `planner_recipe_removed`,
   `planner_empty_slot_added`, `shopping_item_checked`, `premium_cta_clicked`,
   `pdf_download_attempt`. (Lecție învățată: commit `75f2b959` — whitelist-ul
   client și server **trebuie** modificate împreună, altfel drop silențios.)
2. **`api/event.js`** — aceleași nume în `CLIENT_EVENTS`. Opțional: validare
   props (chei cunoscute, valori scurte) ca să nu intre junk în `jsonb`.
3. **`public/js/app.js`** — 5 hook-uri: `rerollMeal`, `removeMealSlot`,
   `pwPickItem` (2 ramuri), delegatul de checkbox + flush pe `visibilitychange`,
   click CTA premium, `exportShoppingListToPDF` (outcome).
4. **Fără migrare DB** — schema `events` (jsonb `props`) acoperă tot.
5. **`scripts/smoke-analytics.mjs`** — adaugă noile evenimente în smoke test.
6. **SQL-urile din §4** — salvate ca views (`weekly_return_v`,
   `plan_completed_v`) în Supabase, rulate manual săptămânal (dashboard mai
   târziu, doar dacă ritualul manual devine enervant).
7. **Min-files:** regenerat `analytics.min.js` / `app.min.js`.

Estimare: toate hook-urile sunt în puncte unice, deja identificate — o zi de
lucru cu tot cu smoke test. Rate-limit-ul existent (120 ev/min/anon) acoperă
lejer și noile evenimente.

---

## 7. Praguri de decizie (setate ÎNAINTE de a vedea datele)

| Metrică | Se citește după | Semnal → decizie |
|---|---|---|
| reroll-uri / plan | 2 săpt. | ≤ 0,5 ok · ≥ 3 → refacem generatorul |
| % planuri cu ≥1 editare manuală | 2 săpt. | ≥ 40% → preferințe > random; ~0% → UI-ul de editare nu se vede |
| checked/total pe shopping | 3-4 săpt. | ≥ 30% → investim în listă · ~0 → PDF-ul e produsul |
| premium_viewed → cta_clicked | 2 săpt. | < 2% → copy/ofertă · > 10% cu checkout slab → flux/preț |
| pdf blocked / attempts (free) | 2 săpt. | mare = gate corect; corelat cu checkout spune dacă gate-ul convertește |
| **weekly_return** | 4-6 săpt. | **singurul număr care validează produsul**; orice creștere susținută > orice conversie |
| plan_completed / plan_generated | 2 săpt. | mic → oamenii generează dar nu folosesc → problema e în customize/shopping, nu în acquisition |

---

## 8. Respinse explicit (ca să nu revină „după inspirație")

- fiecare tastă în search, textul căutat (privacy + zero decizie)
- deschiderea picker-ului fără selecție, hover, scroll depth
- eveniment per checkbox bifat (agregat e suficient)
- `shopping_category_expanded` (nu există colaps — §2.2)
- `pdf_preview_started` (nu există preview — §3.3)
- evenimente de undo, favorites-click, plan-cart-click — se adaugă doar dacă o
  decizie concretă depinde de ele, cu întrebarea din preambul aplicată în PR
