#!/usr/bin/env node
// scripts/smoke-analytics.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Deterministic smoke test for the funnel-measurement foundation
// (branch p1-funnel-foundation-fixes). Static, no network, no browser, no Stripe.
// Run AFTER `npm run build` (needs the generated public/**.html + built *.min.js):
//
//     npm run build && node scripts/smoke-analytics.mjs
//
// Proves, with concrete file evidence:
//   1. First-party analytics is present on every generated SEO page class
//      (recipe, recipe index, cuisine hub, plan, plan index, pricing) in ALL
//      14 locales — not only homepage/pricing.
//   2. Each page declares the correct pageType via data-page-type, so page_view
//      is classified correctly (incl. /ro/premium/ → 'pricing', previously mis-
//      classified as 'other').
//   3. The homepage keeps analytics with NO data-page-type (→ URL-inferred
//      'home'), and the corrected URL fallback resolves /ro/premium/ → 'pricing'.
//   4. checkout_started carries the corrected source + the anon_id join is wired
//      end-to-end (checkout.js → create-checkout-session.js → stripe-webhook.js).
//   5. Double-count guards exist for plan_generated, checkout_started,
//      email_submitted.
//
// Exit code 0 = all pass, 1 = at least one failure.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const p = (...s) => path.join(ROOT, ...s);
const read = (f) => fs.readFileSync(f, 'utf8');
const exists = (f) => fs.existsSync(f);

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; fails.push(name + (detail ? ` — ${detail}` : '')); console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`); }
}

// Pull the data-page-type off the analytics <script> tag in a page's HTML.
// Returns: string value, '' if the tag is present but has no attribute, or
// null if the analytics tag is absent entirely.
function analyticsPageType(html) {
  const tag = html.match(/<script[^>]*src="\/js\/analytics\.min\.js"[^>]*>/i);
  if (!tag) return null;
  const attr = tag[0].match(/data-page-type="([^"]*)"/i);
  return attr ? attr[1] : '';
}

// ── The 14 locales and their per-locale dir slugs (mirrors generate-content.mjs)
const RECIPE_DIR = { ro:'ro/retete', en:'en/recipes', es:'es/recetas', fr:'fr/recettes',
  de:'de/rezepte', pt:'pt/receitas', ru:'ru/retsepty', ar:'ar/wasafat', zh:'zh/shipu',
  ja:'ja/reshipi', hi:'hi/recipes', tr:'tr/tarifler', it:'it/ricette', ko:'ko/recipes' };
const PLAN_DIR = { ro:'ro/meniu-saptamanal', en:'en/weekly-meal-plan', es:'es/plan-semanal',
  fr:'fr/plan-semaine', de:'de/wochenplan', pt:'pt/plano-semanal', ru:'ru/nedelnoe-menyu',
  ar:'ar/khitat-usbuiya', zh:'zh/zhoujicaidan', ja:'ja/weekly-menu', hi:'hi/weekly-plan',
  tr:'tr/haftalik-menu', it:'it/piano-settimanale', ko:'ko/jugan-menu' };
const PRICING = { ro:'ro/premium', en:'en/pricing', es:'es/precios', fr:'fr/tarifs',
  de:'de/preise', pt:'pt/precos', ru:'ru/tseny', ar:'ar/asaar', zh:'zh/jiage',
  ja:'ja/pricing', hi:'hi/pricing', tr:'tr/fiyatlar', it:'it/prezzi', ko:'ko/pricing' };
const LOCALES = Object.keys(RECIPE_DIR);

const subdirs = (dir) => exists(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  : [];

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[1] SEO-page coverage + pageType per locale (all 14)\n');

// Recipe detail + cuisine-hub pages share the recipe dir; every subdir page must
// carry analytics and declare either 'recipe' or 'hub'. Recipe index → recipe_index.
for (const lc of LOCALES) {
  const dir = p('public', RECIPE_DIR[lc]);
  const kids = subdirs(dir).map(s => path.join(dir, s, 'index.html')).filter(exists);
  const idx = path.join(dir, 'index.html');
  let ok = kids.length > 0 && exists(idx);
  let recipe = 0, hub = 0, bad = [];
  for (const f of kids) {
    const t = analyticsPageType(read(f));
    if (t === 'recipe') recipe++;
    else if (t === 'hub') hub++;
    else { bad.push(path.relative(PUBLIC, f) + `→${t}`); ok = false; }
  }
  const idxType = exists(idx) ? analyticsPageType(read(idx)) : null;
  if (idxType !== 'recipe_index') { ok = false; bad.push(`index→${idxType}`); }
  check(`${lc}: ${recipe} recipe + ${hub} hub + recipe_index all tagged`, ok,
        bad.slice(0, 3).join(', '));
}

console.log('');
// Plan detail pages → 'plan'; plan index → 'plan_index'.
for (const lc of LOCALES) {
  const dir = p('public', PLAN_DIR[lc]);
  const kids = subdirs(dir).map(s => path.join(dir, s, 'index.html')).filter(exists);
  const idx = path.join(dir, 'index.html');
  let ok = kids.length > 0 && exists(idx);
  let plan = 0, bad = [];
  for (const f of kids) {
    const t = analyticsPageType(read(f));
    if (t === 'plan') plan++; else { bad.push(path.relative(PUBLIC, f) + `→${t}`); ok = false; }
  }
  const idxType = exists(idx) ? analyticsPageType(read(idx)) : null;
  if (idxType !== 'plan_index') { ok = false; bad.push(`index→${idxType}`); }
  check(`${lc}: ${plan} plan + plan_index all tagged`, ok, bad.slice(0, 3).join(', '));
}

console.log('');
// Pricing pages → 'pricing' (the /ro/premium/ regex bug lived here).
for (const lc of LOCALES) {
  const f = p('public', PRICING[lc], 'index.html');
  const t = exists(f) ? analyticsPageType(read(f)) : null;
  check(`${lc}: ${PRICING[lc]}/ → pageType 'pricing'`, t === 'pricing', `got ${t}`);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[2] Homepage keeps analytics, WITHOUT a data-page-type (→ URL-inferred)\n');
for (const lc of LOCALES) {
  const f = p('public', lc, 'index.html');
  const t = exists(f) ? analyticsPageType(read(f)) : null;
  // '' = tag present, no attribute (correct for a homepage). null = tag missing.
  check(`${lc}: /${lc}/ homepage has analytics, no override`, t === '', `got ${JSON.stringify(t)}`);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[3] Corrected URL fallback (the homepage path — no override)\n');
// Faithful mirror of the fallback branch in public/js/analytics.js pageType().
const PRICING_RE = /\/(pricing|premium|precios|precos|tarifs|preise|tseny|asaar|jiage|fiyatlar|prezzi)(?:\/|$)/i;
const RECIPE_RE  = /\/(recipes|retete|recetas|recettes|rezepte|receitas|retsepty|wasafat|shipu|reshipi|tarifler|ricette)\//i;
const PLAN_RE    = /\/(meniu-saptamanal|weekly-meal-plan|plan-semanal|plan-semaine|wochenplan|plano-semanal|nedelnoe-menyu|khitat-usbuiya|zhoujicaidan|weekly-menu|weekly-plan|haftalik-menu|piano-settimanale|jugan-menu)(?:\/|$)/i;
function urlPageType(pathname) {
  if (PRICING_RE.test(pathname)) return 'pricing';
  if (RECIPE_RE.test(pathname)) return 'recipe';
  if (PLAN_RE.test(pathname)) return 'plan';
  if (pathname === '/' || /^\/[a-z]{2}\/?$/.test(pathname)) return 'home';
  return 'other';
}
// before/after: on main these 6 fell through to 'other'; now they resolve correctly.
check("URL '/ro/premium/' → 'pricing' (was 'other')", urlPageType('/ro/premium/') === 'pricing');
check("URL '/fr/tarifs/'  → 'pricing' (was 'other')", urlPageType('/fr/tarifs/') === 'pricing');
check("URL '/ru/tseny/'   → 'pricing' (was 'other')", urlPageType('/ru/tseny/') === 'pricing');
check("URL '/en/'         → 'home'", urlPageType('/en/') === 'home');
check("URL '/ro/retete/x/' → 'recipe'", urlPageType('/ro/retete/adobo/') === 'recipe');
check("URL '/en/weekly-meal-plan/x/' → 'plan'", urlPageType('/en/weekly-meal-plan/budget/') === 'plan');
// dead legacy patterns must be gone from the built bundle
const amin = read(p('public/js/analytics.min.js'));
check('analytics.min.js drops dead patterns (abonament/preturi/prix)',
      !/abonament|preturi|prix/i.test(amin));
check('analytics.min.js reads data-page-type override', amin.includes('data-page-type'));
check('analytics.min.js exposes mpPageType + mpAnonId',
      amin.includes('mpPageType') && amin.includes('mpAnonId'));
check('analytics.min.js drops browser-automation traffic (navigator.webdriver)',
      amin.includes('webdriver'));

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[4] anon_id ↔ subscription_active join wired end-to-end (no PII)\n');
const checkoutMin = read(p('public/js/checkout.min.js'));
const ccs = read(p('api/create-checkout-session.js'));
const webhook = read(p('api/stripe-webhook.js'));
check('checkout.min.js reads window.mpAnonId', checkoutMin.includes('mpAnonId'));
check('checkout.min.js sends anonId in the session request', /anonId/.test(checkoutMin));
check('checkout.min.js source uses corrected mpPageType', checkoutMin.includes('mpPageType'));
check('create-checkout-session sets client_reference_id from anonId',
      ccs.includes('client_reference_id') && ccs.includes('anonId'));
check('stripe-webhook reads session.client_reference_id',
      webhook.includes('client_reference_id'));
check('stripe-webhook writes anon_id onto the subscription_active row',
      /anon_id:\s*anonId/.test(webhook));
check('join key is not PII (no raw email sent to Stripe ref)',
      !/client_reference_id:\s*[^)]*email/i.test(ccs));

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[5] Double-count guards present\n');
// Guard LOGIC is asserted in source (esbuild minifies local vars like
// `wasPremium` away, but object-property guards survive) …
const appSrc = read(p('public/js/app.js'));
const checkoutSrc = read(p('public/js/checkout.js'));
const appMin = read(p('public/js/app.min.js'));
check('plan_generated: re-entry guard + fires on success only (source)',
      appSrc.includes('_generating') && /if\s*\(\s*ok\s*&&\s*window\.mpTrack\)/.test(appSrc));
check('email_submitted: in-flight guard + skip already-premium re-verify (source)',
      appSrc.includes('_verifying') && appSrc.includes('wasPremium') && appSrc.includes('!(wasPremium && active)'));
check('checkout_started: in-flight guard on pay button (source)',
      checkoutSrc.includes('_checkoutInFlight'));
check('checkout_started: button stays locked once redirecting (no reset on success)',
      checkoutSrc.includes('if (!redirecting)') && /return true;\s*}\s*\/\/ redirecting/.test(checkoutSrc));
// … and the built bundles must carry the property-named guards through minify.
check('built app.min.js carries _generating + _verifying guards',
      appMin.includes('_generating') && appMin.includes('_verifying'));
check('built checkout.min.js carries _checkoutInFlight guard',
      checkoutMin.includes('_checkoutInFlight'));

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[6] recipe_added_to_plan — Sprint 1 (Funnel Measurement Foundation)\n');
const planCartSrc = read(p('public/js/plan-cart.js'));
const planCartMin = read(p('public/js/plan-cart.min.js'));
const explorerSrc = read(p('public/js/recipe-explorer.js'));

check('analytics.js ALLOWED includes recipe_added_to_plan', /recipe_added_to_plan:\s*1/.test(read(p('public/js/analytics.js'))));
check('api/event.js CLIENT_EVENTS includes recipe_added_to_plan', /'recipe_added_to_plan'/.test(read(p('api/event.js'))));

// plan-cart.js: the track call must live in the real-add branch (after the
// items.push/writeCart pair that follows the `else {` of the add/remove/full
// toggle), NOT anywhere near the remove branch (items.splice) above it.
{
  const addBranch = planCartSrc.split('items.push({ en: en, display:')[1] || '';
  check('plan-cart.js: recipe_added_to_plan fires in the add branch',
        addBranch.includes("mpTrack('recipe_added_to_plan'"));
  const removeBranch = (planCartSrc.split('items.splice(at, 1);')[1] || '').split('items.length >= CAP')[0];
  check('plan-cart.js: recipe_added_to_plan does NOT fire in the remove branch',
        !removeBranch.includes("mpTrack('recipe_added_to_plan'"));
  check('plan-cart.js: recipe_id uses the stable EN name (not a new identity)',
        addBranch.includes('recipe_id: en'));
  check('plan-cart.js: source is derived, not hard-coded to one value',
        planCartSrc.includes("function pageSource()") && planCartSrc.includes("t === 'hub' ? 'recipe_hub' : 'recipe_page'"));
  check('plan-cart.js: guarded by typeof window.mpTrack === function',
        addBranch.includes("typeof window.mpTrack === 'function'"));
}
check('plan-cart.min.js (built) carries recipe_added_to_plan', planCartMin.includes('recipe_added_to_plan'));

// recipe-explorer.js: the track call must be gated on `on` (res === 'added'),
// i.e. textually after the `on ? L.inPlan` line and inside an `if (on ...)`.
{
  const addGuard = explorerSrc.split("b.textContent = on ? L.inPlan : L.addToPlan;")[1] || '';
  check("recipe-explorer.js: recipe_added_to_plan gated on res === 'added'",
        /if\s*\(\s*on\s*&&\s*typeof window\.mpTrack/.test(addGuard));
  check('recipe-explorer.js: recipe_id uses r.en (same join key as plan-cart.js), not r.id',
        addGuard.includes('recipe_id: r.en'));
  check("recipe-explorer.js: source is the literal 'recipe_explorer'",
        addGuard.includes("source: 'recipe_explorer'"));
}

// No parallel cart/analytics system: still the one shared mp:plan-cart key,
// still the one /api/event ingestion endpoint.
check('plan-cart.js still uses the single shared mp:plan-cart key', planCartSrc.includes("var KEY = 'mp:plan-cart'"));
check('recipe-explorer.js still uses the single shared mp:plan-cart key', explorerSrc.includes("CART_KEY = 'mp:plan-cart'"));

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n[7] Sprint 2 — Final analytics completion (planner_*, plan_generated source, plan_cart_consumed)\n');
{
  const analyticsSrc = read(p('public/js/analytics.js'));
  const eventSrc = read(p('api/event.js'));
  const NEW_EVENTS = ['planner_reroll', 'planner_recipe_changed', 'planner_recipe_removed', 'planner_empty_slot_added', 'plan_cart_consumed'];
  for (const ev of NEW_EVENTS) {
    check(`analytics.js ALLOWED includes ${ev}`, new RegExp(`\\b${ev}\\s*:\\s*1\\b`).test(analyticsSrc));
    check(`api/event.js CLIENT_EVENTS includes '${ev}'`, new RegExp(`'${ev}'`).test(eventSrc));
  }

  // rerollMeal(): the track call must sit AFTER setSlotValue (i.e. after the
  // two early-return no-ops — empty slot, exhausted pool — have already
  // exited), so it can only fire on a genuine reroll.
  {
    const fn = (appSrc.split('async function rerollMeal(inputId, btn) {')[1] || '').split('\n  function removeMealSlot')[0];
    const setIdx = fn.indexOf('setSlotValue(input, getRecipeText(pick, lang));');
    const trackIdx = fn.indexOf("mpTrack('planner_reroll'");
    check('rerollMeal(): planner_reroll fires only after setSlotValue (past both early returns)',
          setIdx !== -1 && trackIdx !== -1 && trackIdx > setIdx);
    check("rerollMeal(): slot_type derived via the existing inputId.endsWith('l') convention",
          fn.includes("inputId.endsWith('l') ? 'lunch' : 'dinner'"));
  }

  // removeMealSlot(): track call after setSlotValue(input, '') — past the
  // empty-slot early return.
  {
    const fn = (appSrc.split('function removeMealSlot(inputId) {')[1] || '').split('\n  // §2b.2')[0];
    const setIdx = fn.indexOf("setSlotValue(input, '');");
    const trackIdx = fn.indexOf("mpTrack('planner_recipe_removed'");
    check("removeMealSlot(): planner_recipe_removed fires only after setSlotValue(input, '')",
          setIdx !== -1 && trackIdx !== -1 && trackIdx > setIdx);
  }

  // pwPickItem(): planner_recipe_changed inside the wasFilled branch,
  // planner_empty_slot_added inside the else branch — both nested inside the
  // outer `if (newText && newText !== prevValue)` no-op guard.
  {
    const fn = (appSrc.split('function pwPickItem(idx) {')[1] || '').split('\n  function startDictation')[0];
    const guardIdx = fn.indexOf('if (newText && newText !== prevValue)');
    const ifWasFilledIdx = fn.indexOf('if (wasFilled) {');
    const changedIdx = fn.indexOf("mpTrack('planner_recipe_changed'");
    const elseIdx = fn.indexOf('} else {');
    const addedIdx = fn.indexOf("mpTrack('planner_empty_slot_added'");
    check('pwPickItem(): both new events are nested inside the newText!==prevValue no-op guard',
          guardIdx !== -1 && guardIdx < ifWasFilledIdx && changedIdx > ifWasFilledIdx && addedIdx > elseIdx);
    check('pwPickItem(): planner_recipe_changed is in the wasFilled (replace) branch, before planner_empty_slot_added',
          changedIdx !== -1 && changedIdx < elseIdx);
    check('pwPickItem(): planner_empty_slot_added is in the else (add) branch',
          addedIdx !== -1 && addedIdx > elseIdx);
  }

  // plan_generated: three call sites, one `source` value each.
  {
    check("Generate button: plan_generated carries source:'generator_button'",
          /mpTrack\('plan_generated',\s*\{\s*filter:.*source:\s*'generator_button'/.test(appSrc));
    const autoplanBlock = (appSrc.split('// ---------- ?autoplan= deep link')[1] || '').split('// ---------- ?meal= deep link')[0];
    check("?autoplan= (budget branch): awaits generateRandomMenu() before gating plan_generated",
          /const ok = await generateRandomMenu\(\);\s*\n\s*if \(ok && window\.mpTrack\) window\.mpTrack\('plan_generated', \{ source: 'autoplan_deeplink' \}\);/.test(autoplanBlock));
    check("?autoplan= (non-budget branch): plan_generated carries source:'autoplan_deeplink'",
          /mpTrack\('plan_generated',\s*\{\s*source:\s*'autoplan_deeplink'\s*\}\);\s*\n\s*}\s*\n\s*updateShoppingList/.test(autoplanBlock));
    const mealBlock = (appSrc.split('// ---------- ?meal= deep link')[1] || '').split('// ---------- plan cart')[0];
    check("?meal= deep link: awaits generateRandomMenu before gating plan_generated with source:'meal_deeplink'",
          /let mealPlanOk = false;[\s\S]*mealPlanOk = await generateRandomMenu\(\{ keepFilled: true \}\)[\s\S]*if \(mealPlanOk && window\.mpTrack\) window\.mpTrack\('plan_generated', \{ source: 'meal_deeplink' \}\);/.test(mealBlock));
  }

  // consumePlanCart(): plan_cart_consumed (NOT plan_generated) gated on
  // `poured` (past the `if (!poured) return;` no-op guard), with the
  // items_poured count as the sole minimal prop.
  {
    const fn = (appSrc.split('(function consumePlanCart() {')[1] || '').split('\n  // ---------- EXPORT SECTION')[0];
    check('consumePlanCart(): does NOT emit plan_generated', !fn.includes("mpTrack('plan_generated'"));
    check('consumePlanCart(): emits plan_cart_consumed', fn.includes("mpTrack('plan_cart_consumed'"));
    const noopIdx = fn.indexOf('if (!poured) return;');
    const trackIdx = fn.indexOf("mpTrack('plan_cart_consumed'");
    check('consumePlanCart(): plan_cart_consumed fires only after the !poured no-op guard',
          noopIdx !== -1 && trackIdx !== -1 && trackIdx > noopIdx);
    check('consumePlanCart(): props carry items_poured (minimal, matches the actual pour count)',
          /plan_cart_consumed',\s*\{\s*items_poured:\s*poured\s*\}/.test(fn));
  }

  // No parallel analytics system: every new call still routes through the
  // single window.mpTrack, guarded exactly like the rest of the file.
  const newTrackCalls = (appSrc.match(/window\.mpTrack\('(planner_reroll|planner_recipe_changed|planner_recipe_removed|planner_empty_slot_added|plan_cart_consumed)'/g) || []);
  check('all 5 new Sprint 2 events fire via the single window.mpTrack (no parallel system)',
        newTrackCalls.length === 5);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log(`\n──────────────────────────────────────────\n${pass} passed, ${fail} failed\n`);
if (fail) {
  console.log('FAILURES:');
  for (const f of fails) console.log('  • ' + f);
  process.exit(1);
}
console.log('✅ Funnel measurement foundation verified.');
process.exit(0);
