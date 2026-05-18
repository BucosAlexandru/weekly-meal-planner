# Recipe Quality Phase 1 Audit — ID 1 Only

**Recipe:** Spaghetti Carbonara  
**ID:** 1  
**Source files audited:**  
- `public/js/recipes.js` lines 2–94  
- `public/js/recipes-meta.js` id `1` entry  

**Status:** Audit complete. No edits made. Awaiting approval.

---

## Tier A Quality Standard (defined here for reuse)

A Tier A recipe must satisfy all of the following:

| Criterion | Requirement |
|---|---|
| **Ingredients** | Every item has a specific quantity (grams, ml, count, tsp/tbsp). No "some", "a little", "to taste" except for final seasoning. |
| **Steps** | Numbered or clearly sequenced. Each step has a time or visual cue. No vague verbs ("cook until done"). |
| **Timing** | `recipes-meta.time` reflects real wall-clock time (boiling water included). Never understated. |
| **Servings** | `servings` field present in `recipes.js`. |
| **Tip/Pairing types** | `tipType` and `pairingsType` fields present in `recipes.js`. |
| **Names** | All 13 languages have the recipe name in their own script (no raw English left in non-Latin locales). |
| **originText** | Grammatically correct in every language. No template errors (wrong case, wrong article, wrong word). |
| **recipes-meta desc** | Mentions the correct hero ingredients (no substitution of guanciale → "bacon", Pecorino → "parmesan"). |

---

## Recipe ID 1: Spaghetti Carbonara

### A. Structural fields missing from `recipes.js`

Every other recipe from id 2 onward has `servings`, `tipType`, and `pairingsType`. Recipe id 1 has none of them.

| Missing field | Required value | Reasoning |
|---|---|---|
| `servings` | `4` | 400 g pasta = 4 standard portions (100 g/person) |
| `tipType` | `'pasta'` | `'pasta'` is a valid tipType used by other pasta entries |
| `pairingsType` | `'pasta'` | Consistent with pasta category pairing logic |

**Risk:** Low. Adding three fields that already exist in every other recipe.

---

### B. `originText` — grammatical errors across languages

The originText for id 1 is a short template sentence. Three languages have hard grammatical errors; one is a real word error.

| Language | Current (line) | Problem | Proposed correction |
|---|---|---|---|
| `it` (line 91) | `"Spaghetti Carbonara è una risotta tradizionale di Italia."` | **"risotta"** is not an Italian word (conflates "ricetta" and "risotto"). **"di Italia"** should be **"dell'Italia"** or simply **"italiana"**. | `"Spaghetti Carbonara è una ricetta tradizionale italiana."` |
| `fr` (line 83) | `"Spaghetti Carbonara est une recette traditionnelle de Italie."` | French requires elision before a vowel: **"de Italie"** → **"d'Italie"**. | `"Spaghetti Carbonara est une recette traditionnelle d'Italie."` |
| `ru` (line 86) | `"Спагетти Карбонара — традиционный рецепт из Италия."` | "Италия" is nominative; after preposition "из" the genitive **"Италии"** is required. | `"Спагетти Карбонара — традиционный рецепт из Италии."` |

**Risk:** Low. Single-field string replacements.

---

### C. `name` — non-Latin locales left in English/romanised script

| Language | Current (line) | Problem | Proposed correction |
|---|---|---|---|
| `ko` (line 32) | `"Spaghetti Carbonara"` | Korean has a standard transliteration convention; leaving the raw English name is inconsistent with every other Korean name in the file. | `"스파게티 카르보나라"` |
| `zh` (line 28) | `"培根意大利面"` | Literally "bacon pasta". Correct but generic — does not identify this dish as Carbonara. All other Chinese names use the specific dish name. | `"意式培根蛋面"` (Italian bacon-and-egg pasta) or `"卡波纳拉意面"` |

**Note on zh:** "意式培根蛋面" is more descriptive and commonly used on Chinese menus; "卡波纳拉意面" is a direct transliteration. Either is correct. Recommend "意式培根蛋面" as it matches the tone of other zh names in the file.

**Risk:** Low. Two string replacements.

---

### D. `recipes-meta.js` — time understated and desc uses wrong ingredients

**File:** `public/js/recipes-meta.js`, id `1` entry.

#### D1. Time

| Field | Current | Problem | Proposed |
|---|---|---|---|
| `time` | `20` | 20 minutes is not achievable. Step breakdown: bring 4L to boil (~8–10 min on most hobs) + render guanciale 8–10 min (parallel, but boiling water is the bottleneck) + cook pasta 8–10 min + emulsify ~3 min. Real wall-clock: **28–32 min**. | `30` |

Setting `time: 20` also makes the `'quick'` tag misleading — 30 min sits at the outer edge of "quick" but is borderline acceptable. If `time` is corrected to `30`, consider removing `'quick'` from tags or keeping it as 30 min is still quick relative to other dinner recipes.

#### D2. `desc` — wrong ingredient names in all 14 languages

The current desc says "bacon" and "parmesan" across all languages. The recipe itself uses **guanciale (or pancetta)** and **Pecorino Romano + Parmigiano Reggiano**. This is not a minor simplification — calling guanciale "bacon" is the single most common Carbonara mistake. The desc is the first text users see on the recipe card and sets expectations.

**Current EN desc (and equivalent in all languages):**  
`"Creamy pasta with crispy bacon and parmesan, done in 20 min."`

**Proposed EN desc:**  
`"Silky Roman pasta with guanciale, Pecorino Romano and eggs — ready in 30 min."`

Full 14-language proposed desc block:

```js
desc: d(
  'Paste romane mătăsoase cu guanciale, Pecorino Romano și ouă — gata în 30 min.',
  'Silky Roman pasta with guanciale, Pecorino Romano and eggs — ready in 30 min.',
  'Pasta romana sedosa con guanciale, Pecorino Romano y huevos — lista en 30 min.',
  'Pâtes romaines soyeuses au guanciale, Pecorino Romano et œufs — prêtes en 30 min.',
  'Seidige römische Pasta mit Guanciale, Pecorino Romano und Eiern — fertig in 30 Min.',
  'Macarrão romano sedoso com guanciale, Pecorino Romano e ovos — pronto em 30 min.',
  'Шелковистая римская паста с гуанчале, Пекорино Романо и яйцами — готово за 30 мин.',
  'معكرونة رومانية حريرية مع غوانشالي وبيكورينو رومانو والبيض — جاهزة في 30 دقيقة.',
  '丝滑罗马风味意面，关查莱、佩科里诺干酪与鸡蛋，30分钟完成。',
  '絹のようなローマ風パスタ、グアンチャーレとペコリーノ・ロマーノと卵で30分完成。',
  'Guanciale, Pecorino Romano ve yumurtalı ipeksi Roma makarnası — 30 dakikada hazır.',
  'Pasta romana setosa con guanciale, Pecorino Romano e uova — pronta in 30 min.',
  '관찰레, 페코리노 로마노, 달걀로 만든 실크처럼 부드러운 로마 파스타, 30분 완성.',
  'गुआनशाले, पेकोरिनो रोमानो और अंडे के साथ रेशमी रोमन पास्ता — 30 मिनट में तैयार।'
)
```

**Risk:** Low. String-only replacement.

---

### E. Content confirmed correct — no changes needed

The following fields are accurate and meet Tier A standard already:

| Field | Assessment |
|---|---|
| `ingredients.en` (and all 13 languages) | Specific quantities on every item. Correct proper names (guanciale, Pecorino Romano, Parmigiano Reggiano). Salt is acceptably "to taste" for pasta water (standard practice). |
| `howIsMade.en` (and all 13 languages) | Technically correct technique: cold-pan guanciale render, off-heat emulsification, tempering via starchy water, correct scramble-prevention method. Consistent across all 13 language versions. |
| `category` | "Lunch" is acceptable for a meal planner context. In Italy, Carbonara is a primo piatto served at both lunch and dinner; the simplification is harmless. |
| `origin` | "Italy" correct in all 13 languages. |
| `recipes-meta.costRon` | 22 RON per serving is plausible for guanciale + pasta + Pecorino in Romania. |
| `recipes-meta.tags` | `['quick','high-protein','family']` — correct except `'quick'` becomes borderline if time is corrected to 30. Suggest keeping it since 30 min is still fast vs average dinner. |

---

## Summary of exact edits pending approval

### File: `public/js/recipes.js`

| # | Line(s) | Field | Change |
|---|---|---|---|
| 1 | After line 3 (`id: 1,`) | Add `servings` | Insert `servings: 4,` |
| 2 | After `servings` | Add `tipType` | Insert `tipType: 'pasta',` |
| 3 | After `tipType` | Add `pairingsType` | Insert `pairingsType: 'pasta',` |
| 4 | Line 28 | `name.zh` | `"培根意大利面"` → `"意式培根蛋面"` |
| 5 | Line 32 | `name.ko` | `"Spaghetti Carbonara"` → `"스파게티 카르보나라"` |
| 6 | Line 83 | `originText.fr` | `"de Italie"` → `"d'Italie"` |
| 7 | Line 86 | `originText.ru` | `"из Италия"` → `"из Италии"` |
| 8 | Line 91 | `originText.it` | `"una risotta tradizionale di Italia"` → `"una ricetta tradizionale italiana"` |

**Total edits in recipes.js:** 8 (3 field insertions + 5 string fixes)

### File: `public/js/recipes-meta.js`

| # | Field | Change |
|---|---|---|
| 9 | `time` | `20` → `30` |
| 10 | `desc` (all 14 languages) | Replace full desc block with corrected version (section D2 above) |

**Total edits in recipes-meta.js:** 2 (one integer + one 14-language string block)

---

## Risk assessment

| Change | Risk | Reason |
|---|---|---|
| Add `servings`, `tipType`, `pairingsType` | **Low** | Additive fields. All other recipes have them. No downstream breakage. |
| Fix `name.ko`, `name.zh` | **Low** | String replacement. No slug or URL change. |
| Fix `originText.fr`, `ru`, `it` | **Low** | String replacement, display-only. |
| `time: 20 → 30` | **Low** | Affects "Ready in X min" display and the `'quick'` tag logic only. |
| Replace `desc` in recipes-meta | **Low** | Display-only text on recipe cards. |

**No slug changes. No URL changes. No generator, pricing, API, auth, or SEO infrastructure touched.**

---

*Audit by Claude Code — awaiting approval before any edits to source files.*
