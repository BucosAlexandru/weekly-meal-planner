# Final Static Cleanup — Phase 1

_Implemented: 2026-05-18_
_Owner: Claude Code (Lead Developer)_
_Prerequisite: FINAL_PRODUCTION_SMOKE_TEST.md (issues 1 and 2)_
_Commit: `d4c2f4dfb`_

---

## Summary

Two cosmetic/copy accuracy issues from the smoke test resolved. Exactly 16 files changed (one surgical line each). No generated content touched, no generator changes, no recipe data changes.

---

## Task 1 — Footer Year: © 2025 → © 2026

### Files updated (15)

| File | Line changed |
|------|-------------|
| `public/index.html` | `<span>© 2025</span>` → `<span>© 2026</span>` |
| `public/ro/index.html` | same |
| `public/en/index.html` | same |
| `public/es/index.html` | same |
| `public/fr/index.html` | same |
| `public/de/index.html` | same |
| `public/pt/index.html` | same |
| `public/ru/index.html` | same |
| `public/ar/index.html` | same |
| `public/zh/index.html` | same |
| `public/ja/index.html` | same |
| `public/hi/index.html` | same |
| `public/tr/index.html` | same |
| `public/it/index.html` | same |
| `public/ko/index.html` | same |

All 15 files had exactly **1 occurrence** of `© 2025`. All replaced with `© 2026`.

These are static app-shell HTML files not managed by `generate-content.mjs`. The generator's `makeFooter()` already outputs `© 2026` for all generated pages (Recipe, Plan, Pricing). This fix brings the static homepages into alignment.

---

## Task 2 — JSON-LD Copy: "1 PDF per day" → "Free PDF preview — 2 of 7 days"

### File updated (1)

**`public/pricing/index.html`** — line 70, inside `<script type="application/ld+json">`, Free Plan `Offer` object.

| | Value |
|--|-------|
| **Before** | `"description": "7-day meal planner, auto shopping list, 175 recipes, 1 PDF per day."` |
| **After** | `"description": "7-day meal planner, auto shopping list, 175 recipes, Free PDF preview — 2 of 7 days."` |

This is a root-level legacy static pricing page (`/pricing/`), distinct from the generated `/en/pricing/` page. It is not linked from any current nav but may be indexed. The old claim `"1 PDF per day"` was factually wrong for the Free plan.

---

## Verification

### Bad string search (post-change)

| String | Occurrences in `public/**/*.html` |
|--------|----------------------------------|
| `© 2025` | **0** ✅ |
| `1 PDF per day` | **0** ✅ |
| `1 free PDF/day` | **0** ✅ |
| `1 PDF gratuit/zi` | **0** ✅ |

### Build

| Command | Result |
|---------|--------|
| `npm run build:js` | ✅ Clean |
| `npm run build:css` | ✅ Clean |

### Diff summary

| Metric | Value |
|--------|-------|
| Files changed | **16** (15 homepages + 1 pricing) |
| Insertions | 16 |
| Deletions | 16 |
| Net lines | 0 (pure replacements) |

---

## Impact

| Category | Before | After |
|----------|--------|-------|
| Static homepage footer year | `© 2025` (15 files) | `© 2026` ✅ |
| `/pricing/` JSON-LD Free plan description | `"1 PDF per day"` | `"Free PDF preview — 2 of 7 days"` ✅ |
| Generated pages | Unchanged (already correct) | Unchanged |
| Smoke test static file score | 11/15 | **~14/15** |

---

## Remaining Backlog (from smoke test)

| Priority | Task | Status |
|----------|------|--------|
| 🟡 Medium | Fix garbled EN slugs: `Smørrebrød → Smorrebrod`, `Bacalhau à Brás → Bacalhau a Bras` | Pending |
| 🔵 Low | Verify GitHub Actions CI | Pending |
| 🔵 Low | Phase 2: hreflang per-recipe (all 14 languages) | Backlog |
| 🔵 Low | Phase 2: per-recipe food images | Backlog |
