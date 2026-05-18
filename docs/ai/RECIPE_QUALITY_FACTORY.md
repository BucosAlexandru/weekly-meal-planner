# Recipe Quality Factory — Status Board

Tracks implementation status for the Tier A recipe quality programme.
Audit details live in `RECIPE_QUALITY_PHASE_1_AUDIT.md`.

---

## Phase 1 — Tier A Pilot (10 recipes)

| ID | Recipe | Audit | Impl | Commit | Notes |
|---|---|---|---|---|---|
| 1 | Spaghetti Carbonara | ✅ | ✅ | `2c4e9fc6` | 10 fixes: 3 struct fields, 2 name locales, 3 originText grammar, time 20→30, desc 14 langs |
| 2 | Tripe Soup / Ciorbă de burtă | ✅ | ✅ | `4b239d93` | 6 fixes: 3 name locales (tr/it/ko), 3 originText grammar (ru/tr/it) |
| 3 | Quiche Lorraine | ✅ | ✅ | `12dbcf41` | 3 fixes: howIsMade.ru critical typo (рюмками→сливками), time 45→75, desc 14 langs (ham→lardons) |
| 4 | Gazpacho | ✅ | ✅ | `4e889857` | 7 fixes: name.ko, 4 originText grammar (fr/ru/it/ko), time 15→135, remove 'quick' tag |
| 5 | Sushi | ✅ | ✅ | `48205675` | 5 fixes: name.ko, 4 originText grammar (fr/ru/it/ko) |
| 7 | Cheeseburger | ✅ | — | — | Already Tier A — no changes needed |
| 8 | Tacos | ✅ | — | — | Already Tier A — no changes needed |
| 9 | Chicken Curry | ✅ | ✅ | `9fa6ebc2` | 10 fixes: 3 struct fields, 6 originText grammar (fr/pt/ru/tr/it/ko), time 35→60 |
| — | (id 6 absent) | — | — | — | No recipe with id 6 in file |
| — | Pad Thai | ⬜ | — | — | Pending |
| — | Bibimbap | ⬜ | — | — | Pending |
| — | Butter Chicken | ⬜ | — | — | Not found in recipes.js under this name — needs ID lookup |
| — | Chili con Carne | ⬜ | — | — | Pending |
| — | Shakshuka | ⬜ | — | — | Pending |
| — | Fish and Chips | ⬜ | — | — | Pending |
| — | Shoyu Ramen | ⬜ | — | — | Pending |
| — | Mapo Tofu | ⬜ | — | — | Pending |

---

## ID 1 — Spaghetti Carbonara — Change Log

**Branch:** `claude/remote-control-setup-kYqCw`  
**Commit:** `2c4e9fc6`  
**Date:** 2026-05-18  

### Changes made

#### `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `servings` | missing | `4` |
| `tipType` | missing | `'pasta'` |
| `pairingsType` | missing | `'pasta'` |
| `name.zh` | `"培根意大利面"` | `"意式培根蛋面"` |
| `name.ko` | `"Spaghetti Carbonara"` | `"스파게티 카르보나라"` |
| `originText.fr` | `"…de Italie."` | `"…d'Italie."` |
| `originText.ru` | `"…из Италия."` | `"…из Италии."` |
| `originText.it` | `"…una risotta tradizionale di Italia."` | `"…una ricetta tradizionale italiana."` |

#### `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `20` | `30` |
| `desc` (all 14 langs) | "bacon / parmesan / 20 min" | "guanciale / Pecorino Romano / eggs / 30 min" |

### Validation
- `npm run content` ✅ — 2576 pages generated, no errors
- `npm run build` ✅ — JS bundle, CSS bundle, content all clean
- `/ro/retete/spaghetti-carbonara/` ✅ — guanciale, Pecorino Romano present; pasta tip active
- `/en/recipes/spaghetti-carbonara/` ✅ — guanciale, Pecorino Romano present; recipeYield=4
- `/it/ricette/spaghetti-carbonara/` ✅ — "ricetta tradizionale italiana" confirmed
- `/ko/recipes/spaghetti-carbonara/` ✅ — "스파게티 카르보나라" confirmed
- `/zh/shipu/spaghetti-carbonara/` ✅ — "意式培根蛋面" confirmed
- Korean/zh cascade pages ✅ — recipe index and related-recipe cards updated in both locales

### Not changed (confirmed correct)
- `ingredients` (all 14 languages) — already Tier A quality
- `howIsMade` (all 14 languages) — technically correct, no changes needed
- `name.en` / slug — untouched
- `category`, `origin`, `costRon`, `tags` — untouched

---

## ID 2 — Tripe Soup / Ciorbă de burtă — Change Log

**Commit:** `4b239d93` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `name.tr` | `"Tripe Çorbası"` | `"İşkembe Çorbası"` |
| `name.it` | `"Tripe Zuppa"` | `"Zuppa di Trippa"` |
| `name.ko` | `"Tripe 수프"` | `"내장 수프"` |
| `originText.ru` | `"из Румыния"` | `"из Румынии"` |
| `originText.tr` | `"işkembe çorba …"` | `"İşkembe çorbası …"` |
| `originText.it` | `"trippa zuppa … risotta … di Romania"` | `"Zuppa di trippa … ricetta … della Romania"` |

### `recipes-meta.js` — No changes (time:90 and desc accurate)

### Validation: ✅ build clean · ✅ RO/EN pages · ✅ TR (İşkembe Çorbası) · ✅ IT (Zuppa di Trippa) · ✅ KO (내장 수프) · ✅ RU (из Румынии)

---

## ID 3 — Quiche Lorraine — Change Log

**Commit:** `12dbcf41` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `howIsMade.ru` | `"яйца с рюмками"` (shot glasses) | `"яйца со сливками"` (cream) |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `45` | `75` |
| `desc` (all 14 langs) | "ham/jambon/Schinken/presunto/ветчина/火腿/etc." | "smoked lardons / lardon afumat / etc." |
| `desc.ar` | "بالجبنة" (cheese — wrong) | "باللحم المدخن" (smoked meat) |

### Validation: ✅ build clean · ✅ RO (lardon afumat) · ✅ EN (smoked lardons) · ✅ RU (со сливками confirmed, рюмками gone)

---

## ID 4 — Gazpacho — Change Log

**Commit:** `4e889857` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `name.ko` | `"Gazpacho"` | `"가스파초"` |
| `originText.fr` | `"…de Espagne."` | `"…d'Espagne."` |
| `originText.ru` | `"…из Испания."` | `"…из Испании."` |
| `originText.it` | `"…una risotta tradizionale di Spagna."` | `"…una ricetta tradizionale della Spagna."` |
| `originText.ko` | `"Gazpacho는(은) 스페인의 전통 요리입니다."` | `"가스파초는 스페인의 전통 요리입니다."` |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `15` | `135` |
| `tags` | `['quick','vegetarian','vegan','healthy']` | `['vegetarian','vegan','healthy']` |

### Not changed (confirmed correct)
- `ingredients` (all 14 languages) — specific quantities, correct produce
- `howIsMade` (all 14 languages) — technically correct, mandatory 2h chill already in steps
- `desc` — correctly describes chilled tomato soup, no ingredient substitution
- `servings`, `tipType`, `pairingsType` — already present and correct

### Validation: ✅ build clean · ✅ FR (d'Espagne) · ✅ RU (из Испании tagline) · ✅ IT (ricetta tradizionale della Spagna) · ✅ KO (가스파초) · KO cascade pages updated

---

## ID 4 — Gazpacho — Change Log

**Commit:** `4e889857` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `name.ko` | `"Gazpacho"` | `"가스파초"` |
| `originText.fr` | `"…de Espagne."` | `"…d'Espagne."` |
| `originText.ru` | `"…из Испания."` | `"…из Испании."` |
| `originText.it` | `"…una risotta tradizionale di Spagna."` | `"…una ricetta tradizionale della Spagna."` |
| `originText.ko` | `"Gazpacho는(은) 스페인의 전통 요리입니다."` | `"가스파초는 스페인의 전통 요리입니다."` |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `15` | `135` |
| `tags` | `['quick','vegetarian','vegan','healthy']` | `['vegetarian','vegan','healthy']` |

### Validation: ✅ build clean · ✅ FR (d'Espagne) · ✅ RU (из Испании tagline) · ✅ IT (ricetta tradizionale della Spagna) · ✅ KO (가스파초) · KO cascade pages updated

---

## ID 5 — Sushi — Change Log

**Commit:** `48205675` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `name.ko` | `"Sushi"` | `"스시"` |
| `originText.fr` | `"…de Japon."` | `"…du Japon."` (masculine contraction) |
| `originText.ru` | `"…из Япония."` | `"…из Японии."` (genitive) |
| `originText.it` | `"…una risotta tradizionale di Giappone."` | `"…una ricetta tradizionale del Giappone."` |
| `originText.ko` | `"Sushi는(은) 일본의 전통 요리입니다."` | `"스시는 일본의 전통 요리입니다."` |

### `recipes-meta.js` — No changes (time:45 and desc accurate)

### Validation: ✅ build clean · ✅ FR (du Japon) · ✅ RU (из Японии) · ✅ IT (ricetta tradizionale del Giappone) · ✅ KO (스시) · KO cascade pages updated

---

## ID 7 — Cheeseburger — No changes

Already meets Tier A standard. All originText grammatically correct, all name locales in native script, time 20 min realistic for smash burgers, desc accurate.

---

## ID 8 — Tacos — No changes

Already meets Tier A standard. All originText grammatically correct (RU already "из Мексики", KO already "타코는"), desc accurate, time 25 min realistic.

---

## ID 9 — Chicken Curry — Change Log

**Commit:** `9fa6ebc2` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `servings` | missing | `4` |
| `tipType` | missing | `'meat'` |
| `pairingsType` | missing | `'meat'` |
| `originText.fr` | `"…de Inde."` | `"…d'Inde."` (elision, India feminine in French) |
| `originText.pt` | `"…de Índia."` | `"…da Índia."` (feminine article contraction) |
| `originText.ru` | `"…из Индия."` | `"…из Индии."` (genitive) |
| `originText.tr` | `"tavuk köri …"` | `"Tavuk köri …"` (capitalize sentence start) |
| `originText.it` | `"pollo curry è una risotta tradizionale di India."` | `"Pollo curry è una ricetta tradizionale dell'India."` |
| `originText.ko` | `"닭고기 카레는(은) …"` | `"닭 카레는 …"` (consistent with name.ko) |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `35` | `60` |

### Validation: ✅ build clean · ✅ all 14 locale pages updated (servings/tipType/pairingsType cascade) · ✅ FR (d'Inde) · ✅ RU (из Индии) · ✅ IT (ricetta tradizionale dell'India) · ✅ KO (닭 카레는)

---

## Tier A Quality Standard (reference)

| Criterion | Requirement |
|---|---|
| Ingredients | Every item has a specific quantity. No "some"/"a little" except final seasoning. |
| Steps | Each step has a time or visual doneness cue. |
| Timing | `recipesMeta.time` = realistic wall-clock time (water boil included). |
| Servings | `servings` field present in `recipes.js`. |
| Tip/Pairing types | `tipType` and `pairingsType` present in `recipes.js`. |
| Names | All locales use their own script (no raw English in non-Latin locales). |
| originText | Grammatically correct in every language. |
| desc | Names the correct hero ingredients — no ingredient substitution. |
