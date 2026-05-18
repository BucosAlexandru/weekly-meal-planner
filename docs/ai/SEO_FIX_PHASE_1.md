# SEO Fix — Phase 1: Recipe schema.org Image

_Implemented: 2026-05-18_
_Commit: `2f9cf8bfb`_
_Owner: Claude Code (Lead Developer)_

---

## Problem

Every recipe page used the same placeholder image in its `schema.org/Recipe` JSON-LD:

```json
"image": ["https://meal-planner.ro/images/cover2.jpg"]
```

This meant Google Rich Results saw 175 identical images across all recipe pages — a silent SEO
penalty. Google's recipe carousel, image search, and structured-data validation all rank pages
with unique, relevant images above pages using a generic placeholder.

---

## Fix: Build-time image resolution

**File changed:** `scripts/generate-content.mjs` (lines 1848–1852, 1867)

```js
// Resolve recipe-specific image at build time.
// Falls back to cover2.jpg if no dedicated image file exists yet.
const recipeImgFile = path.join(PUBLIC, 'images', `${rslug}.jpg`);
const recipeImgUrl  = fs.existsSync(recipeImgFile)
  ? `https://meal-planner.ro/images/${rslug}.jpg`
  : 'https://meal-planner.ro/images/cover2.jpg';
```

The `"image"` field in the JSON-LD block then uses `recipeImgUrl`:

```js
"image": [recipeImgUrl],
```

**How it works:** `fs.existsSync()` runs at content-generation time (not at runtime). For each
recipe, it checks whether `/public/images/{slug}.jpg` exists on disk. If the file is present,
the recipe gets its own URL. If not, `cover2.jpg` is used as the fallback. Zero runtime cost,
zero new dependencies — `fs` was already imported at line 14 of the script.

**Slug format:** lowercase English recipe name with non-alphanumeric characters replaced by
hyphens, leading/trailing hyphens stripped. Defined at line 25:

```js
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
```

Examples:

| Recipe name (English) | Slug | Expected filename |
|-----------------------|------|-------------------|
| Miso Ramen | `miso-ramen` | `miso-ramen.jpg` |
| Spaghetti Carbonara | `spaghetti-carbonara` | `spaghetti-carbonara.jpg` |
| Sweet & Sour Chicken | `sweet-sour-chicken` | `sweet-sour-chicken.jpg` |
| Boeuf Bourguignon | `boeuf-bourguignon` | `boeuf-bourguignon.jpg` |

---

## Fallback Behaviour

If `/public/images/{slug}.jpg` does not exist, the JSON-LD image is set to:

```
https://meal-planner.ro/images/cover2.jpg
```

This is the same generic cover image used before the fix. No page breaks. No missing-image
errors in structured data. The fallback is safe and Google-valid.

---

## How to Add a Recipe Image

1. Prepare the image as a `.jpg` file (recommended: 1200×900 px, aspect ratio 4:3, under 300 KB).
2. Name it exactly `{slug}.jpg` — use the English recipe name, lowercased, hyphens for spaces/special chars.
3. Drop it into `/public/images/`.
4. Run `npm run content` (or `npm run build` for a full rebuild).
5. The next build automatically picks up the file via `fs.existsSync()` — no code change needed.
6. Verify with `grep '"image"' public/en/recipes/{slug}/index.html`.

**To confirm the slug for any recipe:**

```bash
node -e "
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/gi,'-').replace(/^-|-\$/g,'');
console.log(slug('Your Recipe Name Here'));
"
```

---

## Verification Examples (post-fix, from live generated pages)

### Recipe with dedicated image — `miso-ramen`

```json
"image": ["https://meal-planner.ro/images/miso-ramen.jpg"]
```

File present: `public/images/miso-ramen.jpg` ✅

### Recipe with dedicated image — `shoyu-ramen`

```json
"image": ["https://meal-planner.ro/images/shoyu-ramen.jpg"]
```

File present: `public/images/shoyu-ramen.jpg` ✅

### Recipe with dedicated image — `tonkotsu-ramen`

```json
"image": ["https://meal-planner.ro/images/tonkotsu-ramen.jpg"]
```

File present: `public/images/tonkotsu-ramen.jpg` ✅

### Recipe using fallback — `spaghetti-carbonara`

```json
"image": ["https://meal-planner.ro/images/cover2.jpg"]
```

File `public/images/spaghetti-carbonara.jpg` does not exist → fallback applied ✅

---

## Current Image Coverage

| Status | Count |
|--------|-------|
| Recipes with dedicated `.jpg` image | 3 |
| Recipes using `cover2.jpg` fallback | 172 |
| Total recipes | 175 |

Images with dedicated files: `miso-ramen`, `shoyu-ramen`, `tonkotsu-ramen`.

---

## Remaining Limitation

**Only recipes where `/public/images/{slug}.jpg` exists get a unique schema.org image.**

The other 172 recipes still show `cover2.jpg` in Rich Results and Google Image Search. This is the
correct, expected behaviour given the current image library — it is not a bug.

To improve Google Rich Results coverage, recipe-specific images need to be produced and added to
`public/images/`. Priority order (highest SEO impact first):

1. Recipes with the highest Google Search Console impression counts
2. Recipes in the most-searched categories (pasta, soup, dessert)
3. Recipes with the most complete `howIsMade` and `recipeIngredient` data

Adding images requires no code changes — only the `.jpg` file in `public/images/` and a rebuild.

---

## Related Files

| File | Role |
|------|------|
| `scripts/generate-content.mjs` | Image resolution logic (lines 1848–1852, 1867) |
| `public/images/` | Recipe image store — add `{slug}.jpg` files here |
| `docs/ai/SEO_PLAN.md` | Full SEO roadmap and action items |
| `docs/ai/REPOSITORY_AUDIT.md` | Original audit noting "same cover2.jpg for all recipes" |
