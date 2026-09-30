# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build         # full build: content → build:index → sync:counts → build:js → build:css
npm run build:js      # bundles checkout.js, portal.js, analytics.js → *.min.js (app.js is not bundled)
npm run build:css     # minifies public/css/style.css → style.min.css
npm run content       # regenerates ~10400 HTML pages + public/sitemap.xml
npm run build:index   # writes per-locale search indexes → public/data/recipe-search-index.<lc>.json
npm run sync:counts   # rewrites the hardcoded RECIPE_COUNT in app.js from recipes.js if it drifted
                       # (--check exits 1 instead of writing)
npm run sitemap       # alias for npm run content — generate-sitemap.cjs used to hand-build a
                       # 15-URL sitemap independently and could wipe the real one; it now just
                       # delegates to generate-content.mjs, the only correct source of the page list
```

No test runner is configured. The CI workflow (`.github/workflows/build-check.yml`) is the de facto test suite: it runs the curly-quote check, `node --check` on the API files listed in the workflow (a hard-coded list, see rule 6), the full build, then asserts:
- HTML page + sitemap counts match a **content-derived** invariant (not a magic number): `scripts/verify-corpus-counts.mjs` computes `EXPECTED_PAGES = 14 × (recipes + eligibleCuisines + plans) + 57` from `recipes.js` + `plan-meals.generated.js`, tolerance ±14. Currently 681 recipes → 10431 pages / 10430 sitemap URLs (the bare `/` page is deliberately left out of the sitemap). Adding recipes/cuisines/plans auto-tracks; a regenerate bug still fails.
- No `sk_live_` Stripe keys anywhere in source
- No hard-coded `SUPABASE_SERVICE_ROLE_KEY=…` assignments (only `process.env.SUPABASE_SERVICE_ROLE_KEY` reads allowed, in `api/`)

Run any of those checks locally before committing if you touch recipes, generators, or API handlers.

## Pre-commit invariants

Violating these will silently break production or trip CI:

1. **Curly quotes (U+2018 / U+2019) in `public/js/recipes.js` break JS parsing.** Always grep before committing:
   `python3 -c "s=open('public/js/recipes.js',encoding='utf-8').read(); print(s.count('‘')+s.count('’'))"` must be `0`.
2. **Any edit to `public/js/recipes.js` requires `npm run content`** to regenerate HTML; the page count auto-tracks via `scripts/verify-corpus-counts.mjs` (currently ~10431), so adding recipes is fine — just don't leave the generated HTML/sitemap out of sync with the data.
3. **Every multilingual field needs all 14 language codes**: `ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko`. Older recipes are often missing `hi` — add it.
4. **Recipes with 9+ ingredients need an explicit `servings: 4` override** at the recipe-object level (default scaling assumptions otherwise produce wrong amounts).
5. **Never commit `.env` or `.env.local`** — gitignored, hold Stripe + Supabase + OpenAI secrets.
6. **Adding a new `api/*.js` route?** Add it to the `node --check` list in `.github/workflows/build-check.yml` step 5 — that step iterates a hard-coded file list, not a glob, so new handlers go unchecked silently until you add them.

Workflow: commit directly to `main` and push. No feature branches, no PRs.

## Architecture

### Two halves: static site + serverless API

- **Static site** lives in `public/` and is served as-is (Vercel `@vercel/static` + GitHub Pages). The browser loads `public/js/app.js` directly as an ES module (it is not bundled); only `checkout.js`, `portal.js` and `analytics.js` are bundled by esbuild (→ `*.min.js`).
- **Serverless API** lives in `api/*.js` (Vercel `@vercel/node`). `vercel.json` rewrites `/api/foo` → `/api/foo.js`. Files under `api/_lib/` are NOT routes (Vercel ignores leading underscore); they are shared modules.

### Content pipeline

`scripts/generate-content.mjs` is the engine. It imports `public/js/recipes.js`, `public/js/recipes-budget.js`, and `public/js/i18n.js`, then writes ~10431 static HTML pages:

- 14 language home indexes (`/{lc}/`) + root
- 11 themed weekly plans × 14 languages + 14 plan indexes = 168 plan pages
- 681 recipes × 14 languages = 9534 recipe pages (under language-specific dirs like `/ro/retete/`, `/en/recipes/`, `/de/rezepte/`, etc.)
- 14 pricing pages
- 49 cuisine hubs (origins with ≥2 recipes) × 14 locales = 686 hub pages + 14 hub indexes (under language-specific prefixes like `/en/recipes/<country>/`, `/ro/retete/<country>/`, `/de/rezepte/<country>/`)
- `public/sitemap.xml` (~10430 URLs)

Recipe slugs are derived from `r.name.en || r.name.ro` via the local `slug()` helper. If you rename a recipe's English name, every language's URL for that recipe changes — update internal links and check 301s.

Per-language URL prefixes for recipes and pricing are hard-coded in the `RECIPE_LANG` and `PRICING_SLUGS` tables inside `generate-content.mjs`. Adding a language means editing both tables plus `i18n.js`.

### Frontend JS layout

- `public/js/app.js` — main planner UI. **Not bundled**: `public/index.html` loads it directly as an ES module (`<script type="module" src="/js/app.js">`). It statically imports `recipes-meta.js`, `i18n.js`, `shopping-list.js` and `plan-meals.generated.js`; `recipes.js` and `recipes-budget.js` are lazy-loaded at runtime (`ensureMainRecipes()` / `ensureBudgetRecipes()`) to keep the initial payload small. Do not statically import `recipes.js` or `recipes-budget.js` from `app.js`.
- `public/js/recipes.js` — 681 main recipes, one object per recipe with multilingual `name`, `origin`, `featureCards`, `ingredients`, `howIsMade`, plus `nutrition`, `tipType`, `pairingsType`. This is the canonical content source; the HTML generator reads it directly.
- `public/js/recipes-meta.js` — per-recipe `time`, `costRon`, `tags`, optional `desc`. Applied to recipe objects at runtime by `app.js` (does not mutate the file).
- `public/js/recipes-budget.js` — secondary recipe set, only loaded when the budget toggle is on.
- `public/js/i18n.js` — all UI translations, language names, SEO paragraph templates.
- `public/js/checkout.js` / `portal.js` — Stripe Checkout + Customer Portal launch buttons. Bundled separately.
- `public/js/recipe-images.js` — **auto-generated** (`// DO NOT edit manually`). Maps recipe ID → image URL (Spoonacular + Wikipedia). Regenerated by a separate tooling script.
- `public/js/content.js` — client script loaded by the generated recipe/content pages (food-photo map, back-pill and back-to-top buttons), not by the planner UI. `public/js/find-duplicates.js` is a gitignored local helper and is not in the repo.

### Payments + premium gating

The whole monetization model lives in the Supabase `tokens` table. Each row = one purchase, columns include `email` and `expires_at` (ms or seconds — both are tolerated; values < 1e12 are treated as seconds and multiplied by 1000). `null` expires_at means lifetime.

A user may have **multiple rows** (e.g. renewed subscription). Therefore:

- **Never use `.single()` when querying `tokens`** — it errors with PGRST116 and incorrectly blocks valid users. Always `.select(...).eq('email', email).order('expires_at', { ascending: false })` and reduce.
- `api/_lib/requirePremium.js` is the canonical "is this email premium right now" check for API handlers. Re-use it; don't reimplement.
- `api/check-access.js` is the equivalent read-only endpoint for the frontend (returns `{ active, found, until }`).
- `api/stripe-webhook.js` is what writes new rows into `tokens` after Checkout completes; treat it as the source of truth for subscription state.

The Supabase anon key in client JS is intentionally public. The `SUPABASE_SERVICE_ROLE_KEY` must only ever appear in `process.env.*` references inside `api/`. The CI secret-leak step enforces this.

### AI endpoints

`api/chat.js` and `api/coach.js` both call OpenAI and both gate access with `requirePremium`. `api/_lib/rateLimiter.js` provides the rate limit (per-email, in-memory — survives only as long as the Vercel function instance does).

### Deployment

Vercel hosts the production site at `meal-planner.ro` (CNAME). GitHub Pages serves the demo at the GitHub URL in the README. The Vercel build runs the same `npm run build` pipeline. Pushing to `main` triggers both the GitHub Actions build-check and the Vercel deploy.

## Per-recipe `fix_*.py` scripts

The repo root may hold local-only `fix_<recipe-id>.py` files (and `audit_*.py`, `fix_tier_c_*.py`, etc.). They are gitignored (`/*.py`, `/fix_*.py`, `/audit_*.py` in `.gitignore`) and never committed, so a fresh checkout has none. Where they exist, these are one-shot Python scripts used to rewrite specific recipes in `public/js/recipes.js` — they parse the JS as text, splice in new content for one or more recipe IDs, and write the file back. They are throwaway tooling, not a library. Run them with `python3 fix_<id>.py` from repo root, then run `npm run content` to regenerate HTML. Don't try to import or generalize them.

The matching local-only `audit_*.py` scripts at repo root, if present (`audit_quality.py`, `audit_recipes.py`, `audit_uniqueness.py`), are read-only checks over `recipes.js` and the generated HTML — run before/after batch fixes to spot regressions.

## Multi-agent context (from AGENTS.md)

This codebase has a documented multi-AI workflow: Claude Code is the Lead Developer / Architect, with Cursor handling rapid UI edits, ChatGPT doing QA/SEO review, Codex on CI/CD, Windsurf on batch refactors. Zone ownership is enforced informally — see `AGENTS.md` for the full table. When working in `public/css/`, `public/js/app.js`, or HTML pages without touching payment/Supabase/API/build config, you're in the "Frontend Builder" zone; everything else is the Lead Developer's.

`docs/ai/` contains per-initiative planning docs (PRODUCT_SPEC, SAAS_PLAN, SEO_PLAN, QA_CHECKLIST, plus audit/phase reports). Skim the most relevant one before starting a non-trivial change in that area.
