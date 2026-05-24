# Recipes missing images — upload TODO

17 recipes currently fall back to `cover2.jpg`. When you upload an image to
`public/images/<slug>.webp` (or `.jpg`), the next build picks it up
automatically via `resolveRecipeImage()` in `scripts/generate-content.mjs`.

Upload precedence:
  1. `public/images/<slug>.webp` (preferred — smaller, modern)
  2. `public/images/<slug>.jpg`  (also accepted)

The slug uses the lowercase-hyphenated form of the recipe's English name
(with non-ASCII chars stripped to hyphens). **Use exactly the filenames
below** — they must match what the slug helper produces.

---

## Grouped by cuisine

### New Zealand — 1
- `hangi.webp` — Hangi (Dinner, recipe id 53)

### Czech Republic — 1
- `sv-kov.webp` — Svíčková (Dinner, recipe id 56)

### Norway — 1
- `f-rik-l.webp` — Fårikål (Dinner, recipe id 57)

### Croatia — 1
- `dalmatinska-pasticada.webp` — Dalmatinska Pasticada (Dinner, recipe id 59)

### Moldova — 1
- `zeama.webp` — Zeama (Lunch, recipe id 81)

### Samoa — 1
- `oka-i-a.webp` — Oka i'a (Snack, recipe id 98)

### Dominican Republic — 1
- `la-bandera.webp` — La Bandera (Lunch, recipe id 104)

### Cambodia — 1
- `lok-lak.webp` — Lok Lak (Lunch, recipe id 114)

### Sweden — 1
- `kottbullar.webp` — Köttbullar (Lunch, recipe id 119)

### Latvia — 1
- `piragi.webp` — Pirāgi (Snack, recipe id 125)

### Peru — 1
- `causa-lime-a.webp` — Causa Limeña (Appetizer, recipe id 127)

### Kyrgyzstan — 1
- `beshbarmak.webp` — Beshbarmak (Dinner, recipe id 129)

### Switzerland — 1
- `r-sti.webp` — Rösti (Breakfast, recipe id 132)

### Turkmenistan — 1
- `ichlekli.webp` — Ichlekli (Lunch, recipe id 137)

### Hungary — 1
- `l-ngos.webp` — Lángos (Snack, recipe id 164)

### United Kingdom — 1
- `shepherd-s-pie.webp` — Shepherd's Pie (Lunch, recipe id 168)

### Finland — 1
- `karelian-stew.webp` — Karelian stew (Dinner, recipe id 177)

---

## Easiest replacements first (well-photographed dishes with abundant CC0 / public-domain sources)

1. **Köttbullar** — Swedish meatballs, ubiquitous in food photography
2. **Shepherd's Pie** — classic UK comfort dish, easy to find
3. **Rösti** — Swiss potato dish, well-documented
4. **Lángos** — Hungarian fried bread, widely photographed
5. **Karelian stew** — Finnish comfort food
6. **Hangi** — NZ Maori earth oven (harder, more cultural)
7. **Beshbarmak** — Central Asian, fewer sources
8. **Causa Limeña** — Peruvian, abundant on food blogs
9. **Svíčková** — Czech beef in cream sauce
10. **Fårikål** — Norwegian lamb and cabbage
11. **Dalmatinska Pasticada** — Croatian braised beef
12. **Zeama** — Moldovan chicken soup
13. **Oka i'a** — Samoan raw fish
14. **La Bandera** — Dominican rice/beans/meat plate
15. **Lok Lak** — Cambodian beef
16. **Pirāgi** — Latvian filled pastries
17. **Ichlekli** — Turkmen meat pie

---

## Recommended source pipeline

- **Wikimedia Commons** (CC0/CC-BY): always check first, no licensing risk
- **Spoonacular API**: high-quality but commercial — only if you have an API key
- **Original photography**: if you can shoot or commission

## Sizing recommendation

- Width: at least **1200px** so the future srcset pipeline (Phase 6 item 3)
  can serve responsive variants without scaling up
- Format: WebP preferred (smaller), JPG accepted
- Aspect ratio: any — the tiles use `object-fit: cover` with `aspect-ratio: 4/3`
  for cards and the recipe hero uses its own ratio

## After upload

Run `npm run content` to regenerate the HTML pages. The image will appear:
- On the recipe page (`/<lc>/recipes/<slug>/`) hero
- In country hub tiles if the recipe's origin has a hub (most don't —
  only Sweden, Croatia, Hungary, Switzerland, Cambodia, Peru, Finland
  are hub-eligible from this list)
- In the og:image meta tag for social sharing
