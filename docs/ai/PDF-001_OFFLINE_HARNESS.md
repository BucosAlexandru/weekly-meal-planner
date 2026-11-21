# PDF-001 — Offline PDF test harness (14 locales, no secrets, no network)

Status: implemented on `claude/pdf-001-offline-harness` (draft PR, not merged).
Date: 2026-11-21. Base for PDF-002…PDF-005.

## Problem

`scripts/stress-test-pdf.mjs` did not run locally: importing `api/generate-pdf.js`
loaded `api/_lib/requirePremium.js`, which called `createClient()` **at import time**
and threw `supabaseUrl is required` when there was no production env. Nothing in
the PDF stack could be exercised without Supabase credentials.

## What changed

| File | Change |
|---|---|
| `api/_lib/requirePremium.js` | The Supabase client is created **lazily** on the first premium check (`getSupabase()`), not at import. No flag, env switch or code path grants premium. With no env: `isPremiumEmail()` catches the throw and returns `false` (fails closed, as before); `requirePremium()` lets it propagate → handler 500 (an import failure gave the same result). |
| `api/generate-pdf.js` | Two pure functions extracted and exported, and the handler now calls them: `pdfLanguageGuard(plan)` (the ar → 422 guard, plus `PDF_BLOCKED_LANGS`) and `renderPlanPdf(plan)` (= `renderToBuffer(MealPlanDocument(plan))`). Handler order is unchanged: guard → `isPremiumEmail` → rate limit → `gatePlanForAccess` → render. |
| `scripts/pdf/fixture-plan.mjs` | Deterministic 7-day fixture (recipes pinned by id, fixed date 2026-05-25) in the **exact payload shape** of `buildPdfV2Payload()` in `public/js/app.js`. It reads the label tables (`PDF_LABELS`, `WEEK_OF`, `localeMap`, `DAY_ABBREV`) **from app.js at load time** so it can't drift from production. |
| `scripts/pdf/pdf-inspect.mjs` | Inspection with two modes: **poppler** (`pdfinfo`/`pdftotext`/`pdffonts`) or **builtin** (pure JS: header/trailer + page-object count, no text). `PDF_HARNESS_NO_POPPLER=1` forces builtin. |
| `scripts/pdf/render-all.mjs` | CLI + library: renders the fixture in all 14 locales in one process (like a warm serverless instance), checks each file, prints a table, writes `results.json`. |
| `tests/pdf/*.test.mjs` | 4 files, 23 tests (`node --test`), no network. |
| `scripts/stress-test-pdf.mjs` | Uses `renderPlanPdf()`. Runs offline now (10/10). Exits 2 with a clear message if poppler is missing. |
| `scripts/preview-pdf.mjs` | Uses `renderPlanPdf()`. Output goes to `os.tmpdir()` or the path in argv[2]. |
| `.github/workflows/build-check.yml` | New step 6d: installs `poppler-utils` (if that fails the tests still run in builtin mode), then runs `node --test tests/pdf/*.test.mjs`. |

## How to run

```bash
node scripts/pdf/render-all.mjs                       # all 14 locales → $TMPDIR/pdf-001/
node scripts/pdf/render-all.mjs --out out/ --langs hi,ja --days 2
node scripts/pdf/render-all.mjs --json                # machine-readable
PDF_HARNESS_NO_POPPLER=1 node scripts/pdf/render-all.mjs   # no poppler
node --test tests/pdf/*.test.mjs                      # the CI suite
node scripts/stress-test-pdf.mjs                      # pagination stress (needs poppler + ImageMagick convert)
node scripts/preview-pdf.mjs [out.pdf]
```

The harness never needs `.env`. The handler test also deletes every `SUPABASE_*`,
`STRIPE_*` and `OPENAI_*` variable before importing the API, so CI can't reach Supabase
by accident.

## What it checks

Per locale, `render-all` returns one of these statuses:

- **ok**: the guard passes, the render succeeds, the PDF has a valid header and `%%EOF`, pages > 0,
  and with poppler: the title and all 14 recipe names in that language are found in
  `pdftotext` output (normalized: NFC, no whitespace, lower-case).
- **blocked-by-guard**: `pdfLanguageGuard()` refuses the locale (today `ar` → 422
  `pdf_unavailable_for_language`). Reported explicitly. **Not rendered**, because an ar render
  corrupts shared font state for the locales rendered after it.
- **fail**: anything else. Exit code 1.

Non-fatal **warnings** (baseline for PDF-005): fonts that are not embedded (a fallback to a
standard-14 font) and variable fonts embedded at `-Thin`.

**Devanagari caveat:** `pdftotext` extracts Devanagari in visual order. The ि matra comes out
before its consonant, and a reph (र्) is moved or dropped. Examples from the hi file:
`कार्बोनारा` → `काबार्नारा`, `नोर्मा` → `नोमा`. For Devanagari strings that don't match exactly,
the harness compares a **consonant skeleton** (base letters only, minus र, minimum 3 letters).
It reports these as `weakMatches`. The check is weaker than an exact match. The rendering
itself was checked visually and is shaped correctly.

The tests (`tests/pdf/`):

- `fixture.test.mjs`: the 14 locales, labels read from app.js, recipes localized in all 14
  languages, determinism (identical JSON), production payload shape, names that are not EN
  fallbacks. Plus one `todo` for the ar weekday labels (see defects).
- `inspect.test.mjs`: normalization, the skeleton fallback (positive and negative, on real hi
  output), the builtin page count.
- `handler-offline.test.mjs`: the API imports without env; `isPremiumEmail` → `false`;
  `requirePremium` never grants; the guard returns 422 for ar and passes the other 13; the
  **handler** answers an ar POST with 422 before rendering; the **handler** clamps a 7-day plan
  with an email and no Supabase to the free 2-day preview (fewer pages, days 3–7 missing from the
  text, Premium notice present). So working offline does **not** open the premium gate.
- `render-all.test.mjs`: all 14 locales (13 ok and ar blocked-by-guard), exact text matches for
  every script except hi. Plus builtin mode (no poppler).

## Results (2026-11-21, poppler 24, Node 22; 7-day fixture)

| Locale | Status | Pages | Bytes | Notes |
|---|---|---|---|---|
| ro | ok | 4 | 69 920 | cost shown in RON (`~302 RON`) |
| en | ok | 4 | 67 893 | |
| es | ok | 4 | 69 864 | |
| fr | ok | 4 | 70 839 | |
| de | ok | 4 | 70 445 | |
| pt | ok | 4 | 71 018 | |
| ru | ok | 4 | 76 193 | |
| **ar** | **blocked-by-guard** | — | — | 422 `pdf_unavailable_for_language` (expected) |
| zh | ok ⚠ | 4 | 115 508 | font embedded as `NotoSansSC-Thin` |
| ja | ok ⚠ | 4 | 98 224 | font embedded as `NotoSansJP-Thin` |
| hi | ok ⚠ | 4 | 71 385 | 8/15 strings matched only via the skeleton; Helvetica fallback not embedded; `~€-61` in the hero |
| tr | ok | 4 | 70 036 | the "Hafta"/"kırmızı" regression did not come back (rendered after ru in the same process) |
| it | ok | 4 | 70 332 | |
| ko | ok ⚠ | 4 | 68 349 | font embedded as `NotoSansKR-Thin` |

Totals: **13 ok, 1 blocked-by-guard (ar), 0 fail.** `stress-test-pdf.mjs`: 10/10 scenarios offline.

## Defects found (not fixed: outside PDF-001's scope)

1. **hi: `~€-61` in the hero (the known "~€-63").** Confirmed. `NotoSansDevanagari` has no
   `€` glyph (verified with fontkit: `hasGlyphForCodePoint(0x20AC) === false`). @react-pdf falls
   back to **non-embedded Helvetica** for it, `pdffonts` lists `Helvetica`/`Helvetica-Bold` with
   `emb=no`, and the narrow stat box breaks the run with a hyphen. `pdftotext` extracts `~€61`,
   so the hyphen is a line-break artifact. The value changes with the plan: 63 in the old plan,
   61 in the fixture. Candidate fix: a fallback font with `€` for hi, or a font stack.
2. **zh / ja / ko are rendered at Thin weight.** The Noto SC/JP/KR TTFs are variable, with
   default `wght` 100. @react-pdf embeds the default instance (`NotoSans*-Thin`) for both 400
   and 700. The comment in `generate-pdf.js` ("@react-pdf rasterises the appropriate axis
   position per weight") is wrong. Visually, all CJK text, numbers included, comes out very thin
   and pale. Candidate fix: static Regular/Bold instances.
3. **ar: duplicate weekday abbreviations** (latent while ar is blocked). `slice(0,3)` on the
   Arabic names gives `الا | الث | الأ | الخ | الج | الس | الأ`: Wednesday and Sunday are both
   `الأ`, and every label is just the article plus one letter. Same class as the Turkish P0, which
   was fixed with `DAY_ABBREV.tr`. A `todo` test is in `tests/pdf/fixture.test.mjs`.
4. **hi: abbreviations cut mid-cluster.** `गुरुवार` → `गुर`, `शुक्रवार` → `शुक`. They are unique
   but not the conventional short forms.
5. **hi: letter-spacing on Devanagari labels** (stat labels, `दोपहर`/`रात्रि` badges, day
   names) visibly breaks clusters apart (`दि न`, `भो ज न`). The `letterSpacing` styles meant for
   Latin are applied to Devanagari too.
6. The `rtl-names` scenario in `stress-test-pdf.mjs` passes, but it renders Arabic characters
   with **Roboto**, which has no Arabic glyphs, because the payload has no `lang:'ar'`. It doesn't
   prove anything about Arabic. Already the case before this change.

## What remains for PDF-002…PDF-005

- **PDF-002 (Arabic/RTL):** remove `ar` from `PDF_BLOCKED_LANGS` once the bidi/textkit fix
  lands. `render-all` will then render ar automatically, and the test expects `ok` instead of
  `blocked-by-guard` (update `render-all.test.mjs`). Add `DAY_ABBREV.ar` (defect 3; turn the
  `todo` into a normal test). Check font-state corruption: render ar **before** tr/ru in the
  same process; render-all's order already does this (ar sits between ru and zh).
- **PDF-003 (Hindi/Devanagari):** defects 1, 4, 5. Make `pdffonts` warnings fatal for hi once
  fixed. Consider a visual check (pdftoppm + a golden image), because text extraction is
  unreliable for Devanagari.
- **PDF-004 (14-locale regression suite):** extend `render-all` with page-count snapshots per
  locale, with a tolerance; free 2-day fixtures (`--days 2`) through the handler; the shopping
  list (group/item labels in the target locale); and the `pageOf` footer.
- **PDF-005 (glyph coverage):** turn the warnings (non-embedded, `-Thin`) into assertions. Use
  fontkit to check that every code point in the fixture payload (names, ingredients, labels) has a
  glyph in the locale's font. Fix defect 2.
