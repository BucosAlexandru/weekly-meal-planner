# PDF Renderer Divergence Audit

Snapshot taken before the Phase 2 default flip. Lists what is duplicated between the legacy `html2pdf` path and the new `pdfv2` (`@react-pdf/renderer`) path, and what is already shared. Goal: identify safe future consolidation work once the legacy engine is retired.

This is a **read-only audit**. No code changes in this document.

## Engine boundaries

| Layer | Legacy | pdfv2 |
|---|---|---|
| Entry point (UI) | `#generate-btn` / `#paid-generate-pdf` → `exportShoppingListToPDF` (legacy block) | same dispatcher → `exportViaPdfV2` |
| Data prep | `generatePDFimpact()` builds HTML into `#pdf-list` | `buildPdfV2Payload()` builds JSON for the endpoint |
| Render runtime | client-side: `html2canvas` rasterizes → `jsPDF` embeds | server-side: `@react-pdf/renderer` `renderToBuffer` |
| Output transport | `html2pdf().from(node).save()` → browser download | `fetch('/api/generate-pdf').blob()` → anchor `download` |
| Bundle dependency | `html2pdf.bundle.min.js` lazy-loaded from cdnjs | none on client (server-side React-PDF) |

## Already shared (good)

| Shared module | Used by both | Notes |
|---|---|---|
| `public/js/shopping-list.js` | legacy + pdfv2 | Both paths call `buildShoppingFromRawIngredients(rawEnIngredients, lang)`. Single source of truth for ingredient sanitization and category grouping. |
| `public/js/shopping-list.js` `parseIngredient` | legacy (inside engine) + pdfv2 (via `shortIngredients` helper in `app.js`) | Exported for the pdfv2 per-meal noun summary. |
| `collectMeals()` (`app.js`) | both | Reads the user's selected lunch/dinner from the planner inputs. |
| `extractRecipeName()` (`app.js`) | both | Strips meta from the planner input value. |
| `window.recipes` (`recipes.js` + `recipes-budget.js`) | both | Canonical recipe catalog, multilingual fields. |
| Premium gate (`window.hasUnlimited`) | both | Both paths apply `slice(0, 2)` for free users. |
| Locale (`lang` module variable) | both lookups | Both resolve recipes by the user's display locale. |

## Duplicated logic (candidates for consolidation)

### 1. Recipe lookup by meal-text

- Legacy: `getRecipe(mealText)` inside `generatePDFimpact()` — checks `r.name?.[lang]` then `r.name?.en`.
- pdfv2: `findRecipe(mealText)` inside `buildPdfV2Payload()` — checks `r.name?.[lang]` then `r.name?.en` then `r.name?.ro`.

**Consolidation**: extract to a shared `findRecipeByMealText(mealText, lang)` in `app.js` (or a new `recipe-helpers.js`).

**Risk if not consolidated**: small drift bug — pdfv2 has a `ro` fallback that legacy lacks; could cause one path to find a recipe the other doesn't.

### 2. Per-meal data shape

- Legacy: builds HTML inline — `metaHTML(r)`, `ingrPillsHTML(r)`, `stepsOL(r)`.
- pdfv2: builds `{ name, time, servings, cost, ingredients }` JSON via `mealPayload()`.

**Consolidation**: extract a `buildMealPayload(recipe)` returning the structured object; legacy renders by stringifying, pdfv2 sends it over the wire.

**Risk if not consolidated**: low — these are different shapes by design (HTML for canvas-render vs JSON for React-PDF). Consolidation would force a translation step in legacy.

### 3. Shopping-list rendering CSS

- Legacy: 130-line inline stylesheet in `buildCleanPdfNode()` — `.pdf-shopping`, `.pdf-shop-group`, `.pdf-shop-list`, `.pdf-shop-name`, `.pdf-shop-qty`, `.shop-item`, `.shopping-grid`.
- pdfv2: React-PDF `StyleSheet.create({...})` in `api/generate-pdf.js` — `shopSection`, `shopHeading`, `shopGrid`, `shopGroup`, `shopGroupTitle`, `shopItem`, etc.

**Consolidation**: not possible — the two rendering paths use different CSS subsets (browser CSS vs React-PDF style dialect). They are intentionally distinct.

### 4. Cover page

- Legacy: `pdf-cover` block with gradient, brand, title, week, divider, motiv, free-badge.
- pdfv2: no cover. Replaced by a 14mm masthead strip at the top of page 1.

**Consolidation**: N/A — pdfv2 deliberately drops the cover for compactness.

### 5. Steps / howIsMade rendering

- Legacy: `stepsOL(r)` renders `<ol>` of recipe steps.
- pdfv2: no steps. Per spec, weekly PDF is a planner, not a cookbook.

**Consolidation**: N/A — design difference.

### 6. Pagination

- Legacy: `paginateCleanNode()` + `maybeCompactToTwoPages()` — custom DOM-measurement + page-break insertion. Recently patched to keep cover + first recipe on page 1.
- pdfv2: React-PDF native pagination + `break: days.length > 3` on the shopping section.

**Consolidation**: not possible — different rendering pipelines.

### 7. Free / locked teaser

- Legacy: `.pdf-locked` block at the end with blurred "Days 3 – 7" + upgrade CTA.
- pdfv2: not implemented. Free pdfv2 simply shows 2 days + their shopping list.

**Gap**: pdfv2 lacks the upsell. Worth adding before the default flip if the conversion funnel relies on it.

### 8. Footer

- Legacy: `<div class="doc-footer">🥗 Meal-Planner.ro · {date}</div>`.
- pdfv2: fixed-position footer rendered by React-PDF with brand + date | plan title.

**Consolidation**: N/A — both engines have their own footer style.

### 9. Page numbers

- Legacy: not rendered.
- pdfv2: attempted, but `@react-pdf/renderer` 4.5.1 drops dynamic `render` prop output when the element is absolutely-positioned. Deferred.

**Gap**: neither engine currently shows `Page X / Y`. Worth wiring on pdfv2 once a viable workaround is found.

### 10. iOS scaling hack

- Legacy: `html2canvas.scale: isIOS ? 1.36 : 2` — empirical workaround for iOS Safari raster scaling.
- pdfv2: vector text, no rasterization → no scaling hack needed.

**Consolidation**: N/A — pdfv2 doesn't have this problem.

## What pdfv2 still lacks (vs legacy)

Tracked for post-flip work, NOT blockers:

- ❌ Font embedding for non-Latin locales (zh, ja, ko, ar, hi, ru). Currently default Helvetica — non-Latin glyphs become missing-character boxes.
- ❌ Recipe images / thumbnails. Spec deferred them; pdfv2 is text-only.
- ❌ QR codes / links back to recipe pages. Spec deferred.
- ❌ Free-tier locked teaser. Worth adding before default flip if the upsell funnel relies on it.
- ❌ Per-locale URL filename (e.g., `plan-mese.pdf` for `ro`). Currently always `meal-plan.pdf`.
- ❌ Page numbers (see #9 above).

## Recommended consolidation order (post-flip)

After Phase 2 (default flip) and a soak period that confirms pdfv2 is stable, the legacy engine becomes safely deletable. Order of removal:

1. **Delete `html2pdf.bundle.min.js` lazy-load and `ensureHtml2pdfLoaded()`** — drops 1.2 MB of client bundle. Trivial change. Once deleted, the dispatcher's legacy branch is dead code.
2. **Delete `generatePDFimpact()`, `buildCleanPdfNode()`, `paginateCleanNode()`, `maybeCompactToTwoPages()`** — and the inline 130-line PDF stylesheet. Saves ~600 lines from `app.js`.
3. **Delete `#pdf-impact-area` / `#pdf-list` from `public/index.html` and the 14 locale planners**. Saves ~10 lines per page.
4. **Drop the legacy-specific telemetry and runtime-switch opt-out paths** — collapse `isPdfV2Enabled()` to a constant `true`. Drop the dispatcher branching.
5. **Extract `findRecipeByMealText`** to a shared module (item #1 above) — only if a future contributor needs it; otherwise leave the now-unified `findRecipe` in app.js.

Steps 1–4 are mechanical (deletion only). Step 5 is optional refactor.

## Risk after legacy removal

- Any user with `localStorage.pdfV2='0'` (explicit opt-out) will get an error on Generate PDF since the legacy branch no longer exists. Mitigation: keep the opt-out branch logging `'legacy-removed'` and reverting to pdfv2 for one release cycle, then drop the opt-out entirely.
- Cached `app.min.js` containing references to deleted helpers — service-worker / CDN cache flush will resolve.

## Audit performed

By repo grep on:
- `html2pdf`, `html2canvas`, `jsPDF` references (4 unique sites in `app.js`)
- `generatePDFimpact`, `buildCleanPdfNode`, `paginateCleanNode`, `maybeCompactToTwoPages` (5 helpers in `app.js`)
- `exportViaPdfV2`, `buildPdfV2Payload`, `shortIngredients`, `findRecipe` (4 functions in `app.js`)
- `api/generate-pdf.js` full read
- `public/js/shopping-list.js` for shared module surface
- `public/css/style.css` and `public/css/content.css` for PDF-relevant CSS

No dead code or unexpected couplings found beyond the duplications listed above.
