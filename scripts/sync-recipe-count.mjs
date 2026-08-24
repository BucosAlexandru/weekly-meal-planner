// Self-healing sync for the ONE hand-maintained recipe-count constant.
//
// Why this exists: scripts/generate-content.mjs already derives every page,
// the sitemap, and the hero copy from `recipes.length` dynamically — those
// never drift. But public/js/app.js has a single hardcoded mirror,
// `const RECIPE_COUNT = <N>;`, used for the Premium-page "{{RECIPE_COUNT}}
// recipes • 70+ countries" strings. Nothing recomputed it automatically, so
// every time a recipe was added (especially via a GitHub web upload that
// skips `npm run build` locally) it went stale — e.g. hero said 233 while the
// Premium card still said 232.
//
// This script is idempotent and safe to run on every build: it reads the
// true count from recipes.js and rewrites the app.js literal only if it
// differs. Wired into `npm run build` (before build:js, so the corrected
// value gets bundled into app.min.js) and into a CI job that runs whenever
// recipes.js/recipes-budget.js change on push — see
// .github/workflows/recipe-content-sync.yml.
//
//   node scripts/sync-recipe-count.mjs        (writes; prints what changed)
//   node scripts/sync-recipe-count.mjs --check (exits 1 if out of sync, no write)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { recipes } from '../public/js/recipes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_JS = path.join(__dirname, '..', 'public', 'js', 'app.js');
const CHECK_ONLY = process.argv.includes('--check');

const trueCount = recipes.length;
const src = fs.readFileSync(APP_JS, 'utf8');
const RE = /const RECIPE_COUNT = (\d+);/;
const m = src.match(RE);

if (!m) {
  console.error('sync-recipe-count: could not find `const RECIPE_COUNT = N;` in public/js/app.js — nothing changed. Fix the regex if that line moved/changed shape.');
  process.exit(1);
}

const current = Number(m[1]);
if (current === trueCount) {
  console.log(`sync-recipe-count: RECIPE_COUNT already correct (${trueCount}).`);
  process.exit(0);
}

if (CHECK_ONLY) {
  console.error(`sync-recipe-count: OUT OF SYNC — app.js has ${current}, recipes.js has ${trueCount}. Run \`node scripts/sync-recipe-count.mjs\` (or \`npm run build\`).`);
  process.exit(1);
}

fs.writeFileSync(APP_JS, src.replace(RE, `const RECIPE_COUNT = ${trueCount};`), 'utf8');
console.log(`sync-recipe-count: updated RECIPE_COUNT ${current} → ${trueCount} in public/js/app.js`);
