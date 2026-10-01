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
// DIVERSITY INVARIANT (Stage 4B addendum, added after the duplicate-PDF
// investigation). Protects the EXISTING `used`-Set generation behavior — the
// live-browser + 12,000-plan audit found it already holds unconditionally;
// this makes that guarantee an explicit, permanent assertion instead of an
// untested emergent property, so a future change to smartPickWeek can't
// silently reintroduce reuse without this gate catching it.
//
// Two separate mechanisms, never conflated by this code:
//   - `mealSlots` (mealEligibility.js) is semantic ELIGIBILITY: which POOL a
//     recipe may be drawn from for a given slot. HARD, never relaxed, tested
//     by check() above. This section does not touch it.
//   - `used` (inside smartPickWeek, this file's port + app.js's real one) is
//     exact-recipe DIVERSITY: once a recipe object is picked anywhere in a
//     call, every one of smartPickWeek's three fallback tiers still filters
//     on `!used.has(r)`, so it can never be picked again in that same call.
//     This is what this section tests.
//
// A duplicate recipeId is treated as an unconditional violation below, not a
// conditional "only if a candidate was available" one: the current engine's
// `used` Set has no bypass at ANY fallback tier, so it structurally cannot
// reuse a recipe even when a position's pool is genuinely exhausted — the
// correct degradation there is an unfilled slot (already measured by
// `insufficientPool` above). "While sufficient eligible unused candidates
// exist" is therefore equivalent, for this engine as it exists today, to
// "always" — confirmed, not assumed: see the Budget+Breakfast case in 3d.
// ─────────────────────────────────────────────────────────────────────────
function newDiversityTracker(label) {
  return { label, plansChecked: 0, plansWithWeekDuplicate: 0, plansWithSameDayDuplicate: 0, weekViolations: [], sameDayViolations: [] };
}
// `slotIds` is the same array already built by each caller to drive
// smartPickWeek — reused here purely to recover each position's day, no
// separate construction, no separate port of the picking logic.
function recordDiversity(tracker, picks, slotIds, scenario, iter) {
  tracker.plansChecked++;
  const seenAt = new Map(); // recipeId -> first slot index it was picked at
  let weekDup = false;
  picks.forEach((p, i) => {
    if (!p) return;
    if (seenAt.has(p.id)) {
      weekDup = true;
      tracker.weekViolations.push(`${scenario} iter=${iter}: recipeId ${p.id} picked twice (positions ${seenAt.get(p.id)} and ${i}) within one week`);
    } else {
      seenAt.set(p.id, i);
    }
  });
  if (weekDup) tracker.plansWithWeekDuplicate++;

  const byDay = new Map();
  slotIds.forEach((s, i) => { if (!byDay.has(s.day)) byDay.set(s.day, []); byDay.get(s.day).push(i); });
  let sameDayDup = false;
  for (const [day, idxs] of byDay) {
    const ids = idxs.map(i => picks[i]).filter(Boolean).map(p => p.id);
    if (new Set(ids).size < ids.length) {
      sameDayDup = true;
      tracker.sameDayViolations.push(`${scenario} iter=${iter} day=${day}: same-day slots share a recipeId (${JSON.stringify(ids)})`);
    }
  }
  if (sameDayDup) tracker.plansWithSameDayDuplicate++;
}
function reportDiversity(tracker) {
  console.log(`  ${tracker.label}: plans checked=${tracker.plansChecked}, plans with a within-week duplicate recipeId=${tracker.plansWithWeekDuplicate}, plans with a same-day duplicate=${tracker.plansWithSameDayDuplicate}`);
  tracker.weekViolations.slice(0, 20).forEach(v => fail(v));
  tracker.sameDayViolations.slice(0, 20).forEach(v => fail(v));
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
const diversityGate = newDiversityTracker('Lunch+Dinner gate (3a)');
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
  recordDiversity(diversityGate, picks, slotIds, scenario, iter);
}

console.log('\n  --- Diversity invariant (Lunch+Dinner gate, same ' + N_GATE + ' plans above) ---');
reportDiversity(diversityGate);

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

// ═════════════════════════════════════════════════════════════════════════
// STAGE 4 — Breakfast gate + starvation coverage. Appended entirely below
// the Stage 3 gate/coverage/breakdown above, which is reported UNCHANGED
// (same thresholds, same scenarios, same math) — Stage 4's numbers are never
// commingled with Stage 3's, exactly the separation precedent the Stage 3
// reconciliation established for gate vs. coverage.
// ═════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// 3c. Breakfast gate — genuinely complete 7-day x 3-meal (21-slot) plans,
// Breakfast enabled. Verbatim port of generateRandomMenu()'s week branch AS
// CHANGED by Stage 4: ONE shared smartPickWeek call across all 21 slots in
// day-major order (breakfast, lunch, dinner) x day 1..7 — NOT three
// independent calls — so diversity counters (max 2/country, max 3 pasta,
// max 4 heavy-meat) are shared across all three meal kinds per week, exactly
// as the live app does (see app.js generateRandomMenu, "poolByKind" +
// activeSlotKinds()). getGenerationPool/smartPickWeek above are reused
// UNMODIFIED — slot is already a free-form string to both, 'breakfast'
// needed no new code path in either.
// ─────────────────────────────────────────────────────────────────────────
section('3c. Breakfast gate (Stage 4) — genuinely complete 7-day x 3-meal (21-slot) plans');
const breakfastBuckets = {
  complete_week_breakfast:          newBucket('full-week generation, Breakfast ON (21/21 slots fresh)', 21),
  complete_week_breakfast_filtered: newBucket('full-week generation, Breakfast ON + a realistic filter chip', 21),
  complete_week_breakfast_starved:  newBucket('full-week generation, Breakfast ON + a chip measured (Stage 4A audit) to starve the breakfast pool below 7 candidates', 21),
};
// The 5 filter chips the Stage 4A audit measured as yielding fewer than 7
// breakfast-eligible recipes (chicken=2, meat=4, fish=5, asian=5, quick=5 —
// see FILTER_DEFS in app.js for the real predicates these mirror exactly).
const STARVING_CHIP_TESTS = {
  chicken: r => /(pui|piept de pui|carne de pui|chicken|poultry)/.test((r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase()),
  meat: r => {
    const i = (r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase();
    return /(vit[ăa]|carne de vit|biftec|porc|cotlet|cârnați|miel|beef|pork|steak|lamb|veal)/.test(i) && !/(pui|piept de pui|chicken)/.test(i);
  },
  fish: r => /(pește|somon|ton\b|creveți|dorad|crap|macrou|tilapia|cod\b|fish|salmon|tuna|shrimp|prawn|trout|sea bass)/.test((r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase()),
  asian: r => ['Japonia', 'Coreea de Sud', 'China', 'Vietnam', 'Thailanda', 'India', 'Indonezia'].includes(r.origin?.ro),
  quick: r => (r.time || 999) <= 30,
};
const STARVING_CHIP_IDS = Object.keys(STARVING_CHIP_TESTS);

const N_BREAKFAST_GATE = 5200;
const diversityBreakfastGate = newDiversityTracker('Breakfast gate (3c)');
for (let iter = 0; iter < N_BREAKFAST_GATE; iter++) {
  const rng = mulberry32(400000 + iter); // disjoint seed space from both 3a and 3b above
  const scenarioKeys = Object.keys(breakfastBuckets);
  const scenario = scenarioKeys[Math.floor(rng() * scenarioKeys.length)];
  const bucket = breakfastBuckets[scenario];
  bucket.iterations++;

  let activeTests = [];
  if (scenario === 'complete_week_breakfast_filtered') activeTests = randomRealisticChipTests(rng);
  if (scenario === 'complete_week_breakfast_starved') {
    const chipId = STARVING_CHIP_IDS[Math.floor(rng() * STARVING_CHIP_IDS.length)];
    activeTests = [STARVING_CHIP_TESTS[chipId]];
  }

  const breakfastPool = getGenerationPool({ slot: 'breakfast', isBudget: false, activeTests });
  const lunchPool     = getGenerationPool({ slot: 'lunch',     isBudget: false, activeTests });
  const dinnerPool    = getGenerationPool({ slot: 'dinner',    isBudget: false, activeTests });
  const poolByKind = { b: breakfastPool, l: lunchPool, c: dinnerPool };
  const KIND_SLOT = { b: 'breakfast', l: 'lunch', c: 'dinner' };

  const slotIds = [];
  for (let d = 1; d <= 7; d++) {
    slotIds.push({ day: d, kind: 'b' });
    slotIds.push({ day: d, kind: 'l' });
    slotIds.push({ day: d, kind: 'c' });
  }
  const maxTimes = slotIds.map(s => (s.day >= 6 ? Infinity : WEEKDAY_MAX_MIN));
  const slotPools = slotIds.map(s => poolByKind[s.kind]);
  const picks = smartPickWeek(slotPools, 21, maxTimes, rng);
  picks.forEach((pick, i) => check(bucket, pick, KIND_SLOT[slotIds[i].kind], 'complete_week_breakfast', iter, scenario));
  recordDiversity(diversityBreakfastGate, picks, slotIds, scenario, iter);
}

console.log('\n  --- Diversity invariant (Breakfast gate, same ' + N_BREAKFAST_GATE + ' plans above; same-day = b/l/c mutually distinct) ---');
reportDiversity(diversityBreakfastGate);

const BREAKFAST_GATE_KEYS = Object.keys(breakfastBuckets);
const bfGateIterations = BREAKFAST_GATE_KEYS.reduce((s, k) => s + breakfastBuckets[k].iterations, 0);
const bfGateSlotsChecked = BREAKFAST_GATE_KEYS.reduce((s, k) => s + breakfastBuckets[k].slotsChecked, 0);
const bfGateInsufficient = BREAKFAST_GATE_KEYS.reduce((s, k) => s + breakfastBuckets[k].insufficientPool, 0);
const bfGateViolations = BREAKFAST_GATE_KEYS.reduce((s, k) => s + breakfastBuckets[k].violations.length, 0);
console.log('  scenario | iterations | expected slots/iter | actual slots checked | insufficient-pool | violations');
for (const k of BREAKFAST_GATE_KEYS) {
  const b = breakfastBuckets[k];
  console.log(`  ${k} | ${b.iterations} | ${b.expectedPerIter} | ${b.slotsChecked} | ${b.insufficientPool} | ${b.violations.length}`);
  for (const v of b.violations.slice(0, 20)) fail(v);
}
console.log(`  complete 21-slot plans run: ${bfGateIterations}`);
console.log(`  total slot positions checked: ${bfGateSlotsChecked} (= ${bfGateIterations} plans x 21 slots)`);
console.log(`  insufficient-pool slots (correctly left unfilled, never substituted): ${bfGateInsufficient}`);
console.log(`  violations (a pick ineligible for the exact slot it was picked for): ${bfGateViolations} (requirement: 0)`);
const breakfastGatePass = bfGateViolations === 0;
console.log(`  BREAKFAST GATE RESULT: ${breakfastGatePass ? 'PASS' : 'FAIL'}`);
if (!breakfastGatePass) fail(`breakfast gate found ${bfGateViolations} eligibility violation(s)`);

// ─────────────────────────────────────────────────────────────────────────
// 3d. Exact starvation reproduction — ONE deterministic 21-slot plan per
// starving chip (no randomness in which chip runs — only the pick order
// within an already-narrow pool is seeded), reporting the EXACT breakfast
// fill count against the Stage 4A audit's measured pool sizes. This is the
// "report exact starvation behavior" requirement: a reader can check these
// numbers against the audit table directly, not infer them from a fuzz run.
// ─────────────────────────────────────────────────────────────────────────
section('3d. Exact starvation reproduction (one deterministic run per starving chip)');
const MEASURED_BREAKFAST_POOL_SIZE = { chicken: 2, meat: 4, fish: 5, asian: 5, quick: 5 }; // Stage 4A audit §5
console.log('  chip | measured breakfast pool (Stage 4A audit) | breakfast slots filled | breakfast slots left empty | any lunch/dinner-only recipe picked for breakfast?');
let starvationReproFailed = false;
const diversityStarvation = newDiversityTracker('Starvation reproduction (3d) — per-chip + Budget+Breakfast');
for (const chipId of STARVING_CHIP_IDS) {
  const rng = mulberry32(900000 + chipId.length);
  const activeTests = [STARVING_CHIP_TESTS[chipId]];
  const breakfastPool = getGenerationPool({ slot: 'breakfast', isBudget: false, activeTests });
  const lunchPool     = getGenerationPool({ slot: 'lunch',     isBudget: false, activeTests });
  const dinnerPool    = getGenerationPool({ slot: 'dinner',    isBudget: false, activeTests });
  const poolByKind = { b: breakfastPool, l: lunchPool, c: dinnerPool };
  const slotIds = [];
  for (let d = 1; d <= 7; d++) { slotIds.push({ day: d, kind: 'b' }); slotIds.push({ day: d, kind: 'l' }); slotIds.push({ day: d, kind: 'c' }); }
  const maxTimes = slotIds.map(s => (s.day >= 6 ? Infinity : WEEKDAY_MAX_MIN));
  const slotPools = slotIds.map(s => poolByKind[s.kind]);
  const picks = smartPickWeek(slotPools, 21, maxTimes, rng);
  let filled = 0, empty = 0, badSubstitution = false;
  picks.forEach((pick, i) => {
    if (slotIds[i].kind !== 'b') return;
    if (pick === null) { empty++; return; }
    filled++;
    if (!isEligibleForSlot(pick, 'breakfast')) badSubstitution = true; // the thing that must NEVER happen
  });
  if (filled > breakfastPool.length) badSubstitution = true; // filled more breakfast slots than the eligible pool can distinctly supply without reuse-past-eligibility
  recordDiversity(diversityStarvation, picks, slotIds, `starved_${chipId}`, 0);
  console.log(`  ${chipId} | ${breakfastPool.length} (expect ${MEASURED_BREAKFAST_POOL_SIZE[chipId]}) | ${filled} | ${empty} | ${badSubstitution}`);
  if (breakfastPool.length !== MEASURED_BREAKFAST_POOL_SIZE[chipId]) {
    fail(`${chipId}: breakfast pool size drifted from the Stage 4A audit's measured ${MEASURED_BREAKFAST_POOL_SIZE[chipId]} to ${breakfastPool.length} — recipe data changed since the audit; update MEASURED_BREAKFAST_POOL_SIZE if intentional`);
  }
  if (badSubstitution) { starvationReproFailed = true; fail(`${chipId}: a breakfast slot was filled with a non-breakfast-eligible recipe — HARD eligibility was relaxed`); }
  if (filled > 7) { starvationReproFailed = true; fail(`${chipId}: ${filled} breakfast slots filled but only 7 exist in a week — impossible, investigate`); }
}
console.log(`  STARVATION REPRODUCTION RESULT: ${starvationReproFailed ? 'FAIL' : 'PASS'} (every starving chip left the pool-exceeding slots empty, never substituted)`);
console.log('\n  --- Diversity invariant (requirement 4: starvation must leave slots empty, never reuse) ---');

// The single most severe starvation case the Stage 4A audit identified:
// Budget + Breakfast together, breakfast pool = 3 recipes total (vs 7
// slots/week) — deterministic, not fuzzed, same "never substitute" proof.
{
  const rng = mulberry32(950001);
  const breakfastPool = getGenerationPool({ slot: 'breakfast', isBudget: true, activeTests: [] });
  const lunchPool     = getGenerationPool({ slot: 'lunch',     isBudget: true, activeTests: [] });
  const dinnerPool    = getGenerationPool({ slot: 'dinner',    isBudget: true, activeTests: [] });
  const poolByKind = { b: breakfastPool, l: lunchPool, c: dinnerPool };
  const slotIds = [];
  for (let d = 1; d <= 7; d++) { slotIds.push({ day: d, kind: 'b' }); slotIds.push({ day: d, kind: 'l' }); slotIds.push({ day: d, kind: 'c' }); }
  const maxTimes = slotIds.map(s => (s.day >= 6 ? Infinity : WEEKDAY_MAX_MIN));
  const slotPools = slotIds.map(s => poolByKind[s.kind]);
  const picks = smartPickWeek(slotPools, 21, maxTimes, rng);
  let filled = 0, empty = 0, badSubstitution = false;
  picks.forEach((pick, i) => {
    if (slotIds[i].kind !== 'b') return;
    if (pick === null) { empty++; return; }
    filled++;
    if (!isEligibleForSlot(pick, 'breakfast')) badSubstitution = true;
  });
  console.log(`\n  Budget + Breakfast (most severe case): breakfast pool=${breakfastPool.length} (expect 3) | filled=${filled} | empty=${empty} | bad substitution=${badSubstitution}`);
  if (breakfastPool.length !== 3) fail(`Budget breakfast pool drifted from the audit's measured 3 to ${breakfastPool.length}`);
  if (badSubstitution) fail('Budget + Breakfast: a non-breakfast-eligible (or non-budget) recipe filled a breakfast slot');
  if (filled > breakfastPool.length) fail(`Budget + Breakfast: ${filled} breakfast slots filled but the eligible pool only has ${breakfastPool.length} distinct recipes`);
  if (!badSubstitution && filled <= breakfastPool.length) console.log('  OK: Budget + Breakfast leaves the pool-exceeding slots empty, never substitutes a non-breakfast recipe');
  recordDiversity(diversityStarvation, picks, slotIds, 'budget_breakfast', 0);
}
reportDiversity(diversityStarvation);

// ─────────────────────────────────────────────────────────────────────────
section(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
if (failed) {
  console.error('\nOne or more generation-engine checks failed — see FAIL lines above.');
  process.exit(1);
}
console.log(`\n✓ Generation engine OK — known regressions stay fixed, static output is 100% eligible, the complete-plan gate (${gateIterations} genuinely complete weekly plans, ${gateSuccessfulAssertions} successful-slot assertions) found zero violations, and additional day/meal/reroll/budget/keepFilled coverage found zero violations.`);
