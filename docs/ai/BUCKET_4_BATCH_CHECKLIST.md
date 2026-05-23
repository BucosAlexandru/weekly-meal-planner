# Bucket 4 Batch — Manual Checklist

Five recipes from bucket 4 (true fallback: SSR emoji + no URL anywhere). After
this batch lands, bucket 4 drops from 22 → 17 and P0 drops from 2 → 0.

Source of truth for the slugs below is `scripts/generate-content.mjs`'s
`slug()` helper. Anything different here will silently fail (the build
resolver won't find the file). All five paths have been cross-checked
against the actual generated `public/en/recipes/<slug>/` directories.

## Per-recipe specs

| # | Recipe (id) | Slug | Expected file path | Cultural target (what the image must show) |
|---|---|---|---|---|
| 1 | **Dhal** (12) 🚩 P0 | `dhal` | `public/images/dhal.webp` | Cooked North-Indian dal — yellow/orange lentil curry with a glistening tadka (cumin seeds + ghee) on top, served with rice or roti. NOT raw lentils. |
| 2 | **Poutine** (39) 🚩 P0 | `poutine` | `public/images/poutine.webp` | Quebec poutine — golden fries + brown gravy + white cheese curds (curds just softened by the gravy, not fully melted). NOT a generic food shot. |
| 3 | **Chicken Fricassée** (140) | `chicken-fricass-e` | `public/images/chicken-fricass-e.webp` | French chicken fricassée — pieces of chicken in a white wine + cream sauce, with mushrooms and pearl onions, served over rice or noodles. |
| 4 | **Bún bò Huế** (87) | `b-n-b-hu` | `public/images/b-n-b-hu.webp` | Vietnamese spicy beef noodle soup from Huế — clear red-orange broth with lemongrass, thick round rice noodles (bún), beef shank, garnished with banana blossom + mint + lime wedge. NOT phở. |
| 5 | **Smørrebrød** (84) | `sm-rrebr-d` | `public/images/sm-rrebr-d.webp` | Danish open-faced rye-bread sandwich — dark rye base topped with herring/salmon/roast beef/egg, garnished with dill or chives. Multiple slices arranged on a wooden board is the canonical shot. |

(🚩 = flagship. The two P0 recipes also have their old bad URLs blacklisted
in `docs/ai/RECIPE_IMAGES_MISSING.md` — Dhal's was raw lentils on a board,
Poutine's was a generic Wikimedia conference photo. Whatever new image is
picked must not reuse those URLs.)

Slugs look ugly because `slug()` strips diacritics with `[^a-z0-9]+` →
single hyphen, so é → `-`, ø → `-`, ế → `-`, etc. The build resolver
expects exactly these filenames; renaming is not safe without also
changing the generator.

## Image quality spec (applies to all five)

| Field | Target | Hard limit |
|---|---|---|
| Format | **WebP** (`.webp`) | JPEG (`.jpg`) acceptable if WebP not available |
| Aspect ratio | **3:2** (e.g. 1200×800) | between 4:3 and 16:9 — anything narrower or taller looks cropped on mobile |
| Width | **1200 px** | min 600 px, max 2000 px |
| File size | **≤ 150 KB** | hard ceiling 200 KB (audit flags `OVERSIZED` above 500 KB) |
| Colour profile | sRGB | — |
| Subject coverage | dish fills ≥60% of frame | — |
| Watermarks / faces | none | — |
| Licensing | own / CC0 / CC-BY | document credit in commit message |

The 3:2 aspect ratio matches the current hero container (≈4:3 visible on
iPhone 14, but image is `object-fit: cover` so a slightly wider 3:2 source
crops cleanly without losing the dish).

## Two ways to import (pick one — both end at the same audit delta)

### Path A — through the batch pipeline (matches the project workflow)

1. Drop the source images anywhere (e.g. `sources/dhal.webp` — the `sources/`
   dir is `.gitignore`-d so no risk of committing raw downloads):

   ```
   sources/dhal.webp
   sources/poutine.webp
   sources/chicken-fricassee.webp        ← human-readable source name is fine
   sources/bun-bo-hue.webp
   sources/smorrebrod.webp
   ```

   The batch script rewrites filenames on write — source name doesn't have
   to match the ugly auto-slug.

2. Create `data/image-batch.json` (the file itself is `.gitignore`-d; the
   `*.example.json` template stays committed for reference):

   ```json
   [
     { "id": 12,  "source": "./sources/dhal.webp",            "note": "credit: ..." },
     { "id": 39,  "source": "./sources/poutine.webp",         "note": "credit: ..." },
     { "id": 140, "source": "./sources/chicken-fricassee.webp", "note": "credit: ..." },
     { "id": 87,  "source": "./sources/bun-bo-hue.webp",      "note": "credit: ..." },
     { "id": 84,  "source": "./sources/smorrebrod.webp",      "note": "credit: ..." }
   ]
   ```

3. Run the batch (it calls `add-recipe-image.mjs` per entry, then one
   rebuild + audit at the end):

   ```bash
   node scripts/batch-image-add.mjs data/image-batch.json
   ```

   `sharp` re-encodes each source to WebP @ q=80, resized to ≤1200px wide,
   and writes the correctly-slugged file to `public/images/`. No need to
   hand-optimise upstream.

### Path B — direct (use only if sources are already optimised WebPs)

1. Drop pre-optimised files directly using the exact slug-derived
   filenames from the table above:

   ```
   public/images/dhal.webp
   public/images/poutine.webp
   public/images/chicken-fricass-e.webp     ← exact slug, including the trailing -e
   public/images/b-n-b-hu.webp              ← exact slug
   public/images/sm-rrebr-d.webp            ← exact slug
   ```

2. Rebuild + audit:

   ```bash
   npm run content
   node scripts/audit-images.mjs
   ```

## Verification after either path

```bash
# 1. CI invariants — none of these numbers may drift
find public -name "*.html" | wc -l           # expect: 2620
grep -c "<url>" public/sitemap.xml           # expect: 2620

# 2. SSR check — each page must now ship an <img> with the new URL
for slug in dhal poutine chicken-fricass-e b-n-b-hu sm-rrebr-d; do
  grep -E 'recipe-photo-container.*<img src="https://meal-planner\.ro/images/'"$slug"'\.webp"' \
    public/en/recipes/$slug/index.html > /dev/null \
    && echo "✓ $slug SSR ok" || echo "✗ $slug SSR MISSING"
done

# 3. OG image check — same URL must appear in og:image meta tag
for slug in dhal poutine chicken-fricass-e b-n-b-hu sm-rrebr-d; do
  grep -E 'property="og:image" content="https://meal-planner\.ro/images/'"$slug"'\.webp' \
    public/en/recipes/$slug/index.html > /dev/null \
    && echo "✓ $slug og:image ok" || echo "✗ $slug og:image MISSING"
done

# 4. Audit shows the expected delta
node scripts/audit-images.mjs
```

## Expected audit delta after the full 5-recipe batch

|                                  | Before this batch | After this batch | Δ |
|---|---|---|---|
| Bucket 1 (local override)        | 3                 | **8**            | **+5** |
| Bucket 2 (mapped external)       | 153               | 153              | — |
| Bucket 3 (client-only)           | 0                 | 0                | — |
| Bucket 4 (fallback)              | 22                | **17**           | **-5** |
| SSR-emoji total (3 + 4)          | 22                | **17**           | **-5** |
| P0                               | 2                 | **0**            | **-2** |
| P1                               | 23                | **21**           | **-2** |

P0 drops to 0 once Dhal + Poutine land. P1 drops by 2 because the other 3
recipes (Chicken Fricassée, Bún bò Huế, Smørrebrød) are non-flagship and
were P1 by visibility, not because they were flagship. The 3 oversized
ramen images (181/182/183) keep P1 at non-zero until they're re-encoded
to ≤200 KB — out of scope for this batch.

## Commit shape

One commit per logical chunk. Suggested split:

- Commit 1 — `feat(images): Dhal + Poutine real photos (P0 flagship)` —
  takes P0 to 0, audit delta cited in the body.
- Commit 2 — `feat(images): Chicken Fricassée + Bún bò Huế + Smørrebrød (P1 long-tail)` —
  finishes the batch.

Either can be a single combined commit if all 5 land at once. Keep the
body short — the audit report tells the story; reference it in the body
(e.g. `IMAGE_QA_REPORT.md` after the run).

## Anti-regression guardrails

- Do not edit `public/js/recipe-images.js` for these — local files take
  precedence already (`resolveRecipeImage()` checks `.webp` before the
  mapping). Local override is the canonical path here.
- Do not delete the corresponding `🍽️` / `🍳` / etc. emoji from the HTML
  template — it stays as a CSS-positioned safety net below the `<img>`,
  exactly as Phase I.2 set up. The `onerror="this.remove()"` handler will
  reveal the emoji again if any image ever 404s in production.
- Do not change the slug (`scripts/generate-content.mjs:slug()`). Renaming
  it would change every recipe URL and need 14-locale URL migration.
