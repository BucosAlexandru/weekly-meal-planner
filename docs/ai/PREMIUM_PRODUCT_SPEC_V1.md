# Meal-Planner Premium Product Specification v1.1

_Data: 2026-07-08 (v1.1 — adăugate Product Principles, DoD, Quality Checklist, Product Review, North Star)_
_Status: aprobat pentru Etapa 1_
_Document viu — se actualizează cu versiuni, nu se apără. Deciziile contrazise de date se schimbă aici, nu se ignoră._

**Rolul documentului:** constituția produsului. Orice idee nouă (de la producător, de la ChatGPT, de la Claude) trece prin filtrul: ajută clientul principal? respectă principiile? se aliniază cu etapa curentă? putem măsura efectul? Dacă da → backlog. Dacă nu → rămâne o idee bună pentru mai târziu.

---

## 1. Viziunea produsului

**Nu construim un generator de meniuri. Construim cea mai bună aplicație de planificare a meselor pentru utilizatorul obișnuit.**

Nu pentru nutriționiști. Nu pentru culturiști. Nu pentru toată lumea. Pentru omul care își planifică mesele săptămânii: vrea să nu mai piardă 30 de minute gândindu-se ce gătește, să nu arunce mâncare, să nu meargă de trei ori la magazin, să mănânce ceva mai sănătos fără efort.

**Principiul central:** utilizatorii nu cumpără funcționalități, cumpără rezultate. PDF-ul, lista, plannerul sunt formate de livrare. Rezultatul vândut este: _„săptămâna mea alimentară e rezolvată în 2 minute."_

**Testul reușitei:** un utilizator obișnuit înțelege planul în 30 de secunde, iar un nutriționist nu s-ar jena să-l trimită unui client.

**Ce NU facem încă** (interzis până la Etapa 4-5): macros/calorii afișate, coach mode, white-label, verticale pentru nutriționiști. Motivul: produsul pentru utilizatorul obișnuit nu e încă excelent.

---

## 1b. Product Principles (constituția)

1. Fiecare ecran răspunde la: **„ce fac mai departe?"**
2. Fiecare funcționalitate economisește **timp, bani sau efort mental** — altfel nu intră. Testul: ce problemă rezolvă utilizatorului în sub 3 secunde? Dacă răspunsul cere un paragraf, funcția nu intră.
3. **Nu optimizăm pentru noi.** Producătorul nu e utilizatorul; intuițiile noastre sunt ipoteze, nu dovezi.
4. **Comportamentul utilizatorilor bate opiniile** — inclusiv ale noastre și ale AI-urilor.
5. **Simplu înainte de puternic.**
6. **Profesionist înainte de bogat în funcții.** Premium = eliminarea zgomotului, nu adăugarea de funcții.
7. **Regula celor 2 secunde.** Orice acțiune frecventă (schimb, scot, adaug, văd costul) se rezolvă în max. 2 secunde. Acțiunile rare pot costa mai mult; cele frecvente, niciodată.
8. **Fără formulare.** Plannerul se simte ca Notion/Apple Notes, nu ca un formular ANAF. Nicio acțiune de bază nu cere completat câmpuri.
9. **Predictibil, nu inteligent.** După 5 apăsări pe 🎲, utilizatorul trebuie să poată spune singur regulile („evită duplicatele, ține costul"). Magia neexplicabilă distruge încrederea; regulile simțite o construiesc.
10. **Constructor, nu generator.** Utilizatorul nu consumă un plan — își construiește planul (inclusiv ca instrument de negociere în familie: copilul nu vrea pește, soția vrea vegetarian). Generarea doar pornește procesul; atașamentul apare la finalizarea lui de către om.

---

## 1c. North Star

> Scopul nu e să generăm PDF-uri. Scopul e: **un utilizator generează un plan, revine săptămâna următoare și generează altul.**

Măsurabil de azi cu `mp:anon` id: % utilizatori cu `plan_generated` în două săptămâni consecutive. Dacă metrica asta crește constant, retenția, conversia și recomandările tind să urmeze. Toate pragurile din §7 sunt subordonate ei.

---

## 2. Principii de design

Ce înseamnă „premium" pentru acest produs:

1. **Claritate.** Un plan alimentar, nu un tabel Excel. Ierarhie vizuală: ziua → masa → detaliile.
2. **Spațiu alb.** Aglomerarea e inamicul percepției de calitate. Mai puține elemente, mai bine așezate.
3. **Consistență.** Aceleași fonturi, spacing, iconografie pe ecran și în PDF. (Design system formal: abia înainte de Etapa 4 — atunci doar tokens + 4-5 componente, nu un sistem complet.)
4. **Fiecare informație trebuie să-și câștige dreptul de a exista.** Nu adăugăm badge-uri, stele, scoruri „pentru că ar fi frumos". O informație apare doar dacă răspunde la o întrebare pe care utilizatorul chiar o are. Premium înseamnă de obicei _mai puțină_ informație, mai bine aleasă.
5. **Aplicația justifică, nu doar afișează.** Unde e ieftin de făcut, răspundem la „de ce?": rezumatul săptămânii (nr. mese, timp mediu, cost estimat) spune o poveste pe care tabelul n-o spunea.

---

## 3. User journey (starea țintă, Etapa 1)

```
Intrare (SEO / direct)
  → Homepage: plannerul vizibil imediat
  → Generare plan (1 click sau completare manuală)
  → Weekly Meal Plan: rezumat săptămână + 7 carduri de zi
  → Shopping Summary: listă pe categorii, cantități agregate, checkbox-uri
  → Generate PDF: document care pare cumpărat, nu exportat
  → Premium: beneficii clare ÎNAINTE de plată (zile deblocate, listă completă în PDF, PDF-uri nelimitate)
```

Ordinea contează: utilizatorul vede întâi plannerul, abia apoi lista, abia apoi oferta. Fiecare pas trebuie să merite pasul următor.

---

## 4. Specificația plannerului (redesign)

### Problema
Vederea actuală (`#plan-table`, rânduri `<tr>` generate în `public/js/app.js` ~linia 328-400) arată ca un tabel din Excel: Luni/Onigiri/Marți/Nasi Goreng. Nu comunică valoare.

### Ținta
Carduri pe zi, nu tabel. Pentru fiecare zi:

```
Monday
🍱 Lunch          Onigiri            20 min · ~18 RON
🌙 Dinner         Bacalhau à Brás    45 min · ~26 RON
```

Plus un **Week Overview** deasupra planului: 7 zile · 14 mese · timp mediu de gătit · cost estimat săptămânal. (Datele există: `time` și `costRon` în `recipes-meta.js`.)

### Ce informații afișează un card de masă și de ce

| Informație | De ce există | Sursă |
|---|---|---|
| Numele rețetei (localizat) | identificare | `recipes.js` `name.{lang}` |
| Timp de gătit | „am timp azi?" | `recipes-meta.js` `time` |
| Cost estimat | „îmi permit?" | `recipes-meta.js` `costRon` |
| 1-2 taguri max (ex. vegetarian, quick) | filtrare mentală rapidă | `tags` |

**Explicit exclus în v1:** stele de rating (Meal Prep ★★★★☆ etc.), dificultate, „shopping complexity", calorii. Se pot adăuga doar după ce interviurile arată că lipsesc — vezi principiul 4.

### Decizie de formă
Direcția (carduri aerisit) e decisă. Forma exactă NU se cercetează înainte — se livrează o variantă rezonabilă în Etapa 1 și se pune pe masă la interviurile din Etapa 2. Oamenii reacționează mai bine la ceva concret decât la abstracțiuni.

**Referințe de design** (inspirație, nu copiere — modelul lor de produs diferă): MyFitnessPal, Lifesum, Mealime, Paprika, AnyList, Apple Health. Ce împrumutăm: spațiu alb, tipografie disciplinată, o singură acțiune principală pe ecran.

### Definition of Done — Planner
- [ ] Responsive: mobil + desktop, fără layout shift (CLS)
- [ ] Print decent (planul se poate lipi pe frigider)
- [ ] Toate cele 14 limbi, fără overflow pe textele lungi (de, ru, ar RTL)
- [ ] Lighthouse fără regresii vs. main
- [ ] 5 utilizatori îl înțeleg fără explicații (testul din §8)

---

## 5. Specificația shopping list

### Situația (confirmată de audit, 2026-07)
Motorul profesionist există deja: `public/js/shopping-list.js` (~2260 linii) — parsing ingrediente, agregare cantități, normalizare unități, grupare pe categorii, etichete localizate. **Dar alimentează doar PDF-ul.** Lista de pe ecran (`updateShoppingList()`, `app.js` ~linia 1240) e o funcție naivă: dedup pe lowercase + sortare alfabetică. Fără cantități, fără categorii.

### Fix-ul (Sprint 1, banda grea)
`updateShoppingList()` se rescrie să consume `buildShoppingFromRawIngredients(pairs, lang)` — deja importat în `app.js` (linia 7) — construind perechile `{en, loc}` exact ca `buildPdfV2Payload()` (liniile ~714-725). Se renderizează structura `[{category, label, items:[{name, qty}]}]`.

### Ținta vizuală

```
🥬 Vegetables & herbs
□ 4 onions
□ 2 tomatoes

🥩 Meat
□ 700 g chicken breast

🧂 Pantry
□ olive oil · salt · rice        (fără cantități — staples)
```

Ordinea categoriilor: vegetables, meat, dairy, dry, sauces, bakery, misc, pantry (deja definită în motor).

### Criterii de acceptare (definiția lui „Done")
- [ ] Fără duplicate („1 onion chopped" + „2 onions diced" → „3 onions")
- [ ] Cantități agregate și unități normalizate (g/ml)
- [ ] Grupare pe categorii cu etichete localizate; fallback la EN unde `CATEGORY_LABELS` e incomplet
- [ ] Checkbox-uri funcționale
- [ ] Arată bine pe mobil
- [ ] PDF-ul rămâne neafectat (folosește deja același motor)
- [ ] Funcționează în toate cele 14 limbi (ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko)
- [ ] Comportamentul de gating free/premium rămâne identic

„Codul merge" nu înseamnă Done. Lista de mai sus înseamnă Done.

### Known issue (preexistent, afectează și PDF-ul)
Două ingrediente EN diferite pot avea aceeași traducere localizată (ex. RO „smântână grasă", HI „नींबू का रस") și apar ca două rânduri cu același nume. Cauza e în dicționarul motorului, nu în UI. Backlog, banda rapidă — nu blochează Done-ul.

### Amânat pentru mai târziu (după validare)
Buget estimat de cumpărături, „You already have these?" / hide pantry staples. Idei bune, dar trebuie să-și câștige dreptul prin interviuri.

---

## 6. Specificația PDF

### Situația
PDF v2 există (`api/generate-pdf.js`, @react-pdf/renderer): masthead, hero cu statistici, THE PLAN pe zile, SHOPPING LIST grupată, tip box, upsell, footer. Fonturi per limbă. Gating server-side (free = 2 zile, fără shopping list).

### Ținta
Documentul trebuie să pară **cumpărat, nu exportat** (referințe de calitate: MyFitnessPal, Lifesum): spațiu alb generos, tipografie disciplinată, iconografie consistentă, pagini clare. Structura rămâne: titlu + săptămână → rezumat → zile → shopping list la final.

### Definition of Done — PDF
- [ ] Un utilizator din testul de 5 persoane spune neîntrebat „l-aș printa / l-aș salva"
- [ ] Vizual consistent cu plannerul de pe ecran (aceleași informații, aceeași ierarhie)
- [ ] Toate limbile suportate: fără overflow, fără text tăiat, fără pagini rupte la mijloc de secțiune (`wrap: false` pe blocuri)
- [ ] Trece `scripts/stress-test-pdf.mjs` (ar rămâne blocat client-side — bug bidi cunoscut)

---

## 7. Măsurare: praguri stabilite ÎNAINTE de a vedea datele

Funnel-ul instrumentat (first-party, `public/js/analytics.js` → `/api/event` → Supabase):
`page_view → plan_generated → pdf_click → email_submitted → checkout_started → subscription_active`

**Gap de instrumentare de închis în Sprint 1:** nu există eveniment pentru interacțiunea cu shopping list (ex. `shopping_list_viewed` / check pe item) și nici pentru vizualizarea ofertei Premium (`premium_viewed`). Fără ele, decizia de la ziua 30 nu se poate lua. Se adaugă în whitelist-ul din `api/event.js` + client.

**Praguri de decizie (estimări grosiere, fixate acum ca să nu raționalizăm după):**

| Metrică | Sub prag = problemă de... | Prag orientativ |
|---|---|---|
| vizitatori → plan_generated | experiență / promisiunea homepage | < 25% |
| plan_generated → pdf_click | valoarea percepută a output-ului | < 20% |
| pdf_click → email_submitted | fricțiune / încredere | < 40% |
| premium_viewed → checkout_started | ofertă / preț / comunicare | < 5% |
| revenire în 7 zile (anon id) | retenție / utilitate reală | < 10% |

Interpretare la ziua 30: apreciază dar nu plătesc → problema e oferta/monetizarea; pleacă înainte de plan → problema e experiența; generează și revin dar ignoră Premium → valoarea Premium trebuie regândită.

---

## 8. Cercetare utilizatori (Etapa 2, în paralel)

**5-10 interviuri scurte**, categorii diferite (părinți, persoane singure, sportivi, 50+). Minim 2-3 din 5 testeri să NU fie cunoscuți personal (grupuri de gătit/meal prep, utilizatori existenți). Testul se face pe telefonul lor, fără explicații de la noi.

**Întrebăm despre comportament, nu despre aplicație:**
- Cum îți planifici mesele acum? Cât durează? Ce te enervează?
- Ce faci când nu ai idei? Cât de des arunci mâncare?
- Faci listă de cumpărături? Cum? Ai folosit alte aplicații? Ce nu ți-a plăcut?

**Întrebarea de acceptare pentru Etapa 1** (nu „îți place?"):
> „Ai avea încredere să folosești asta săptămâna viitoare?"

Etapa 1 e terminată când 4 din 5 spun da. Interviurile sunt terminate când aceleași probleme încep să se repete.

**Lecția de reținut** (interviul #1, iulie 2026): „nu aș plăti pentru un PDF" ≠ produsul n-are viitor. Înseamnă: valoarea percepută a fost insuficientă SAU nu e clientul principal. Cauza se află prin date + interviuri, nu se presupune.

---

## 9. Etape și backlog

| Etapă | Conținut | Criteriu de terminare |
|---|---|---|
| **1. Professional Output** 🟢 (3-4 săpt.) | Shopping list (motor existent → UI), planner redesign (carduri + overview), PDF premium | 4/5 testeri: „aș folosi-o săptămâna viitoare" |
| **2. Înțelegerea utilizatorilor** 🟢 (paralel) | Analytics complet pe funnel + 5-10 interviuri | problemele se repetă; pragurile din §7 evaluate |
| **3. Alegerea direcției** 🟡 | Clientul principal (familie / meal prep / buget / sănătos) | ales pe date (cine revine + plătește), nu în ședință |
| **4. Premium Value** 🟡 | valoare reală pe direcția aleasă (personalizare, obiective; eventual macros) | conversia premium crește măsurabil |
| **5. Verticale** 🔴 | coach mode, nutriționiști, white-label | doar după 1-4 |

Design system (tokens + componente de bază): înainte de Etapa 4.

**Regula backlog-ului:** nu se construiește nimic pe „poate e util / poate le place". Orice task răspunde la o întrebare din §7 sau §8.

---

## 10. Procesul de lucru — două benzi

**Banda grea** — orice atinge experiența utilizatorului (planner, listă, PDF, onboarding, pricing):

```
Problemă → Audit → Specificație → Mockup → Feedback → Implementare (branch separat) → Preview → Test → Merge
```

**Banda rapidă** — bug-uri, traduceri, padding, orice sub ~1 oră:

```
Fix → Test → Merge
```

Fără implementare direct în `main` pe banda grea. O etapă e „Done" când îndeplinește criteriul de acceptare stabilit **înainte** — nu când build-ul e verde și nu când Claude spune „done".

### Quality Checklist — înainte de orice merge pe banda grea

```
□ Responsive (mobil + desktop)      □ Localization (14 limbi, fără overflow)
□ Accessibility (focus, contrast)   □ PDF neafectat (preview-pdf.mjs)
□ Performance (Lighthouse, bundle)  □ Analytics (evenimentele încă emit)
□ SEO (paginile generate intacte)   □ CI verde (count HTML, node --check, secrete)
```

Banda rapidă: doar testul relevant + CI. Checklist-ul complet pe fix-uri de o oră ar ucide viteza.

### Product Review — la sfârșitul fiecărui sprint, 5 întrebări

1. Un utilizator nou ar înțelege ce s-a livrat, fără explicații?
2. Un părinte ocupat l-ar folosi?
3. **Ce arată datele că utilizatorii au făcut diferit după acest sprint?** (nu „mi-ar plăcea mie?" — producătorul nu e utilizatorul, principiul 3)
4. Economisește timp real?
5. **Ce eliminăm?** (nu „ce mai adăugăm?")

---

## 11. Planul pe 30 de zile (de la 2026-07-08)

Ordinea de implementare ≠ ordinea din user journey (plannerul e primul văzut, dar shopping list era quick win cu motor existent și risc zero — decizie închisă, implementată pe `feature/shopping-list-engine-ui`, 2026-07-08).

| Săpt. | Livrabil | Bandă |
|---|---|---|
| 1 | ✅ Shopping list pe ecran conectată la motorul existent (LIVRAT 2026-07-08) + evenimente analytics noi (`shopping_list_viewed`, `premium_viewed`) | grea (dar spec = acest document) |
| 2 | Planner redesign: carduri + Week Overview | grea |
| 3 | PDF polish + testul cu 5 persoane | grea |
| 4 | Interviuri finalizate + citirea pragurilor din §7 → **decizia de direcție (Etapa 3)** | — |

La finalul celor 30 de zile, decizia se ia pe dovezi, conform tabelului din §7.
