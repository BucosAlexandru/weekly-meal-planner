# PDF Experience — plan în 3 pași

_Data: 9 iul 2026 · Declanșator: feedback producător pe meal-plan-2/3/4.pdf („jumate de informație, fără personalitate")_

## Modelul: un PDF, trei momente

| Moment | Întrebarea utilizatorului | Secțiunea din PDF |
|---|---|---|
| **Frigiderul** | „ce mâncăm azi?" | pag. 1 — săptămâna dintr-o privire (grilă compactă) |
| **Bucătăria** | „gătesc X — ce-mi trebuie și cât?" | zilele, cu TOATE ingredientele + cantități per rețetă |
| **Magazinul** | „ce cumpăr?" | lista agregată pe categorii (existentă, curățată) |

Regula: fiecare vedere își are momentul; nu se amestecă (lista de magazin NU se mapează înapoi pe rețete — bucătăria răspunde la aia).

## Pasul 1 — Conținutul complet ([]acum)

- Ingredientele per rețetă: TOATE, cu cantități (rândurile localizate complete din recipes.js) — dispare „+N more", dispare lista fără cantități.
- Restructurare secțiuni: 01 Săptămâna dintr-o privire (grilă 7 zile, nume + minute) → 02 Zi cu zi (bucătăria) → 03 Lista de cumpărături.
- Layout: ingrediente pe 2 coloane per rețetă; blocurile de zi pot trece pe pagina următoare fără să taie o rețetă la mijloc.
- Gating free/premium neschimbat (2 zile + fără listă la free).
- Verificare: render local (preview-pdf.mjs) + citire vizuală + stress-test pe limbi.

## Pasul 2 — Curățenia datelor / încrederea (acum, banda rapidă)

Artefacte de parsare găsite în PDF-ul real, de reparat în motorul de listă (shopping-list.js):
- „Mixed 500 g" (carne tocată mixtă fără substantiv), „A small piece of" ca articol, „Bone-in" fără pui, „Littleneck" fără scoici, „Thinly" ca ingredient
- „Ice-cold lager" / „Ice-cold beef stock" — epitetele de temperatură nu aparțin listei de cumpărături
- Stocurile (clam juice, chicken stock) categorisite la MEAT & FISH → sauces/pantry
- „Sliced onion" separat de „Onion" (canonicalizare)
- Statistica „CUISINES —" din hero: dispare când e necunoscută (informația își câștigă dreptul)
- Costul uniform „~€5" peste tot: header-ul zilei primește totalul real al zilei; suma săptămânii pe copertă devine reală

## Pasul 3 — Personalitatea (mâine, cu mockup aprobat)

- Copertă cu identitate: tipografie serif ca site-ul premium, zile cu date reale („Luni, 13 iulie"), sumar cald, un singur accent de culoare
- Ton uman: titlu localizat („Planul tău pentru săptămâna 13–19 iulie"), tip-ul zilei
- Link/QR per rețetă → pagina cu pașii de gătit
- Proces: mockup HTML → aprobarea producătorului → implementare în renderer (nu se improvizează direct în producție)

## Definition of Done

- [ ] Un om poate GĂTI orice rețetă din plan folosind doar PDF-ul (ingrediente + cantități complete)
- [ ] Zero artefacte de parsare în lista de cumpărături pe planul de test
- [ ] Niciun „—" sau statistică goală vizibilă
- [ ] stress-test-pdf.mjs verde pe toate limbile suportate
- [ ] Testul de 5 secunde al producătorului: „l-aș printa?"
