# Pricing Consistency Fix

_Implemented: 2026-05-18_
_Commit: `105831bc7`_
_Owner: Claude Code (Lead Developer)_

---

## Problems Fixed

### Problem 1 — "1 full PDF per day" was doubly inaccurate

The Free card on every pricing surface claimed `"1 full PDF per day"`. Both parts were wrong:

- **"Full"** — the free PDF contains exactly **2 days** of a 7-day plan (controlled by `const freeDays = 2` in `app.js` line 484). It is a preview, not the complete plan.
- **"Per day"** — there is no daily download cap. The comment at line 1360 of `app.js` confirms: `// Free users always allowed — content is limited to 2 days inside generatePDFimpact()`. Free users can download as many times as they want; they just always get the same 2-day preview.

The `i18n.js` file already contained the correct label in all 14 languages (`"pdf.free.label": "Free preview — 2 of 7 days"` for English). These translations were adopted across all surfaces.

### Problem 2 — Homepage pricing section omitted AI features

The `renderPricingSection()` function in `app.js` (homepage in-page pricing cards, shown to non-premium users) listed only 4 Premium features and no AI features. The standalone `/pricing/` page and all 14 localised pricing pages correctly listed `AI recipe assistant (chat)` and `AI meal planning assistant`. This created an inconsistency where switching between the homepage and the pricing page showed different premium feature sets.

---

## Scope

Pure copy changes only. No logic, payment, API, card layout, or sitemap changes.

---

## What Was Changed

### Files changed

| File | Changes |
|------|---------|
| `public/js/app.js` | 14 language entries in `renderPricingSection()` P object: (1) freeFeats PDF row corrected; (2) 2 AI rows added to premFeats |
| `scripts/generate-content.mjs` | 14 language entries in `PRICING_COPY`: freeFeats PDF row corrected + FAQ answer corrected |
| `public/pricing/index.html` | 1 Free card row corrected |
| `public/js/app.min.js` | Rebuilt from updated `app.js` |
| 14 generated `/{lang}/{slug}/index.html` | Rebuilt automatically via `npm run content` |

---

## Before / After — Free PDF Row (all surfaces)

| Lang | Before | After |
|------|--------|-------|
| `en` | `✅ 1 full PDF per day` | `✅ Free preview — 2 of 7 days` |
| `ro` | `✅ 1 PDF complet / zi` | `✅ Previzualizare gratuită — 2 zile din 7` |
| `es` | `✅ 1 PDF completo / día` | `✅ Vista previa gratuita — 2 de 7 días` |
| `fr` | `✅ 1 PDF complet / jour` | `✅ Aperçu gratuit — 2 jours sur 7` |
| `de` | `✅ 1 PDF / Tag` | `✅ Kostenlose Vorschau — 2 von 7 Tagen` |
| `pt` | `✅ 1 PDF completo / dia` | `✅ Pré-visualização gratuita — 2 de 7 dias` |
| `ru` | `✅ 1 PDF / день` | `✅ Бесплатный просмотр — 2 из 7 дней` |
| `ar` | `✅ PDF واحد / يوم` | `✅ معاينة مجانية — يومان من أصل 7` |
| `zh` | `✅ 每天1份PDF` | `✅ 免费预览 — 7天中的2天` |
| `ja` | `✅ 1日1PDF` | `✅ 無料プレビュー — 7日中2日` |
| `hi` | `✅ 1 PDF / दिन` | `✅ मुफ्त पूर्वावलोकन — 7 में से 2 दिन` |
| `tr` | `✅ Günde 1 PDF` | `✅ Ücretsiz önizleme — 7 günden 2'si` |
| `it` | `✅ 1 PDF completo / giorno` | `✅ Anteprima gratuita — 2 giorni su 7` |
| `ko` | `✅ 하루 1 PDF` | `✅ 무료 미리보기 — 7일 중 2일` |

---

## Before / After — Homepage premFeats (AI rows added, `app.js` only)

The following 2 rows were added to each language's `premFeats` array, before "Unlimited access":

| Lang | AI recipe row added | AI planning row added |
|------|--------------------|-----------------------|
| `en` | `✅ AI recipe assistant (chat)` | `✅ AI meal planning assistant` |
| `ro` | `✅ Asistent AI rețete (chat)` | `✅ Asistent AI planificare mese` |
| `es` | `✅ Asistente IA recetas (chat)` | `✅ Asistente IA planificación` |
| `fr` | `✅ Assistant IA recettes (chat)` | `✅ Assistant IA planification` |
| `de` | `✅ KI-Rezept-Assistent (Chat)` | `✅ KI-Mahlzeiten-Assistent` |
| `pt` | `✅ Assistente IA receitas (chat)` | `✅ Assistente IA planeamento` |
| `ru` | `✅ ИИ-помощник по рецептам (чат)` | `✅ ИИ-помощник по планированию` |
| `ar` | `✅ مساعد وصفات بالذكاء الاصطناعي (دردشة)` | `✅ مساعد الذكاء الاصطناعي للتخطيط` |
| `zh` | `✅ AI食谱助手（聊天）` | `✅ AI膳食规划助手` |
| `ja` | `✅ AIレシピアシスタント（チャット）` | `✅ AIミールプランアシスタント` |
| `hi` | `✅ AI रेसिपी सहायक (चैट)` | `✅ AI भोजन योजना सहायक` |
| `tr` | `✅ AI tarif asistanı (sohbet)` | `✅ AI yemek planlama asistanı` |
| `it` | `✅ Assistente IA ricette (chat)` | `✅ Assistente IA pianificazione` |
| `ko` | `✅ AI 레시피 도우미 (채팅)` | `✅ AI 식단 계획 도우미` |

---

## Verification

```
Generated 2576 pages total.   ✅ (unchanged)
sitemap.xml — 2620 URLs       ✅ (unchanged)
```

Old strings confirmed absent (grep returned 0) from all 3 source files.

New PDF wording confirmed present: 10 occurrences across `app.js` + `pricing/index.html`.

AI recipe assistant row confirmed present: 14 occurrences in `app.js` (all language premFeats).

---

## What This Does NOT Fix

- A full copy QA audit (`docs/ai/PRICING_PAGE_QUALITY_AUDIT.md`) is still pending.
- PDF free-tier enforcement server-side (Option B) is deferred.
