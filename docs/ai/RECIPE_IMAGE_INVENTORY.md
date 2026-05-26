# RECIPE IMAGE INVENTORY (Phase M)

**Status:** Investigation log + incremental verification trail. Originally created in investigate-only mode (Phase M); updated as legacy entries are verified.

**Scope:** All 179 recipes in `public/js/recipes.js`, cross-referenced with `public/js/recipe-images.js` and `public/images/`. Risk-classified for the visual QA pass.

---

## 0. Verification log

| Date | Verified by | Entries | Mechanism | Resulting risk |
|---|---|---|---|---|
| 2026-05-26 | User upload via GitHub UI (commits `a07e36dc5` + `484cf2adf`) — wired in this session | 10 recipes: ids 184 (Tempura), 185 (Onigiri), 186 (Yakitori), 187 (Mole Poblano), 188 (Chilaquiles), 90 (Ropa Vieja), 106 (Kare-Kare), 133 (Beans with Sausages), 172 (Clam Chowder), 182 (Shoyu Ramen) | Verified images uploaded as `IMG_1090..IMG_1100.png` (skip IMG_1096), renamed in-repo to `public/images/<slug>.png` so the `resolveRecipeImage()` local-file precedence takes over from the external URLs. The pre-existing `public/images/shoyu-ramen.webp` (Phase 8B-era best-guess) was removed so the new `.png` would win. | HIGH/MEDIUM → **LOW (verified)** for all 10 |

---

## 1. Inventory summary

| Source | Count | Risk | Δ since last update |
|---|---|---|---|
| **Local file** (`public/images/<slug>.webp` / `.jpg` / `.png`) | **50** | LOW | +9 (10 wired; 1 .webp removed and replaced with .png on the same slug) |
| **External Wikipedia Commons URL** | 98 | MEDIUM | −4 (4 mismatch candidates promoted to LOW via local file) |
| **External Spoonacular thumb** | 31 | MEDIUM | (unchanged) |
| **Phase 8B best-guess Wikipedia URL** | **0** | n/a | −5 — all five verified and promoted to LOW |
| **Missing entry / placeholder** | 0 | n/a | (unchanged) |

Resolver order in `scripts/generate-content.mjs:resolveRecipeImage()`:

1. `public/images/<slug>.webp`
2. `public/images/<slug>.jpg`
3. `public/images/<slug>.png`
4. `recipeImages[id]` (external URL fallback)
5. `cover2.jpg` (last-resort placeholder)

Local files take precedence — the verified `.png` uploads now win over the external URLs without any `recipe-images.js` edit. The external URLs remain in place as a defensive fallback (preserves the audit trail and protects against any local-file deletion).

---

## 2. HIGH risk: Phase 8B best-guess URLs

**Status: cleared (2026-05-26).** All five Phase 8B best-guess URLs (ids 184–188) have been superseded by verified local PNG files. The URLs remain in `recipe-images.js` as a defensive fallback but are no longer the rendered source.

For audit reference, the original best-guess URLs were:

| id | Recipe | Original best-guess URL | Now rendered from |
|---|---|---|---|
| 184 | Tempura | `…/Tempura_001.jpg/330px-Tempura_001.jpg` | `/images/tempura.png` |
| 185 | Onigiri | `…/Onigiri.jpg/330px-Onigiri.jpg` | `/images/onigiri.png` |
| 186 | Yakitori | `…/Yakitori_001.jpg/330px-Yakitori_001.jpg` | `/images/yakitori.png` |
| 187 | Mole Poblano | `…/Mole_poblano.jpg/330px-Mole_poblano.jpg` | `/images/mole-poblano.png` |
| 188 | Chilaquiles | `…/Chilaquiles_rojos.jpg/330px-Chilaquiles_rojos.jpg` | `/images/chilaquiles.png` |

---

## 3. MEDIUM risk: external URLs without recent verification (129 recipes)

98 Wikipedia + 31 Spoonacular = 129 external URLs that were curated by the original `recipeImages.js` generator. They are not Phase 8B best-guesses — the prior tooling fetched and ranked these — but they have **not** been re-verified since the rebase.

Not enumerated individually — reproducible via the audit script in §8.

**Suggested future QA action:**
- Spot-check 10–20 random MEDIUM entries per locale during the visual QA pass.
- For any 404 / mismatch found, drop a verified local image override (mirrors the pattern used for the 10 entries above).
- Wikipedia URLs that begin with `https://upload.wikimedia.org/wikipedia/commons/thumb/<hash1>/<hash1hash2>/<filename>` ending with `/330px-<filename>` are the most stable variant — commit `b2d374555` already eliminated `srcset` 660w/990w variants from rendered HTML to avoid 404-and-remove failures.

**Blocks recipe generation?** No.

---

## 4. Heuristic mismatch detector — manual classification

A heuristic mismatch detector flagged 35 entries where the URL filename did not share any meaningful word with the recipe's English name. Manual classification:

### 4.1 False positives — same dish, non-English filename (24 entries, no action)

These are correct images filed under the dish's native-language name (Cyrillic, Arabic, Vietnamese diacritics, alternate romanization). No action needed:

`koshari` ← `koshary` · `moussaka` ← `mussakas` · `khachapuri` ← `кхачапури` · `ceviche` ← `cebiche` · `banh mi` ← `bánh mì` · `satay` ← `sate` · `gravlax` ← `laxrätter` · `fatteh` ← `فتّة` · `khorovats` ← `barbecue_armenian` · `shrimp ceviche` ← `cebiche` · `manti` ← `mantı` · `chakhokhbili` ← `чахохбили` · `tagine` (118 + 167) ← `tajine-marocain` · `arepa` ← `arepitas` · `karelian pie` ← `karjalanpiirakka` · `cevapi` ← `serbian sausages` · `okroshka` ← `окрошка` · `kotlet schabowy` ← `schnitzel` · `kimbap` ← `gimbap` · `pljeskavica` ← `pleskavitsa` · `tlayudas` ← `tlayuda12` · `solyanka` ← `soljanka` · `chakchouka` ← `shakshuka` · `miso ramen` ← `dosanko`

### 4.2 Acceptable variants (6 entries, monitor)

`stoofvlees` ← `carbonade_flamande` · `verivorst` ← `boudin3` · `coconut rice` ← `nasi liwet solo` · `pasticada` ← `sinjski arambaši` · `plov` ← `afghan palo` · ~~`shoyu ramen` ← `gyoza no ousho`~~ (promoted to LOW via verified upload 2026-05-26)

### 4.3 Real mismatch candidates — visual QA targets

**Status: cleared (2026-05-26)** — all five entries received verified local PNG uploads and are now LOW risk.

| id | Recipe | Original URL filename concern | Now rendered from |
|---|---|---|---|
| 90 | Ropa Vieja | `cubanfood.jpg` (generic) | `/images/ropa-vieja.png` |
| 106 | Kare-Kare | `mac_mg_5939.jpg` (uninformative) | `/images/kare-kare.png` |
| 133 | Beans with Sausages | `feijoada à transmontada` (wrong cuisine label) | `/images/beans-with-sausages.png` |
| 172 | Clam Chowder | `quail_07_bg_041506.jpg` (HIGH-priority — filename suggested quail) | `/images/clam-chowder.png` |
| 182 | Shoyu Ramen | `gyoza no ousho` (restaurant-chain photo) | `/images/shoyu-ramen.png` |

---

## 5. `imageConfidence` flag — proposal (still deferred)

No `imageConfidence` field is implemented in code. With 10 entries now verified via the local-file route, the immediate need for a tracking flag is lower (the file's mere presence in `public/images/<slug>.<ext>` is the verification signal). The proposal in §5 (previous version) remains valid for a future formal-tracking pass.

---

## 6. Missing thumbnails

**Zero.** Every recipe resolves to either a local file or an external URL. The earlier Phase 8A "22 missing" flag was a false positive (missed local-file precedence).

---

## 7. Whether image risks block Phase T0/T1 recipe generation

**No.** After the 2026-05-26 verification batch, HIGH risk count is **0** and the 5 most-concerning mismatch candidates are resolved. Phase T0/T1 generation continues under the existing image policy (best-guess Wikipedia URLs flagged at authoring time; verified uploads promoted to LOW via the local-file precedence mechanism).

---

## 8. Reproducible audit script

```bash
node --input-type=module -e "
import('node:fs').then(({default:fs}) => import('node:path').then(({default:path}) => import('./public/js/recipes.js').then(async m => {
  const img = await import('./public/js/recipe-images.js');
  const slug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-\$/g, '');
  const ROOT = 'public/images';
  let local=0, wiki=0, spoon=0, bestguess=0;
  const PHASE_8B_BESTGUESS = new Set([184, 185, 186, 187, 188]);
  for (const r of m.recipes) {
    const s = slug(r.name?.en || r.name?.ro);
    const localExt = ['webp','jpg','png'].find(e => fs.existsSync(path.join(ROOT, s + '.' + e)));
    if (localExt) local++;
    else if (PHASE_8B_BESTGUESS.has(r.id)) bestguess++;
    else if (img.recipeImages[r.id] && /wikipedia/.test(img.recipeImages[r.id])) wiki++;
    else if (img.recipeImages[r.id] && /spoonacular/.test(img.recipeImages[r.id])) spoon++;
  }
  console.log({local, wiki, spoon, bestguess});
})));
"
```

Re-run after any image swap to confirm risk classification stays current.

