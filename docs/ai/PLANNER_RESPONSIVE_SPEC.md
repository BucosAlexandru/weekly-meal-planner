# Planner Interaction — Responsive Specification v1.0

_Data: 2026-07-08 · Status: ÎN AȘTEPTAREA APROBĂRII — nu se implementează până nu e aprobat._
_Părinte: PREMIUM_PRODUCT_SPEC_V1.md §4. Mockup: docs/mockups/planner-cards-mockup.html (v4)._
_Implementarea, după aprobare, pe branch separat: `feature/planner-cards`._

---

## 1. Breakpoint-uri (decizie)

Două praguri, trei layout-uri. Capabilitatea de hover se detectează prin media query de input, NU prin lățime — o tabletă lată nu are hover.

| Nume | Interval | Coloane carduri | Overview | Acțiuni per masă |
|---|---|---|---|---|
| **Mobil** | < 700px | 1 | grilă 2×2 | mereu vizibile |
| **Tabletă** | 700–959px | 2 | 4 pe rând | vizibile dacă touch, hover dacă pointer |
| **Desktop** | ≥ 960px | 2 (container max 860px) | 4 pe rând | hover-reveal |

```css
/* coloane */
.days { grid-template-columns: 1fr; }
@media (min-width: 700px) { .days { grid-template-columns: 1fr 1fr; } }
/* hover-reveal DOAR pe dispozitive cu hover real */
@media (hover: hover) and (pointer: fine) {
  .meal-actions { opacity: 0; }
  .meal:hover .meal-actions, .meal:focus-within .meal-actions { opacity: 1; }
}
```

Motivarea pragului 700px: un card de zi are nevoie de min. ~320px pentru nume de rețete lungi (de, ru) + chips fără wrap urât; 2×320 + gap + padding ≈ 700.

## 2. Alinierea cardurilor (regulă dură)

- `.day-card { display:flex; flex-direction:column; }` + `.meal { flex:1; }` → prânzul și cina au înălțimi egale în card; „Cină" pornește pe aceeași linie la toate cardurile din același rând de grid.
- Grid-ul (align-items implicit `stretch`) egalizează înălțimea cardurilor pe rând.
- Numele de rețetă poate avea max. 2 rânduri (wrap normal); nu folosim ellipsis care ascunde informație. Peste 2 rânduri: acceptăm creșterea cardului — perechea de pe rând crește odată cu el (stretch).
- Spacing fix: meal padding 12/16px, gap grid 14px, border-radius 14px. Fără alte variații.

## 3. Interacțiune per masă (trei niveluri de efort)

| Gest | Acțiune | Regulă |
|---|---|---|
| 🎲 (buton) | **Reroll instant** | Înlocuiește masa cu o rețetă aleatoare care respectă filtrul activ (`window._activeFilter`), **fără duplicate** în planul curent. Fără dialog. Dacă pool-ul e gol (toate folosite): feedback scurt, nu eroare. |
| Click/tap pe numele rețetei sau pe slotul gol „＋" | **Deschide picker-ul** | Search după numele rețetei SAU ingredient, în limba activă cu fallback EN. |
| ✕ (buton) | **Scoate masa** | Slotul devine „＋ Alege o rețetă". Fără confirmare (acțiunea e reversibilă cu un tap). |

După orice modificare se recalculează **imediat, fără reload**: costul zilei, numărul de mese, timpul mediu, numărul de bucătării, lista de cumpărături (`updateShoppingList()`) și starea butonului de PDF.

**Explicit în afara v1:** drag-and-drop; filtre „mai gustos/fancy/funny"; favorite; istoric undo multi-pas.

## 4. Picker

**Desktop/tabletă-pointer:** modal centrat, max-width 480px, max-height 70vh, backdrop semi-opac. Click pe backdrop sau Esc închide.

**Mobil și orice touch < 700px:** **bottom sheet** — full-width, ancorat jos, colțuri rotunjite sus, max-height 85vh, search-ul sticky sus. NU popup mic de desktop. Focus pe search la deschidere (după animație, ca tastatura mobilă să nu sară). Body scroll blocat cât e deschis.

**Search:** un singur câmp; potrivire case-insensitive pe numele rețetei în limba activă (fallback EN), apoi pe ingrediente. Rezultatele găsite prin ingredient afișează motivul („conține pui"). Fără rezultate → mesaj localizat cu sugestii de ingrediente comune. Rezultatele arată: nume, timp, cost, tag-uri (max 1-2). Listă plafonată la ~30 rezultate cu randare simplă (fără virtualizare în v1 — 175 rețete nu o cer).

**Touch targets:** toate elementele interactive ≥ 44×44px pe touch (butoanele 🎲/✕ 28px pe desktop-pointer, 40px pe touch; rândurile din picker min. 44px).

## 5. Accesibilitate

- Toate butoanele: `aria-label` localizat („Altă rețetă pentru Luni prânz", „Scoate masa", „Adaugă rețetă"). Emoji-urile sunt `aria-hidden`.
- Numele rețetei e `<button>` (nu div cu onclick) — tabbabil nativ.
- Picker: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; focus trap în interior; **Esc închide**; **↑/↓ mută selecția** în rezultate; **Enter selectează** rezultatul evidențiat; selecția evidențiată are `aria-selected` și contrast vizibil.
- **La închidere (cu sau fără selecție), focusul revine pe slotul de masă editat.**
- `:focus-visible` vizibil pe toate controalele; contrast text ≥ 4.5:1.
- Recalculările (cost, rezumat) într-un container `aria-live="polite"`.

## 6. Localizare (14 limbi) + RTL

- Chei i18n noi, adăugate în TOATE cele 14 limbi din `i18n.js` (regula din CLAUDE.md — inclusiv `hi`): `planner.reroll`, `planner.remove`, `planner.addMeal`, `picker.title` (cu placeholder zi+masă), `picker.searchPlaceholder`, `picker.noResults`, `picker.containsIngredient`.
- Nume lungi (de/ru: „Hühnerfrikassee mit Champignons") nu sparg cardul: wrap pe 2 rânduri, testat la 320px lățime de card.
- **RTL (ar):** poziționarea acțiunilor cu proprietăți logice (`inset-inline-end`, `margin-inline-start`), nu `right/left`. Bottom sheet și modal sunt simetrice, deci sigure. Chips-urile își inversează ordinea natural (flex).
- Search-ul normalizează diacriticele la potrivire (ș→s, ă→a) pentru ro/tr/pt etc.

## 7. Stările (toate demonstrate în mockup v4)

1. **Normal** — masă cu rețetă, chips, acțiuni (după capabilitate hover).
2. **Hover/focus** (doar pointer) — acțiunile apar; pe touch sunt mereu vizibile.
3. **Slot gol** — „＋ Alege o rețetă sau generează", chenar punctat, hover verde.
4. **Picker deschis** — modal (desktop) / bottom sheet (mobil), search focusat.
5. **Fără rezultate** — mesaj localizat + sugestii.
6. **Pool epuizat la reroll** — feedback discret (buton pulsează / tooltip scurt), nu alert().

## 8. Acceptance checklist (Definition of Done — implementare)

**Layout**
- [ ] Mobil < 700px: 1 coloană; tabletă/desktop ≥ 700px: 2 coloane
- [ ] „Cină" aliniată pe aceeași linie la cardurile din același rând
- [ ] Nume lungi (de, ru) nu sparg cardul la 320px; testat cu cele mai lungi nume din recipes.js
- [ ] RTL (ar): layout corect, acțiuni pe partea corectă
- [ ] Fără CLS la încărcare; Lighthouse fără regresii vs. main

**Interacțiune**
- [ ] 🎲 = instant, respectă filtrul, zero duplicate în plan
- [ ] ✕ = slot gol; slot gol = deschide picker; nume rețetă = deschide picker
- [ ] Cost zi + overview + shopping list + stare PDF se recalculează imediat
- [ ] Touch: toate țintele ≥ 44px; nicio funcție dependentă de hover
- [ ] Mobil: picker = bottom sheet, search focusat, tastatura nu acoperă rezultatele

**Accesibilitate**
- [ ] Tab prin toate controalele; Esc închide; ↑/↓ + Enter în picker
- [ ] Focus revine pe slotul editat după închidere
- [ ] aria-labels localizate pe toate acțiunile

**Localizare**
- [ ] Toate cheile noi în toate cele 14 limbi (verificat cu grep pe fiecare cheie × 14)
- [ ] Search funcționează cu diacritice în ro/tr/pt

**Integrare**
- [ ] `collectMeals()` / payload PDF / gating free-premium neschimbate funcțional
- [ ] `npm run build` + CI verde (count HTML ~3250, node --check, fără secrete)
- [ ] Quality Checklist din PREMIUM_PRODUCT_SPEC_V1 §10 bifat integral

**Testul final**
- [ ] 5 persoane (min. 2 necunoscute), pe telefonul lor: înțeleg și folosesc 🎲/✕/picker fără explicații; 4/5 răspund „da" la „ai avea încredere să folosești asta săptămâna viitoare?"

## 9. Definition of Success (≠ Definition of Done)

DoD (§8) = implementarea e corectă. DoS = implementarea și-a atins scopul. Se evaluează cu oameni reali, nu de către noi. Plannerul e gata de testare cu utilizatori doar când răspunsul e DA la toate:

1. Un utilizator nou înțelege plannerul în sub 30 de secunde?
2. Poate schimba o rețetă fără explicații?
3. Poate găsi o rețetă după ingredient fără tutorial?
4. Costul și lista de cumpărături se actualizează imediat și sunt credibile?
5. Funcționează la fel de bine pe telefon ca pe desktop?
6. După ce îi arăt plannerul două minute, îl poate folosi singur, fără să-i explic?

DA la toate ≠ produs final. Înseamnă doar că următorul feedback merită să vină de la oameni reali, nu din presupunerile noastre.

## 10. Plan de implementare în straturi (aprobat)

| Zi | Strat | Conține |
|---|---|---|
| 1 | UI static | layout, carduri, Week Overview, responsive, RTL — fără interacțiuni |
| 2 | Mutații | 🎲 reroll, ✕ remove, toast undo, recalculare instant |
| 3 | Picker | modal/bottom sheet, search, recomandări, tastatură |
| 4 | QA | telefon/tabletă/desktop, Safari/Chrome/Firefox/Edge, 14 limbi, checklist §8 |
| 5 | Preview | deploy preview + primele priviri de oameni reali |
