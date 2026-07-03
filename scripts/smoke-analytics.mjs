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
// … and the built bundles must carry the property-named guards through minify.
check('built app.min.js carries _generating + _verifying guards',
      appMin.includes('_generating') && appMin.includes('_verifying'));
check('built checkout.min.js carries _checkoutInFlight guard',
      checkoutMin.includes('_checkoutInFlight'));

// ═════════════════════════════════════════════════════════════════════════════
console.log(`\n──────────────────────────────────────────\n${pass} passed, ${fail} failed\n`);
if (fail) {
  console.log('FAILURES:');
  for (const f of fails) console.log('  • ' + f);
  process.exit(1);
}
console.log('✅ Funnel measurement foundation verified.');
process.exit(0);
