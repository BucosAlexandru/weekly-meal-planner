// CI corpus-count invariant — content-derived, not a magic number.
//
//   node scripts/verify-corpus-counts.mjs      (run AFTER `npm run build`)
//
// Replaces the old hard-coded "~3936 / [3800,4050]" thresholds in
// build-check.yml. Those drifted every time the catalog grew and had to be
// hand-bumped; worse, their comments were stale (claimed 220 recipes / 2562 /
// 3712 while the real corpus is 225 recipes / 4005 pages / 4006 URLs).
//
// Instead we DERIVE the expected page count from the same content inputs the
// generator uses, so adding/removing recipes, cuisines, or plans updates the
// expectation automatically. A narrow tolerance (±1 locale = ±14) still catches
// a real regeneration bug (double-write ≈ 2×, a dropped locale ≈ −N×hundreds).
//
// Page composition (verified against the current generated output — exact):
//   recipe detail      = recipes.length      × LANGS   (all recipes, every locale)
//   cuisine country    = eligibleCuisines    × LANGS   (origins with ≥ MIN recipes)
//   weekly plan        = plans               × LANGS
//   recipe-index hub   = LANGS
//   plan-index hub     = LANGS
//   pricing            = LANGS
//   SPA homes + root   = LANGS + 1
//   ───────────────────────────────────────────────────────────────────────
//   EXPECTED_PAGES = LANGS × (recipes + eligibleCuisines + plans) + 4×LANGS + 1
//   EXPECTED_URLS  = EXPECTED_PAGES + SITEMAP_ROOT_EXTRA   (bare "/" canonical)
//
// If the FIXED structural terms below ever change (a new per-locale hub type,
// etc.), update LANGS/MIN/FIXED here — the failure message points right at it.

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { recipes } from '../public/js/recipes.js';
import { PLAN_MEALS } from '../public/js/plan-meals.generated.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── content-derived inputs ──────────────────────────────────────────────────
const LANGS = 14;                 // app locales (ro,en,es,fr,de,pt,ru,ar,zh,ja,hi,tr,it,ko)
const MIN_CUISINE_RECIPES = 2;    // CUISINE_MIN_RECIPES in generate-content.mjs
const SITEMAP_ROOT_EXTRA = 1;     // bare https://meal-planner.ro/ has a sitemap URL beyond the per-page ones
const TOLERANCE = LANGS;          // ±1 locale of structural slack; a real bug is off by hundreds

const recipeCount = recipes.length;
const originCounts = {};
for (const r of recipes) { const o = r.origin?.en; if (o) originCounts[o] = (originCounts[o] || 0) + 1; }
const eligibleCuisines = Object.values(originCounts).filter(n => n >= MIN_CUISINE_RECIPES).length;
const planCount = Object.keys(PLAN_MEALS).length;

const FIXED = 4 * LANGS + 1; // recipe-index + plan-index + pricing + homes, per locale, + bare root
const EXPECTED_PAGES = LANGS * (recipeCount + eligibleCuisines + planCount) + FIXED;
const EXPECTED_URLS = EXPECTED_PAGES + SITEMAP_ROOT_EXTRA;

// ── actual counts from the built output ─────────────────────────────────────
const actualPages = Number(execSync(`find "${path.join(ROOT, 'public')}" -name '*.html' | wc -l`).toString().trim());
const sitemapPath = path.join(ROOT, 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) { console.error('ERROR: public/sitemap.xml not found — run `npm run build` first'); process.exit(1); }
const actualUrls = (fs.readFileSync(sitemapPath, 'utf8').match(/<url>/g) || []).length;

// ── report + assert ─────────────────────────────────────────────────────────
console.log('Corpus composition (content-derived):');
console.log(`  recipes=${recipeCount}  eligibleCuisines(>=${MIN_CUISINE_RECIPES})=${eligibleCuisines}  plans=${planCount}  langs=${LANGS}`);
console.log(`  expected pages = ${LANGS}×(${recipeCount}+${eligibleCuisines}+${planCount}) + ${FIXED} = ${EXPECTED_PAGES}`);
console.log(`  expected URLs  = ${EXPECTED_PAGES} + ${SITEMAP_ROOT_EXTRA} = ${EXPECTED_URLS}`);
console.log(`  actual pages=${actualPages}  actual URLs=${actualUrls}  tolerance=±${TOLERANCE}`);

let ok = true;
function assertNear(label, actual, expected) {
  const lo = expected - TOLERANCE, hi = expected + TOLERANCE;
  if (actual < lo || actual > hi) {
    console.error(`ERROR: ${label} = ${actual}, expected ${expected} (allowed ${lo}..${hi}).`);
    console.error(`       If the catalog changed legitimately this auto-tracks recipes/cuisines/plans;`);
    console.error(`       a failure here means a generation bug (dup/missing pages) or a FIXED-term change.`);
    ok = false;
  } else {
    console.log(`  OK: ${label} within ±${TOLERANCE} of ${expected}`);
  }
}
assertNear('HTML page count', actualPages, EXPECTED_PAGES);
assertNear('sitemap URL count', actualUrls, EXPECTED_URLS);

if (!ok) process.exit(1);
console.log('\n✓ Corpus counts OK.');
