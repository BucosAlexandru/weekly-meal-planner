# Image credits & attribution

Audited provenance for curated recipe images in `public/images/`.
All images are commercial-use-safe (CC0 / Public domain / CC BY / CC BY-SA).
For **CC BY** and **CC BY-SA** images, attribution is required — the author,
license and source link below satisfy that requirement.

## Batch 10 — Iconic Romanian recipes (added on branch `preview/recipe-batch-10-ro`)

| Recipe ID | Local file | Dish | Author | License | Source (Wikimedia Commons) |
|-----------|-----------|------|--------|---------|----------------------------|
| 230 | `romanian-cabbage-rolls.webp` | Sarmale | Andrei | CC0 1.0 | https://commons.wikimedia.org/wiki/File:Sarmale_Romania.jpg |
| 231 | `polenta-with-cheese-sour-cream.webp` | Mămăligă cu brânză și smântână | en:User:Igor.skokan | Public domain | https://commons.wikimedia.org/wiki/File:MamaligaBranza.JPG |
| 232 | `radauti-sour-chicken-soup.webp` | Ciorbă rădăuțeană | Romaniancook | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Ciorba_radauteana.jpg |
| 233 | `romanian-fried-cheese-doughnuts.webp` | Papanași | Nicubunu | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Papanasi_cu_cirese.jpg |
| 234 | `romanian-sweet-braided-bread.webp` | Cozonac | Vvssmmaann | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Cozonac-cu-nuca-103.jpg |
| 235 | `romanian-grilled-minced-meat-rolls.webp` | Mici (Mititei) | Emilian Robert Vicol | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Barbecue_mici_(4791357455).jpg |
| 236 | `romanian-beef-vegetable-salad.webp` | Salată de boeuf | Flavius Frantz | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Salat%C4%83_Beuf.jpg |
| 237 | `romanian-vegetable-spread.webp` | Zacuscă | Paul Chiorean | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Zacusc%C4%83.jpg |
| 238 | `roasted-pork-loin.webp` | Mușchi de porc la cuptor | Sara Goldsmith | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Roast_pork_loin,_potatoes_(2585116058).jpg |

### License URLs
- CC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/
- CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/
- CC BY-SA 3.0 — https://creativecommons.org/licenses/by-sa/3.0/
- CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0/

### Attribution strings (for CC BY / CC BY-SA images)
- Ciorbă rădăuțeană — "Ciorba radauteana" by Romaniancook, CC BY-SA 4.0, via Wikimedia Commons.
- Papanași — "Papanasi cu cirese" by Nicubunu, CC BY-SA 3.0, via Wikimedia Commons.
- Cozonac — "Cozonac-cu-nuca-103" by Vvssmmaann, CC BY-SA 4.0, via Wikimedia Commons.
- Mici — "Barbecue mici" by Emilian Robert Vicol, CC BY 2.0, via Wikimedia Commons.
- Salată de boeuf — "Salată Beuf" by Flavius Frantz, CC BY-SA 4.0, via Wikimedia Commons.
- Zacuscă — "Zacuscă" by Paul Chiorean, CC BY 2.0, via Wikimedia Commons.
- Mușchi de porc la cuptor — "Roast pork loin, potatoes" by Sara Goldsmith, CC BY 2.0, via Wikimedia Commons.

### Processing
Each source was downloaded from Wikimedia Commons (~1280px), then optimised to
WebP (resize ≤1200px wide) via `scripts/add-recipe-image.mjs` and written to
`public/images/<slug>.webp`. The auto-generated `public/js/recipe-images.js` was
**not** modified — local `public/images/<slug>.webp` takes precedence in
`scripts/generate-content.mjs:resolveRecipeImage`.
