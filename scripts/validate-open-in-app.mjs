#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════
   validate-open-in-app.mjs — build-time guard for the "Open in app"
   (?autoplan=) deep link.

   Single source of truth: scripts/generate-content.mjs renders the SEO
   meal-plan pages AND emits public/js/plan-meals.generated.js (per-plan
   recipe IDs) from the SAME deterministic selection. app.js consumes those
   IDs so "Open in app" loads exactly the meals the page shows.

   This guard fails loud (non-zero exit) on any of:
     1. A PLANS plan id (generate-content.mjs) with no PLAN_MEALS entry
        → "Open in app" would land on an empty planner.
     2. A PLAN_MEALS recipe id that no longer exists in recipes.js
        → that slot would carry no recipe data.
     3. Wrong meal count for a plan (expected 14, or 4 for weekend).
     4. PARITY: the set of recipes in PLAN_MEALS for a plan differs from the
        set of recipes rendered into that plan's EN SEO page table.
   ════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';
import { PLAN_MEALS } from '../public/js/plan-meals.generated.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fail = msg => { console.error(`✗ ${msg}`); process.exitCode = 1; };

// Mirror the slug() helper in generate-content.mjs exactly.
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

const byId = new Map([...recipes, ...budgetRecipes].map(r => [r.id, r]));
const recipeSlug = id => { const r = byId.get(id); return r ? slug(r.name?.en || r.name?.ro || '') : null; };

const genSrc = readFileSync(join(ROOT, 'scripts/generate-content.mjs'), 'utf8');
const planIds = [...genSrc.matchAll(/\bid:\s*'([a-z0-9-]+)',\s*idEn:\s*'([a-z0-9-]+)'/g)]
  .map(m => ({ id: m[1], idEn: m[2] }));
if (!planIds.length) fail('Could not extract any PLANS ids from generate-content.mjs');

let checkedPlans = 0, checkedMeals = 0, parityChecked = 0;

// (1) every SEO plan id must have a PLAN_MEALS entry
for (const { id, idEn } of planIds) {
  if (!(id in PLAN_MEALS)) {
    fail(`PLANS plan "${id}" (${idEn}) has no PLAN_MEALS entry — ` +
         `"Open in app" would land on an empty planner.`);
  }
}

for (const [key, plan] of Object.entries(PLAN_MEALS)) {
  checkedPlans++;
  if (plan.isBudget) continue; // budget plan is generated randomly, no id list

  const ids = [...(plan.lunchIds || []), ...(plan.dinnerIds || [])];

  // (2) every recipe id must resolve
  for (const id of ids) {
    checkedMeals++;
    if (!byId.has(id)) {
      fail(`PLAN_MEALS["${key}"] recipe id ${id} does not exist in recipes.js — ` +
           `slot would carry no recipe data.`);
    }
  }

  // (3) meal count
  const expected = plan.weekend ? 4 : 14;
  if (ids.length !== expected) {
    fail(`PLAN_MEALS["${key}"] has ${ids.length} meals, expected ${expected}.`);
  }

  // (4) parity: PLAN_MEALS recipe set === EN SEO page table recipe set
  const pageFile = join(ROOT, 'public/en/weekly-meal-plan', plan.idEn, 'index.html');
  if (!existsSync(pageFile)) {
    fail(`PLAN_MEALS["${key}"] — EN page not found at ${pageFile}. ` +
         `Run "npm run content" before validating.`);
    continue;
  }
  const html = readFileSync(pageFile, 'utf8');
  // Recipe links inside the planner table: /en/recipes/<slug>/
  const tableMatch = html.match(/<table[^>]*planner-table[\s\S]*?<\/table>/);
  const scope = tableMatch ? tableMatch[0] : html;
  const pageSlugs = new Set(
    [...scope.matchAll(/\/en\/recipes\/([^/"]+)\//g)].map(m => m[1])
  );
  const idSlugs = new Set(ids.map(recipeSlug).filter(Boolean));
  parityChecked++;

  const missingOnPage = [...idSlugs].filter(s => !pageSlugs.has(s));
  const extraOnPage    = [...pageSlugs].filter(s => !idSlugs.has(s));
  if (missingOnPage.length || extraOnPage.length) {
    fail(`PARITY MISMATCH for "${key}" (page ${plan.idEn}): ` +
         (missingOnPage.length ? `in PLAN_MEALS but not on page: ${missingOnPage.join(', ')}. ` : '') +
         (extraOnPage.length ? `on page but not in PLAN_MEALS: ${extraOnPage.join(', ')}.` : ''));
  }
}

if (process.exitCode === 1) {
  console.error(`\nOpen-in-app validation FAILED.`);
  process.exit(1);
}
console.log(`✓ Open-in-app OK: ${planIds.length} SEO plans, ${checkedPlans} PLAN_MEALS entries, ` +
            `${checkedMeals} meals resolve, ${parityChecked} plans page↔app parity verified.`);
