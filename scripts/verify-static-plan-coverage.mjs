// Stage 3 reconciliation — static-output coverage, full accounting.
//
//   node scripts/verify-static-plan-coverage.mjs
//
// scripts/test-generation-engine.mjs's check #2 only reads PLAN_MEALS
// (public/js/plan-meals.generated.js), which by pre-existing design omits
// the budget plan's ids ("Budget is random -> no id list" - it regenerates
// live via generateRandomMenu() client-side rather than serving a baked
// list). That check alone is NOT a full account of static output: the
// budget plan's page is still a real, statically rendered page with 14 real
// recipe picks baked into its HTML at build time by the same autoPlanMeals()
// that produces the other 10 plans' picks -- it just isn't exported as an id
// list. This script closes that gap and reconciles every number in one
// place:
//
//   1. Canonical (id-level) coverage for ALL 11 plan definitions, budget
//      included. The 10 non-budget plans use PLAN_MEALS ids directly
//      (already the authoritative ground truth for the deep link -- no
//      parsing needed). The budget plan has no id list, so its RO page is
//      parsed and each name resolved against ONLY budgetRecipes (35 items,
//      verified to have 35 distinct RO names -- no cross-corpus ambiguity).
//   2. Full localization/rendering coverage, all 14 locales x all 11 plans
//      (154 pages): for every canonical (plan, slot, position) the EXPECTED
//      text is computed directly from the canonical id --
//      `recipe.name[locale] || recipe.name.en || recipe.name.ro` (the same
//      fallback chain generate-content.mjs's own page renderer uses) -- and
//      compared against the ACTUAL text parsed from that locale's rendered
//      page. This is a pure string comparison per (plan, locale, position):
//      it needs no name->id resolution and so cannot be confused by two
//      different recipes coincidentally sharing a name in some locale (a
//      real, pre-existing property of this catalogue -- see the "duplicate
//      name" note below -- which made an earlier, name-resolution-based
//      version of this script report false mismatches).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';
import { isEligibleForSlot } from '../public/js/mealEligibility.js';
import { PLAN_MEALS } from '../public/js/plan-meals.generated.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');

const byId = new Map([...recipes, ...budgetRecipes].map(r => [r.id, r]));

const LOCALES = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko'];
const PLAN_DIR_BY_LOCALE = {
  ro: 'meniu-saptamanal', en: 'weekly-meal-plan', es: 'plan-semanal', fr: 'plan-semaine',
  de: 'wochenplan', pt: 'plano-semanal', ru: 'nedelnoe-menyu', ar: 'khitat-usbuiya',
  zh: 'zhoujicaidan', ja: 'weekly-menu', hi: 'weekly-plan', tr: 'haftalik-menu',
  it: 'piano-settimanale', ko: 'jugan-menu',
};
function planSlugFor(planId, idEn, locale) { return locale === 'ro' ? planId : idEn; }

function expectedText(recipe, locale) {
  return recipe.name?.[locale] || recipe.name?.en || recipe.name?.ro || '';
}

function decodeHtml(s) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}

function parsePlanPage(locale, planId, idEn) {
  const dir = path.join(PUBLIC, locale, PLAN_DIR_BY_LOCALE[locale]);
  const slug = planSlugFor(planId, idEn, locale);
  const file = path.join(dir, slug, 'index.html');
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  // Non-budget recipes link to their own recipe page (<a class="recipe-link
  // plan-meal-name">); budget recipes (no dedicated pages) render a plain
  // <span class="plan-meal-name">. Match both tag shapes and class orders.
  const names = [...html.matchAll(/<(a|span)[^>]*class="[^"]*\bplan-meal-name\b[^"]*"[^>]*>([^<]*)<\/\1>/g)]
    .map(m => decodeHtml(m[2]));
  const lunchNames = names.filter((_, i) => i % 2 === 0);
  const dinnerNames = names.filter((_, i) => i % 2 === 1);
  return { lunchNames, dinnerNames };
}

let errors = [];
function fail(msg) { errors.push(msg); console.error('  FAIL: ' + msg); }

console.log('=== Static plan coverage reconciliation ===\n');

// ---------------------------------------------------------------------
// 0. Inventory
// ---------------------------------------------------------------------
const planIds = Object.keys(PLAN_MEALS);
console.log(`Total plan definitions: ${planIds.length}`);
let totalLocalizedPages = 0;
for (const locale of LOCALES) for (const id of planIds) {
  const p = path.join(PUBLIC, locale, PLAN_DIR_BY_LOCALE[locale], planSlugFor(id, PLAN_MEALS[id].idEn, locale), 'index.html');
  if (fs.existsSync(p)) totalLocalizedPages++;
}
console.log(`Total localized static plan pages found on disk: ${totalLocalizedPages} (expected ${planIds.length} x ${LOCALES.length} = ${planIds.length * LOCALES.length})`);
if (totalLocalizedPages !== planIds.length * LOCALES.length) fail(`page count mismatch: found ${totalLocalizedPages}`);

const roIndexCells = (fs.readFileSync(path.join(PUBLIC, 'ro', 'meniu-saptamanal', 'index.html'), 'utf8').match(/plan-meal-name/g) || []).length;
console.log(`Spot-check: RO plan-index page lunch/dinner cells: ${roIndexCells} (expected 0)`);
if (roIndexCells !== 0) fail(`RO plan index page unexpectedly contains ${roIndexCells} plan-meal-name cells`);

// ---------------------------------------------------------------------
// 1. Canonical ids for all 11 plans (10 from PLAN_MEALS directly, budget
//    resolved from its own RO page against the budget-only corpus).
// ---------------------------------------------------------------------
console.log('\n--- Canonical ids (ground truth) ---');
const canonicalIdsByPlan = {};
for (const planId of planIds) {
  const meta = PLAN_MEALS[planId];
  if (!meta.isBudget) {
    canonicalIdsByPlan[planId] = { lunchIds: meta.lunchIds || [], dinnerIds: meta.dinnerIds || [] };
    console.log(`  ${planId}: from PLAN_MEALS, lunch=${meta.lunchIds.length} dinner=${meta.dinnerIds.length}`);
    continue;
  }
  // Budget: resolve RO page names against budgetRecipes only (verified: 35
  // distinct RO names, no ambiguity).
  const byRoNameBudget = new Map(budgetRecipes.map(r => [(r.name?.ro || '').toLowerCase(), r]));
  const page = parsePlanPage('ro', planId, meta.idEn);
  if (!page) { fail(`${planId}: RO page not found`); continue; }
  const resolve = names => names.map(n => {
    const r = byRoNameBudget.get(n.toLowerCase());
    if (!r) fail(`${planId} RO cell "${n}": does not resolve against the budget corpus`);
    return r ? r.id : null;
  });
  const lunchIds = resolve(page.lunchNames);
  const dinnerIds = resolve(page.dinnerNames);
  canonicalIdsByPlan[planId] = { lunchIds, dinnerIds };
  console.log(`  ${planId}: resolved from RO page (budget corpus), lunch=${lunchIds.length} dinner=${dinnerIds.length}`);
}

let canonicalLunchCells = 0, canonicalDinnerCells = 0, canonicalViolations = 0;
for (const planId of planIds) {
  const { lunchIds, dinnerIds } = canonicalIdsByPlan[planId];
  for (const id of lunchIds) {
    canonicalLunchCells++;
    const r = byId.get(id);
    if (!r) { fail(`${planId} lunch id ${id}: unresolved in catalogue`); continue; }
    if (!isEligibleForSlot(r, 'lunch')) { canonicalViolations++; fail(`${planId} lunch id ${id} "${r.name?.en}": not lunch-eligible (mealSlots=${JSON.stringify(r.mealSlots)})`); }
  }
  for (const id of dinnerIds) {
    canonicalDinnerCells++;
    const r = byId.get(id);
    if (!r) { fail(`${planId} dinner id ${id}: unresolved in catalogue`); continue; }
    if (!isEligibleForSlot(r, 'dinner')) { canonicalViolations++; fail(`${planId} dinner id ${id} "${r.name?.en}": not dinner-eligible (mealSlots=${JSON.stringify(r.mealSlots)})`); }
  }
}
console.log(`\nCanonical lunch cells: ${canonicalLunchCells}, dinner cells: ${canonicalDinnerCells}, total: ${canonicalLunchCells + canonicalDinnerCells}`);
console.log(`Eligibility violations: ${canonicalViolations}`);

// ---------------------------------------------------------------------
// Known pre-existing duplicate-name note (data-quality observation, NOT an
// eligibility issue -- both members of each pair carry IDENTICAL mealSlots,
// so a name-based mix-up between them, if one ever occurred elsewhere in
// the app, would have zero effect on slot eligibility). Not fixed here:
// fixing translation text is a content/taxonomy change, out of scope for
// this reconciliation.
// ---------------------------------------------------------------------
console.log('\n--- Data-quality note: recipes sharing an identical name in some locale ---');
{
  const byLocaleName = new Map(); // `${locale}:${name}` -> [ids]
  for (const r of [...recipes, ...budgetRecipes]) {
    for (const locale of LOCALES) {
      const n = (r.name?.[locale] || '').toLowerCase();
      if (!n) continue;
      const key = `${locale}:${n}`;
      if (!byLocaleName.has(key)) byLocaleName.set(key, []);
      byLocaleName.get(key).push(r.id);
    }
  }
  let dupeGroups = 0;
  for (const [key, ids] of byLocaleName) {
    const uniq = [...new Set(ids)];
    if (uniq.length > 1) {
      dupeGroups++;
      const slots = uniq.map(id => JSON.stringify(byId.get(id)?.mealSlots));
      const sameSlots = slots.every(s => s === slots[0]);
      console.log(`  ${key}: ids ${uniq.join(', ')} ${sameSlots ? '(identical mealSlots — no eligibility impact)' : '(DIFFERENT mealSlots — worth a closer look)'}`);
    }
  }
  console.log(`Total duplicate-name groups found: ${dupeGroups} (informational only; not fixed, not a gate failure)`);
}

// ---------------------------------------------------------------------
// 2. Full localization/rendering coverage — every one of the 154 pages,
//    pure expected-text-vs-actual-text comparison, no name resolution.
// ---------------------------------------------------------------------
console.log('\n--- Localization/rendering coverage (all 14 locales x all 11 plans) ---');
let renderedPagesChecked = 0, renderedCellsChecked = 0, renderedMismatches = 0, renderedUnparsed = 0;
for (const planId of planIds) {
  const meta = PLAN_MEALS[planId];
  const { lunchIds, dinnerIds } = canonicalIdsByPlan[planId];
  for (const locale of LOCALES) {
    const page = parsePlanPage(locale, planId, meta.idEn);
    if (!page) { fail(`${planId}/${locale}: page not found`); continue; }
    renderedPagesChecked++;
    if (page.lunchNames.length !== lunchIds.length || page.dinnerNames.length !== dinnerIds.length) {
      renderedUnparsed++;
      fail(`${planId}/${locale}: cell-count mismatch (page has ${page.lunchNames.length}L/${page.dinnerNames.length}D, canonical has ${lunchIds.length}L/${dinnerIds.length}D)`);
      continue;
    }
    const checkSide = (actualNames, ids, label) => {
      ids.forEach((id, i) => {
        renderedCellsChecked++;
        const r = byId.get(id);
        const expected = expectedText(r, locale);
        const actual = actualNames[i];
        if (expected !== actual) {
          renderedMismatches++;
          fail(`${planId}/${locale} ${label}[${i}]: expected "${expected}" (id ${id}) but page shows "${actual}"`);
        }
      });
    };
    checkSide(page.lunchNames, lunchIds, 'lunch');
    checkSide(page.dinnerNames, dinnerIds, 'dinner');
  }
}
console.log(`Localized pages checked: ${renderedPagesChecked} / ${planIds.length * LOCALES.length} expected`);
console.log(`Rendered cells checked: ${renderedCellsChecked}`);
console.log(`Cell-count mismatches: ${renderedUnparsed}`);
console.log(`Text mismatches (page shows different text than the canonical id's name in that locale): ${renderedMismatches}`);

// ---------------------------------------------------------------------
console.log('\n=== SUMMARY ===');
console.log(`Static plan definitions: ${planIds.length}`);
console.log(`Localized static plan pages: ${totalLocalizedPages} (11 plans x 14 locales)`);
console.log(`Canonical semantic cells: lunch=${canonicalLunchCells}, dinner=${canonicalDinnerCells}, total=${canonicalLunchCells + canonicalDinnerCells} (9 full-week plans x14 + 1 weekend plan x4 + 1 budget plan x14 = 144)`);
console.log(`  of which captured in PLAN_MEALS (id-list export used by the ?autoplan= deep link): 130 — budget's 14 intentionally excluded by pre-existing design ("Budget is random -> no id list"; it regenerates live client-side via generateRandomMenu(), already covered by the fuzz gate's budget scenarios)`);
console.log(`Eligibility violations: ${canonicalViolations}`);
console.log(`Rendered cells checked across all 154 pages: ${renderedCellsChecked}`);
console.log(`Rendering mismatches: ${renderedMismatches}`);
console.log(`\nTotal errors: ${errors.length}`);

if (errors.length) {
  console.error(`\nFAILED: ${errors.length} issue(s) — see FAIL lines above.`);
  process.exit(1);
}
console.log('\n✓ Static output fully accounted for: every canonical cell is eligible, and every localized page renders exactly the canonical recipe\'s name for its locale.');
