# Recipe Quality Tracker (Tier A / B / C)

> Permanent tracking file for the Recipe Experience Wave (P1). Read-only audit; **no recipe content has been modified**.
> Generated 2026-06-17, after the P0 systemic-engine merge (commit `2fee9ac8`). Re-run the audit after each P1 batch and update this file.

## Methodology

All 225 recipes (`public/js/recipes.js`) audited across six user-facing dimensions: **Highlights, Pairings, Difficulty, Time, Nutrition, Instructions.** A deterministic engine pass (validated post-P0 generator logic) covers the objective signals; an LLM pass judges the two subjective dimensions (pairings appropriateness on all 225; highlights specificity on the 61 authored sets).

**Tiers** (matching the original Tier-A audit framing):
- **Tier A** — 0 blockers.
- **Tier B** — 1–2 *surface* blockers (Highlights and/or Pairings), fixable with authored content.
- **Tier C** — *deeper editorial* problems (stub instructions, quantity-less ingredients, implausible nutrition). **None exist** — the May-2026 stub backlog is fully resolved.

**Backlog priority is separate from tier:** P1 = 1 blocker, P2 = 2 blockers, P3 = deeper editorial.

**Dimensions that are NOT blockers anywhere (verified):**
- **Instructions** — 0 stubs (every recipe has complete multi-step instructions with doneness cues).
- **Ingredients** — 0 quantity-less stubs; 0 recipes missing any of the 14 language codes.
- **Nutrition** — post-P0 values plausible (4 deterministic flags were false positives: side-dish rice/beef in Borscht, Kung Pao, Mole, Green Curry).
- **Difficulty / Time** — P0 fixed the unrealistic cases; residual gaps are passive-time (marinades/chills correctly excluded) → metadata-B, not a blocker.

**The only two remaining Tier-A blockers are Highlights and Pairings.**

## Summary

| Tier | Count | % |
|---|:-:|:-:|
| **Tier A** (0 blockers) | 51 | 23% |
| **Tier B** (1–2 surface blockers) | 174 | 77% |
| **Tier C** (deeper editorial) | 0 | 0% |
| **Total** | 225 | 100% |

### Estimates (for planning)

- **Already Tier A:** 51
- **Become Tier A with HIGHLIGHTS only** (1 blocker = Highlights; pairings already fine): **91**
- **Become Tier A with PAIRINGS only** (1 blocker = Pairings; highlights already authored): **10**
- **Require highlights work** (total, incl. 2-blocker): 164
- **Require pairings work** (total, incl. 2-blocker): 83
- **Require both Highlights + Pairings:** 73
- **Require instruction rewrites:** 0
- **Require nutrition rewrites:** 0

> "Pairings work" is largely **central template work** — splitting over-broad cuisine templates (`thai` → Indonesian/Malaysian/Filipino; `middle-eastern` → Persian/Maghrebi; `mediterranean` → Croatian/Portuguese), exactly like the P0-4 Hungarian split — so the 83 figure is **far fewer than 83 manual edits**. "Highlights work" is per-recipe authored `featureCards` (14 locales each).

---

## Ranked backlog

### Priority 1 — Closest to Tier A (1 blocker) — 101 recipes

**P1a — Highlights only (91)** — add authored `featureCards`; pairings already appropriate:

`26, 27, 28, 30, 31, 32, 33, 36, 37, 38, 39, 40, 43, 44, 45, 49, 51, 52, 55, 58, 60, 61, 63, 66, 72, 74, 76, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 95, 96, 102, 103, 104, 111, 112, 114, 115, 116, 118, 120, 121, 123, 129, 130, 134, 137, 139, 140, 142, 143, 145, 148, 149, 150, 151, 152, 153, 154, 156, 160, 161, 162, 163, 165, 166, 167, 168, 169, 171, 173, 174, 177, 178, 180, 195, 197, 214, 217, 219, 222, 227`

**P1b — Pairings only (10)** — fix pairings; highlights already authored:

- **ID 189 Tres Leches Cake** — Blocker: Pairings — Generic Western dessert pairings; whipped cream redundant, not Mexican
- **ID 190 Bouillabaisse** — Blocker: Pairings — Red wine contradicts saffron seafood stew; needs dry white/rose
- **ID 191 Croque Monsieur** — Blocker: Pairings — Generic French defaults; cheese platter redundant with Gruyere sandwich
- **ID 199 Pizza Margherita** — Blocker: Pairings — Extra Parmigiano contradicts pizza; bread+pizza redundant
- **ID 201 Osso Buco alla Milanese** — Blocker: Pairings — Milanese pairs Barolo/risotto, not Chianti; Parmigiano off
- **ID 205 Hyderabadi Lamb Biryani** — Blocker: Pairings — Biryani is already rice; steamed basmati pairing redundant/wrong
- **ID 208 Samosa** — Blocker: Pairings — Samosa is a fried snack; rice+naan are starch-on-starch, wrong
- **ID 211 Som Tam** — Blocker: Pairings — Som Tam eaten with sticky rice; jasmine rice/herbs off for a salad
- **ID 212 Khao Soi** — Blocker: Pairings — Khao Soi is a noodle soup; jasmine rice pairing is wrong
- **ID 213 Mango Sticky Rice (Khao Niao Mamuang)** — Blocker: Pairings — Espresso/berries/whipped cream are Western-default, wrong for Thai coconut dessert

### Priority 2 — Two blockers (Highlights + Pairings) — 73 recipes

`29, 35, 41, 42, 46, 47, 48, 50, 53, 54, 56, 57, 59, 62, 64, 65, 67, 68, 69, 70, 73, 75, 77, 78, 91, 92, 93, 94, 97, 98, 99, 100, 105, 106, 107, 109, 110, 113, 117, 124, 125, 126, 127, 131, 132, 133, 135, 141, 144, 146, 147, 155, 157, 158, 159, 170, 172, 175, 176, 179, 181, 182, 183, 194, 196, 203, 215, 216, 218, 223, 226, 228, 229`

### Priority 3 — Deeper editorial work — 0 recipes

No recipes require instruction, ingredient, or nutrition rewrites.

---

## Full per-recipe register (225)

| ID | Recipe | Origin | Tier | Blocker(s) | Note |
|---:|---|---|:-:|---|---|
| 1 | Spaghetti Carbonara | Italy | A | — |  |
| 2 | Tripe Soup | Romania | A | — |  |
| 3 | Quiche Lorraine | France | A | — |  |
| 4 | Gazpacho | Spain | A | — |  |
| 5 | Sushi | Japan | A | — |  |
| 7 | Cheeseburger | USA | A | — |  |
| 8 | Tacos | Mexico | A | — |  |
| 9 | Chicken Curry | India | A | — |  |
| 10 | Ratatouille | France | A | — |  |
| 11 | Souvlaki | Greece | A | — |  |
| 12 | Dhal | India | A | — |  |
| 13 | Guacamole | Mexico | A | — |  |
| 14 | Borscht | Russia | A | — |  |
| 15 | Pancakes | USA | A | — |  |
| 16 | Pad Thai | Thailand | A | — |  |
| 17 | Schnitzel | Germany | A | — |  |
| 18 | Feijoada | Brazil | A | — |  |
| 19 | Kung Pao Chicken | China | A | — |  |
| 20 | Fish and Chips | United Kingdom | A | — |  |
| 21 | Pho | Vietnam | A | — |  |
| 22 | Paella | Spain | A | — |  |
| 23 | Bibimbap | South Korea | A | — |  |
| 24 | Hummus | Syria | A | — |  |
| 25 | Tabbouleh | Lebanon | A | — |  |
| 26 | Risotto | Italy | B | Highlights | Highlights are generic computed badges, not authored |
| 27 | Swedish Meatballs | Sweden | B | Highlights | Highlights are generic computed badges, not authored |
| 28 | Classic Japanese Ramen | Japan | B | Highlights | Highlights are generic computed badges, not authored |
| 29 | Empanadas | Argentina | B | Highlights + Pairings | Rice/plantains/black beans are Caribbean defaults, not Argentine |
| 30 | Tzatziki | Greece | B | Highlights |  |
| 31 | French Onion Soup | France | B | Highlights |  |
| 32 | Goulash | Hungary | B | Highlights |  |
| 33 | Koshari | Egypt | B | Highlights |  |
| 35 | Baklava | Turkey | B | Highlights + Pairings | Espresso, berries, whipped cream are Western-default on Turkish pastry |
| 36 | Chili con carne | Mexico | B | Highlights |  |
| 37 | Sweet and Sour Chicken | China | B | Highlights |  |
| 38 | Pavlova | Australia | B | Highlights | Generic computed badge, not authored. |
| 39 | Poutine | Canada | B | Highlights | Generic computed badges, not authored. |
| 40 | Pierogi | Poland | B | Highlights | Generic computed badges, not authored. |
| 41 | Nasi Goreng | Indonesia | B | Highlights + Pairings | All-Thai pairings on Indonesian dish; rice contradicts. |
| 42 | Fondue | Switzerland | B | Highlights + Pairings | Beer/rye German set; Swiss fondue wants white wine. |
| 43 | Masgouf | Iraq | B | Highlights | Generic computed badge, not authored. |
| 44 | Shakshuka | Israel | B | Highlights | Generic computed badge, not authored. |
| 45 | Salmon Soup | Finland | B | Highlights |  |
| 46 | Ghormeh Sabzi | Iran | B | Highlights + Pairings | Levantine mezze on a Persian herb stew; needs rice/torshi |
| 47 | Bacalhau à Brás | Portugal | B | Highlights + Pairings | Greek feta/kalamata/pita on a Portuguese cod dish |
| 48 | Adobo | Philippines | B | Highlights + Pairings | Thai pairings on a Filipino dish; should be plain rice |
| 49 | Jerk Chicken | Jamaica | B | Highlights |  |
| 50 | Doro Wat | Ethiopia | B | Highlights + Pairings | Rice/plantains not Ethiopian; should be served with injera |
| 51 | Kibbeh | Syria | B | Highlights |  |
| 52 | Stamppot | Netherlands | B | Highlights | Dutch-appropriate; boiled potatoes redundant with mash |
| 53 | Hangi | New Zealand | B | Highlights + Pairings | British pub defaults on a Maori earth-oven feast |
| 54 | Moules-frites | Belgium | B | Highlights + Pairings | Generic; classic pairing is frites, not boiled potatoes/rye |
| 55 | Moussaka | Greece | B | Highlights |  |
| 56 | Svíčková | Czech Republic | B | Highlights + Pairings | Russian smetana/dill on Czech dish; serve knedlíky/cranberry |
| 57 | Fårikål | Norway | B | Highlights + Pairings | Herring/dill generic; fårikål served with potatoes |
| 58 | Ful Medames | Sudan | B | Highlights |  |
| 59 | Crni Rizot | Croatia | B | Highlights + Pairings | Greek feta/olives/pita off-cuisine for Croatian black risotto |
| 60 | Buuz | Mongolia | B | Highlights |  |
| 61 | Biryani | Pakistan | B | Highlights |  |
| 62 | Brik | Tunisia | B | Highlights + Pairings | Levantine hummus/tabbouleh; turnips Levant, not Tunisian brik |
| 63 | Khachapuri | Georgia | B | Highlights |  |
| 64 | Bobotie | South Africa | B | Highlights + Pairings | Plantains/greens off-cuisine; bobotie served with yellow rice, chutney |
| 65 | Ceviche | Peru | B | Highlights + Pairings | Black beans/sweet plantains off-cuisine; needs camote, choclo, cancha |
| 66 | Kimchi | South Korea | B | Highlights |  |
| 67 | Banh Mi | Vietnam | B | Highlights + Pairings | Rice/Thai basil wrong for a baguette sandwich |
| 68 | Satay | Indonesia | B | Highlights + Pairings | All-Thai pairings off-cuisine for Indonesian satay |
| 69 | Laksa | Malaysia | B | Highlights + Pairings | Thai-default pairings; rice wrong for noodle soup |
| 70 | Pupusa | El Salvador | B | Highlights + Pairings | Mexican-default; missing curtido, tortillas redundant |
| 72 | Amok | Cambodia | B | Highlights |  |
| 73 | Momo | Nepal | B | Highlights + Pairings | Indian-default; momo served with achar, not naan/raita |
| 74 | Encebollado | Ecuador | B | Highlights |  |
| 75 | Harira | Morocco | B | Highlights + Pairings | Levantine mezze set, off-cuisine for Moroccan harira |
| 76 | Lobio | Georgia | B | Highlights |  |
| 77 | Chakhchoukha | Algeria | B | Highlights + Pairings | Generic Levantine set, off-cuisine for Algerian dish |
| 78 | Rendang | Indonesia | B | Highlights + Pairings | Thai pairings on Indonesian rendang; wrong cuisine |
| 79 | Gravlax | Sweden | A | — |  |
| 80 | Stoofvlees | Belgium | B | Highlights |  |
| 81 | Zeama | Moldova | B | Highlights |  |
| 82 | Meat Pie | Australia | B | Highlights |  |
| 83 | Fatteh | Syria | B | Highlights |  |
| 84 | Smørrebrød | Denmark | B | Highlights |  |
| 85 | Naengmyeon | North Korea | B | Highlights |  |
| 86 | Nihari | Pakistan | B | Highlights |  |
| 87 | Bún bò Huế | Vietnam | B | Highlights |  |
| 88 | Moqueca | Brazil | B | Highlights |  |
| 89 | Sabich | Israel | B | Highlights |  |
| 90 | Ropa Vieja | Cuba | B | Highlights |  |
| 91 | Cullen Skink | Scotland | B | Highlights + Pairings | Pub-roast sides; wrong for creamy smoked-haddock soup |
| 92 | Gado-Gado | Indonesia | B | Highlights + Pairings | All Thai pairings on an Indonesian peanut-sauce salad |
| 93 | Cinnamon Bun | Sweden | B | Highlights + Pairings | Berries/whipped cream are Western default, not Swedish fika |
| 94 | Chiles en nogada | Mexico | B | Highlights + Pairings | Taqueria defaults contradict refined walnut-sauce dish |
| 95 | Lentil Soup | Lebanon | B | Highlights |  |
| 96 | Spanakopita | Greece | B | Highlights |  |
| 97 | Jollof Rice | Nigeria | B | Highlights + Pairings | Steamed white rice redundant alongside a rice dish |
| 98 | Oka i'a | Samoa | B | Highlights + Pairings | White wine Western-default; Samoan oka served with coconut, taro |
| 99 | Khorovats | Armenia | B | Highlights + Pairings | Saperavi and tonis puri are Georgian, not Armenian |
| 100 | Verivorst | Estonia | B | Highlights + Pairings | Smetana/dill Slavic default; Estonian is lingonberry, sauerkraut |
| 102 | Tteokbokki | South Korea | B | Highlights |  |
| 103 | Shrimp Ceviche | Ecuador | B | Highlights |  |
| 104 | La Bandera | Dominican Republic | B | Highlights |  |
| 105 | Fesenjan | Iran | B | Highlights + Pairings | Arab mezze on Persian stew; needs chelow rice |
| 106 | Kare-Kare | Philippines | B | Highlights + Pairings | Thai pairings on Filipino kare-kare; needs rice, bagoong |
| 107 | Francesinha | Portugal | B | Highlights + Pairings | Greek mezze on Portuguese sandwich; needs fries, beer |
| 109 | Arroz Chaufa | Peru | B | Highlights + Pairings | Rice with rice; not Peruvian-Chinese fried rice |
| 110 | Chili Crab | Singapore | B | Highlights + Pairings | Thai pairings on Singaporean chili crab; needs mantou |
| 111 | Tamale | Mexico | B | Highlights |  |
| 112 | Tom Yum | Thailand | B | Highlights |  |
| 113 | Milanesa | Argentina | B | Highlights + Pairings | Plantains/black beans/lime are Caribbean, not Argentine milanesa sides |
| 114 | Lok Lak | Cambodia | B | Highlights |  |
| 115 | Manti | Uzbekistan | B | Highlights |  |
| 116 | Chakhokhbili | Georgia | B | Highlights |  |
| 117 | Lomo Saltado | Peru | B | Highlights + Pairings | Plantains/black beans off-cuisine; lomo saltado uses fries, not these |
| 118 | Chicken Tagine | Morocco | B | Highlights | Generic computed badges; pairings authentic Moroccan/Levantine-leaning but fit |
| 120 | Arepa | Venezuela | B | Highlights | Generic computed badges |
| 121 | Karelian Pie | Finland | B | Highlights | Generic computed badges |
| 123 | Pasta e fagioli | Italy | B | Highlights | Generic computed badges |
| 124 | Kottu | Sri Lanka | B | Highlights + Pairings | Naan/raita/mango chutney are Indian, not Sri Lankan kottu |
| 125 | Piragi | Latvia | B | Highlights + Pairings | Smetana is Slavic; off-cuisine for Latvian piragi |
| 126 | Banh Xeo | Vietnam | B | Highlights + Pairings | Banh xeo wrapped in lettuce/herbs, not served with jasmine rice |
| 127 | Causa Limeña | Peru | B | Highlights + Pairings | Generic Latin/Caribbean sides, not Peruvian causa; 'fermented' wrong |
| 129 | Beshbarmak | Kyrgyzstan | B | Highlights |  |
| 130 | Coconut Rice | Thailand | B | Highlights |  |
| 131 | Nasi lemak | Malaysia | B | Highlights + Pairings | Copy-pasted Thai pairings on Malaysian dish; contradicts rice |
| 132 | Rösti | Switzerland | B | Highlights + Pairings | Redundant boiled potatoes; German-default, not Swiss |
| 133 | Beans with Sausages | Romania | B | Highlights + Pairings | Slavic smetana/dill defaults on Romanian dish |
| 134 | Chicken Paprikash | Hungary | B | Highlights |  |
| 135 | Pasta alla Norma | Italy | B | Highlights + Pairings | Norma uses ricotta salata, not Parmigiano |
| 137 | Ichlekli | Turkmenistan | B | Highlights |  |
| 138 | Chicken Kiev | Ukraine | A | — |  |
| 139 | Cepelinai | Lithuania | B | Highlights |  |
| 140 | Chicken Fricassée | France | B | Highlights |  |
| 141 | Machboos | Kuwait | B | Highlights + Pairings | Levantine mezze, not Gulf Khaleeji accompaniments |
| 142 | Moambe chicken | Republic of the Congo | B | Highlights |  |
| 143 | Cassoulet | France | B | Highlights |  |
| 144 | Pasticada | Croatia | B | Highlights + Pairings | Greek mezze on Dalmatian beef braise; should be gnocchi/pasta |
| 145 | Sheftalia | Cyprus | B | Highlights |  |
| 146 | Cevapi | Bosnia and Herzegovina | B | Highlights + Pairings | Greek defaults; cevapi needs somun, kajmak, onion, ajvar |
| 147 | Fufu | Ghana | B | Highlights + Pairings | Fufu is the starch; pairing with rice contradicts dish |
| 148 | Khinkali | Georgia | B | Highlights |  |
| 149 | Pozole | Mexico | B | Highlights |  |
| 150 | Pepian | Guatemala | B | Highlights | Generic computed badges; Guatemalan pairings fit pepian well |
| 151 | Okroshka | Russia | B | Highlights | Generic badges; rye/smetana/dill authentic for Russian okroshka |
| 152 | Plov | Uzbekistan | B | Highlights | Generic badges; green tea, non bread, onion authentic Uzbek |
| 153 | Potica | Slovenia | B | Highlights | Generic badge; coffee/tea pairings fit Slovenian nut pastry |
| 154 | Egusi soup | Nigeria | B | Highlights | Generic badges; rice, plantain, pepper sauce fit Nigerian egusi |
| 155 | Kotlet schabowy | Poland | B | Highlights + Pairings | Russian smetana/dill on Polish schnitzel; off-cuisine pairings |
| 156 | Kimbap | South Korea | B | Highlights | Generic badges; kimchi, doenjang jjigae, banchan authentic Korean |
| 157 | Pastel de Choclo | Chile | B | Highlights + Pairings | Generic Latin sides; rice/black beans wrong for Chilean pastel de choclo |
| 158 | Pljeskavica | Serbia | B | Highlights + Pairings | Russian smetana/dill/rye wrong; Serbian needs lepinje, kajmak, ajvar |
| 159 | Poffertjes | Netherlands | B | Highlights + Pairings | Espresso/berries/whipped cream off; Dutch poffertjes use butter and powdered sugar |
| 160 | Japanese Curry Rice | Japan | B | Highlights |  |
| 161 | Fasolada | Greece | B | Highlights |  |
| 162 | Tlayudas | Mexico | B | Highlights |  |
| 163 | Bandeja Paisa | Colombia | B | Highlights |  |
| 164 | Lángos | Hungary | A | — |  |
| 165 | Rajma | India | B | Highlights | Computed generic badges, not authored |
| 166 | Picadillo | Cuba | B | Highlights | Generic computed badges |
| 167 | Lamb Tagine | Morocco | B | Highlights | Generic computed badges |
| 168 | Shepherd's Pie | United Kingdom | B | Highlights | Generic computed badges |
| 169 | Mapo Tofu | China | B | Highlights | Generic computed badges |
| 170 | Menemen | Turkey | B | Highlights + Pairings | Levantine mezze on a Turkish egg dish; should be Turkish breakfast items |
| 171 | Solyanka | Russia | B | Highlights | Generic computed badges |
| 172 | Clam Chowder | USA | B | Highlights + Pairings | Mash, peas, brown gravy are British roast, not chowder |
| 173 | Currywurst | Germany | B | Highlights | Generic computed badges |
| 174 | Tom Kha Gai | Thailand | B | Highlights | Generic computed badges |
| 175 | Cachupa | Cape Verde | B | Highlights + Pairings | Black beans redundant; rice/plantain generic, not Cape Verdean |
| 176 | Pav Bhaji | India | B | Highlights + Pairings | Pav bhaji eaten with pav, not rice or naan |
| 177 | Karelian stew | Finland | B | Highlights | Generic computed badges |
| 178 | Boeuf Bourguignon | France | B | Highlights | Generic computed badges, not authored. |
| 179 | Chakchouka | Tunisia | B | Highlights + Pairings | Levantine mezze on Tunisian shakshuka; off-cuisine, generic badges. |
| 180 | Okonomiyaki | Japan | B | Highlights | Generic computed badges, not authored. |
| 181 | Tonkotsu Ramen | Japan | B | Highlights + Pairings | Miso soup beside ramen redundant; templated izakaya set, generic badges. |
| 182 | Shoyu Ramen | Japan | B | Highlights + Pairings | Miso soup beside ramen redundant; templated set, generic badges. |
| 183 | Miso Ramen | Japan | B | Highlights + Pairings | Miso soup beside miso ramen redundant; templated, generic badges. |
| 184 | Tempura | Japan | A | — |  |
| 185 | Onigiri | Japan | A | — |  |
| 186 | Yakitori | Japan | A | — |  |
| 187 | Mole Poblano | Mexico | A | — |  |
| 188 | Chilaquiles | Mexico | A | — |  |
| 189 | Tres Leches Cake | Mexico | B | Pairings | Generic Western dessert pairings; whipped cream redundant, not Mexican |
| 190 | Bouillabaisse | France | B | Pairings | Red wine contradicts saffron seafood stew; needs dry white/rose |
| 191 | Croque Monsieur | France | B | Pairings | Generic French defaults; cheese platter redundant with Gruyere sandwich |
| 192 | Crêpes | France | A | — |  |
| 193 | Tarte Tatin | France | A | — |  |
| 194 | Avgolemono | Greece | B | Highlights + Pairings | Feta/olives/pita don't belong with lemon-egg soup; generic badges |
| 195 | Gyros | Greece | B | Highlights | Generic computed badges, not authored |
| 196 | Pastitsio | Greece | B | Highlights + Pairings | Pita/olives generic for baked pasta casserole; generic badges |
| 197 | Dolmades | Greece | B | Highlights | Generic computed badges, not authored |
| 198 | Galaktoboureko | Greece | A | — |  |
| 199 | Pizza Margherita | Italy | B | Pairings | Extra Parmigiano contradicts pizza; bread+pizza redundant |
| 200 | Lasagne alla Bolognese | Italy | A | — |  |
| 201 | Osso Buco alla Milanese | Italy | B | Pairings | Milanese pairs Barolo/risotto, not Chianti; Parmigiano off |
| 202 | Tiramisu | Italy | A | — |  |
| 203 | Cacio e Pepe | Italy | B | Highlights + Pairings | Generic badges; Parmigiano contradicts Pecorino-only cacio e pepe |
| 204 | Butter Chicken (Murgh Makhani) | India | A | — |  |
| 205 | Hyderabadi Lamb Biryani | India | B | Pairings | Biryani is already rice; steamed basmati pairing redundant/wrong |
| 206 | Palak Paneer | India | A | — |  |
| 207 | Rogan Josh | India | A | — |  |
| 208 | Samosa | India | B | Pairings | Samosa is a fried snack; rice+naan are starch-on-starch, wrong |
| 209 | Green Curry (Gaeng Khiao Wan) | Thailand | A | — |  |
| 210 | Massaman Curry | Thailand | A | — |  |
| 211 | Som Tam | Thailand | B | Pairings | Som Tam eaten with sticky rice; jasmine rice/herbs off for a salad |
| 212 | Khao Soi | Thailand | B | Pairings | Khao Soi is a noodle soup; jasmine rice pairing is wrong |
| 213 | Mango Sticky Rice (Khao Niao Mamuang) | Thailand | B | Pairings | Espresso/berries/whipped cream are Western-default, wrong for Thai coconut dessert |
| 214 | Lamb Stew | International | B | Highlights | Generic computed badges |
| 215 | Greek Salad | Greece | B | Highlights + Pairings | Generic chips; 'Salad' on a salad, garlic off-mark; computed badges |
| 216 | Caprese Salad | Italy | B | Highlights + Pairings | Extra Parmigiano contradicts mozzarella Caprese; red wine odd; computed badges |
| 217 | Lasagna | Italy | B | Highlights | Generic computed badges |
| 218 | Salade Niçoise | France | B | Highlights + Pairings | Steamed rice off-cuisine for Provençal salad; computed badges |
| 219 | Beef Stroganoff | Russia | B | Highlights | Generic computed badges |
| 222 | Coq au Vin | France | B | Highlights | Generic computed badges, not authored. |
| 223 | Bigos | Poland | B | Highlights + Pairings | Smetana is Russian; Polish bigos uses śmietana but off; generic badges. |
| 226 | Vietnamese Spring Rolls | Vietnam | B | Highlights + Pairings | Red wine/bread/potatoes wholly off-cuisine for Vietnamese rolls. |
| 227 | Grilled Sea Bream | Mediterranean | B | Highlights | Generic computed badge. |
| 228 | Sea Bass Provençal | France | B | Highlights + Pairings | Yogurt off for Provençal; should be white wine/herbs/lemon. |
| 229 | Roast Chicken Diavola | Italy | B | Highlights + Pairings | Extra Parmigiano off for chicken diavola; generic badges. |
| 230 | Romanian Cabbage Rolls | Romania | A | — |  |
| 231 | Polenta with Cheese & Sour Cream | Romania | A | — |  |
| 232 | Radauti Sour Chicken Soup | Romania | A | — |  |
| 233 | Romanian Fried Cheese Doughnuts | Romania | A | — |  |
| 234 | Romanian Sweet Braided Bread | Romania | A | — |  |
| 235 | Romanian Grilled Minced Meat Rolls | Romania | A | — |  |
| 236 | Romanian Beef & Vegetable Salad | Romania | A | — |  |
| 237 | Romanian Vegetable Spread | Romania | A | — |  |
| 238 | Roasted Pork Loin | Romania | A | — |  |
