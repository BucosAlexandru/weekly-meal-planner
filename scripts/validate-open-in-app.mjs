#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════
   validate-open-in-app.mjs — build-time guard for the "Open in app"
   (?autoplan=) deep link.

   The SEO meal-plan pages are generated from PLANS (generate-content.mjs)
   but "Open in app" reconstructs the plan from a SEPARATE hand-maintained
   map, PLAN_DATA (public/js/app.js). The two can drift, producing two
   silent failure modes this script makes loud:

     1. A PLANS plan id with NO matching PLAN_DATA key
        → "Open in app" is a no-op (empty planner).
     2. A PLAN_DATA meal name that matches no recipe by name.ro/name.en
        → that slot falls back to literal text and carries no recipe data.

   Exits non-zero on either, so it can gate CI / the build. This is an
   INTERIM guard until PLANS/PLAN_DATA are unified onto recipe ids.
   ════════════════════════════════════════════════════════════════ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fail = msg => { console.error(`✗ ${msg}`); process.exitCode = 1; };

// ---- extract a top-level `const NAME = { … };` object literal by brace match
function extractObjectLiteral(src, declaration) {
  const start = src.indexOf(declaration);
  if (start === -1) throw new Error(`could not find "${declaration}"`);
  const braceStart = src.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = braceStart; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error(`unbalanced braces after "${declaration}"`);
  const literal = src.slice(braceStart, end + 1);
  // Data-only literal (arrays of strings + booleans); safe to evaluate.
  return new Function(`return (${literal});`)();
}

const appSrc = readFileSync(join(ROOT, 'public/js/app.js'), 'utf8');
const genSrc = readFileSync(join(ROOT, 'scripts/generate-content.mjs'), 'utf8');

// ---- PLAN_DATA (app.js)
let PLAN_DATA;
try {
  PLAN_DATA = extractObjectLiteral(appSrc, 'const PLAN_DATA =');
} catch (e) {
  fail(`Failed to parse PLAN_DATA from public/js/app.js: ${e.message}`);
  process.exit(1);
}

// ---- PLANS ids (generate-content.mjs): every plan id must have a deep link
const planIds = [...genSrc.matchAll(/\bid:\s*'([a-z0-9-]+)',\s*idEn:\s*'([a-z0-9-]+)'/g)]
  .map(m => ({ id: m[1], idEn: m[2] }));
if (!planIds.length) fail('Could not extract any PLANS ids from generate-content.mjs');

// ---- recipe name resolver (mirrors app.js: name.ro || name.en exact match)
const all = [...recipes, ...budgetRecipes];
const resolves = name => all.some(r => r.name?.ro === name || r.name?.en === name);

let checkedPlans = 0, checkedMeals = 0;

// (1) every SEO plan id must have a PLAN_DATA key
for (const { id, idEn } of planIds) {
  if (!(id in PLAN_DATA)) {
    fail(`PLANS plan "${id}" (${idEn}) has no PLAN_DATA key in app.js — ` +
         `"Open in app" would land on an empty planner.`);
  }
}

// (2) every PLAN_DATA meal name must resolve to a recipe
for (const [key, plan] of Object.entries(PLAN_DATA)) {
  checkedPlans++;
  if (plan.isBudget) continue; // budget plan is generated randomly, no name list
  for (const name of [...(plan.lunches || []), ...(plan.dinners || [])]) {
    checkedMeals++;
    if (!resolves(name)) {
      fail(`PLAN_DATA["${key}"] meal "${name}" matches no recipe ` +
           `by name.ro/name.en — slot would carry no recipe data.`);
    }
  }
}

if (process.exitCode === 1) {
  console.error(`\nOpen-in-app validation FAILED.`);
  process.exit(1);
}
console.log(`✓ Open-in-app OK: ${planIds.length} SEO plans, ${checkedPlans} PLAN_DATA entries, ` +
            `${checkedMeals} meals — all resolve, all linked.`);
