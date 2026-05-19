# Recipe Quality Factory — Status Board

Tracks implementation status for the Tier A recipe quality programme.
Audit details live in `RECIPE_QUALITY_PHASE_1_AUDIT.md`.

---

## Status Table

| ID | Recipe | Audit | Impl | Commit | Notes |
|---|---|---|---|---|---|
| 1 | Spaghetti Carbonara | ✅ | ✅ | `2c4e9fc6` | 10 fixes: 3 struct fields, 2 name locales, 3 originText grammar, time 20→30, desc 14 langs |
| 2 | Tripe Soup / Ciorbă de burtă | ✅ | ✅ | `4b239d93` | 6 fixes: 3 name locales (tr/it/ko), 3 originText grammar (ru/tr/it) |
| 3 | Quiche Lorraine | ✅ | ✅ | `12dbcf41` | 3 fixes: howIsMade.ru critical typo (рюмками→сливками), time 45→75, desc 14 langs (ham→lardons) |
| 4 | Gazpacho | ✅ | ✅ | `4e889857` | 7 fixes: name.ko, 4 originText grammar (fr/ru/it/ko), time 15→135, remove 'quick' tag |
| 5 | Sushi | ✅ | ✅ | `48205675` | 5 fixes: name.ko, 4 originText grammar (fr/ru/it/ko) |
| — | (id 6 absent) | — | — | — | No recipe with id 6 in file |
| 7 | Cheeseburger | ✅ | — | — | Already Tier A — no changes needed |
| 8 | Tacos | ✅ | — | — | Already Tier A — no changes needed |
| 9 | Chicken Curry | ✅ | ✅ | `9fa6ebc2` | 10 fixes: 3 struct fields, 6 originText grammar (fr/pt/ru/tr/it/ko), time 35→60 |
| 10 | Ratatouille | ✅ | ✅ | `65dbf968` | 2 fixes: originText.pt "da França", time 45→60 |
| 11 | Souvlaki | ✅ | ✅ | `c9918778` | 2 fixes: originText.pt "da Grécia", time 30→80 (1h marinade) |
| 12 | Dhal | ✅ | ✅ | `8f4ca230` | 7 fixes: name.ko, 5 originText grammar (fr/pt/ru/it/ko), time 40→45 |
| 13 | Guacamole | ✅ | ✅ | `60f45f3d` | 1 fix: add servings:4 |
| 14 | Borscht | ✅ | ✅ | `4e1d6dd2` | 9 fixes: 3 struct fields (soup), name.ko, 5 originText grammar (pt/ru/tr/it/ko) |
| 15 | Pancakes | ✅ | — | — | Already Tier A — no changes needed |
| 16 | Pad Thai | ✅ | ✅ | `7ce0f6df` | 8 fixes: 3 struct fields (fish), name.ko, 4 originText grammar (pt/ru/it/ko), time 25→40, remove 'quick' tag |
| 17 | Schnitzel | ✅ | — | — | Already Tier A — no changes needed |
| 18 | Feijoada | ✅ | ✅ | `816e7821` | 1 fix: time 90→120 (1h bean simmer + 45-60min second simmer) |
| 19 | Kung Pao Chicken | ✅ | ✅ | `d4db6206` | 8 fixes: 3 struct fields, name.ko, 5 originText grammar (pt/ru/tr/it/ko) |
| 20 | Fish and Chips | ✅ | ✅ | `0410a40a` | 12 fixes: 3 struct fields (fish), 3 name locales (tr/it/ko), 6 originText grammar (fr/pt/ru/tr/it/ko) |
| 21 | Pho | ✅ | ✅ | `b53e7aeb` | 6 fixes: name.ko, 5 originText grammar (fr/pt/ru/it/ko) |
| 22 | Paella | ✅ | ✅ | `21387273` | 6 fixes: name.ko, 5 originText grammar (fr/pt/ru/it/ko) |
| 23 | Bibimbap | ✅ | ✅ | `05a76d62` | 5 fixes: name.ko, 4 originText grammar (pt/ru/it/ko) |
| 24 | Hummus | ✅ | ✅ | `4e1c7976` | 1 fix: add servings:4 |
| 25 | Tabbouleh | ✅ | ✅ | `4e1c7976` | 1 fix: add servings:4 |
| 26 | Risotto | ✅ | — | — | Already Tier A — no changes needed |
| 27 | Swedish Meatballs | ✅ | — | — | Already Tier A — no changes needed |
| 28 | Ramen | ✅ | — | — | Already Tier A — no changes needed |
| 29 | Empanadas | ✅ | — | — | Already Tier A — no changes needed |
| 30 | Tzatziki | ✅ | ✅ | `eeb27ad5` | 1 fix: add servings:4 |
| 31 | French Onion Soup | ✅ | ✅ | `eeb27ad5` | 1 fix: originText.pt "de França"→"da França" |
| 32 | Goulash | ✅ | — | — | Already Tier A — no changes needed |
| 33 | Koshari | ✅ | ✅ | `eeb27ad5` | 1 fix: add servings:4 |
| — | (id 34 absent) | — | — | — | No recipe with id 34 in file |
| 35 | Baklava | ✅ | ✅ | `eeb27ad5` | 1 fix: add servings:8 |
| 36 | Chili con Carne | ✅ | — | — | Already Tier A — no changes needed |
| 37 | Sweet and Sour Chicken | ✅ | ✅ | `eeb27ad5` | 6 fixes: name.de/tr (missing umlauts/Turkish chars), originText.de/tr/pt/it |
| 38 | Pavlova | ✅ | ✅ | `eeb27ad5` | 6 fixes: add servings:8, originText.fr/de/pt/tr/it (stripped diacritics) |
| 39 | Poutine | ✅ | ✅ | `eeb27ad5` | 6 fixes: add servings:4, originText.fr/de/pt/tr/it (stripped diacritics) |
| 40 | Pierogi | ✅ | ✅ | `eeb27ad5` | 4 fixes: add servings:4, originText.fr/pt/tr (stripped diacritics) |
| 41 | Nasi Goreng | ✅ | ✅ | `eeb27ad5` | 9 fixes: 3 struct fields, name.ko, originText.fr/pt/ru/it/ko; NOTE: stub recipe (no ingredient quantities, missing hi lang) |
| 42 | Fondue | ✅ | ✅ | `11c5eb14` | 8 fixes: 3 struct fields, name.ko, originText.de/pt/ru/it/ko; NOTE: stub recipe (no ingredient quantities, missing hi lang) |
| 43 | Masgouf | ✅ | ✅ | `f8fbcec3` | 9 fixes: 3 struct fields, name.ko, originText.fr/pt/ru/it/ko; NOTE: stub recipe |
| 44 | Shakshuka | ✅ | ✅ | `b1a7f417` | 9 fixes: 3 struct fields, name.ko, originText.fr/pt/ru/it/ko; NOTE: stub recipe |
| 45 | Salmon Soup | ✅ | ✅ | `1fd96fe1` | 12 fixes: 3 struct fields, name.it/ko/tr, originText.pt/ru/tr/it/ko; NOTE: stub recipe |
| 46 | Ghormeh Sabzi | ✅ | ✅ | `2ca28c8f` | 9 fixes: 3 struct fields, name.ko, originText.fr/pt/ru/it/ko; NOTE: stub recipe |
| 47 | Bacalhau à Brás | ✅ | ✅ | `8ec94c6f` | 9 fixes: 3 struct fields, name.ko, originText.fr/pt/ru/it/ko |
| 48 | Adobo | ✅ | ✅ | `8487adf0` | 11 fixes: 3 struct fields, name.ko, originText.fr/de/pt/ru/it/ko; NOTE: stub recipe |
| 49 | Jerk Chicken | ✅ | ✅ | `9401ae5e` | 13 fixes: 3 struct fields, origin it/tr/ko, name.it/ko, originText.fr/pt/ru/tr/it/ko |
| 50 | Doro Wat | ✅ | ✅ | `a0a1b5a5` | 12 fixes: 3 struct fields, origin it/tr/ko, name.ko, originText.fr/pt/ru/tr/it/ko; NOTE: stub recipe |
| 51 | Kibbeh | ✅ | ✅ | `22730291` | 12 fixes: 3 struct fields, origin it/tr/ko, name.ko, originText.pt/ru/tr/it/ko; NOTE: stub recipe |
| 52 | Stamppot | ✅ | ✅ | `454512b4` | 11 fixes: 3 struct fields, name.ko, originText.fr/de/pt/ru/it/ko; NOTE: stub recipe |
| 53 | Hangi | ✅ | ✅ | `09c90a91` | 12 fixes: 3 struct fields, origin it/tr/ko, name.ko, originText.pt/ru/tr/it/ko; NOTE: stub recipe |
| 54 | Moules-frites | ✅ | ✅ | `04ba532e` | 9 fixes: 3 struct fields, name.ko, originText.pt/ru/tr/it/ko |
| 55 | Moussaka | ✅ | ✅ | `7fb899a0` | 8 fixes: 3 struct fields, name.ko, originText.pt/ru/it/ko |
| 56 | Svíčková | ✅ | ✅ | `96cd3925` | 12 fixes: 3 struct fields, origin it/tr/ko, name.ko, originText.fr/pt/ru/tr/it/ko |
| 57 | Fårikål | ✅ | ✅ | `f8c93958` | 8 fixes: 3 struct fields, name.ko, originText.pt/ru/it/ko; NOTE: stub recipe |
| 58 | Ful Medames | ✅ | ✅ | `186f970a` | 10 fixes: 3 struct fields, origin.ko, name.ko, originText.fr/pt/ru/it/ko; NOTE: stub recipe |
| 59 | Pasticada | ✅ | ✅ | `df31196c` | 12 fixes: 3 struct fields, origin it/tr/ko, name.ko, originText.pt/ru/tr/it/ko; NOTE: stub recipe |
| 60 | Buuz | ✅ | ✅ | `6ed83b6e` | 12 fixes: 3 struct fields, origin tr/ko, name.ko, originText.de/pt/ru/tr/it/ko; NOTE: stub recipe |

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

### Validation: ✅ build clean · ✅ FR (d'Espagne) · ✅ RU (из Испании tagline) · ✅ IT (ricetta tradizionale della Spagna) · ✅ KO (가스파초)

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

### Validation: ✅ build clean · ✅ FR (du Japon) · ✅ RU (из Японии) · ✅ IT (ricetta tradizionale del Giappone) · ✅ KO (스시)

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

### Validation: ✅ build clean · ✅ all 14 locale pages updated · ✅ FR (d'Inde) · ✅ RU (из Индии) · ✅ IT (ricetta tradizionale dell'India) · ✅ KO (닭 카레는)

---

## ID 10 — Ratatouille — Change Log

**Commit:** `65dbf968` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `originText.pt` | `"…de França."` | `"…da França."` (feminine article contraction) |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `45` | `60` (salt-and-drain step + sequential sautéing + simmer) |

### Validation: ✅ build clean · ✅ PT (da França) · ✅ RO/EN pages

---

## ID 11 — Souvlaki — Change Log

**Commit:** `c9918778` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `originText.pt` | `"…de Grécia."` | `"…da Grécia."` (feminine article contraction) |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `30` | `80` (mandatory 1 hour marinade) |

### Validation: ✅ build clean · ✅ PT (da Grécia) · ✅ RO/EN pages

---

## ID 12 — Dhal — Change Log

**Commit:** `8f4ca230` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `name.ko` | `"Dhal"` | `"달"` |
| `originText.fr` | `"…de Inde."` | `"…d'Inde."` (elision) |
| `originText.pt` | `"…de Índia."` | `"…da Índia."` (feminine article contraction) |
| `originText.ru` | `"…из Индия."` | `"…из Индии."` (genitive) |
| `originText.it` | `"…risotta tradizionale di India."` | `"…ricetta tradizionale dell'India."` |
| `originText.ko` | `"Dhal는(은) 인도의 전통 요리입니다."` | `"달은 인도의 전통 요리입니다."` |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `40` | `45` (onion caramelization + lentil simmer = ~45 min) |

### Validation: ✅ build clean · ✅ FR (d'Inde) · ✅ RU (из Индии) · ✅ IT (ricetta tradizionale dell'India) · ✅ KO (달은)

---

## ID 13 — Guacamole — Change Log

**Commit:** `60f45f3d` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `servings` | missing | `4` |

### `recipes-meta.js` — No changes (time:15 accurate, desc accurate)

### Validation: ✅ build clean · ✅ RO/EN pages (recipeYield was already 4 via generator default; explicit field added for schema correctness)

---

## ID 14 — Borscht — Change Log

**Commit:** `4e1d6dd2` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `servings` | missing | `4` |
| `tipType` | missing | `'soup'` |
| `pairingsType` | missing | `'soup'` |
| `name.ko` | `"Borscht"` | `"보르시"` |
| `originText.pt` | `"…de Rússia."` | `"…da Rússia."` (feminine article contraction) |
| `originText.ru` | `"…из Россия."` | `"…из России."` (genitive) |
| `originText.tr` | `"borş çorbası …"` | `"Borş çorbası …"` (capitalize sentence start) |
| `originText.it` | `"…risotta tradizionale di Russia."` | `"…ricetta tradizionale della Russia."` |
| `originText.ko` | `"Borscht는(은) 러시아의 전통 요리입니다."` | `"보르시는 러시아의 전통 요리입니다."` |

### `recipes-meta.js` — No changes (time:90 accurate for long-simmered beet soup)

### Validation: ✅ build clean · ✅ PT (da Rússia) · ✅ RU (из России) · ✅ IT (ricetta tradizionale della Russia) · ✅ KO (보르시는)

---

## ID 15 — Pancakes — No changes

Already meets Tier A standard. All originText grammatically correct, all name locales in native script, time accurate, desc accurate.

---

## ID 16 — Pad Thai — Change Log

**Commit:** `7ce0f6df` | **Date:** 2026-05-18

### Changes made — `public/js/recipes.js`
| Field | Before | After |
|---|---|---|
| `servings` | missing | `4` |
| `tipType` | missing | `'fish'` |
| `pairingsType` | missing | `'fish'` |
| `name.ko` | `"Pad Thai"` | `"팟타이"` |
| `originText.pt` | `"…de Tailândia."` | `"…da Tailândia."` (feminine article contraction) |
| `originText.ru` | `"…из Таиланд."` | `"…из Таиланда."` (genitive) |
| `originText.it` | `"…risotta tradizionale di Thailandia."` | `"…ricetta tradizionale della Thailandia."` |
| `originText.ko` | `"Pad Thai는(은) 태국의 전통 요리입니다."` | `"팟타이는 태국의 전통 요리입니다."` |

### Changes made — `public/js/recipes-meta.js`
| Field | Before | After |
|---|---|---|
| `time` | `25` | `40` (30 min rice noodle soak is mandatory) |
| `tags` | `['quick','high-protein']` | `['high-protein']` (remove 'quick' — 40 min is not quick) |

### Validation: ✅ build clean · ✅ PT (da Tailândia) · ✅ RU (из Таиланда) · ✅ IT (ricetta tradizionale della Thailandia) · ✅ KO (팟타이)

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
