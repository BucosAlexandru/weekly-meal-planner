# pdfv2 default-rollout checklist

Use this checklist before flipping `PDF_EXPORT_DEFAULT_ENGINE` from `'legacy'` to `'pdfv2'` in `public/js/app.js`.

The flip is a **one-line change** + `npm run build` + push. The hard part is verifying everything below first.

---

## Pre-launch checks (must all pass)

- [ ] PR #5 (stress tests) merged. Run `node scripts/stress-test-pdf.mjs` locally — all 10 scenarios passing.
- [ ] PR #6 (telemetry) merged. Confirm `PDF_EXPORT_TELEMETRY` log line appears in Safari Web Inspector for both engines.
- [ ] PR #7 (runtime switch) merged. Confirm `?pdfv2=0` opt-out works.
- [ ] Legacy `paginateCleanNode` cover-whitespace fix merged (PR #4, already in main).
- [ ] CI green on the most recent commit on `main`.
- [ ] Vercel preview deployed and accessible.
- [ ] No open critical issues tagged `pdf`.

## Safari checks (real device — not Playwright)

iPhone Safari is the single most important target. The pdfv2 endpoint produces vector PDF that should behave well on iOS, but several Safari-specific behaviors need manual confirmation.

### iPhone Safari (iOS 17+)

- [ ] Open the production homepage with `?pdfv2=1` on iPhone Safari.
- [ ] Confirm the console (via macOS Safari → Develop → iPhone → tab) shows `PDF_EXPORT_ENGINE (on load) = "pdfv2"`.
- [ ] Auto-fill the planner (random or autoplan).
- [ ] Tap **Generate PDF**.
- [ ] Confirm the PDF opens inline OR is downloaded to Files. Filename must be `meal-plan.pdf`.
- [ ] Verify the PDF is 1–3 pages.
- [ ] Verify vector text — pinch-zoom to 400%. Text stays crisp, no blur.
- [ ] Verify NO "HOW IT'S MADE" / "CUM SE FACE" sections.
- [ ] Verify the shopping list is present.
- [ ] Verify `PDF_EXPORT_TELEMETRY` log line in Safari console. Status should be `"ok"`.

### iPad Safari

- [ ] Same checks as iPhone Safari, on iPad.

### macOS Safari

- [ ] Open production homepage in Safari (macOS). 
- [ ] Open Web Inspector → Console.
- [ ] Click **Generate PDF**.
- [ ] Confirm `PDF_EXPORT_ENGINE = "pdfv2"`, `PDF_EXPORT_TELEMETRY status="ok"`.
- [ ] Confirm the PDF opens in Preview.app cleanly. Text is selectable.

## Android Chrome

- [ ] Open the production homepage on a real Android device (Chrome).
- [ ] Confirm Generate PDF triggers a download notification.
- [ ] Confirm the file opens in Google Drive / Files PDF viewer.

## Desktop Chrome

- [ ] Open production homepage in Desktop Chrome.
- [ ] Click Generate PDF.
- [ ] Confirm vector text, 1–3 pages, no howIsMade.

## Premium / free checks

- [ ] Without verifying email (free user):
  - [ ] PDF contains exactly 2 days of meals.
  - [ ] Shopping list scope is also limited to those 2 days (cross-check item counts).
- [ ] Verify email (premium user):
  - [ ] PDF contains all 7 days.
  - [ ] Shopping list contains the full week's ingredients.
- [ ] Verify that premium gating still applies: a free user cannot somehow trigger a 7-day PDF.

## Localization checks

EN-only pdfv2 currently. Confirm:

- [ ] On a Romanian-locale page (`/ro/`), generated pdfv2 still renders all text in English (per Phase 1 spec).
- [ ] On RTL locale (Arabic `/ar/`), the pdfv2 still renders in English LTR. The button label localizes; the PDF content does not.
- [ ] No console errors related to font / locale on any locale.

## Telemetry health (post-flip soak)

After the default flip, watch telemetry for 24–48 hours:

- [ ] No `status: "error"` spike — error rate should stay below 1%.
- [ ] No `durationMs` spike — p95 should stay under 3 seconds.
- [ ] No `isSafari && status:"error"` cluster — would indicate a Safari-specific regression.
- [ ] No `pageCount > 5` reports — pdfv2 should never produce more than 5 pages for a 7-day plan.

## Rollback procedure

### Instant rollback (no code change)

If a single user reports a problem, advise them to:
```
On the broken page, open Settings → Safari → Advanced → Web Inspector
In the console: localStorage.setItem('pdfV2', '0')
Reload the page.
```
Or share a URL with `?pdfv2=0` appended.

### Global rollback (~5 minutes)

If the issue affects many users:

1. Edit `public/js/app.js`:
   ```js
   const PDF_EXPORT_DEFAULT_ENGINE = 'legacy';  // ← change from 'pdfv2'
   ```
2. `npm run build`
3. Commit + push to `main` (or open a hotfix PR + merge).
4. Vercel redeploys (~1–2 min).
5. Confirm production now logs `PDF_EXPORT_ENGINE (on load) = "legacy"` for default users.

The legacy engine remains in the bundle — no deletion until after a multi-week soak with zero issues.

### Per-user instant override (no deploy)

Users who explicitly opted in via `?pdfv2=1` or `localStorage.pdfV2='1'` will continue to get pdfv2 even after rollback. They can opt back to legacy by:
- Visiting `?pdfv2=0` once (persists), OR
- Running `localStorage.removeItem('pdfV2')` to revert to the default

## Known limitations of pdfv2

These are tracked but **not blockers** for the flip:

| Limitation | Mitigation |
|---|---|
| Non-Latin scripts (CJK, Arabic, Devanagari, Cyrillic) render as missing-glyph boxes — default Helvetica is Latin-only | Document the limitation; non-Latin users keep the locale-correct UI but get EN-only PDF (intentional Phase 1 scope). Locale font subsetting is a future phase. |
| No recipe images / thumbnails in the PDF | Spec defers images to a later phase. |
| No QR codes / links back to recipe pages | Same — future phase. |
| No free-tier locked teaser (legacy had a blurred-days CTA block) | If conversion data shows it matters, add a `LockedTeaser.jsx` component before flipping. **Worth re-checking before merging the flip.** |
| Filename always `meal-plan.pdf` (legacy was the same) | Future polish if needed. |
| No `Page X / Y` page numbers | Quirk in `@react-pdf/renderer` 4.5.1 with dynamic content in absolute-positioned text. Re-test with newer versions. |

## Kill-switch summary (one-liner)

To revert ALL users to legacy in one PR:

```diff
- const PDF_EXPORT_DEFAULT_ENGINE = 'pdfv2';
+ const PDF_EXPORT_DEFAULT_ENGINE = 'legacy';
```

Then `npm run build && git commit && git push`. Production reverts on next Vercel deploy. Users who explicitly opted in stay on pdfv2.

---

## After successful flip

If the soak period (≥ 2 weeks) passes without significant issues:

1. Consider the legacy engine deletable. See `docs/pdf/renderer-divergence-audit.md` § "Recommended consolidation order" for the safe sequence.
2. Document the new default in `CLAUDE.md` so future contributors know pdfv2 is canonical.
3. Update `PDFV2_ROLLOUT_CHECKLIST.md` (this file) to reflect the new baseline.
