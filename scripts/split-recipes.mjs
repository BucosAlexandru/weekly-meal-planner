// Phase 3 — per-locale recipe corpus splitter.
//
// Reads the canonical full corpora (public/js/recipes.js + recipes-budget.js)
// and emits one reduced, content-hashed chunk PER locale for each, plus a
// manifest the content generator inlines into the SPA homepages.
//
// Reduction (browser only — the generator still reads the full recipes.js):
//   • DROP generator-only fields the planner never reads: originText,
//     featureCards, pairings (≈27% of the corpus).
//   • Multilingual fields kept as { <lc>, en, ro } so the active locale renders
//     and the shopping/PDF/search engine still has its English source.
//   • howIsMade kept as { <lc>, en } (only used for the truncated `desc`).
//
// Output: public/js/recipes.<lc>.<hash>.min.js,
//         public/js/recipes-budget.<lc>.<hash>.min.js,
//         public/js/recipes-manifest.json  { <lc>: { main, budget } }
//
// Run via `npm run build:recipes`. MUST run before build:js / content.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JS_DIR = path.join(__dirname, '..', 'public', 'js');

const LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','tr','it','ko','hi'];

// Multilingual fields the planner never reads → dropped from browser chunks.
const DROP = new Set(['originText', 'featureCards', 'pairings']);

const isMultilingual = v =>
  v && typeof v === 'object' && !Array.isArray(v) && LANGS.some(l => l in v);

const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) if (obj[k] != null) out[k] = obj[k];
  return out;
};

// Reduce a single recipe object to the locale-specific shape.
function reduceRecipe(r, lc) {
  const out = {};
  for (const k of Object.keys(r)) {
    if (DROP.has(k)) continue;
    const v = r[k];
    if (isMultilingual(v)) {
      const keepLangs = k === 'howIsMade' ? [lc, 'en'] : [lc, 'en', 'ro'];
      out[k] = pick(v, keepLangs);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function hash8(str) {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 8);
}

// Remove previously-emitted hashed chunks so old hashes don't accumulate.
function cleanOldChunks() {
  const re = /^recipes(-budget)?\.[a-z]{2}\.[0-9a-f]{6,}\.min\.js$/;
  for (const f of fs.readdirSync(JS_DIR)) {
    if (re.test(f)) fs.unlinkSync(path.join(JS_DIR, f));
  }
}

function emitChunks(recipes, prefix, lc) {
  const reduced = recipes.map(r => reduceRecipe(r, lc));
  const body = `export const recipes=${JSON.stringify(reduced)};export default recipes;`;
  const h = hash8(body);
  const file = `${prefix}.${lc}.${h}.min.js`;
  fs.writeFileSync(path.join(JS_DIR, file), body, 'utf8');
  return `/js/${file}`;
}

const { recipes: mainRecipes } = await import('../public/js/recipes.js');
const budgetMod = await import('../public/js/recipes-budget.js');
const budgetRecipes = budgetMod.recipes || budgetMod.default || [];

cleanOldChunks();

const manifest = {};
for (const lc of LANGS) {
  manifest[lc] = {
    main:   emitChunks(mainRecipes,   'recipes',        lc),
    budget: emitChunks(budgetRecipes, 'recipes-budget', lc),
  };
}

fs.writeFileSync(
  path.join(JS_DIR, 'recipes-manifest.json'),
  JSON.stringify(manifest),
  'utf8'
);

console.log(`✅ split-recipes: ${LANGS.length} locales × 2 corpora → ${LANGS.length * 2} hashed chunks + manifest`);
console.log(`   main ${mainRecipes.length} recipes · budget ${budgetRecipes.length} recipes`);
