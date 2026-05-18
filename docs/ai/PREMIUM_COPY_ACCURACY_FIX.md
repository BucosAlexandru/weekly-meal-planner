# Premium Copy Accuracy Fix

_Implemented: 2026-05-18_
_Commit: `72a7b680c`_
_Owner: Claude Code (Lead Developer)_

---

## Problem

Every pricing page (root `/pricing/` and all 14 localised variants) claimed that Premium
includes an **"AI nutrition coach"**. This was inaccurate:

- `api/coach.js` implements a general assistant, a cooking assistant, and a fitness/workout
  assistant — not a personalised nutrition system.
- The app has no user goals, allergy tracking, calorie counting, health records, or adaptive
  meal plan logic.
- Calling a chat assistant a "coach" overpromises and risks regulatory/trust issues.
- The homepage in-page pricing section (`renderPricingSection()` in `app.js`) never mentioned
  AI features at all — the pricing pages were inconsistent with the main app copy.

Additionally, `public/pricing/index.html` had a stale OG description calling it `"AI chef"` —
a third label used nowhere else.

---

## What Was Changed

### Scope

Pure copy changes only. No API, logic, card layout, payment, recipe, or sitemap changes.

### Replacement

| Before | After |
|--------|-------|
| `AI nutrition coach` | `AI meal planning assistant` |
| And 13 translated equivalents (see table below) | → equivalent safer translations |

### Files changed

| File | Strings changed |
|------|----------------|
| `public/pricing/index.html` | 6 (OG desc, JSON-LD product desc, JSON-LD offer desc, Free ✗ row, Premium ✅ row, FAQ answer) |
| `scripts/generate-content.mjs` | 42 (14 languages × 3 positions each: `freeFeats`, `premFeats`, FAQ answer) |
| 14 generated `/{lang}/{slug}/index.html` | Rebuilt automatically via `npm run content` |

`app.js` — **not changed** (homepage pricing section already listed no AI features).

---

## Before / After — All 14 Languages

| Lang | Before | After |
|------|--------|-------|
| `en` | `AI nutrition coach` | `AI meal planning assistant` |
| `ro` | `Coach nutriție AI` | `Asistent AI planificare mese` |
| `es` | `Coach de nutrición IA` | `Asistente IA planificación` |
| `fr` | `Coach nutrition IA` | `Assistant IA planification` |
| `de` | `KI-Ernährungscoach` | `KI-Mahlzeiten-Assistent` |
| `pt` | `Coach de nutrição IA` | `Assistente IA planeamento` |
| `ru` | `ИИ-тренер по питанию` | `ИИ-помощник по планированию` |
| `ar` | `مدرب تغذية بالذكاء الاصطناعي` | `مساعد الذكاء الاصطناعي للتخطيط` |
| `zh` | `AI营养教练` | `AI膳食规划助手` |
| `ja` | `AI栄養コーチ` | `AIミールプランアシスタント` |
| `hi` | `AI पोषण कोच` | `AI भोजन योजना सहायक` |
| `tr` | `AI beslenme koçu` | `AI yemek planlama asistanı` |
| `it` | `coach nutrizione IA` | `assistente IA di pianificazione` |
| `ko` | `AI 영양 코치` | `AI 식단 계획 도우미` |

Also fixed in `/pricing/index.html` OG description:

| Before | After |
|--------|-------|
| `"Unlimited PDFs, AI chef, budget menu — all for €3/month."` | `"Unlimited PDFs, AI meal planning assistant, budget menu — all for €3/month."` |

---

## Verification

```
Generated 2576 pages total.   ✅ (unchanged)
sitemap.xml — 2620 URLs       ✅ (unchanged)
```

Old strings confirmed absent from all 15 pricing pages (grep returned empty).

New strings confirmed present:
- `/pricing/index.html` → `AI meal planning assistant` ✅
- `/ro/premium/` → `Asistent AI planificare` ✅
- `/en/pricing/` → `AI meal planning assistant` ✅
- `/de/preise/` → `KI-Mahlzeiten-Assistent` ✅
- `/ko/pricing/` → `AI 식단 계획 도우미` ✅

---

## What This Does NOT Fix

The following copy accuracy issues remain open (deferred to a future quality pass):

- **"1 full PDF per day"** on the Free card — free users actually get a 2-day PDF
  (`window.hasUnlimited = false` → 2-day generation). "Full" is misleading.
- **AI recipe assistant** is still listed as a Premium feature but does not appear in the
  homepage `renderPricingSection()`. Consistency between homepage and `/pricing/` copy is
  deferred.
- A full copy QA audit (`docs/ai/PRICING_PAGE_QUALITY_AUDIT.md`) is still pending approval.
