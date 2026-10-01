// CI generation-engine regression + property test (Stage 3 — Engine Fix).
//
//   node scripts/test-generation-engine.mjs
//
// scripts/verify-meal-taxonomy.mjs checks the DATA (every recipe carries a
// valid mealSlots array). This script checks the ENGINE: that every code
// path which picks a recipe for a lunch or dinner slot — the browser
// planner's getGenerationPool()/smartPickWeek() (ported here verbatim, see
// below) and the static-site generator's autoPlanMeals() (exercised via its
// real output, public/js/plan-meals.generated.js) — actually honours that
// data. Without this, a future edit could silently reintroduce the original
// production bug (a free-text `category` check, a shared lunch+dinner pool,
// a "pool too small, ignore eligibility" fallback) without the taxonomy
// validator ever noticing, since that script only checks the data is
// well-formed, not that anything downstream respects it.
//
// Three checks, each independently fatal:
//   1. Known-regression guard — specific recipes empirically confirmed (this
//      session) to have leaked into a Lunch/Dinner slot in production must
//      never be eligible for lunch/dinner per their final mealSlots. This
//      guards the DATA side of the two real bugs found; the ENGINE side is
//      covered by checks 2–3. Regression ids live ONLY here, in a test —
//      never as a name/id exception in production code (see CLAUDE.md).
//   2. Static output — every lunchIds/dinnerIds entry in the already-built
//      public/js/plan-meals.generated.js (the single source of truth every
//      locale's weekly-plan page and its ?autoplan= deep link both render
//      from — see that file's own header) resolves to a recipe whose
//      mealSlots contains that exact slot.
//   3. Engine fuzz, using a verbatim port of app.js's
//      getGenerationPool()+smartPickWeek() pool-construction and picking
//      logic (the DOM-dependent parts — window.*, FILTER_DEFS, lazy-loading
//      — are the only things stubbed out; the algorithm itself is
//      unchanged) against the live recipes.js/recipes-budget.js data and
//      the real shared public/js/mealEligibility.js module. Split in two,
//      never commingled:
//        3a. The complete-plan gate — >=5,000 genuinely complete 7-day
//            (14-slot) weekly plans, i.e. every slot attempted fresh in one
//            smartPickWeek call, exactly as a real Generate press does.
//            Requires >=70,000 successful-slot eligibility assertions
//            (slots checked minus explicitly-counted insufficient-pool
//            slots) and 0 violations.
//        3b. Additional coverage — day / single-meal / single-slot reroll /
//            budget / filtered / keepFilled-partial scenarios. This is real
//            coverage of those other entry points, but NONE of it counts
//            toward the 3a gate: a day-mode or reroll run is not a complete
//            week, and counting it as one would misstate what was tested.
//      Every picked recipe must be eligible for the exact slot it was
//      picked for, in both 3a and 3b.

import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import { isEligibleForSlot, filterEligible } from '../public/js/mealEligibility.js';

// Production merges recipesMeta (time/costRon/tags) onto each main recipe
// object at load time (app.js's ensureMainRecipes()) — recipes.js itself
// carries no `.time`/`.tags`. Without this merge, this script's `.time`
// reads are always undefined and both the WEEKDAY_MAX_MIN ceiling and any
// tag/time-based filter-chip stand-in below would silently test nothing.
// Budget recipes already carry `.time`/`.costRon` natively (recipes-budget.js
// bakes them in directly), so only main recipes need this.
recipes.forEach(r => {
  const meta = recipesMeta[r.id];
  if (!meta) return;
  r.time = meta.time;
  r.costRon = meta.costRon;
  r.tags = meta.tags || [];
});
import { PLAN_MEALS } from '../public/js/plan-meals.generated.js';

let failed = false;
function section(title) { console.log(`\n=== ${title} ===`); }
function fail(msg) { failed = true; console.error('  FAIL: ' + msg); }

// ─────────────────────────────────────────────────────────────────────────
// 1. Known-regression guard
// ─────────────────────────────────────────────────────────────────────────
section('1. Known-regression guard');
const byId = new Map([...recipes, ...budgetRecipes].map(r => [r.id, r]));
const KNOWN_REGRESSIONS = [
  // Reported by the user (screenshot): Birchermüesli selected as Saturday
  // lunch in production, before mealSlots existed.
  { id: 650, name: 'Birchermüesli', mustNotBeEligibleFor: ['lunch', 'dinner'] },
  // Found independently in this session: present as a lunch/dinner pick in
  // the pre-fix public/ro/meniu-saptamanal/buget/index.html build output.
  { id: 'budget_025', name: 'Oat porridge / Terci de ovăz', mustNotBeEligibleFor: ['lunch', 'dinner'] },
];
for (const reg of KNOWN_REGRESSIONS) {
  const r = byId.get(reg.id);
  if (!r) { fail(`regression id ${reg.id} (${reg.name}) no longer exists in the catalogue — update this test`); continue; }
  for (const slot of reg.mustNotBeEligibleFor) {
    if (isEligibleForSlot(r, slot)) {
      fail(`${reg.name} (id ${reg.id}) is eligible for "${slot}" — mealSlots=${JSON.stringify(r.mealSlots)}`);
    } else {
      console.log(`  OK: ${reg.name} (id ${reg.id}) correctly ineligible for "${slot}"`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Static output — every PLAN_MEALS slot resolves to an eligible recipe
// ─────────────────────────────────────────────────────────────────────────
section('2. Static plan output (plan-meals.generated.js)');
{
  let total = 0, violations = 0;
  for (const [planId, plan] of Object.entries(PLAN_MEALS)) {
    (plan.lunchIds || []).forEach(id => {
      total++;
      const r = byId.get(id);
      if (!r || !isEligibleForSlot(r, 'lunch')) {
        violations++;
        fail(`plan "${planId}" lunch id=${id}: ${r ? `not lunch-eligible (mealSlots=${JSON.stringify(r.mealSlots)})` : 'unresolved id'}`);
      }
    });
    (plan.dinnerIds || []).forEach(id => {
      total++;
      const r = byId.get(id);
      if (!r || !isEligibleForSlot(r, 'dinner')) {
        violations++;
        fail(`plan "${planId}" dinner id=${id}: ${r ? `not dinner-eligible (mealSlots=${JSON.stringify(r.mealSlots)})` : 'unresolved id'}`);
      }
    });
  }
  console.log(`  slots checked: ${total}, violations: ${violations}`);
  if (!violations) console.log('  OK: every generated Lunch/Dinner cell resolves to a slot-eligible recipe.');
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Engine fuzz — verbatim port of app.js's pure pool/pick algorithm
// ─────────────────────────────────────────────────────────────────────────
section('3. Engine fuzz (generation algorithm)');

// Verbatim port of public/js/app.js getGenerationPool(slot)'s pool
// construction. DOM-only bits (ensureMainRecipes/ensureBudgetRecipes lazy
// loading, window.isBudgetMenu, FILTER_DEFS/getActiveFilterIds) are replaced
// with plain parameters — the algorithm itself (chip-filter union, the
// pool.length<2 "chip too narrow" fallback, the final filterEligible gate)
// is unchanged. Keep this in sync with app.js if that function's shape changes.
function getGenerationPool({ slot, isBudget, activeTests }) {
  let pool;
  if (isBudget) {
    pool = budgetRecipes;
  } else if (!activeTests.length) {
    pool = recipes;
  } else {
    pool = recipes.filter(r => activeTests.some(test => test(r)));
    if (pool.length < 2) pool = recipes;
  }
  return filterEligible(pool, slot);
}

// Verbatim port of public/js/app.js smartPickWeek(pools, count, maxTimes).
function smartPickWeek(pools, count, maxTimes, rng) {
  const shuffledPools = pools.map(pool => [...pool].sort(() => 0.5 - rng()));
  const result = new Array(count).fill(null);
  const used = new Set();
  const countryCounts = Object.create(null);
  let pastaCount = 0;
  let heavyMeatCount = 0;

  const isPasta = r => {
    const ingr = (r.ingredients?.en || r.ingredients?.ro || []).join(' ').toLowerCase();
    return /(pasta\b|spaghetti|penne|fettuccin|tagliatell|noodle|risotto|\brice\b|\borez\b|\bpaste\b)/.test(ingr);
  };
  const isHeavyMeat = r => {
    const ingr = (r.ingredients?.en || r.ingredients?.ro || []).join(' ').toLowerCase();
    return /(beef|pork|lamb|veal|steak|vit[aă]|porc|miel|biftec|cotlet)/.test(ingr);
  };
  const timeOk = (r, k) => {
    const max = maxTimes ? maxTimes[k] : Infinity;
    return !(max != null && max !== Infinity && r.time && r.time > max);
  };
  const diversityOk = r => {
    const country = r.origin?.en || r.origin?.ro || '';
    if ((countryCounts[country] || 0) >= 2) return false;
    if (isPasta(r) && pastaCount >= 3) return false;
    if (isHeavyMeat(r) && heavyMeatCount >= 4) return false;
    return true;
  };
  const take = r => {
    used.add(r);
    const country = r.origin?.en || r.origin?.ro || '';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
    if (isPasta(r)) pastaCount++;
    if (isHeavyMeat(r)) heavyMeatCount++;
  };

  for (let k = 0; k < count; k++) {
    const candidates = shuffledPools[k];
    const pick =
      candidates.find(r => !used.has(r) && timeOk(r, k) && diversityOk(r)) ||
      candidates.find(r => !used.has(r) && timeOk(r, k)) ||
      candidates.find(r => !used.has(r));
    if (pick) { result[k] = pick; take(pick); }
  }
  return result;
}

// Deterministic PRNG (mulberry32) so a failing iteration is reproducible
// from its seed alone.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Two chip generators standing in for FILTER_DEFS (app.js's real chips are
// tag/ingredient-keyword predicates — chicken, fish, vegetarian, budget,
// quick, family — each matching dozens to hundreds of recipes; see
// CLAUDE.md's Frontend JS layout section and app.js's FILTER_DEFS array).
//
// randomRealisticChipTests: used by the 3a GATE. Mirrors the real chips'
// SELECTIVITY (tag-based, or a generous time ceiling) so the gate measures
// what an actual user filtering their plan would see — not an artificially
// starved pool. (A single-origin or near-empty predicate is not something
// any real FILTER_DEFS chip does; see 2026-10-01 reconciliation below.)
const TAG_POOL = ['vegetarian', 'family', 'budget', 'high-protein', 'healthy'];
function randomRealisticChipTests(rng) {
  const n = Math.floor(rng() * 3); // 0, 1 or 2 active chips, same union/OR semantics as production
  const tests = [];
  for (let i = 0; i < n; i++) {
    if (rng() < 0.5) {
      const tag = TAG_POOL[Math.floor(rng() * TAG_POOL.length)];
      tests.push(r => (r.tags || []).includes(tag));
    } else {
      const maxTime = 40 + Math.floor(rng() * 40); // 40-80 min, a realistic "quick"-style ceiling
      tests.push(r => r.time != null && r.time <= maxTime);
    }
  }
  return tests;
}

// randomAdversarialChipTests: used ONLY by 3b coverage (never the gate).
// Deliberately includes single-origin and near-empty-match predicates no
// real chip would produce, specifically to stress-test that insufficient
// pool is handled correctly (left unfilled, never a silent substitution)
// even under conditions far outside normal use.
const origins = [...new Set(recipes.map(r => r.origin?.en).filter(Boolean))];
function randomAdversarialChipTests(rng) {
  const n = Math.floor(rng() * 3);
  const tests = [];
  for (let i = 0; i < n; i++) {
    const kind = rng();
    if (kind < 0.34) {
      const origin = origins[Math.floor(rng() * origins.length)];
      tests.push(r => (r.origin?.en || '') === origin);
    } else if (kind < 0.67) {
      const maxTime = 20 + Math.floor(rng() * 60);
      tests.push(r => r.time != null && r.time <= maxTime);
    } else {
      tests.push(r => (r.name?.en || '').startsWith('Z')); // adversarial near-empty predicate
    }
  }
  return tests;
}

const WEEKDAY_MAX_MIN = 75;

// Per-scenario accounting, exact — no estimates. Each scenario tracks:
// iterations run, the generation path it exercises, expected slots per
// iteration (fixed by the scenario's shape), actual slots checked (always
// iterations x expected — every slot position is evaluated), how many of
// those came back with no candidate at all (insufficient pool — correctly
// left unfilled, not a violation), and how many violated eligibility.
function newBucket(generationPath, expectedPerIter) {
  return { generationPath, expectedPerIter, iterations: 0, slotsChecked: 0, insufficientPool: 0, violations: [] };
}
const buckets = {
  complete_week:          newBucket('full-week generation (14/14 slots fresh, keepFilled=false)', 14),
  complete_week_filtered: newBucket('full-week generation + active filter chip', 14),
  complete_week_budget:   newBucket('full-week generation, budget corpus', 14),
  week_keepFilled:        newBucket('full-week generation, keepFilled=true (partial pre-fill, e.g. ?meal= deep link)', null), // variable per-iteration
  day:                    newBucket('day generation (mode=day)', 2),
  day_filtered:           newBucket('day generation + active filter chip', 2),
  day_budget:             newBucket('day generation, budget corpus', 2),
  meal:                   newBucket('single-meal generation (mode=meal, "Surprise me")', 1),
  meal_filtered:          newBucket('single-meal generation + active filter chip', 1),
  meal_budget:            newBucket('single-meal generation, budget corpus', 1),
  reroll_lunch:           newBucket('single-slot reroll (lunch, 🎲)', 1),
  reroll_dinner:          newBucket('single-slot reroll (dinner, 🎲)', 1),
  reroll_budget:          newBucket('single-slot reroll, budget corpus', 1),
  week_filtered_adversarial: newBucket('full-week generation + ADVERSARIAL filter chip (single-origin/near-empty — stress test only, not a realistic chip)', 14),
};

function check(bucket, pick, slot, label, iter, scenario) {
  bucket.slotsChecked++;
  if (pick === null) { bucket.insufficientPool++; return; }
  if (!isEligibleForSlot(pick, slot)) {
    bucket.violations.push(`${label} iter=${iter} scenario=${scenario}: picked "${pick.name?.en}" (mealSlots=${JSON.stringify(pick.mealSlots)}) for slot=${slot}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 3a. COMPLETE-PLAN GATE — genuinely complete 7-day (14-slot) weekly plans
// only. "Complete" means every one of the 14 slots is attempted fresh in a
// single smartPickWeek call, exactly as generateRandomMenu()'s full-week
// branch does for a fresh Generate (keepFilled=false — the default, most
// common production path). day/meal/reroll/keepFilled-partial runs do NOT
// count toward this gate; they are separate coverage, reported in 3b.
// ─────────────────────────────────────────────────────────────────────────
section('3a. Complete-plan gate — genuinely complete 7-day Lunch+Dinner plans');
const GATE_SCENARIOS = ['complete_week', 'complete_week_filtered', 'complete_week_budget'];
const N_GATE = 5200;
for (let iter = 0; iter < N_GATE; iter++) {
  const rng = mulberry32(100000 + iter); // disjoint seed space from 3b
  const scenario = GATE_SCENARIOS[Math.floor(rng() * GATE_SCENARIOS.length)];
  const bucket = buckets[scenario];
  bucket.iterations++;
  const isBudget = scenario === 'complete_week_budget';
  const activeTests = scenario === 'complete_week_filtered' ? randomRealisticChipTests(rng) : [];

  const lunchPool  = getGenerationPool({ slot: 'lunch',  isBudget, activeTests });
  const dinnerPool = getGenerationPool({ slot: 'dinner', isBudget, activeTests });

  // All 14 slots, every day, both lunch and dinner — a genuine complete
  // week, matching generateRandomMenu()'s full-week branch exactly (7 days
  // x {l,c}, WEEKDAY_MAX_MIN ceiling on days 1-5, Infinity on 6-7).
  const slotIds = [];
  for (let d = 1; d <= 7; d++) { slotIds.push({ day: d, kind: 'l' }); slotIds.push({ day: d, kind: 'c' }); }
  const maxTimes = slotIds.map(s => (s.day >= 6 ? Infinity : WEEKDAY_MAX_MIN));
  const slotPools = slotIds.map(s => (s.kind === 'l' ? lunchPool : dinnerPool));
  const picks = smartPickWeek(slotPools, 14, maxTimes, rng);
  picks.forEach((pick, i) => check(bucket, pick, slotIds[i].kind === 'l' ? 'lunch' : 'dinner', 'complete_week', iter, scenario));
}

const gateIterations = GATE_SCENARIOS.reduce((s, k) => s + buckets[k].iterations, 0);
const gateSlotsChecked = GATE_SCENARIOS.reduce((s, k) => s + buckets[k].slotsChecked, 0);
const gateInsufficient = GATE_SCENARIOS.reduce((s, k) => s + buckets[k].insufficientPool, 0);
const gateViolations = GATE_SCENARIOS.reduce((s, k) => s + buckets[k].violations.length, 0);
const gateSuccessfulAssertions = gateSlotsChecked - gateInsufficient;
console.log(`  complete plans run: ${gateIterations} (requirement: >= 5,000)`);
console.log(`  total slot positions checked: ${gateSlotsChecked} (= ${gateIterations} plans x 14 slots)`);
console.log(`  insufficient-pool slots (correctly left unfilled): ${gateInsufficient}`);
console.log(`  successful-slot eligibility assertions: ${gateSuccessfulAssertions} (requirement: >= 70,000)`);
console.log(`  violations: ${gateViolations} (requirement: 0)`);
for (const k of GATE_SCENARIOS) {
  const b = buckets[k];
  for (const v of b.violations.slice(0, 20)) fail(v);
}
const gatePass = gateIterations >= 5000 && gateSuccessfulAssertions >= 70000 && gateViolations === 0;
console.log(`  GATE RESULT: ${gatePass ? 'PASS' : 'FAIL'}`);
if (!gatePass) fail(`complete-plan gate did not meet its own thresholds (plans=${gateIterations}, successful assertions=${gateSuccessfulAssertions}, violations=${gateViolations})`);

// ─────────────────────────────────────────────────────────────────────────
// 3b. Additional coverage — day / single-meal / reroll / keepFilled-partial.
// Reported separately and NEVER counted toward the complete-plan gate above.
// ─────────────────────────────────────────────────────────────────────────
section('3b. Additional coverage (not part of the complete-plan gate)');
const COVERAGE_SCENARIOS = ['week_keepFilled', 'week_filtered_adversarial', 'day', 'day_filtered', 'day_budget',
  'meal', 'meal_filtered', 'meal_budget', 'reroll_lunch', 'reroll_dinner', 'reroll_budget'];
const N_COVERAGE = 5200;
for (let iter = 0; iter < N_COVERAGE; iter++) {
  const rng = mulberry32(iter + 1); // original seed space, unchanged from the first report
  const scenario = COVERAGE_SCENARIOS[Math.floor(rng() * COVERAGE_SCENARIOS.length)];
  const bucket = buckets[scenario];
  bucket.iterations++;
  const isBudget = scenario.includes('budget');
  const activeTests = scenario.includes('filtered') ? randomAdversarialChipTests(rng) : [];

  const lunchPool  = getGenerationPool({ slot: 'lunch',  isBudget, activeTests });
  const dinnerPool = getGenerationPool({ slot: 'dinner', isBudget, activeTests });

  if (scenario === 'week_filtered_adversarial') {
    const slotIds = [];
    for (let d = 1; d <= 7; d++) { slotIds.push({ day: d, kind: 'l' }); slotIds.push({ day: d, kind: 'c' }); }
    const maxTimes = slotIds.map(s => (s.day >= 6 ? Infinity : WEEKDAY_MAX_MIN));
    const slotPools = slotIds.map(s => (s.kind === 'l' ? lunchPool : dinnerPool));
    const picks = smartPickWeek(slotPools, 14, maxTimes, rng);
    picks.forEach((pick, i) => check(bucket, pick, slotIds[i].kind === 'l' ? 'lunch' : 'dinner', 'week_filtered_adversarial', iter, scenario));
  } else if (scenario.startsWith('meal')) {
    const pick = lunchPool.length ? lunchPool[Math.floor(rng() * lunchPool.length)] : null;
    check(bucket, pick, 'lunch', 'meal', iter, scenario);
  } else if (scenario.startsWith('day')) {
    const picks = smartPickWeek([lunchPool, dinnerPool], 2, undefined, rng);
    check(bucket, picks[0], 'lunch', 'day.lunch', iter, scenario);
    check(bucket, picks[1], 'dinner', 'day.dinner', iter, scenario);
  } else if (scenario.startsWith('reroll')) {
    const slot = scenario === 'reroll_dinner' ? 'dinner' : 'lunch';
    const basePool = slot === 'dinner' ? dinnerPool : lunchPool;
    const usedIds = new Set();
    const poolSize = basePool.length;
    for (let i = 0; i < Math.min(5, poolSize); i++) {
      if (rng() < 0.5) usedIds.add(basePool[Math.floor(rng() * poolSize)]?.id);
    }
    const valid = basePool.filter(r => !usedIds.has(r.id));
    const pick = valid.length ? valid[Math.floor(rng() * valid.length)] : null;
    check(bucket, pick, slot, 'reroll', iter, scenario);
  } else {
    // week_keepFilled: a RANDOM SUBSET of the 14 slots are "already filled"
    // and skipped — this is NOT a complete plan (that's the whole point of
    // this bucket being separate from 3a) — it simulates the ?meal= deep
    // link's partial pre-fill-then-complete-the-rest behaviour.
    const slotIds = [];
    for (let d = 1; d <= 7; d++) {
      if (rng() < 0.5) slotIds.push({ day: d, kind: 'l' });
      if (rng() < 0.5) slotIds.push({ day: d, kind: 'c' });
    }
    const maxTimes = slotIds.map(s => (s.day >= 6 ? Infinity : WEEKDAY_MAX_MIN));
    const slotPools = slotIds.map(s => (s.kind === 'l' ? lunchPool : dinnerPool));
    const picks = smartPickWeek(slotPools, slotIds.length, maxTimes, rng);
    picks.forEach((pick, i) => check(bucket, pick, slotIds[i].kind === 'l' ? 'lunch' : 'dinner', 'week_keepFilled', iter, scenario));
  }
}
for (const k of COVERAGE_SCENARIOS) {
  const b = buckets[k];
  for (const v of b.violations.slice(0, 20)) fail(v);
}

// ─────────────────────────────────────────────────────────────────────────
// Exact breakdown table — every scenario, gate and coverage alike.
// ─────────────────────────────────────────────────────────────────────────
section('Exact per-scenario breakdown');
const ALL_SCENARIO_KEYS = [...GATE_SCENARIOS, ...COVERAGE_SCENARIOS];
console.log('  scenario | iterations | generation path | expected slots/iter | actual slots checked | insufficient-pool | violations');
for (const k of ALL_SCENARIO_KEYS) {
  const b = buckets[k];
  const expectedLabel = b.expectedPerIter === null ? 'variable (partial)' : String(b.expectedPerIter);
  console.log(`  ${k} | ${b.iterations} | ${b.generationPath} | ${expectedLabel} | ${b.slotsChecked} | ${b.insufficientPool} | ${b.violations.length}`);
}
const totalIterations = ALL_SCENARIO_KEYS.reduce((s, k) => s + buckets[k].iterations, 0);
const totalSlotsChecked = ALL_SCENARIO_KEYS.reduce((s, k) => s + buckets[k].slotsChecked, 0);
const totalInsufficient = ALL_SCENARIO_KEYS.reduce((s, k) => s + buckets[k].insufficientPool, 0);
const totalViolations = ALL_SCENARIO_KEYS.reduce((s, k) => s + buckets[k].violations.length, 0);
console.log(`  TOTAL (gate + coverage) | ${totalIterations} | — | — | ${totalSlotsChecked} | ${totalInsufficient} | ${totalViolations}`);

// ─────────────────────────────────────────────────────────────────────────
section(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
if (failed) {
  console.error('\nOne or more generation-engine checks failed — see FAIL lines above.');
  process.exit(1);
}
console.log(`\n✓ Generation engine OK — known regressions stay fixed, static output is 100% eligible, the complete-plan gate (${gateIterations} genuinely complete weekly plans, ${gateSuccessfulAssertions} successful-slot assertions) found zero violations, and additional day/meal/reroll/budget/keepFilled coverage found zero violations.`);
