# Recipe Quality Factory — Status Board

Tracks implementation status for the Tier A recipe quality programme.
Audit details live in `RECIPE_QUALITY_PHASE_1_AUDIT.md`.

---

## Status Key

| Status | Meaning |
|---|---|
| **Tier A Complete** | Confirmed: exact quantities in all ingredients, complete multi-step EN howIsMade, all 14 locales aligned, struct fields present, visual QA passed |
| **Partial Fix Only** | Struct fields / name locales / originText grammar / translation stubs fixed — but EN ingredient quantities and EN cooking steps NOT verified or rewritten |
| **Stub / Needs Full Rewrite** | Explicitly identified as stub: EN ingredients are single words without quantities; EN howIsMade is 1–2 generic sentences. Surface fixes applied but core content is broken |
| **Needs Visual QA** | Declared Tier A with no changes but never verified against all 10 criteria |

---

## Status Table

| ID | Recipe | Status | Commit | Notes |
|---|---|---|---|---|
| 1 | Spaghetti Carbonara | Partial Fix Only | `2c4e9fc6` | Struct + name/originText/time fixed; EN ingredients+steps not re-verified |
| 2 | Tripe Soup / Ciorbă de burtă | Partial Fix Only | `4b239d93` | name tr/it/ko + originText ru/tr/it fixed |
| 3 | Quiche Lorraine | Partial Fix Only | `12dbcf41` | howIsMade.ru typo fixed; time + desc corrected |
| 4 | Gazpacho | Partial Fix Only | `4e889857` | name.ko + originText fr/ru/it/ko + time corrected |
| 5 | Sushi | Partial Fix Only | `48205675` | name.ko + originText fr/ru/it/ko fixed |
| — | (id 6 absent) | — | — | No recipe with id 6 in file |
| 7 | Cheeseburger | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 8 | Tacos | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 9 | Chicken Curry | Partial Fix Only | `9fa6ebc2` | Struct + originText fr/pt/ru/tr/it/ko + time fixed |
| 10 | Ratatouille | Partial Fix Only | `65dbf968` | originText.pt + time fixed |
| 11 | Souvlaki | Partial Fix Only | `c9918778` | originText.pt + time fixed |
| 12 | Dhal | Partial Fix Only | `8f4ca230` | name.ko + originText fr/pt/ru/it/ko + time fixed |
| 13 | Guacamole | Partial Fix Only | `60f45f3d` | servings field added |
| 14 | Borscht | Partial Fix Only | `4e1d6dd2` | Struct + name.ko + originText pt/ru/tr/it/ko fixed |
| 15 | Pancakes | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 16 | Pad Thai | Partial Fix Only | `7ce0f6df` | Struct + name.ko + originText pt/ru/it/ko + time fixed |
| 17 | Schnitzel | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 18 | Feijoada | Partial Fix Only | `816e7821` | time corrected |
| 19 | Kung Pao Chicken | Partial Fix Only | `d4db6206` | Struct + name.ko + originText pt/ru/tr/it/ko fixed |
| 20 | Fish and Chips | Partial Fix Only | `0410a40a` | Struct + name tr/it/ko + originText fr/pt/ru/tr/it/ko fixed |
| 21 | Pho | Partial Fix Only | `b53e7aeb` | name.ko + originText fr/pt/ru/it/ko fixed |
| 22 | Paella | Partial Fix Only | `21387273` | name.ko + originText fr/pt/ru/it/ko fixed |
| 23 | Bibimbap | Partial Fix Only | `05a76d62` | name.ko + originText pt/ru/it/ko fixed |
| 24 | Hummus | Partial Fix Only | `4e1c7976` | servings field added |
| 25 | Tabbouleh | Partial Fix Only | `4e1c7976` | servings field added |
| 26 | Risotto | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 27 | Swedish Meatballs | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 28 | Ramen | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 29 | Empanadas | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 30 | Tzatziki | Partial Fix Only | `eeb27ad5` | servings field added |
| 31 | French Onion Soup | Partial Fix Only | `eeb27ad5` | originText.pt fixed |
| 32 | Goulash | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 33 | Koshari | Partial Fix Only | `eeb27ad5` | servings field added |
| — | (id 34 absent) | — | — | No recipe with id 34 in file |
| 35 | Baklava | Partial Fix Only | `eeb27ad5` | servings field added |
| 36 | Chili con Carne | Needs Visual QA | — | Declared Tier A — never verified against all 10 criteria |
| 37 | Sweet and Sour Chicken | Partial Fix Only | `eeb27ad5` | name de/tr + originText de/tr/pt/it fixed |
| 38 | Pavlova | Partial Fix Only | `eeb27ad5` | servings + originText fr/de/pt/tr/it fixed |
| 39 | Poutine | Partial Fix Only | `eeb27ad5` | servings + originText fr/de/pt/tr/it fixed |
| 40 | Pierogi | Partial Fix Only | `eeb27ad5` | servings + originText fr/pt/tr fixed |
| 41 | Nasi Goreng | Tier A Complete | `eeb27ad5`→`TBD` | Full rewrite: 12 ingredients with exact quantities, 11-step howIsMade with times/doneness cues, all 14 locales |
| 42 | Fondue | Tier A Complete | `11c5eb14`→`TBD` | Full rewrite: 10 ingredients with exact quantities (Gruyère/Emmental/kirsch), 8-step howIsMade, all 14 locales |
| 43 | Masgouf | Tier A Complete | `f8fbcec3`→`TBD` | Full rewrite: 13 ingredients with exact quantities (1.5kg fish, turmeric/cumin marinade), 9-step howIsMade with grill times, all 14 locales |
| 44 | Shakshuka | Tier A Complete | `feat/44` | Full rewrite: 14 ingredients with exact quantities, 8-step howIsMade with times/cues, all 14 locales |
| 45 | Salmon Soup | Tier A Complete | — | Full rewrite: 11 EN ingredients with exact quantities; 10-step EN howIsMade with timings and doneness cues; all 14 locales including hi |
| 46 | Ghormeh Sabzi | Tier A Complete | — | Full rewrite: 12 EN ingredients with exact quantities; multi-step EN howIsMade with timings (3–4 min browning, 8 min onion, 15–20 min herb fry, 2–2.5 hr simmer); all 14 locales including hi |
| 47 | Bacalhau à Brás | Partial Fix Only | `8ec94c6f` | Struct + name.ko + originText fr/pt/ru/it/ko fixed; no stub note |
| 48 | Adobo | Tier A Complete | — | Full rewrite: 8 EN ingredients with exact quantities; multi-step EN howIsMade with timings (30 min marinade, 30–45 min simmer, 15–20 min reduce, 3–4 min crisping); all 14 locales including hi |
| 49 | Jerk Chicken | Partial Fix Only | `9401ae5e` | Struct + origin + name + originText fixed; no stub note |
| 50 | Doro Wat | Tier A Complete | — | Full rewrite: 12 EN ingredients with exact quantities; 15-step EN howIsMade with timings (25–30 min dry onion fry, 5 min spice bloom, 40–45 min covered simmer, 10 min egg finish); all 14 locales including hi |
| 51 | Kibbeh | Stub / Needs Full Rewrite | `22730291` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 52 | Stamppot | Stub / Needs Full Rewrite | `454512b4` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 53 | Hangi | Stub / Needs Full Rewrite | `09c90a91` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 54 | Moules-frites | Partial Fix Only | `04ba532e` | Struct + name.ko + originText pt/ru/tr/it/ko fixed; no stub note |
| 55 | Moussaka | Partial Fix Only | `7fb899a0` | Struct + name.ko + originText pt/ru/it/ko fixed; no stub note |
| 56 | Svíčková | Partial Fix Only | `96cd3925` | Struct + origin + name.ko + originText fr/pt/ru/tr/it/ko fixed; no stub note |
| 57 | Fårikål | Stub / Needs Full Rewrite | `f8c93958` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 58 | Ful Medames | Stub / Needs Full Rewrite | `186f970a` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 59 | Pasticada (id 59) | Stub / Needs Full Rewrite | `df31196c` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 60 | Buuz | Stub / Needs Full Rewrite | `6ed83b6e` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 61 | Biryani | Partial Fix Only | `7be76e95` | Struct + origin/name/originText fixed; no stub note |
| 62 | Brik | Stub / Needs Full Rewrite | `80a781c2` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 63 | Khachapuri | Stub / Needs Full Rewrite | `0fd228e9` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 64 | Bobotie | Stub / Needs Full Rewrite | `1e7156dc` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 65 | Ceviche | Stub / Needs Full Rewrite | `96b7d091` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 66 | Kimchi | Partial Fix Only | `b93a114b` | Struct + name.ko + category + originText pt/ru/tr/it/ko fixed; no stub note |
| 67 | Banh Mi | Stub / Needs Full Rewrite | `6a5ade8b` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 68 | Satay | Stub / Needs Full Rewrite | `5322300e` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 69 | Laksa | Stub / Needs Full Rewrite | `675b7502` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 70 | Pupusa | Stub / Needs Full Rewrite | `edcc4a7c` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| — | (id 71 absent) | — | — | No recipe with id 71 in file |
| 72 | Amok | Stub / Needs Full Rewrite | `1adeb0de` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 73 | Momo | Stub / Needs Full Rewrite | `f63ff84f` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 74 | Encebollado | Stub / Needs Full Rewrite | `831fb0e0` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 75 | Harira | Stub / Needs Full Rewrite | `226a3dbe` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 76 | Lobio | Stub / Needs Full Rewrite | `e7265c7a` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 77 | Chakhchoukha | Stub / Needs Full Rewrite | `d7dac09d` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only; origin.pt added |
| 78 | Rendang | Stub / Needs Full Rewrite | `21801e1c` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 79 | Gravlax | Stub / Needs Full Rewrite | `799bd94b` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 80 | Stoofvlees | Stub / Needs Full Rewrite | `07267d80` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 81 | Zeamă | Stub / Needs Full Rewrite | `29c1a485` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 82 | Meat Pie | Stub / Needs Full Rewrite | `c57df593` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/name/originText surface-fixed only |
| 83 | Fatteh | Stub / Needs Full Rewrite | `a4db3ae9` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 84 | Smørrebrød | Stub / Needs Full Rewrite | `5aa5026e` | EN ingredients have no quantities; howIsMade is 1–2 generic sentences. Struct/origin/name/originText surface-fixed only |
| 85 | Naengmyeon | Partial Fix Only | `a79eb8f0` | origin/name/originText fixed; struct already present; EN content not verified |
| 86 | Nihari | Partial Fix Only | `b75f2bd9` | Struct + name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 87 | Bún bò Huế | Partial Fix Only | `d73b3558` | Struct + name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 88 | Moqueca | Partial Fix Only | `6a3475e8` | Struct + name/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 89 | Sabich | Partial Fix Only | `be69c7fe` | Struct + name/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 90 | Ropa Vieja | Partial Fix Only | `433ddd43` | Struct + origin/name/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 91 | Cullen Skink | Partial Fix Only | `2bcdb5c6` | Struct + origin/name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 92 | Gado-Gado | Partial Fix Only | `d9238b8f` | Struct + category/name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 93 | Cinnamon Bun | Partial Fix Only | `1cb35fbc` | Struct + origin.pt added + name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 94 | Chiles en nogada | Partial Fix Only | `65ccb271` | Struct + name/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 95 | Lentil Soup | Partial Fix Only | `4f0399d0` | Struct + origin/name/originText (all) + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 96 | Spanakopita | Partial Fix Only | `d450ed9c` | Struct + name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 97 | Jollof Rice | Partial Fix Only | `5dbb975f` | Struct + origin/name/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 98 | Oka i'a | Partial Fix Only | `532191d5` | Struct + origin/name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 99 | Khorovats | Partial Fix Only | `761e6858` | Struct + origin/name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 100 | Verivorst | Partial Fix Only | `4375692f` | Struct + origin/name/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 102 | Tteokbokki | Partial Fix Only | `7315b69e` | name.ko + originText fixed; well-formed recipe base; EN content not fully verified |
| 103 | Shrimp Ceviche | Partial Fix Only | `622f21a8` | Struct + origin/name/ingredients/originText + howIsMade tr/it fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 104 | La Bandera | Partial Fix Only | `c94573ed` | Struct + origin/name/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 105 | Fesenjan | Partial Fix Only | `7415bb79` | Struct + name/ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 106 | Kare-Kare | Partial Fix Only | `2e4fa8e0` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 107 | Francesinha | Partial Fix Only | `203ee21f` | Struct + name/ingredients tr/it + howIsMade tr/it + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 109 | Arroz Chaufa | Partial Fix Only | `cae13e12` | Struct + pt locale added + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 110 | Chili Crab | Partial Fix Only | `240c6bbf` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 111 | Tamale | Partial Fix Only | `27fdac72` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 112 | Tom Yum | Partial Fix Only | `989f905e` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 113 | Milanesa | Partial Fix Only | `ee9d7614` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 114 | Lok Lak | Partial Fix Only | `0084eba4` | Struct + origin/name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 115 | Manti | Partial Fix Only | `49990216` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 116 | Chakhokhbili | Partial Fix Only | `18194785` | Struct + pt locale added + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 117 | Lomo Saltado | Partial Fix Only | `58e8d65d` | Struct + origin/name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 118 | Tagine | Partial Fix Only | `1a5d2a2a` | Struct + ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 119 | Köttbullar | Partial Fix Only | `62653f25` | Struct + name tr/it/ko + ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 120 | Arepa | Partial Fix Only | `db8e0a77` | Struct + origin/name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 121 | Karelian Pie | Partial Fix Only | `0ee03e05` | Struct + name tr/it/ko + ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| — | (id 122 absent) | — | — | No recipe with id 122 in file |
| 123 | Pasta e fagioli | Partial Fix Only | `a1714809` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 124 | Kottu | Partial Fix Only | `643ae659` | Struct + origin/name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 125 | Piragi | Partial Fix Only | `36fac702` | Struct + origin/name tr/it/ko + ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 126 | Bánh xèo | Partial Fix Only | `8d5a8a17` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 127 | Causa Limeña | Partial Fix Only | `d6d38bc8` | Struct + name/category/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| — | (id 128 absent) | — | — | No recipe with id 128 in file |
| 129 | Beshbarmak | Partial Fix Only | `89d1d8a0` | Struct + origin/name tr/it/ko + ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 130 | Coconut Rice | Partial Fix Only | `14fb5723` | Struct + origin/name tr/it/ko + ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 131 | Nasi Lemak | Partial Fix Only | `a31b5627` | Struct + origin/name + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 132 | Rösti | Partial Fix Only | `d1ef86d6` | Struct + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 133 | Fasole cu cârnați | Partial Fix Only | `dca01027` | Struct + pt locale added + name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 134 | Chicken Paprikash | Partial Fix Only | `29a1f54e` | Struct + origin/name/ingredients/originText + howIsMade tr/it/ko fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 135 | Pasta alla Norma | Partial Fix Only | `0b212474` | name tr/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| — | (id 136 absent) | — | — | No recipe with id 136 in file |
| 137 | Ichlekli | Partial Fix Only | `d8a9aad8` | Struct + origin/name + ingredients.tr + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 138 | Chicken Kiev | Partial Fix Only | `4df6f1d6` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 139 | Cepelinai | Partial Fix Only | `b669095c` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 140 | Chicken Fricassée | Partial Fix Only | `16006f6c` | Struct + pt locale added + name.ko + ingredients tr/it/ko + howIsMade tr/it/pt + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 141 | Machboos | Partial Fix Only | `aa13cbcf` | Struct + origin/name.ko + ingredients.tr + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 142 | Moambe Chicken | Partial Fix Only | `ab64de86` | Struct + origin/name tr/it/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 143 | Cassoulet | Partial Fix Only | `30ef7ecc` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 144 | Pasticada (id 144) | Partial Fix Only | `cb093913` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 145 | Sheftalia | Partial Fix Only | `d951741f` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 146 | Cevapi | Partial Fix Only | `13551f6a` | Struct + origin/name tr/it/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 147 | Fufu | Partial Fix Only | `0ff8774e` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 148 | Khinkali | Partial Fix Only | `0d7fd5aa` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 149 | Pozole | Partial Fix Only | `29785503` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 150 | Pepian | Partial Fix Only | `31468100` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 151 | Okroshka | Partial Fix Only | `1661c74e` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 152 | Plov | Partial Fix Only | `57d90299` | Struct + pt locale added + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 153 | Potica | Partial Fix Only | `2f68d90d` | Struct + origin/name.ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 154 | Egusi soup | Partial Fix Only | `48369de9` | Struct + origin/name it/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 155 | Kotlet schabowy | Partial Fix Only | `0a8b637e` | Struct + name tr/it/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 156 | Kimbap | Partial Fix Only | `102177cd` | name.ko + originText fixed; struct already present; EN content not verified |
| 157 | Pastel de Choclo | Partial Fix Only | `7d501223` | Struct + origin/name.ko + ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 158 | Pljeskavica | Partial Fix Only | `c24d3f48` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 159 | Poffertjes | Partial Fix Only | `9d08033d` | Struct + name.ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 160 | Japanese Curry Rice | Partial Fix Only | `bc582960` | Struct + name.ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 161 | Fasolada | Partial Fix Only | `aaafb35a` | Struct + pt locale added + name.ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 162 | Tlayudas | Partial Fix Only | `5a4e6759` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 163 | Bandeja Paisa | Partial Fix Only | `f7ca7062` | Struct + pt locale added + origin/name.ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 164 | Lángos | Partial Fix Only | `8c32b51a` | Struct + origin/name.ko + ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 165 | Rajma | Partial Fix Only | `02bcda6b` | Struct + origin/name.ko + ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 166 | Picadillo | Partial Fix Only | `f054a5a2` | Struct + origin/name.ko + ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 167 | Lamb Tagine | Partial Fix Only | `5776c081` | Struct + name tr/it/ko + ingredients.tr + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 168 | Shepherd's Pie | Partial Fix Only | `4ae72d0a` | Struct + name tr/it/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 169 | Mapo Tofu | Partial Fix Only | `64b4b1a4` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 170 | Menemen | Partial Fix Only | `9d3b3983` | Struct + name.ko + ingredients.tr + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 171 | Solyanka | Partial Fix Only | `6179baae` | Struct + name.ko + ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 172 | Clam Chowder | Partial Fix Only | `22a630e1` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 173 | Currywurst | Partial Fix Only | `66ac45d2` | Struct + name.ko + ingredients.it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 174 | Tom Kha Gai | Partial Fix Only | `556179a0` | Struct + name.ko + ingredients tr/it + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 175 | Cachupa | Partial Fix Only | `59e220fe` | Struct + origin/name.ko + ingredients.tr + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 176 | Pav Bhaji | Partial Fix Only | `0b370363` | Struct + name.ko + ingredients.tr + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 177 | Karelian Stew | Partial Fix Only | `f662bdb2` | Struct + name it/ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 178 | Boeuf Bourguignon | Partial Fix Only | `9f6afcbe` | Struct + name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 179 | Chakchouka | Partial Fix Only | `b32e371f` | Struct + origin/name.ko + ingredients tr/it/ko + howIsMade tr/it/ko + originText fixed; EN howIsMade was stub — EN content still needs full rewrite |
| 180 | Okonomiyaki | Tier A Complete | `36a91875` | Confirmed: exact quantities, multi-step instructions, all 14 locales aligned; name.ko + originText fixed |
| 181 | Tonkotsu Ramen | Tier A Complete | `159635a3` | Confirmed: detailed broth + tare + assembly steps, exact quantities in all locales; struct + originText.tr fixed |
| 182 | Shoyu Ramen | Tier A Complete | `0d5d19f1` | Confirmed: detailed multi-step recipe, exact quantities; struct + originText.tr fixed |
| 183 | Miso Ramen | Tier A Complete | `51a3dc18` | Confirmed: detailed multi-step recipe, exact quantities; struct + originText.tr fixed — FINAL RECIPE |

---

## Summary counts

| Status | Count |
|---|---|
| Tier A Complete | 4 |
| Partial Fix Only | 133 |
| Stub / Needs Full Rewrite | 36 |
| Needs Visual QA | 10 |
| **Total recipes** | **183** |

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

A recipe is Tier A **only if ALL 10 criteria are met**:

1. Every ingredient has an exact quantity (no bare nouns, no "some"/"a little" except final seasoning)
2. Every cooking step has a time or visual doneness cue
3. No generic filler text ("Cook until done", "Prepare ingredients")
4. `tipType` matches the recipe category
5. `pairingsType` matches the recipe category
6. Feature cards (origin, time, difficulty, servings) are accurate
7. `recipesMeta.time` is realistic wall-clock time including prep, marination, water boil
8. `servings` field is present in `recipes.js`
9. All 14 language locales are aligned (names in native script, originText grammatically correct)
10. RO + EN + at least one non-Latin locale page has been visually verified in a browser

**Warning:** Fixing originText grammar, name locales, or time values alone does NOT make a recipe Tier A. If the EN ingredients have no quantities and the EN howIsMade has no doneness cues, the recipe is a stub regardless of how many translation fixes were applied.

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
