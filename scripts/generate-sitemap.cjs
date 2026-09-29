// This used to independently hand-build public/sitemap.xml from just the
// homepage + 14 language roots (15 URLs total) — a leftover from before the
// recipe/plan/cuisine-hub pages existed. Running it stood a real chance of
// silently overwriting the real sitemap (10000+ URLs, one entry per recipe/
// plan/cuisine-hub page across 14 languages) down to those 15 URLs, wiping
// almost everything out of Google's index. See docs/ai/IMAGE_QA_REPORT.md-
// adjacent SEO notes / CLAUDE.md for the real page inventory.
//
// scripts/generate-content.mjs is the single source of truth for which
// pages exist (it derives the full URL set from recipes.js + the PLANS/
// cuisine-hub tables while it writes every HTML page) and already writes
// public/sitemap.xml correctly as part of that run. There is no cheaper way
// to get a *correct* sitemap without recomputing the same page inventory, so
// this script just delegates to it instead of maintaining a second,
// drift-prone copy of that logic.
//
// `npm run sitemap` therefore does the same work as `npm run content`
// (it regenerates every HTML page too, not only the sitemap) — slower than
// the old 15-URL version, but the old version's speed came from being wrong.

const { execFileSync } = require('child_process');
const path = require('path');

const target = path.join(__dirname, 'generate-content.mjs');

console.log('generate-sitemap: delegating to generate-content.mjs (single source of truth for the page/sitemap inventory)…');
execFileSync(process.execPath, [target], { stdio: 'inherit' });
