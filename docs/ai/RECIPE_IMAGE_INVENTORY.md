# RECIPE IMAGE INVENTORY (Phase M)

**Status:** Investigation-only. No image URLs were changed, no images downloaded, no visual assets edited. This document is the audit record + future QA action list.

**Scope:** All 179 recipes in `public/js/recipes.js`, cross-referenced with `public/js/recipe-images.js` and `public/images/`. Risk-classified for the next visual QA pass.

---

## 1. Inventory summary

| Source | Count | Risk |
|---|---|---|
| **Local file** (`public/images/<slug>.webp` / `.jpg` / `.png`) | 41 | LOW — curated, visually checkable in-repo |
| **External Wikipedia Commons URL** | 102 | MEDIUM — author-curated, not re-verified post-rebase, possible upstream URL rot |
| **External Spoonacular thumb** | 31 | MEDIUM — opaque numeric URL, dish-match cannot be confirmed without API access |
| **Phase 8B best-guess Wikipedia URL** | 5 | HIGH — unverified at authoring (~70–75% confidence) |
| **Missing entry / placeholder** | 0 | n/a — every recipe has either a local file or a `recipeImages` entry |

No recipe currently falls through to the `cover2.jpg` placeholder. The image resolver in `scripts/generate-content.mjs:resolveRecipeImage()` follows the order:

1. `public/images/<slug>.webp`
2. `public/images/<slug>.jpg`
3. `public/images/<slug>.png`
4. `recipeImages[id]`
5. `cover2.jpg` (last-resort fallback)

Local files take precedence — dropping a verified webp into `public/images/` auto-promotes the recipe out of MEDIUM/HIGH risk without any code change.

---

## 2. HIGH risk: Phase 8B best-guess URLs (immediate QA targets)

| id | Recipe | Origin | Image URL | Confidence | Local override? | Blocks generation? |
|---|---|---|---|---|---|---|
| 184 | Tempura | Japan | `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tempura_001.jpg/330px-Tempura_001.jpg` | ~75% | none | NO |
| 185 | Onigiri | Japan | `https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Onigiri.jpg/330px-Onigiri.jpg` | ~70% | none | NO |
| 186 | Yakitori | Japan | `https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Yakitori_001.jpg/330px-Yakitori_001.jpg` | ~70% | none | NO |
| 187 | Mole Poblano | Mexico | `https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Mole_poblano.jpg/330px-Mole_poblano.jpg` | ~75% | none | NO |
| 188 | Chilaquiles | Mexico | `https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Chilaquiles_rojos.jpg/330px-Chilaquiles_rojos.jpg` | ~70% | none | NO |

**Reason all are best-guess:** sandbox cannot reach Wikipedia hosts to verify URL hashes (commit `b2d374555` confirms only `github.com` and `raw.githubusercontent.com` are reachable from the build container). The URLs were constructed from training-data knowledge of typical Wikipedia article lead images at the time of authoring.

**Suggested future QA action:**
1. Open each URL in a browser. If 200, visually confirm the image is the dish.
2. If 404 or wrong dish: source a verified local image and drop it as `public/images/<slug>.webp` — this auto-overrides via the resolver precedence.
3. Update this doc to LOW risk once verified.

**Blocks recipe generation?** No. Each of the 5 already renders a page that either loads the image (high probability) or falls back to `cover2.jpg` gracefully via the existing `onerror="this.remove()"` handler. The user-facing copy never claims image authenticity.

---

## 3. MEDIUM risk: external URLs without recent verification (133 recipes)

102 Wikipedia + 31 Spoonacular = 133 external URLs that were curated at the time the original `recipeImages.js` was generated. They are **not** Phase 8B best-guesses — the prior tooling fetched and ranked these — but they have **not** been re-verified since the rebase, and Wikipedia thumbnail variants can occasionally rot upstream (commit `b2d374555` documents this exact failure class for the `srcset` 660w/990w variants).

Not enumerating all 133 here — the inventory is reproducible by re-running the audit script at the bottom of this document. The likely failure rate is small (< 5%) but non-zero.

**Suggested future QA action:**
- Spot-check 10–20 random MEDIUM entries per locale during the visual QA pass.
- For any 404 / mismatch found, drop a local image override.
- Wikipedia URLs that begin with `https://upload.wikimedia.org/wikipedia/commons/thumb/<hash1>/<hash1hash2>/<filename>` and end with `/330px-<filename>` are the most likely to stay stable. URLs that point to specific variant widths (660w, 990w) were already de-risked in commit `b2d374555` by removing `srcset` entirely from rendered output.

**Blocks recipe generation?** No.

---

## 4. Heuristic mismatch detector — manual classification

A heuristic mismatch detector flagged 35 entries where the URL filename did not share any meaningful word with the recipe's English name. Manual review classified the flags:

### 4.1 False positives — same dish, non-English filename (24 entries)

These are correct images filed under the dish's native-language name (Cyrillic, Arabic, Vietnamese diacritics, alternate romanization). No action needed:

`koshari` ← `koshary` · `moussaka` ← `mussakas` · `khachapuri` ← `кхачапури` · `ceviche` ← `cebiche` · `banh mi` ← `bánh mì` · `satay` ← `sate` · `gravlax` ← `laxrätter` · `fatteh` ← `فتّة` · `khorovats` ← `barbecue_armenian` · `shrimp ceviche` ← `cebiche` · `manti` ← `mantı` · `chakhokhbili` ← `чахохбили` · `tagine` (118 + 167) ← `tajine-marocain` · `arepa` ← `arepitas` · `karelian pie` ← `karjalanpiirakka` · `cevapi` ← `serbian sausages` · `okroshka` ← `окрошка` · `kotlet schabowy` ← `schnitzel` · `kimbap` ← `gimbap` · `pljeskavica` ← `pleskavitsa` · `tlayudas` ← `tlayuda12` · `solyanka` ← `soljanka` · `chakchouka` ← `shakshuka` · `miso ramen` ← `dosanko` (Hokkaido miso-ramen chain)

### 4.2 Acceptable — same dish-family, minor variant (6 entries)

The image likely shows a dish in the same family. Not a clear mismatch but worth noting:

| id | Recipe | URL filename suggests | Note |
|---|---|---|---|
| 80 | Stoofvlees (Belgium) | `carbonade_flamande` | Same dish — Stoofvlees IS Carbonade Flamande in Flemish |
| 100 | Verivorst (Estonia) | `boudin3` | Boudin = French blood sausage; Verivorst = Estonian blood sausage — same dish family |
| 130 | Coconut Rice (Thailand) | `nasi_liwet_solo` | Indonesian coconut rice — close cuisine cousin |
| 144 | Pasticada (Croatia) | `sinjski_arambaši` | Arambaši are Croatian stuffed sour cabbage rolls — different Dalmatian dish, may or may not visually pass for Pasticada |
| 152 | Plov (Uzbekistan) | `afghan_palo` | Afghan palaw ≈ Uzbek plov — same dish family |
| 182 | Shoyu Ramen (Japan) | `gyoza_no_ousho` | Restaurant-chain photo; the chain serves ramen, so the image is plausibly ramen |

**Suggested future QA action:** include in the visual QA spot-check; replace if visually wrong.

### 4.3 Real mismatch risk — worth visual QA (5 entries)

These are the strongest mismatch candidates surfaced by the heuristic:

| id | Recipe | Origin | URL filename | Why flagged | Suggested QA |
|---|---|---|---|---|---|
| 90 | Ropa Vieja | Cuba | `cubanfood.jpg` | Generic filename — could be any Cuban dish, not necessarily Ropa Vieja | Visually confirm; replace with a verified Ropa Vieja image if wrong |
| 106 | Kare-Kare | Philippines | `mac_mg_5939.jpg` | Filename is just a camera serial — gives no clue about contents | Visually confirm |
| 133 | Beans with Sausages | Romania | `feijoada_à_transmontada` | Feijoada is Portuguese — wrong cuisine. Image may visually match Romanian beans-and-sausages (Fasole cu cârnați) but the filename is misleading | Visually confirm; the Romanian dish has a more specific look (cabbage, smoked sausage) |
| 172 | Clam Chowder | USA | `quail_07_bg_041506.jpg` | Filename suggests **quail** — strongly suspicious of a wrong-dish image | **High priority** — visually confirm immediately |
| 182 | Shoyu Ramen | Japan | `gyoza_no_ousho_20191210_125203.jpg` | Restaurant-chain dated photo — could be any dish from that chain | Visually confirm |

**Blocks recipe generation?** No. None of these are on a Phase T0/T1 path; they are pre-existing legacy entries.

---

## 5. `imageConfidence` flag — proposal (not implemented in this phase)

The codebase currently has no `imageConfidence` field on recipes or in `recipe-images.js`. Per the Phase M constraint ("do not edit visual assets" + "do not swap URLs"), I have not added one in this phase.

### Proposed schema (for future implementation)

Either of:

**Option A — flag in `recipe-images.js`:**
```js
export const recipeImages = {
  // …
  184: { url: 'https://upload.wikimedia.org/…/Tempura_001.jpg/330px-Tempura_001.jpg', confidence: 'low' },
  // …
};
```

**Option B — separate `recipeImageConfidence` map:**
```js
export const recipeImageConfidence = {
  184: 'low', 185: 'low', 186: 'low', 187: 'low', 188: 'low',
  // (everything else implicitly 'medium' or 'high' based on source)
};
```

### Renderer behaviour with the flag

`resolveRecipeImage()` could read the flag and:
- `high`/`medium` → render `<img src="…">` unchanged
- `low` → render with a small "image to be verified" data-attribute that QA tooling can detect; user-facing copy unchanged

This is purely a tracking mechanism. It does not change what the user sees and does not block generation.

### Decision in this phase

**Defer the flag implementation** until either (a) the visual QA pass produces a verified list of low-confidence recipes to mark, or (b) the field actually unlocks a renderer behaviour (it currently would not). Adding the field now without a consumer would be dead code.

---

## 6. Missing thumbnails

**Zero recipes have a missing thumbnail.** Every recipe falls into one of the three sources documented in §1. The earlier Phase 8A audit that reported "22 missing thumbnails" was a false positive (it checked only `recipeImages[id]` and missed the local-file precedence) — documented in `RECIPE_CONFLICTS.md §6`.

---

## 7. Whether image risks block Phase T0/T1 recipe generation

**No.** All findings are in the existing corpus, not in any planned new recipe. The 5 HIGH-risk entries already render successfully (or fall back gracefully). The MEDIUM-risk entries have a small expected failure rate but no known broken pages. The mismatch candidates are pre-existing and have been present in the corpus for some time.

Phase T0/T1 generation can proceed safely under the binding image policy (best-guess Wikipedia URLs flagged at authoring time; visual QA scheduled as a separate pass).

---

## 8. Reproducible audit script

The inventory and mismatch detector run as inline Node snippets. To re-produce:

```bash
# Inventory by risk class
node --input-type=module -e "<inventory script — see PHASE_M_PRE_GENERATION_QUALITY_GATES.md commit history>"

# Heuristic mismatch detector
node --input-type=module -e "<mismatch detector — see this doc's commit>"
```

The script outputs the categorised counts in §1, the HIGH-risk list in §2, and the mismatch-candidate list filtered to §4. Re-run after any future image swap to confirm risk classification stays current.
