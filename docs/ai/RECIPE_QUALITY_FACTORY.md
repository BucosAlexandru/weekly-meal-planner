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
| 1 | Spaghetti Carbonara | Tier A Complete | `ref/1` | **Reference recipe.** Premium 3-sentence originText headnote + 8-step howIsMade with technique explanations (cold-pan rendering, residual heat emulsification, no-cream rule), all 14 locales |
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
| 51 | Kibbeh | Tier A Complete | — | Full rewrite: 14 EN ingredients (shell + filling + oil) with exact quantities; 19-step EN howIsMade with timings (15 min soak, 3–4 min process, 6–8 min brown, 4–5 min fry at 175°C); all 14 locales including hi |
| 52 | Stamppot | Tier A Complete | `454512b4` | Full EN rewrite: 8 ingredients with exact quantities, 7-step howIsMade with timings and doneness cues. All 14 locales retranslated including hi. |
| 53 | Hangi | Tier A Complete | `09c90a91` | Full EN rewrite: 9 ingredients with exact quantities (lamb, chicken, potatoes, kumara, pumpkin, cabbage, oil, salt, pepper), 7-step oven-adapted howIsMade with timings and doneness cues. All 14 locales retranslated including hi. |
| 54 | Moules-frites | Partial Fix Only | `04ba532e` | Struct + name.ko + originText pt/ru/tr/it/ko fixed; no stub note |
| 55 | Moussaka | Partial Fix Only | `7fb899a0` | Struct + name.ko + originText pt/ru/it/ko fixed; no stub note |
| 56 | Svíčková | Partial Fix Only | `96cd3925` | Struct + origin + name.ko + originText fr/pt/ru/tr/it/ko fixed; no stub note |
| 57 | Fårikål | Tier A Complete | `f8c93958` | Full EN rewrite: 5 ingredients with exact quantities (bone-in lamb, white cabbage, whole peppercorns, cold water, salt), 9-step howIsMade with timings (8-10 min to boil, 2-2.5 hr simmer) and doneness cues (falls off bone, broth rich and fragrant). All 14 locales retranslated including hi. |
| 58 | Ful Medames | Tier A Complete | `186f970a` | Full EN rewrite: 11 ingredients with exact quantities (dried fava beans, garlic, lemon juice, olive oil, cumin, coriander, salt, cayenne, tomatoes, red onion, parsley), 7-step howIsMade with timings (1.5-2 hr simmer, 3-4 min finish) and doneness cues (soft when pressed, tangy and warmly spiced). All 14 locales retranslated including hi. |
| 59 | Pasticada (id 59) | Tier A Complete | `df31196c` | Full EN rewrite: 14 ingredients with exact quantities (beef rump, garlic, bacon, onions, carrots, celery, red wine vinegar, red wine, canned tomatoes, prunes, olive oil, bay leaves, salt, pepper), 8-step howIsMade with timings (12-24 hr marinade, 8-10 min sear, 2.5-3 hr braise) and doneness cues (deeply browned, knife meets no resistance). All 14 locales retranslated including hi. |
| 60 | Buuz | Tier A Complete | `6ed83b6e` | Full EN rewrite: 11 ingredients with exact quantities (flour, warm water, salt for dough; ground lamb, onion, garlic, oil, cumin, salt, pepper, cold water for filling), 9-step howIsMade with timings (5-6 min knead, 30 min rest, 20-22 min steam) and doneness cues (smooth and elastic, no longer pink inside). All 14 locales retranslated including hi. |
| 61 | Biryani | Partial Fix Only | `7be76e95` | Struct + origin/name/originText fixed; no stub note |
| 62 | Brik | Tier A Complete | `80a781c2` | Full EN rewrite: 11 ingredients with exact quantities (brik pastry sheets x4, eggs x4, tuna 160g, onion 80g, capers 3tbsp, parsley 20g, cumin, salt, cayenne, oil 500ml, lemon), 7-step howIsMade with timings (175°C oil, 1.5-2 min per side) and doneness cues (deep golden and crisp, yolk runny to lightly set). All 14 locales retranslated including hi. |
| 63 | Khachapuri | Tier A Complete | `0fd228e9` | Full EN rewrite: 10 ingredients with exact quantities (flour 500g, yeast 7g, sugar, salt, warm water 250ml, olive oil, sulguni/mozzarella 400g, feta 200g, eggs x4, butter 40g), 8-step howIsMade with timings (1 hr rise, 250°C oven, 12-14 min bake, 3-4 min egg finish) and doneness cues (golden crust, bubbling cheese, white just set, yolk runny). All 14 locales retranslated including hi. |
| 64 | Bobotie | Tier A Complete | `1e7156dc` | Full EN rewrite: 14 ingredients with exact quantities (mince 750g, onions 2, bread 60g, milk 125ml, eggs 2, sultanas 50g, apricots 30g, jam 2tbsp, curry powder, turmeric, oil, salt, pepper, bay leaves), 9-step howIsMade with timings (8-10 min sauté, 35-40 min bake) and doneness cues (golden, set custard no wobble). All 14 locales retranslated including hi. |
| 65 | Ceviche | Tier A Complete | `96b7d091` | Full EN rewrite: 11 ingredients with exact quantities (fish 700g, lime juice 180ml, red onion 150g, chilli, garlic, ginger, coriander 30g, salt, white pepper, corn, sweet potatoes 400g), 8-step howIsMade with timings (10-15 min marinate) and doneness cues (opaque outside, slightly translucent centre). All 14 locales retranslated including hi. |
| 66 | Kimchi | Partial Fix Only | `b93a114b` | Struct + name.ko + category + originText pt/ru/tr/it/ko fixed; no stub note |
| 67 | Banh Mi | Tier A Complete | `6a5ade8b` | Full EN rewrite: 14 ingredients with exact quantities (baguettes x4, pork 400g, soy sauce, fish sauce, sesame oil, carrots 200g, daikon 100g, rice vinegar, pâté 60g, mayo 4tbsp, cucumber, jalapeños, coriander 20g), 7-step howIsMade with timings (20 min pickle, 15-20 min marinate, 1-2 min per side sear, 4-5 min toast) and doneness cues (caramelised, golden brown edges). All 14 locales retranslated including hi. |
| 68 | Satay | Tier A Complete | `5322300e` | Full EN rewrite: 15 ingredients with exact quantities (chicken thighs 700g, soy sauce, coconut milk, brown sugar, coriander/cumin/turmeric, garlic, lemongrass, peanut butter 200g, coconut milk 200ml, kecap manis, lime juice, sambal, bamboo skewers), 7-step howIsMade with timings (30 min marinate, 3-4 min peanut sauce, 3-4 min per side grill) and doneness cues (deeply charred, 75°C internal). All 14 locales retranslated including hi. |
| 69 | Laksa | Tier A Complete | `675b7502` | Full EN rewrite: 15 ingredients with exact quantities (laksa paste 3tbsp, coconut milk 800ml, chicken stock 600ml, prawns 400g, tofu 200g, bean sprouts 200g, rice vermicelli 200g, eggs x4, green beans 100g, etc.), 9-step howIsMade with timings (3 min soak, 7 min eggs, 2-3 min paste fry, 3 min beans, 2-3 min prawns) and doneness cues (fragrant, pink and cooked through). All 14 locales retranslated including hi. |
| 70 | Pupusa | Tier A Complete | `edcc4a7c` | Full EN rewrite: 14 ingredients with exact quantities (masa harina 400g, refried beans 200g, mozzarella 200g, curtido: cabbage 300g, carrot 80g, onion 60g, vinegar, water, salt, sugar, oregano), 8-step howIsMade with timings (30 min curtido pickle, 3-4 min per side griddle) and doneness cues (dark golden-brown, dry not tacky). All 14 locales retranslated including hi. |
| — | (id 71 absent) | — | — | No recipe with id 71 in file |
| 72 | Amok | Tier A Complete | `1adeb0de` | Full EN rewrite: 14 ingredients with exact quantities, 7-step howIsMade with timings and doneness cues. All 14 locales + hi updated. |
| 73 | Momo | Tier A Complete | `f63ff84f` | Full EN rewrite: 14 ingredients with exact quantities, 8-step howIsMade with timings and doneness cues. All 14 locales + hi updated. |
| 74 | Encebollado | Tier A Complete | `831fb0e0` | Full EN rewrite: 14 ingredients with exact quantities, 7-step howIsMade with timings and doneness cues. All 14 locales + hi updated. |
| 75 | Harira | Tier A Complete | `226a3dbe` | Full EN rewrite: 14 ingredients with exact quantities, 8-step howIsMade with timings and doneness cues. All 14 locales + hi updated. |
| 76 | Lobio | Tier A Complete | `e7265c7a` | Full EN rewrite: 14 ingredients with exact quantities, 8-step howIsMade with timings and doneness cues. All 14 locales + hi updated. |
| 77 | Chakhchoukha | Tier A Complete | `d7dac09d` | Full EN rewrite: 14 ingredients with exact quantities, 7-step howIsMade with timings and doneness cues. All 14 locales + hi + pt added. |
| 78 | Rendang | Tier A Complete | `21801e1c` | Full EN rewrite: 14 ingredients with exact quantities (beef 1kg, coconut milk 800ml, shallots x5, galangal, lemongrass, dried chillies, kaffir lime leaves), 7-step howIsMade with timings (5-6 min paste fry, 1.5 hr simmer, 30-45 min reduction) and doneness cues (deep mahogany brown, oil splits). All 14 locales + hi updated. |
| 79 | Gravlax | Tier A Complete | `799bd94b` | Full EN rewrite: 6 ingredients with exact quantities (600g salmon, 3 tbsp coarse salt, 2 tbsp sugar, white peppercorns, 60g dill, aquavit), 6-step howIsMade with timings (48-72 hr cure, turn every 12 hr) and doneness cues (brine pools in dish). All 14 locales + hi updated. |
| 80 | Stoofvlees | Tier A Complete | `07267d80` | Full EN rewrite: 12 ingredients with exact quantities (beef 1kg, dark Belgian ale 330ml, onions 500g, Dijon mustard, bread-mustard thickener), 7-step howIsMade with timings (3-4 min sear, 12-15 min onions, 2 hr braise, 20-30 min reduction) and doneness cues (glossy dark gravy coats spoon). All 14 locales + hi updated. |
| 81 | Zeamă | Tier A Complete | `29c1a485` | Full EN rewrite: 9 ingredients with exact quantities (1kg bone-in chicken, carrots, celery, thin egg noodles, 200ml borș/lemon juice, lovage), 7-step howIsMade with timings (5-10 min skim, 45-50 min simmer, 5-7 min noodles) and doneness cues (chicken falls from bone, broth runs clear). All 14 locales + hi updated. |
| 82 | Meat Pie | Tier A Complete | `c57df593` | Full EN rewrite: 12 ingredients with exact quantities (shortcrust 375g, puff 250g, beef mince 500g, stock 250ml, tomato paste, Worcestershire sauce), 8-step howIsMade with timings (3-4 min onions, 6-8 min mince, 12-15 min simmer, 25-30 min bake) and doneness cues (gravy coats spoon, lids puffed and crisp). All 14 locales + hi updated. |
| 83 | Fatteh | Tier A Complete | `a4db3ae9` | Full EN rewrite: 12 ingredients with exact quantities (pita 200g, chickpeas 400g, yogurt 500g, tahini, pine nuts 50g, paprika), 9-step howIsMade with timings (8-10 min bake, 3-4 min chickpeas, 2-3 min pine nuts) and doneness cues (pita golden and crisp, pine nuts golden, serve before pita softens). All 14 locales + hi updated. |
| 84 | Smørrebrød | Tier A Complete | `5aa5026e` | Full EN rewrite: 11 ingredients with exact quantities (8 rugbrød slices, butter 100g, pickled herring 400g, 4 hard-boiled eggs, red onion, radishes, capers, soured cream, Dijon mustard, dill), 7-step howIsMade with timings (10 min boil eggs, 5 min cool) and doneness cues (serve before pita softens, herring curves naturally). All 14 locales + hi updated. |
| 85 | Naengmyeon | Partial Fix Only | `a79eb8f0` | origin/name/originText fixed; struct already present; EN content not verified |
| 86 | Nihari | Tier A Complete | `b75f2bd9` | Full EN rewrite: 13 ingredients with exact quantities (bone-in beef shanks, marrow bones, ghee, onions, ginger-garlic paste, chilli powder, coriander, turmeric, salt, nihari masala, flour slurry, julienned ginger, lemon and coriander to serve), 7-step howIsMade with timings (12–15 min fry onions, 3–4 min sear per side, 3–4 hr slow simmer, 10–15 min uncovered thicken) and doneness cues (deep golden brown, falling from bone, coats back of spoon). All 14 locales retranslated including hi. |
| 87 | Bún bò Huế | Tier A Complete | `d73b3558` | Full EN rewrite: 13 ingredients with exact quantities (pork hock, beef bones, beef shank, rice vermicelli, lemongrass, charred shallots, garlic, shrimp paste, fish sauce, chilli oil, sugar, salt, bean sprouts/herbs/lime/chilli to serve), 7-step howIsMade with timings (5 min blanch, 3–4 min char, 1 hr simmer, 15–20 min poach, 3–5 min noodles) and doneness cues (lightly blackened, savoury and fragrant, cooked through and tender). All 14 locales retranslated including hi. |
| 88 | Moqueca | Tier A Complete | `6a3475e8` | Full EN rewrite: 12 ingredients with exact quantities (firm white fish 800g, lime juice, salt, onion, garlic, red and green bell peppers, tomatoes, coconut milk 400ml, dendê palm oil 2 tbsp, coriander, black pepper), 7-step howIsMade with timings (15–20 min marinate, 6–8 min onion, 5 min veg, 12–15 min covered poach) and doneness cues (lightly golden, tomatoes break down, opaque and flakes easily). All 14 locales retranslated including hi. |
| 89 | Sabich | Tier A Complete | `be69c7fe` | Full EN rewrite: 13 ingredients with exact quantities (4 pita breads, aubergine ~400g, oil, 4 eggs, waxy potatoes 300g, tahini 4 tbsp, lemon, garlic, amba sauce 4 tbsp, tomatoes, cucumber, salt, pickled cucumber/parsley), 7-step howIsMade with timings (10 min hard-boil, 10 min salt+rest, 3–4 min per side fry, 1 min warm pita) and doneness cues (deep golden and tender throughout, creamy and pourable sauce). All 14 locales retranslated including hi. |
| 90 | Ropa Vieja | Tier A Complete | `433ddd43` | Full EN rewrite: 12 ingredients with exact quantities (beef flank 700g, olive oil, onion, red+green bell pepper, garlic, canned crushed tomatoes 400g, tomato paste, white wine 100ml, cumin, oregano, bay leaves, salt+pepper), 7-step howIsMade with timings (1.5–2 hr braise, 8–10 min veg, 2 min wine reduce, 10 min sauce, 10–15 min final simmer) and doneness cues (pulls apart easily, beginning to colour, juicy but not soupy). All 14 locales retranslated including hi. |
| 91 | Cullen Skink | Tier A Complete | `pending` | Full EN rewrite: 10 ingredients with exact quantities, 7-step howIsMade with timings, all 14 locales + hi |
| 92 | Gado-Gado | Tier A Complete | `pending` | Full EN rewrite: 18 ingredients with exact quantities, 7-step howIsMade with timings, all 14 locales + hi |
| 93 | Cinnamon Bun | Tier A Complete | `pending` | Full EN rewrite: 14 ingredients with exact quantities, 7-step howIsMade with timings, all 14 locales + hi |
| 94 | Chiles en nogada | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities, 7-step howIsMade with timings, all 14 locales + hi |
| 95 | Lentil Soup | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities, 7-step howIsMade with timings, all 14 locales + hi |
| 96 | Spanakopita | Tier A Complete | `pending` | Full EN rewrite: 12 ingredients with exact quantities (500g phyllo, 1kg spinach, 300g feta, 2 onions, 4 spring onions, 3 eggs, 30g dill, 20g parsley, 150ml olive oil, kefalotyri, nutmeg, salt+pepper), 7-step howIsMade with timings (4–5 min wilt, 8 min onion softening, 40–45 min bake at 180°C, 15 min rest) and doneness cues (deep golden brown, crisp tap sound). All 14 locales retranslated including hi. |
| 97 | Jollof Rice | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (400g parboiled rice, 6 Roma tomatoes, 2 red bell peppers, scotch bonnet, 2 onions, garlic, ginger, 3 tbsp tomato paste, 120ml oil, 750ml stock, bay leaves, curry/thyme/smoked paprika), 8-step howIsMade with timings (5–6 min onion fry, 3 min tomato paste, 18–20 min sauce reduction, 25–30 min covered simmer, 10 min rest) and doneness cues (dark red sauce with oil rising, slight smoky bottom crust). All 14 locales retranslated including hi. |
| 98 | Oka i'a | Tier A Complete | `pending` | Full EN rewrite: 11 ingredients with exact quantities (500g sashimi-grade tuna or mahi-mahi, 120ml lime juice, 200ml full-fat coconut milk, cucumber, red onion, tomatoes, chilli, spring onion, sea salt, pepper, coriander), 6-step howIsMade with timings (15–20 min lime marinade, 10 min onion soak) and doneness cues (opaque surface with translucent centre, coconut coats without breaking the fish). All 14 locales retranslated including hi. |
| 99 | Khorovats | Tier A Complete | `pending` | Full EN rewrite: 11 ingredients with exact quantities (800g pork/beef, 2 red onions, 2 bell peppers, aubergine, 4 tomatoes, sunflower oil, salt+pepper, herbs, lavash), 7-step howIsMade with timings (4–8 hr marinade, 30–40 min charcoal burn-down, 10–14 min grilling at 60°C internal, 12–15 min veg char) and doneness cues (deeply caramelised exterior, pink centre). All 14 locales retranslated including hi. |
| 100 | Verivorst | Tier A Complete | `pending` | Full EN rewrite: 11 ingredients with exact quantities (500g pig's blood, 200g pork fat, 200g pearl barley, 2 onions, marjoram, allspice, casing, lard, lingonberry jam), 8-step howIsMade with timings (8–10 min fat render, 6–8 min onion soften, 30–40 min poach at 80°C, 12–15 min oven roast at 200°C) and doneness cues (golden burnished skin, clear juices). All 14 locales retranslated including hi. |
| 102 | Tteokbokki | Tier A Complete | `pending` | Full EN rewrite: 11 ingredients with exact quantities (500g garae-tteok, 150g eomuk, 3 tbsp gochujang, 1 tbsp gochugaru, 500ml anchovy stock, eggs, sesame), 7-step howIsMade with timings (20–30 min rice cake soak, 8–10 min simmer, 3–4 min eomuk finish) and doneness cues (syrupy sauce coating spoon, tender chewy rice cakes). All 14 locales retranslated including hi. |
| 103 | Shrimp Ceviche | Tier A Complete | `pending` | Full EN rewrite: 11 ingredients with exact quantities (600g shrimp, 180ml lime juice, 120ml orange juice, red onion, tomatoes, ají, coriander, chifles), 7-step howIsMade with timings (60–90s shrimp blanch, 15–20 min citrus marinate, 10 min onion soak, 5 min rest) and doneness cues (pink and opaque, mellow citrus acidity). All 14 locales retranslated including hi. |
| 104 | La Bandera | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (400g rice, 250g dried red kidney beans, 600g chicken thighs/beef chuck, 2 plantains, sofrito veg, tomato paste, oregano, lime), 8-step composed-plate howIsMade with timings (60–75 min bean simmer, 35–40 min meat braise, 18–20 min rice steam + 10 min rest, double-fry plantains at 175°C) and doneness cues (fork-tender meat, saucy beans, crisp plantain). All 14 locales retranslated including hi. |
| 105 | Fesenjan | Tier A Complete | `pending` | Full EN rewrite: 13 ingredients with exact quantities (800g chicken thighs or duck, 300g walnuts, 120ml pomegranate molasses, 2 onions, turmeric/cinnamon/nutmeg, 1L stock, basmati), 7-step howIsMade with timings (4–5 min walnut toast, 12–15 min onion deep-fry, 3 min walnut oil release, two 30–40 min simmer stages) and doneness cues (near-black sauce, walnut oil rising, tart-sweet balance). All 14 locales retranslated including hi. |
| 106 | Kare-Kare | Tier A Complete | `pending` | Full EN rewrite: 14 ingredients with exact quantities (1.2kg oxtail, 200g peanut butter, annatto, toasted rice powder, eggplant, sitaw, bok choy, bagoong), 8-step howIsMade with timings (5 min initial boil, 2.5–3 hr simmer, 10–15 min sauce build, 5 min eggplant + 3 min bok choy) and doneness cues (deep gold sauce, falling-off-bone meat, vibrant vegetables). All 14 locales retranslated including hi. |
| 107 | Francesinha | Tier A Complete | `pending` | Full EN rewrite: 22 ingredients with exact quantities (8 thick bread, 400g steak, 4 linguiça, ham, salami, 12 cheese slices, 4 eggs + sauce: 400ml beer, 200g tomato paste, whisky, stock, chili), 8-step howIsMade with timings (25–30 min sauce reduction, 1.5 min/side steak sear, 3–4 min under grill at 220°C) and doneness cues (bubbly browned cheese, runny yolk, sauce pooling). All 14 locales retranslated including hi. |
| 109 | Arroz Chaufa | Tier A Complete | `pending` | Full EN rewrite: 13 ingredients with exact quantities (500g day-old rice, 300g chicken/pork, 3 eggs, soy + oyster sauces, ají amarillo paste, ginger, garlic, spring onions, sesame oil), 7-step wok-style howIsMade with timings (3–4 min meat sear, 30s aromatics, 3–4 min rice toss, 1 min sauce coat) and doneness cues (separate grains, slight sizzle, glossy coating). All 14 locales retranslated including hi. |
| 110 | Chili Crab | Tier A Complete | `pending` | Full EN rewrite: 16 ingredients with exact quantities (2 mud crabs 1.5kg, 4 tbsp tomato paste, sambal, sweet chili, ketchup, ginger, garlic, 2 eggs, 500ml stock, cornstarch slurry, mantou), 8-step wok-style howIsMade with timings (30 min stun, 3–4 min shell sear, 8–10 min covered braise, 30s egg ribbon set) and doneness cues (red shells, silky egg threads, glossy thickened sauce). All 14 locales retranslated including hi. |
| 111 | Tamale | Tier A Complete | `pending` | Full EN rewrite: 17 ingredients with exact quantities (20–24 corn husks, 500g masa harina, 250g lard, 500ml stock, 500g shredded pork, guajillo + ancho chilies, cumin, Mexican oregano), 8-step howIsMade with timings (30 min husk soak, 15 min chili steep, 8–10 min sauce, 3 min lard fluff, 60–75 min steam) and doneness cues (float test for masa, clean husk release). All 14 locales retranslated including hi. |
| 112 | Tom Yum | Tier A Complete | `pending` | Full EN rewrite: 13 ingredients with exact quantities (1L stock, 300g prawns, 2 lemongrass stalks, 30g galangal, 6 kaffir lime leaves, 3–4 Thai chilies, 200g mushrooms, 3 tbsp fish sauce, 2 tbsp lime, 1 tbsp palm sugar), 7-step howIsMade with timings (10 min aromatic infusion, 3–4 min mushroom, exactly 2–3 min prawn cook) and doneness cues (pink curled prawns, sour-salty-spicy-sweet balance). All 14 locales retranslated including hi (ko/hi howIsMade upgraded from stub paragraph to full 7-step instructions). |
| 113 | Milanesa | Tier A Complete | `pending` | Full EN rewrite: 10 ingredients with exact quantities (4 thin steaks ~150g each, 2 eggs + garlic + parsley, panko/breadcrumbs, flour, 500ml frying oil, lemon), 8-step howIsMade with timings (pound to 5 mm, 10 min rest after breading, 175°C oil with bread-cube test, 2 min per side fry) and doneness cues (deep golden uniform crust, drain on rack not paper). All 14 locales retranslated including hi. |
| 114 | Lok Lak | Tier A Complete | `pending` | Full EN rewrite: 18 ingredients with exact quantities (600g beef cubes, oyster + soy + palm sugar + tomato paste marinade, 6 garlic cloves, 2 tsp black pepper, 4 eggs, lettuce-tomato-cucumber bed, lime + salt + pepper dip), 8-step wok-style howIsMade with timings (30 min marinate, 1 min sear undisturbed, 2 min vigorous toss) and doneness cues (charred outside pink inside beef). All 14 locales retranslated including hi. |
| 115 | Manti | Tier A Complete | `pending` | Full EN rewrite: 16 ingredients with exact quantities (500g flour + egg dough, 600g knife-cut beef/lamb with 1:1 onion ratio, 100g lamb-tail fat optional, cumin, butter + paprika finish, yogurt to serve), 8-step howIsMade with timings (10 min knead + 30 min rest, 1–2 mm rolled dough, 35–40 min steam) and doneness cues (translucent glossy dough when done). All 14 locales retranslated including hi. |
| 116 | Chakhokhbili | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (1.2kg bone-in chicken, 600g onions for 1:1 ratio, 700g tomatoes, red bell pepper, garlic, tomato paste, khmeli-suneli, blue fenugreek, savory, fresh coriander stems+leaves, parsley, white wine vinegar), 8-step howIsMade with the dry-brown technique (6–8 min per side no oil), 12–15 min onion deep-fry in rendered fat, 35–45 min covered braise, doneness cues (falling off bone, thick glossy sauce, deeply golden onions). All 14 locales retranslated including hi. |
| 117 | Lomo Saltado | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (600g beef strips, 700g potatoes for fries, red onion wedges, ají amarillo, Roma tomatoes, ginger+garlic+soy+red wine vinegar trinity, coriander, basmati), 8-step wok-style howIsMade with the wok hei technique (175°C oil fry potatoes, smoking-hot pan, 30s sear + 90s vigorous toss, soy/vinegar around pan edge for aromatic steam) and doneness cues (browned-outside pink-inside beef, crisp not soft onion). All 14 locales retranslated including hi. |
| 118 | Tagine | Tier A Complete | `pending` | Full EN rewrite: 22 ingredients with exact quantities (1kg bone-in lamb shoulder or chicken, 2 onions, ras el hanout + cumin + cinnamon + turmeric + saffron spice stack, 200g apricots, 200g chickpeas, carrots, preserved lemon, 500ml stock, honey, coriander+parsley+toasted almonds, couscous to serve), 8-step howIsMade with timings (30 min rest, 4–5 min per side sear, 8–10 min onion, 1h 30m–2h covered braise, 20–25 min dried fruit finish) and doneness cues (falling off bone, do not lift lid often to trap steam). All 14 locales retranslated including hi.|
| 119 | Köttbullar | Tier A Complete | `pending` | Full EN rewrite: 22 ingredients with exact quantities (400g beef + 200g pork blend, milk-soaked panada, allspice+nutmeg seasoning, sautéed onion, beef stock + cream roux sauce with soy for color, Dijon mustard, lingonberry jam to serve), 8-step howIsMade with the panada technique (5 min breadcrumb soak), 6–8 min onion sweat, 2.5 cm walnut-sized balls, 8 min batched fry, roux-based pan sauce, 5 min final simmer in sauce. All 14 locales retranslated including hi. |
| 120 | Arepa | Tier A Complete | `pending` | Full EN rewrite: 17 ingredients with exact quantities (400g harina P.A.N., 500ml water + reina pepiada filling: 2 chicken breasts, avocado, mayonnaise, lime, spring onion, coriander), 8-step howIsMade with timings (5 min dough rest, 4–5 min per side griddle + 10–15 min finish at 180°C) and doneness cues (golden crust with darker spots, hollow sound when tapped, slightly sticky-not-raw dough test). All 14 locales retranslated including hi. |
| 121 | Karelian Pie | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (rye+white flour dough, 200g short-grain rice + 1L milk porridge filling, muna voi egg butter topping), 8-step howIsMade with timings (8 min water absorption + 35–45 min milk simmer for porridge, 5 min knead, 1 mm-thin rolled ovals, characteristic zigzag pleat sealing, 15–20 min bake at 250°C) and doneness cues (golden edges, very creamy thick porridge). All 14 locales retranslated including hi. |
| — | (id 122 absent) | — | — | No recipe with id 122 in file |
| 123 | Pasta e fagioli | Tier A Complete | `pending` | Full EN rewrite: 17 ingredients with exact quantities (200g short pasta, 400g borlotti/cannellini beans, soffritto trio + pancetta optional, 400g tomatoes, rosemary+thyme aromatics, 1.2L stock, Parmigiano rind for flavor depth), 8-step howIsMade with the classic Italian technique (10–12 min soffritto sweat, half-mashed half-whole bean texture, 8–10 min pasta cook in soup, 5 min rest for thickening) and doneness cues (deeply caramelised veg, al dente pasta, dense creamy texture from released starch). All 14 locales retranslated including hi. |
| 124 | Kottu | Tier A Complete | `pending` | Full EN rewrite: 18 ingredients with exact quantities (8 godhamba roti/paratha, 600g chicken thigh, 5 eggs, 2 red onions, leek, carrots, green chillies, ginger+garlic, Sri Lankan curry powder+turmeric+Kashmiri chilli, 15 curry leaves, 400ml warm curry sauce, soy sauce, lime), 8-step howIsMade with the chop-and-toss kottu technique (7–8 min chicken sear, 3–4 min onion soften, 2–3 min veg toss, 60–90 s egg scramble, 3–4 min vigorous chop-and-toss to break the roti into small pieces) and doneness cues (no pink in centre, crisp-tender veg, glossy unified mixture, not soupy). All 14 locales retranslated including hi. |
| 125 | Piragi | Tier A Complete | `pending` | Full EN rewrite: 14 ingredients with exact quantities (500g strong bread flour + 250ml milk + 7g yeast + 50g sugar + 70g butter + egg enriched dough; 350g smoked streaky bacon + onion + caraway filling; egg-yolk + milk glaze + flaky salt), 8-step howIsMade with the Baltic crescent technique (5–10 min yeast bloom proof, 8–10 min knead, 1 h–1 h 15 m double rise, 5–6 min bacon render + 4–5 min onion sweat without browning, 24 × 35 g portions rolled to 8 cm × 4 mm ovals, classic crescent fold with seam-down 20–25 min second rise, 12–15 min bake at 220°C) and doneness cues (foam test on yeast, smooth-elastic dough, golden tops with hollow-sounding bottoms, seams holding tight). All 14 locales retranslated including hi. |
| 126 | Bánh xèo | Tier A Complete | `pending` | Full EN rewrite: 18 ingredients with exact quantities (250g rice flour + 30g cornflour + 1 tsp turmeric + 400ml coconut milk + 350ml cold sparkling water enriched batter; 300g pork belly strips + 300g raw prawns + 200g mung sprouts filling; nuoc cham 3 tbsp fish sauce + 3 tbsp lime + 2 tbsp sugar + 4 tbsp warm water + garlic + chilli; lettuce/herb/cucumber lettuce-wrap platter). 8-step howIsMade: 30 min–4 h batter rest for hydration, sparkling-water and cornflour for crisp lift, 60–90 s prawn/pork pre-sear in 24 cm pan, ladle 100 ml batter and swirl, 60 s lidded steam + 2–3 min open-pan crisp, bean-sprout pile and half-moon fold. Doneness cues: deep-golden edges lifting cleanly from the pan, audible crackle when the crepe is bent, prawns curled pink. Servings adjusted from 2 → 4 to satisfy the 9+-ingredient scaling invariant (CLAUDE.md). All 14 locales retranslated including hi. |
| 127 | Causa Limeña | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (1 kg yellow Peruvian potatoes, 60 ml lime juice, 60 ml oil, 2 tbsp ají amarillo paste, 1.5 tsp salt, white pepper; 2 × 160g tuna or 320g shredded chicken + 120g mayo + spring onions + optional celery filling; 1 ripe avocado tossed with lime; black olives + hard-boiled eggs + coriander garnish). 8-step howIsMade with the layered terrine technique (18–20 min boil, 5 min steam-dry, hot rice + ají + lime + oil kneaded silky, 20 min chill, gentle flake fold for filling, 22 × 12 cm cling-lined loaf tin, three potato layers sandwiching two filling+avocado layers, 1–6 h press chill, hot wet knife into 8 portions). Doneness cues: knife slides without resistance into potato, silky elastic mash holding shape when pinched, layers visible in cross-section. All 14 locales retranslated including hi. |
| — | (id 128 absent) | — | — | No recipe with id 128 in file |
| 129 | Beshbarmak | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (1.2 kg bone-in lamb shoulder or beef brisket, 3 L cold water, salt, onion + carrot + bay + 10 peppercorns for stock; 400g flour + 2 eggs + 150 ml warm water + 1 tsp salt egg noodle dough; 2 large onions in half-moons + 0.5 tsp pepper + sugar pinch chyk sauce; dill/parsley to finish). 8-step howIsMade with the Central Asian boiled-meat-and-noodle technique (slow cold-water start for clean broth, 10 min skim, 2–2.5 h bare simmer until fork-tender and falling from bone, knead 8–10 min for firm-smooth-elastic dough then 30 min rest, roll to 1 mm and cut into 8 × 8 cm squares, strain stock and reserve 500 ml for chyk onions softened 5–6 min staying translucent, boil noodles 3–4 min until they float al dente). Doneness cues: clear surface broth, meat falling from bone, onions translucent not collapsed, noodles floating and al dente. All 14 locales retranslated including hi. |
| 130 | Coconut Rice | Tier A Complete | `pending` | Full EN rewrite: 12 ingredients with exact quantities (400 g long-grain jasmine/basmati, 400 ml full-fat coconut milk, 250 ml water, 1 tsp salt + 1 tsp sugar, 2 knotted pandan leaves, 1 shallot, bruised lemongrass stalk, 3 cm lime zest, 1 tbsp coconut oil, 30 g toasted desiccated coconut + coriander garnish). 7-step howIsMade with the Southeast Asian absorption technique (1 min rinse until water runs clear, 90 s–2 min shallot sweat without browning, 30 s oil coat for the grain, 2 min initial stir to stop coconut milk catching on the base, 12 min lowest-flame undisturbed cook with tight lid, 10 min off-heat rest for steam-dry finish, aromatics removed). Doneness cues: water runs clear after rinse, shallot translucent with golden edges, no aromatics in the final fluff. All 14 locales retranslated including hi. |
| 131 | Nasi Lemak | Tier A Complete | `pending` | Full EN rewrite: 18 ingredients with exact quantities (coconut-rice base 400 g jasmine + 400 ml coconut milk + 200 ml water + 1 tsp salt with pandan/lemongrass/ginger; 60 g peanuts + 60 g ikan bilis + 4 eggs + 200 g cucumber rounds for the platter; sambal core of 10 dried + 4 fresh chillies + 2 shallots + 3 garlic + 15 g ginger + 1 tbsp belacan + tamarind water + palm sugar + 120 g red onion rings + split 60 ml/250 ml oil + 0.5 tsp salt). 8-step howIsMade with the Malaysian national-breakfast technique (12 min lowest-flame rice cook + 10 min steam rest, 160°C oil for 3–4 min pale-gold peanuts, 60–90 s ikan-bilis crisp in batches, exactly 8 min eggs then iced 3 min, coarse paste in blender, 12–15 min sambal fry until oil splits and brick-red, 6–8 min onion+tamarind+palm-sugar finish to glossy jammy consistency that holds a clean spoon line, composed plate). Doneness cues: water nearly clear after rinse, peanuts pale gold lifting, anchovies crisp deep gold, oil-split brick-red sambal balanced hot/sweet/sour/savoury. Servings adjusted 2 → 4 to satisfy the 9+-ingredient scaling invariant. All 14 locales retranslated including hi. |
| 132 | Rösti | Tier A Complete | `pending` | Full EN rewrite: 9 ingredients with exact quantities (1 kg waxy potatoes Yukon Gold/Charlotte unpeeled, 60 g butter in two 30g portions, 2 tbsp neutral oil in two 1-tbsp portions, 1 tsp salt + 0.5 tsp pepper + nutmeg pinch, 80 g finely diced onion optional, 60 g grated aged gruyère optional, 1 tbsp chives garnish). 7-step howIsMade with the classic Bernese day-old technique (parboil whole-skin 8–10 min until knife meets resistance, refrigerate uncovered overnight to dry the surface and firm starches, peel cold and grate on box-grater large holes in long shreds, season with fingertips only to keep strands long, butter foaming and nut-brown in 24 cm pan, 90 s–2 min onion soften, lightly press 1.5 cm × 22 cm cake without packing, 8–10 min undisturbed for deep-gold underside, plate-flip plus extra butter + oil under the cake, 7–9 min second side, gruyère melts in residual heat). Doneness cues: knife meets some resistance in parboil, butter nut-brown not burnt, underside deep golden and lifts cleanly, no resistance to a paring knife pushed into the cake middle. Servings adjusted 2 → 4 to satisfy the 9+-ingredient scaling invariant. All 14 locales retranslated including hi. |
| 133 | Fasole cu cârnați | Tier A Complete | `pending` | Full EN rewrite: 18 ingredients with exact quantities (500 g white beans soaked overnight, 4 smoked pork sausages + 150 g optional smoked bacon, 350 g onion + 200 g carrot + red pepper sofrito, 4 garlic, 3 tbsp tomato paste + 200 g crushed tomatoes, 3 bay + 1 tsp sweet paprika + dried thyme + 0.5 tsp pepper, 1.5 tsp salt, 60 ml sunflower oil or 30 g lard, 1.5–2 L water/stock, dill or parsley + optional white wine vinegar). 8-step howIsMade: 8–12 h soak with size-doubling, 10 min throwaway first boil to mellow, 50–60 min unsalted simmer with bay + smoked bacon (no salt yet so skins stay tender), parallel sofrito 8–10 min onion + 5–6 min carrot/pepper + paprika-thyme bloom + 3–4 min oil-split tomato base, slice 2 sausages and leave 2 whole, 35–45 min combined uncovered simmer until liquid coats the back of a spoon, finish vinegar/dill. Doneness cues: beans tender without breaking, sofrito golden-edged, tomato oil-split brick red, liquid spoon-coating, sausage fanned on top. All 14 locales retranslated including hi. |
| 134 | Chicken Paprikash | Tier A Complete | `pending` | Full EN rewrite: 14 ingredients with exact quantities (1.5 kg bone-in skin-on chicken thighs/drumsticks, 400 g onion, 3 tbsp Hungarian sweet paprika + optional hot, 3 garlic, 1 red bell pepper, 100 g tomato or 2 tbsp paste, 60 g lard, 500 ml hot stock, 200 g full-fat 20%+ sour cream, 1 tbsp flour, 1.5 tsp salt + 0.5 tsp pepper, optional caraway, dill/parsley garnish). 8-step howIsMade with the Hungarian off-heat-paprika technique: 15 min rest after seasoning, 4–5 min skin-down then 3 min sear in lard, 12–15 min slow onion sweat to fully golden (foundation of the dish), 2–3 min garlic/pepper/caraway, pan completely off heat before stirring in the paprika so it does not scorch and turn bitter, return to heat for tomato + hot stock + chicken nestled skin-up, 35–45 min lowest-flame covered braise to 75°C internal, flour-whisked sour cream tempered with a ladle of hot pan sauce off heat to prevent splitting, chicken back to warm only. Doneness cues: deep golden skin, onion fully golden and glossy, brick-red oil-stained sauce, chicken pulls easily from bone at 75°C, silky un-split sauce. All 14 locales retranslated including hi. |
| 135 | Pasta alla Norma | Tier A Complete | `pending` | Full EN rewrite: 13 ingredients with exact quantities (700 g aubergine, 1.5 tsp fine salt for salting + extra for pasta water, 300 ml olive oil for shallow-frying, 400 g rigatoni/penne rigate/maccheroni, 3 tbsp olive oil for sauce, 3 garlic sliced, 0.5 tsp chilli flakes optional, 800 g whole peeled tomatoes or 700 g passata, 1 tsp sugar only if sharp, 0.5 tsp pepper, 30 g fresh basil torn, 120 g ricotta salata grated, 1 tbsp coarse salt for pasta water). 8-step howIsMade with the Sicilian salt-and-fry technique: 30 min aubergine salt-purge to draw bitter water and limit oil absorption, 170°C oil bath in three batches 3–4 min/batch turning often, parallel 4 L boiling salted pasta water, 60–90 s sliced-garlic pale gold (never brown), 12–15 min crushed-tomato simmer to oil-on-surface, pasta 1 min under al dente, 250 ml starchy water reserved, 1–2 min finishing toss with splashes of pasta water for a glossy cling, half ricotta salata folded in off-heat, more grated + basil + raw olive oil to finish. Doneness cues: aubergine deep golden all over and knife passes through easily, garlic pale-gold edges only, sauce thickens and the oil rises, pasta clings glossy and flows without being soupy. All 14 locales retranslated including hi. |
| — | (id 136 absent) | — | — | No recipe with id 136 in file |
| 137 | Ichlekli | Tier A Complete | `pending` | Full EN rewrite: 14 ingredients with exact quantities (500 g flour + 1 tsp salt + 240 ml warm water + 1 tbsp oil unleavened dough; 500 g lamb shoulder/beef chuck finely minced + 100 g lamb-tail fat or beef suet + 350 g onion + 200 g optional waxy potato cubes + 1.5 tsp salt + 1 tsp pepper + 1 tsp cumin + 0.5 tsp coriander + 0.5 tsp chilli flakes raw filling; egg-yolk + milk glaze). 8-step howIsMade with the Turkmen two-disc baked pie technique: 6–8 min knead to firm-elastic dough then 30 min rest, raw filling mixed by hand 1 min to bind without pre-cooking so juices flavour the dough from inside, 220 °C pre-heated baking tray or pizza stone (≥20 min) for crisp base, two 32 cm × 2 mm discs with thinner edges, 1.5 cm filling layer with 2 cm border, top disc pressed and rim rolled into a tight rope so no juice escapes, fork-vents in the centre, 30–35 min bake until top deep golden and base sounds hollow, 5 min board rest before cutting into 8 wedges. Doneness cues: top deep golden brown, hollow tap on base, sealed rim holds, filling no longer pink in centre. All 14 locales retranslated including hi. |
| 138 | Chicken Kiev | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (100 g unsalted butter + 3 garlic + 30 g flat-leaf parsley + 1 tbsp lemon juice + 0.5 tsp salt + 0.25 tsp pepper herb-butter cylinders; 4 × 200 g skinless chicken breasts + 1 tsp salt + 0.5 tsp pepper for the meat; 80 g flour + 2 eggs with 1 tbsp water + 150 g panko triple-bread; 750 ml frying oil + optional 1 tbsp butter; lemon wedges and parsley to serve). 8-step howIsMade with the classic Russian/Ukrainian technique: herb butter rolled into a 12 cm × 2 cm log + ≥1 h freeze + cut into 4 cold cylinders, pocket cut to within 1 cm of opposite edge then book-pound to 5 mm even thickness, tight-rolled parcels chilled 30 min, double-coated breading (flour → egg → crumbs → egg → crumbs) to prevent butter blow-out, 6–7 min 170 °C deep-fry in two batches turning once, 8–10 min 180 °C oven finish to 70 °C internal, 2 min rest before piercing at the table to release the golden butter stream. Doneness cues: deep golden uniform crust, 70 °C in the meat (probed away from the butter), molten butter erupting on the first cut. All 14 locales retranslated including hi. |
| 139 | Cepelinai | Tier A Complete | `pending` | Full EN rewrite: 16 ingredients with exact quantities (1.5 kg raw waxy + 500 g floury potato dual-potato dough, 1 tbsp lemon juice or citric acid against greying, 1 tsp salt + optional cornflour, 500 g coarsely minced pork + 150 g onion + 1 tsp salt + pepper + marjoram + 60 ml cold water filling, 200 g smoked bacon + 200 g onion + 200 g sour cream + dill/parsley sauce, 1 tbsp coarse salt for the cooking water). 8-step howIsMade with the Lithuanian dual-potato technique: filling first to marry flavours, 25–30 min boil of floury potatoes then cool to room temperature (hot mash would pre-cook the raw potato), fine-grate raw potato into a towel and wring out ~250 ml of liquid, settle 5 min and reserve the white starch at the bottom (natural binder), knead 2–3 min for sticky elastic dough, divide into 8 × 220 g pieces and shape 12 × 8 cm ovals around 60 g filling sealed into 12 cm zeppelins with no cracks, gentle simmer (not rolling boil) in 4 L salted water 25–30 min until surface turns matte → translucent and they float high, 6–8 min bacon render + 5–6 min onion sweat for the sauce, 2 dumplings per plate with bacon + sour cream + dill. Doneness cues: translucent floating surface, no cracks letting water in, juicy centres. All 14 locales retranslated including hi. |
| 140 | Chicken Fricassée | Tier A Complete | `pending` | Full EN rewrite: 15 ingredients with exact quantities (1.5 kg bone-in skin-on thighs+drumsticks or whole jointed chicken, 1 tsp salt + 0.5 tsp white pepper, 60 g butter split, 2 tbsp neutral oil, 250 g pearl onions, 200 g chestnut/button mushrooms, 200 g carrots in batons, 2 garlic, 30 g flour, 150 ml dry white wine, 500 ml hot stock, bay+thyme+parsley bouquet garni, 200 ml double cream + 2 optional yolks for the liaison, 1 tbsp lemon juice, parsley garnish). 8-step howIsMade with the classic French velouté technique: 15 min seasoned rest, 5–6 min skin-down gentle gilding without browning (a brown crust muddies the sauce), 5–6 min pearl-onion gilding still pale, 4–5 min carrot+mushroom drink-and-release plus 30 s garlic, 2 min flour roux around the vegetables, 1–2 min wine reduction by half, 30–35 min lowest-flame covered braise to 75 °C internal, sauce reduced to spoon-coating, tempered cream+yolk liaison off heat (do NOT boil or the yolks scramble), lemon brighten. Doneness cues: pale-gold skin (never brown), mushrooms reabsorbed their water, sauce coats spoon, fork-tender meat at 75 °C, liaison silky and un-broken. All 14 locales retranslated including hi. |
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
