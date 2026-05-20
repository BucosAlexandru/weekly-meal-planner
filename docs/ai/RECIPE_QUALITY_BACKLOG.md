# Recipe Quality Backlog

Tracks all recipes that still need content work to reach Tier A. Ordered by priority (lowest ID first within each tier).

---

## ⚠️ Critical warning

**Fixing `originText` grammar, `name` locales, `time`, or translation stubs is NOT enough for Tier A.**

A recipe is a stub if:
- Any ingredient is listed as a single word without a quantity (e.g. `"onion"` instead of `"1 large onion, diced"`)
- `howIsMade.en` is 1–2 generic sentences without doneness cues or timings

Surface fixes (struct fields, name/originText/howIsMade tr/it/ko translations) have already been applied to most recipes. That work is done. What remains is rewriting the **English core content**: ingredients with exact quantities and howIsMade with complete multi-step instructions. The translations follow from the English — do not translate first.

---

## Priority 1 — Stub / Needs Full Rewrite (36 recipes)

These have confirmed stub-level EN content. All 14 locale translations will need to be redone after the EN rewrite.

| Priority | ID | Recipe |
|---|---|---|
| 1 | 41 | Nasi Goreng |
| 2 | 42 | Fondue |
| 3 | 43 | Masgouf |
| 4 | 44 | Shakshuka |
| 5 | 45 | Salmon Soup |
| 6 | 46 | Ghormeh Sabzi |
| 7 | 48 | Adobo |
| 8 | 50 | Doro Wat |
| 9 | 51 | Kibbeh |
| 10 | 52 | Stamppot |
| 11 | 53 | Hangi |
| 12 | 57 | Fårikål |
| 13 | 58 | Ful Medames |
| 14 | 59 | Pasticada (id 59) |
| 15 | 60 | Buuz |
| 16 | 62 | Brik |
| 17 | 63 | Khachapuri |
| 18 | 64 | Bobotie |
| 19 | 65 | Ceviche |
| 20 | 67 | Banh Mi |
| 21 | 68 | Satay |
| 22 | 69 | Laksa |
| 23 | 70 | Pupusa |
| 24 | 72 | Amok |
| 25 | 73 | Momo |
| 26 | 74 | Encebollado |
| 27 | 75 | Harira |
| 28 | 76 | Lobio |
| 29 | 77 | Chakhchoukha |
| 30 | 78 | Rendang |
| 31 | 79 | Gravlax |
| 32 | 80 | Stoofvlees |
| 33 | 81 | Zeamă |
| 34 | 82 | Meat Pie |
| 35 | 83 | Fatteh |
| 36 | 84 | Smørrebrød |

---

## Priority 2 — Partial Fix Only, confirmed stub EN (IDs 86–179, ~93 recipes)

Translation stubs were fixed in tr/it/ko, but the EN howIsMade is still stub-level and EN ingredients still lack quantities. These need EN content rewrites before re-translating.

IDs in order: 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 103, 104, 105, 106, 107, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 123, 124, 125, 126, 127, 129, 130, 131, 132, 133, 134, 135, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179

---

## Priority 3 — Partial Fix Only, early recipes (may need verification only)

These are the first recipes added to the site and likely have better content, but have not been verified against all 10 Tier A criteria. Read the EN ingredients and howIsMade before deciding whether they need a full rewrite or just visual QA.

IDs in order: 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 23, 24, 25, 30, 31, 33, 35, 37, 38, 39, 40, 47, 49, 54, 55, 56, 61, 66, 85, 102

---

## Priority 4 — Needs Visual QA (10 recipes)

Declared Tier A with no changes applied. Check ingredients, steps, and visual pages before promoting to Tier A Complete.

IDs: 7, 8, 15, 17, 26, 27, 28, 29, 32, 36

---

## Next 10 to fully rewrite (Priority 1 batch)

Work through these one at a time, in order. Do not advance to the next until the current one is committed and pushed.

| # | ID | Recipe |
|---|---|---|
| 1 | 77 | Chakhchoukha |
| 2 | 78 | Rendang |
| 3 | 79 | Gravlax |
| 4 | 80 | Stoofvlees |
| 5 | 81 | Zeamă |
| 6 | 82 | Meat Pie |
| 7 | 83 | Fatteh |
| 8 | 84 | Smørrebrød |
| 9 | 86 | Poutine |
| 10 | 87 | Roti |

---

## Rules for one-by-one full rewrite

Follow these steps for each recipe. Do not batch. Do not skip steps.

### Step 1 — Read the current EN content
Read `public/js/recipes.js` for the target recipe. Note:
- Does every ingredient have an exact quantity?
- Does every `howIsMade.en` step have a time or doneness cue?
- Are there any single-word ingredients or generic filler sentences?

### Step 2 — Rewrite EN ingredients
Write each ingredient with an exact quantity and preparation note. Example:
- Bad: `"onion"`
- Good: `"1 large onion, finely diced"`

Use realistic cooking quantities for the `servings` count on the recipe.

### Step 3 — Rewrite EN howIsMade
Write complete step-by-step instructions. Each step must include:
- A time (e.g. "cook for 5 minutes") OR a visual/tactile doneness cue (e.g. "until golden brown", "until tender")
- The specific action (no vague verbs like "prepare" or "cook until done")

Aim for 5–8 steps for a main dish, fewer for simple recipes.

### Step 4 — Update all 14 locale translations
After the EN content is solid, update `ingredients` and `howIsMade` for all 14 locales:
`ro`, `en`, `es`, `fr`, `de`, `pt`, `ru`, `ar`, `zh`, `ja`, `tr`, `it`, `ko`

Translate faithfully from EN. Do not invent locale-specific variations.

### Step 5 — Build and verify
```
npm run content
npm run build
```
Then visually check:
- `/ro/retete/<slug>/` — ingredients have quantities, steps have cues
- `/en/recipes/<slug>/` — same
- At least one non-Latin locale (`/ko/`, `/zh/`, `/ar/`, or `/ja/`)

### Step 6 — Update tracking docs
- In `RECIPE_QUALITY_FACTORY.md`: change status from `Stub / Needs Full Rewrite` or `Partial Fix Only` to `Tier A Complete`
- In `RECIPE_QUALITY_BACKLOG.md`: remove the recipe from the next-10 list and add the next candidate

### Step 7 — Commit and push
```
git add public/js/recipes.js docs/ai/RECIPE_QUALITY_FACTORY.md docs/ai/RECIPE_QUALITY_BACKLOG.md
git commit -m "feat(recipe): full Tier A rewrite — ID <N> <Recipe Name>"
git push -u origin claude/remote-control-setup-kYqCw
```

---

## What does NOT count as a full rewrite

The following actions were already performed on most recipes and **do not advance a recipe toward Tier A**:

- Adding `servings`, `tipType`, `pairingsType` struct fields
- Fixing `name.ko`, `name.tr`, `name.it` to use native script
- Fixing `originText` grammar (genitive case, article contractions, capitalization)
- Replacing machine-translated howIsMade stubs in tr/it/ko with better translations of the same stub EN sentence
- Fixing `soğbir` typos or other translation artifacts

These are necessary baseline fixes, not quality upgrades. A recipe with `"servings": 4` and `name.ko: "나시 고렝"` but still listing `"rice"` as a bare ingredient without quantity is still a stub.
