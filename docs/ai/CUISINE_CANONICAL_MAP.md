# CUISINE_CANONICAL_MAP

**Status:** Phase 8A — Data Hygiene
**Scope:** Source of truth for cuisine naming in `public/js/recipes.js → recipe.origin.en`.
**Enforcement:** Manual at edit time + the slug-collision guard in `scripts/generate-content.mjs` (lines ~3612-3625). The English origin key is the only field that drives URL slugs and hub eligibility, so it must be a real country (or recognized polity).

URL pattern: `/<lc>/<recipe-prefix>/<slug(origin.en)>/` (e.g. `/en/recipes/united-kingdom/`).

---

## 1. Canonical origins (country-level only)

Use the exact spelling in the left column for `origin.en`. Diacritics-free, English short-form name. If a recipe legitimately belongs to two cuisines (e.g. Levantine staples shared by Lebanon and Syria), pick the most defensible single claim — do not split a recipe across two hubs.

| Canonical `origin.en` | URL slug | Notes |
|---|---|---|
| Algeria | algeria | |
| Argentina | argentina | |
| Armenia | armenia | |
| Australia | australia | |
| Belgium | belgium | |
| Bosnia and Herzegovina | bosnia-and-herzegovina | |
| Brazil | brazil | |
| Cambodia | cambodia | |
| Canada | canada | |
| Cape Verde | cape-verde | |
| Chile | chile | |
| China | china | Sub-styles (Sichuan, Cantonese, …) stay under China — do not split into per-province hubs. |
| Colombia | colombia | |
| Croatia | croatia | |
| Cuba | cuba | |
| Cyprus | cyprus | |
| Czech Republic | czech-republic | |
| Denmark | denmark | |
| Dominican Republic | dominican-republic | |
| Ecuador | ecuador | |
| Egypt | egypt | |
| El Salvador | el-salvador | |
| Estonia | estonia | |
| Ethiopia | ethiopia | |
| Finland | finland | |
| France | france | |
| Georgia | georgia | |
| Germany | germany | Includes Austrian-origin dishes the German diaspora popularized (Schnitzel sits here). |
| Ghana | ghana | |
| Greece | greece | |
| Guatemala | guatemala | |
| Hungary | hungary | |
| India | india | Sub-regions (Punjabi, South Indian, Bengali) stay under India. |
| Indonesia | indonesia | |
| Iran | iran | |
| Iraq | iraq | |
| Israel | israel | |
| Italy | italy | |
| Jamaica | jamaica | |
| Japan | japan | |
| Kuwait | kuwait | |
| Kyrgyzstan | kyrgyzstan | |
| Latvia | latvia | |
| Lebanon | lebanon | Phase 8A: promoted to hub via Lentil Soup reassignment. |
| Lithuania | lithuania | |
| Malaysia | malaysia | |
| Mexico | mexico | |
| Moldova | moldova | |
| Mongolia | mongolia | |
| Morocco | morocco | |
| Nepal | nepal | |
| Netherlands | netherlands | |
| New Zealand | new-zealand | |
| Nigeria | nigeria | |
| North Korea | north-korea | |
| Norway | norway | |
| Pakistan | pakistan | |
| Peru | peru | |
| Philippines | philippines | |
| Poland | poland | |
| Portugal | portugal | |
| Republic of the Congo | republic-of-the-congo | |
| Romania | romania | |
| Russia | russia | |
| Samoa | samoa | |
| Scotland | scotland | Sub-national, but UK has separate culinary identities; keep as standalone for Cullen Skink etc. |
| Serbia | serbia | |
| Singapore | singapore | |
| Slovenia | slovenia | |
| South Africa | south-africa | |
| South Korea | south-korea | |
| Spain | spain | |
| Sri Lanka | sri-lanka | |
| Sudan | sudan | |
| Sweden | sweden | |
| Switzerland | switzerland | |
| Syria | syria | |
| Thailand | thailand | Phase 8A: Coconut Rice reassigned here (was "Asia"). |
| Tunisia | tunisia | |
| Turkey | turkey | |
| Turkmenistan | turkmenistan | |
| Ukraine | ukraine | |
| United Kingdom | united-kingdom | Phase 8A: canonical spelling. **NEVER use "UK"** as `origin.en`. |
| Uruguay | uruguay | Reserved (no recipes yet). |
| USA | usa | |
| Uzbekistan | uzbekistan | |
| Venezuela | venezuela | |
| Vietnam | vietnam | |

---

## 2. Aliases & previously-used non-canonical spellings → CORRECT

These labels existed in the corpus before Phase 8A and must always be rewritten:

| Old / non-canonical | → Canonical | Rationale |
|---|---|---|
| `UK` | `United Kingdom` | Mixed labels (`UK` for Fish and Chips, `United Kingdom` for Shepherd's Pie) split the same hub. Resolved in Phase 8A on recipe id=20. |
| `Britain` / `Great Britain` | `United Kingdom` | Same hub. |
| `England` | `United Kingdom` (or `Scotland` if a Scottish dish like Cullen Skink). | England is not a separate hub today. |
| `Holland` | `Netherlands` | |
| `Persia` | `Iran` | |
| `Burma` | `Myanmar` (reserved — no recipes yet). | |
| `Czechia` | `Czech Republic` | |
| `North Macedonia` | (reserved — no recipes yet). | |
| `Bangladesh` | `Bangladesh` (reserved — no recipes yet). | |

---

## 3. Forbidden values for `origin.en`

These MUST NOT appear as canonical origins. They are too vague or too broad to serve as a meal-planner cuisine hub.

| Forbidden value | Why forbidden | What to do instead |
|---|---|---|
| `Asia` | Continent. 50+ cuisines collapse here. No editorial signal. | Reassign to the actual country: e.g. *Coconut Rice with pandan + lemongrass* → `Thailand`. Apply this rule mechanically — never default-bucket a recipe into a region. |
| `Middle East` | Multi-country region. | Reassign to the specific country claim: Levantine staples → `Lebanon` or `Syria`; Gulf dishes → `Kuwait` / `Saudi Arabia`; Egyptian-style → `Egypt`. |
| `Europe` | Continent. | Pick a country. |
| `Africa` / `North Africa` / `Sub-Saharan Africa` | Continent / region. | Pick a country. Morocco/Tunisia/Algeria/Sudan/Nigeria/Ghana/Ethiopia/Congo/South Africa already exist. |
| `Latin America` / `South America` / `Central America` | Region. | Pick a country. |
| `Scandinavia` / `Nordic` | Region. | Pick `Sweden` / `Norway` / `Finland` / `Denmark` / `Iceland`. |
| `Balkans` | Region. | Pick `Croatia` / `Serbia` / `Slovenia` / `Bosnia and Herzegovina`. |
| `Caucasus` | Region. | Pick `Georgia` / `Armenia` / `Azerbaijan`. |
| `Mediterranean` | Marketing region. | Pick the country. |
| `International` / `Fusion` / `Global` | Non-cuisine. | Pick the dominant origin or reject the recipe. |
| `Worldwide` / `Various` | Same. | Same. |
| Continent + adjective (e.g. `East Asian`, `Southeast Asian`) | Region. | Country only. |

**Single exception** — the `Middle East` and `Asia` labels remained in the data only because two specific recipes used them. Phase 8A clears both. Any future reintroduction of a regional bucket is a build-time error in disguise: the recipe is misclassified.

---

## 4. Sub-national / disputed polity rules

| Polity | Rule |
|---|---|
| `Scotland` | Allowed as a standalone cuisine because Scottish dishes (Cullen Skink, haggis) are culturally distinct from English/Welsh/Northern Irish food. Do NOT migrate Scottish dishes into `United Kingdom`. |
| `Wales` / `Northern Ireland` / `England` | Not currently in use. If introduced, treat the same as Scotland (standalone). Until then, English/Welsh/NI dishes go under `United Kingdom`. |
| `Hong Kong` / `Taiwan` | Reserved. Both have distinctive culinary identities; if introduced, keep separate from `China`. Until then, Cantonese-style dishes stay under `China`. |
| `Tibet` | Reserved. Keep separate from `China` if introduced. |
| `Catalonia` / `Basque Country` | Stay under `Spain`. Do not split. |
| `Sicily` / `Tuscany` / `Lombardy` | Stay under `Italy`. Do not split. |
| `Quebec` | Stays under `Canada` (Poutine is Canadian-coded). Do not split. |
| `Bavaria` | Stays under `Germany`. |
| `Kashmir` / `Goa` / `Punjab` | Stay under `India`. |
| `Kurdistan` | Reserved. Currently dishes go to the actual state (`Iraq`, `Turkey`, `Syria`, `Iran`). |
| `Palestine` | Reserved. If introduced, keep separate from `Israel`. Shared dishes (Hummus, Falafel) stay where currently filed; do not duplicate. |
| `Macao` | Stays under `China` or `Portugal` depending on the dish (Galinha à Africana → `Portugal`; Pork Chop Bun → `China`). |

---

## 5. Cross-cuisine same-dish handling

Some dishes have legitimate parallel claims from multiple countries. Rule: **one hub gets the dish, the others do NOT.** No duplicate slugs across cuisines. Pick the strongest cultural anchor.

| Dish | Canonical hub | Notes / forbidden duplicates |
|---|---|---|
| Hummus | `Syria` | Lebanon/Israel/Palestine claims exist; do not add a second Hummus. |
| Shakshuka / Chakchouka | Two distinct entries today: `Israel` (Shakshuka) + `Tunisia` (Chakchouka). Tolerated because of the Maghreb-vs-Levant split, but **do not also add to Morocco/Algeria/Libya.** |
| Chakhchoukha (Algeria) | `Algeria`. Different dish from Tunisian Chakchouka — torn-flatbread stew, not egg-in-tomato. Keep the spelling distinct. |
| Tagine | `Morocco` (canonical). Do not also file under Algeria/Tunisia — Tunisia uses Tajine for the frittata, which is a different dish (allowed under a clearly different English name). |
| Tajine Tunisien (frittata) | `Tunisia`. Must NEVER use `Tagine` as `name.en` (collides with id=118 Morocco). |
| Manti | Two parallels: `Uzbekistan` (existing id=115) and Turkey (proposed). If Turkey gets Manti, use a disambiguating English name (`Turkish Manti / Mantı`) and a distinct slug. The Uzbek version stays `manti`. |
| Pelmeni / Vareniki / Pierogi / Pierogi | Each goes to its own canonical hub: Russia / Ukraine / Poland. Do not cross-file. |
| Borscht / Borsch / Barszcz | Russia, Ukraine, Poland each may have their own variant — different `name.en` + clear cultural framing required. |
| Biryani | `Pakistan` (existing id=61). If India gets a biryani, use `Hyderabadi Biryani` (distinct name) — never `Biryani` alone. |
| Ceviche | `Peru` (existing id=65). Ecuador has `Shrimp Ceviche` (id=103) — disambiguated by adjective. Mexico/Chile additions must follow the same pattern (`Ceviche Mexicano`, `Ceviche Verde`). |
| Schnitzel | `Germany` (existing id=17). Polish kotlet schabowy must use the Polish name; never `Pork Schnitzel`. |
| Empanada | `Argentina` (existing id=8). Latin variants must use the country-modifier (`Empanadas Chilenas`, `Empanadas de Pino`). |
| Tamales | `Mexico` (existing id=29). Guatemalan/Honduran/Salvadoran variants need a modifier. |
| Couscous | `Morocco` (planned) or `Tunisia` (Couscous Tunisien). Both can coexist with distinct names. |
| Goulash | `Hungary` (existing id=15). Czech/Austrian goulash variants need modifiers if added. |
| Satay | `Indonesia` (existing id=42). Thai/Malaysian variants → modified names. |
| Curry (the word alone) | Forbidden as `name.en`. Always specify (`Chicken Curry`, `Thai Green Curry`, `Japanese Curry Rice`, `Massaman Curry`). |

---

## 6. Merge decisions log

### Phase 8A — Wave 1 (cuisine renormalization)

| Date | Decision | Affected recipe id | Old | New |
|---|---|---|---|---|
| 2026-05-25 | Renormalize `UK` → `United Kingdom` on Fish and Chips. | 20 | `origin.en: 'UK'` | `origin.en: 'United Kingdom'` (+ `hi` added; `de` updated to "Vereinigtes Königreich" for consistency with id=168) |
| 2026-05-25 | Reassign Coconut Rice from continental "Asia" bucket. | 130 | `origin.en: 'Asia'` (and 14 lang variants) | `origin.en: 'Thailand'` (14 lang variants) — recipe uses pandan + lemongrass, classic Thai/SE-Asian profile; assigned to Thailand to strengthen an existing hub. |
| 2026-05-25 | Reassign Lentil Soup from "Middle East" bucket. | 95 | `origin.en: 'Middle East'` (and 14 lang variants) | `origin.en: 'Lebanon'` (14 lang variants) — classic shorbat adas profile; promotes Lebanon to a 2-recipe hub (with Tabbouleh). |
| 2026-05-25 | Add missing `pt` origin field on Plov. | 152 | `origin.pt` missing | `origin.pt: 'Uzbequistão'` |

### Phase 8A — Wave 2 (deferred items, now applied)

| Date | Decision | Affected recipe id | Outcome |
|---|---|---|---|
| 2026-05-25 | **Delete Kottbullar** — duplicate of Swedish Meatballs. | 119 (removed) | Recipe object removed from `recipes.js`. Swedish Meatballs (id=27) stays canonical. The `kottbullar.webp` local image was renamed to `swedish-meatballs.webp` so id=27 now uses the higher-quality local thumbnail. 14 × 308 redirects added in `vercel.json`: `/<lc>/<dir>/kottbullar` → `/<lc>/<dir>/swedish-meatballs/`. Old recipe directories deleted across all 14 locales. |
| 2026-05-25 | **Rename Tagine → Chicken Tagine** AND rewrite content to clearly differentiate from Lamb Tagine. | 118 | `name.*` updated across 14 locales. `ingredients` rewritten across 14 locales to a clean Djaj M'qalli profile (preserved lemons + green olives + saffron, no dried fruit / chickpeas / honey). `howIsMade` rewritten across 14 locales for the chicken-specific 40-45 min procedure. `originText` second paragraph notes "Djaj M'qalli style" as the distinguishing variant from id=167 Lamb Tagine. 14 × 308 redirects added (`tagine` → `chicken-tagine`). |
| 2026-05-25 | **Rename id=28 Ramen → Classic Japanese Ramen.** Keep BOTH ramen entities (semantic hierarchy preserved: generic vs specific variants). | 28 | `name.*` updated across 14 locales. id=181 Tonkotsu, id=182 Shoyu, id=183 Miso Ramen remain unchanged as specific subtypes. 14 × 308 redirects added (`ramen` → `classic-japanese-ramen`). |
| 2026-05-25 | **Rename Pork schnitzel → Kotlet schabowy.** | 155 | `name.*` updated across 14 locales. Origin still Poland. 14 × 308 redirects added (`pork-schnitzel` → `kotlet-schabowy`). `pork-schnitzel.webp` local image renamed to `kotlet-schabowy.webp`. |
| 2026-05-25 | **Hindi (`hi`) backfill.** | 43 recipes | Added missing `name.hi` and/or `origin.hi` fields. After this pass, every one of the 174 recipes has all 14 language codes on both `name` and `origin`. |

---

## 7. Regional normalization rules (for future recipe creation)

When adding a new recipe, the `origin.en` must:

1. Be a real country (or one of the sub-national exceptions in §4).
2. Match an entry in `CUISINE_ATMOSPHERE` (`scripts/generate-content.mjs` ~line 3350) and `COUNTRY_FLAG` (line ~3310). If the country isn't mapped, add it to BOTH tables in the same PR.
3. Use the exact spelling from §1. No alternate forms.
4. Populate all 14 language fields (`ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko`) for the `origin` object — none may be missing.
5. Never use any value from §3 (forbidden list).
6. If the dish has cross-cuisine parallel claims, follow §5 — single canonical hub + disambiguating English `name.en` on any sibling variant.

These rules are checked by hand at PR-review time; there is no automated enforcement yet. A future improvement would be a build-time check in `generate-content.mjs` that throws on any `origin.en` not in the canonical list.

---

## 8. Hub-eligibility threshold

`CUISINE_MIN_RECIPES = 2` (in `scripts/generate-content.mjs`). A cuisine renders as a hub only after it reaches 2 recipes. Below that it is a single-recipe orphan with no hub URL, no `cuisineHub` href, and no presence on the cuisine-discovery surfaces.

Phase 8B target: 10 recipes per hub. The threshold itself stays at 2 for now — raising the threshold without backfilling would silently drop hubs from the sitemap and create 404s on existing backlinks. Any future raise must be coordinated with a redirects pass.
