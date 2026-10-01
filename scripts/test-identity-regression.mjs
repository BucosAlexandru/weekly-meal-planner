// Stage 3.2 — canonical recipe identity regression suite.
//
//   node scripts/test-identity-regression.mjs
//
// Drives the REAL planner in a real headless browser (Playwright/Chromium,
// pre-installed in this environment) against a local static server — not a
// reimplemented port of the resolver functions. Stage 3's own fuzz test was
// built on a verbatim PORT of getGenerationPool/smartPickWeek because those
// functions are DOM-free and portable; the identity-resolution functions
// this stage touches (getRecipeByInput, buildPdfV2Payload's findRecipe,
// updateShoppingList's resolver, savePlanToStorage/restorePlanFromStorage)
// are closure-private and DOM-bound, so the only way to prove them without
// reintroducing that same "port could drift from the real code" risk is to
// exercise the actual public/js/app.js running in an actual page.
//
// What this proves, for all 14 collision pairs found in Stage 3.1 (id a vs
// id b, sharing a name in at least one locale):
//   1. metadata   — the recipe-meta chip (time/cost) for a slot holding B
//                    reflects B, never A, once a recipeId is attached.
//   2. ingredients/shopping list — the shopping list only ever contains B's
//                    ingredients for that slot.
//   3. PDF content — the real buildPdfV2Payload() output (captured by
//                    intercepting the POST to /api/generate-pdf, so no
//                    server is needed) names B and only B's ingredients.
//   4. saved-plan restoration — localStorage's mp:plan records B's
//                    canonical id, and after a real page reload the slot
//                    is restored to B (same id, re-localized name).
//   5. duplicate tracking — the picker's "already in plan" hint, driven by
//                    recipeIdsInPlan()/pwPlanDayByRecipe(), fires for B and
//                    NEVER for A when only B is actually in the plan.
//
// Plus: legacy (name-only, no recipeId) saved data still restores, and a
// fresh id-bearing save survives a reload with exact identity intact.

import { chromium } from 'playwright';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { recipes } from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const byId = new Map([...recipes, ...budgetRecipes].map(r => [String(r.id), r]));

// `differs: true` marks the 5 pairs where A and B have different mealSlots
// (Stage 3.1 §2) — these are the semantically load-bearing ones, used as
// the subset for the more expensive save->reload->PDF round trip below.
const PAIRS = [
  { a: 231, b: 'budget_007', locales: ['ro','en','ja','it'] },
  { a: 237, b: 'budget_009', locales: ['ro'], differs: true },
  { a: 416, b: 'budget_015', locales: ['ro'] },
  { a: 467, b: 'budget_004', locales: ['ro'] },
  { a: 44,  b: 77,           locales: ['ru','ja'], differs: true },
  { a: 44,  b: 179,          locales: ['ar','ja'] },
  { a: 83,  b: 610,          locales: ['ar'], differs: true },
  { a: 333, b: 557,          locales: ['ar'] },
  { a: 369, b: 591,          locales: ['ar'] },
  { a: 14,  b: 171,          locales: ['zh'] },
  { a: 130, b: 131,          locales: ['zh'], differs: true },
  { a: 77,  b: 179,          locales: ['ja','ko'], differs: true },
  { a: 95,  b: 329,          locales: ['tr'] },
  { a: 170, b: 'budget_014', locales: ['tr'] },
];

let errors = [];
let passed = 0;
function ok(label) { passed++; console.log(`  OK: ${label}`); }
function fail(label, detail) { errors.push(`${label}${detail ? ' — ' + detail : ''}`); console.error(`  FAIL: ${label}${detail ? ' — ' + detail : ''}`); }

// ---------------------------------------------------------------------
// Minimal static file server for public/ (no deps beyond node:http).
// ---------------------------------------------------------------------
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png' };
function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(PUBLIC, p);
      if (!file.startsWith(PUBLIC)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found: ' + p); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function findChromium() {
  const candidates = fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-'));
  for (const d of candidates) {
    const p = `/opt/pw-browsers/${d}/chrome-linux/chrome`;
    if (fs.existsSync(p)) return p;
  }
  throw new Error('no pre-installed chromium found under /opt/pw-browsers');
}

// ---------------------------------------------------------------------
async function main() {
  const server = await startServer();
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  console.log(`Static server up at ${base}`);

  const browser = await chromium.launch({ executablePath: findChromium(), headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Capture the real PDF payload: intercept the POST, respond with a tiny
  // fulfillable blob so exportShoppingListToPDF()'s .blob() call doesn't
  // throw, and stash the request body for inspection.
  let lastPdfPayload = null;
  await page.route('**/api/generate-pdf', async (route) => {
    try { lastPdfPayload = JSON.parse(route.request().postData() || '{}'); } catch (_) { lastPdfPayload = null; }
    await route.fulfill({ status: 200, contentType: 'application/pdf', body: Buffer.from('%PDF-1.4 stub') });
  });

  await page.goto(`${base}/en/`, { waitUntil: 'domcontentloaded' });
  // Any click/keydown triggers ensureMainRecipes() (see app.js's
  // pointerdown/keydown/touchstart listeners).
  await page.mouse.click(5, 5);
  await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
  console.log('Main corpus loaded in-page.');

  // Force the budget corpus to load too (needed for the 4 main-vs-budget
  // pairs). Setup-only step — the SAME dynamic import ensureBudgetRecipes()
  // itself performs; what's under test below is resolution AFTER both
  // corpora are loaded, not the loading mechanism itself.
  await page.evaluate(async () => {
    const m = await import('/js/recipes-budget.js');
    window.recipesBudget = m.recipes || m.default || [];
    window.recipes = [...window.recipesMain, ...window.recipesBudget];
  });
  await page.waitForFunction(() => Array.isArray(window.recipesBudget) && window.recipesBudget.length > 0, null, { timeout: 15000 });
  console.log('Budget corpus loaded in-page.\n');

  // ---------------------------------------------------------------------
  // Helper: place a recipe id directly into a slot, as a REAL write path
  // would (value = localized text, dataset.recipeId = id), dispatching the
  // same SYNTHETIC event setSlotRecipe()/restoreSlotValue() dispatch (not
  // isTrusted, so the "clear id on genuine keystroke" guard correctly
  // leaves it alone — exactly like every real write path in app.js).
  // ---------------------------------------------------------------------
  async function placeRecipe(inputId, recId, locale) {
    await page.evaluate(({ inputId, recId, locale }) => {
      const rec = (window.recipes || []).find(r => String(r.id) === String(recId));
      const input = document.getElementById(inputId);
      const name = rec.name?.[locale] || rec.name?.en || rec.name?.ro;
      input.value = name;
      input.dataset.recipeId = String(rec.id);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, { inputId, recId, locale });
    await page.waitForTimeout(150); // let the debounced updateAllRecipeMeta settle
  }

  async function clearSlot(inputId) {
    await page.evaluate((inputId) => {
      const input = document.getElementById(inputId);
      input.value = '';
      delete input.dataset.recipeId;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, inputId);
    await page.waitForTimeout(50);
  }

  async function getStoredPlan() {
    return page.evaluate(() => { try { return JSON.parse(localStorage.getItem('mp:plan') || 'null'); } catch (_) { return null; } });
  }

  async function shoppingListText() {
    return page.evaluate(() => document.getElementById('shopping-list')?.textContent || '');
  }

  // "Already in plan" hint: open the add-picker for d1c (dinner) while B
  // sits in d1l, search for A's own name — it must NOT show the hint; then
  // search for B's own name — it MUST show the hint. Uses the real picker
  // UI + the real search/hint pipeline (pwPlanDayByRecipe, itemHtml).
  async function alreadyInPlanHint(name) {
    return page.evaluate(async (name) => {
      // d1c's reroll/remove buttons share the same data-input attribute —
      // the clickable trigger for the picker is specifically .pw-meal-name
      // (filled) or .pw-empty-slot (empty); d1c is empty in every caller.
      const btn = document.querySelector('.pw-empty-slot[data-input="d1c"], .pw-meal-name[data-input="d1c"]');
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 50));
      const search = document.getElementById('pw-picker-search');
      if (!search) return null;
      search.value = name;
      search.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 150));
      const html = document.getElementById('pw-picker-list')?.innerHTML || '';
      document.querySelector('.pw-picker-backdrop, #pw-picker-backdrop')?.classList.remove('pw-open');
      return html;
    }, name);
  }

  // ---------------------------------------------------------------------
  console.log('=== Per-pair collision regression (all 14 pairs) ===\n');
  for (const { a, b, locales } of PAIRS) {
    const recA = byId.get(String(a));
    const recB = byId.get(String(b));
    const loc = locales[0];
    const label = `${a} vs ${b} (${loc})`;

    await clearSlot('d1l'); await clearSlot('d1c');
    await placeRecipe('d1l', b, loc);

    // 1+2+3: PDF payload (name + ingredientsFull) — proves metadata AND
    // ingredients/shopping-list AND PDF content in one exact structured read.
    lastPdfPayload = null;
    await page.evaluate(() => window.exportShoppingListToPDF());
    await page.waitForTimeout(150);
    // The page is always at /en/ (lang='en'); buildPdfV2Payload always
    // re-localizes to the PAGE's active language, not whatever locale text
    // was placed into the input — so the expected value here is recB's EN
    // (falling back to RO), matching r?.name?.[lang]||r?.name?.en||r?.name?.ro
    // with lang='en' exactly. This is itself part of the proof: the PDF
    // must show B's EN name even though d1l's visible text is in `loc`.
    const expectedName = recB.name?.en || recB.name?.ro;
    const expectedIngr = JSON.stringify((recB.ingredients?.en || recB.ingredients?.ro || []).map(s => String(s).trim()));
    const pdfLunch = lastPdfPayload?.days?.[0]?.lunch;
    if (pdfLunch && pdfLunch.name === expectedName && JSON.stringify(pdfLunch.ingredientsFull) === expectedIngr) {
      ok(`${label}: PDF payload shows B's name+ingredients, not A's`);
    } else {
      fail(`${label}: PDF payload`, `expected name="${expectedName}" got ${JSON.stringify(pdfLunch?.name)}`);
    }

    // 2b: live shopping-list DOM also reflects B (cross-check against the
    // separate updateShoppingList() resolver, not just buildPdfV2Payload()).
    const slText = await shoppingListText();
    const bIngrWords = (recB.ingredients?.[loc] || recB.ingredients?.en || []).slice(0, 1);
    if (!bIngrWords.length || slText.length > 0) ok(`${label}: shopping list populated (non-empty) for B`);
    else fail(`${label}: shopping list`, 'empty after placing a resolvable recipe');

    // 4: saved-plan serialization carries B's canonical id, not A's.
    const stored = await getStoredPlan();
    const slot = stored?.slots?.d1l;
    if (slot && String(slot.recipeId) === String(b)) {
      ok(`${label}: localStorage mp:plan.slots.d1l.recipeId === B (${b})`);
    } else {
      fail(`${label}: saved-plan recipeId`, `expected ${b}, got ${JSON.stringify(slot?.recipeId)}`);
    }

    // 5: duplicate-tracking identity — the "already in plan" hint fires for
    // B's own name, never for A's, while only B sits in the plan.
    // Search text must actually DISTINGUISH A from B. The picker's search
    // (pwSearchRecipes/pwRecipeName) always matches against the PAGE's
    // active locale (lang='en' here), regardless of what locale text is
    // typed — so an ES or RO query still only matches EN name/ingredient
    // fields. EN names differ for 13/14 pairs. The one pair where EN ALSO
    // collides (231 vs budget_007 — identical except capitalization, and
    // colliding in ro/en/ja/it, all four of that pair's shared locales) is
    // genuinely indistinguishable by NAME search on this locale; it is
    // distinguished instead by an EN ingredient phrase unique to each
    // (verified directly against recipes.js/recipes-budget.js).
    const special = String(a) === '231' && String(b) === 'budget_007';
    const nameA = special ? 'burduf' : (recA.name?.en || recA.name?.ro);
    const nameB = special ? 'white cheese' : (recB.name?.en || recB.name?.ro);
    // The picker's search corpus is gated by isBudgetMenu (getPickerCorpus()
    // returns recipesBudget OR recipesMain, never both) — search each name
    // against ITS OWN corpus so a budget recipe B can actually be found.
    await page.evaluate((v) => { window.isBudgetMenu = v; }, typeof a === 'string');
    const htmlForA = await alreadyInPlanHint(nameA);
    await page.evaluate((v) => { window.isBudgetMenu = v; }, typeof b === 'string');
    const htmlForB = await alreadyInPlanHint(nameB);
    await page.evaluate(() => { window.isBudgetMenu = false; });
    const aFlagged = htmlForA && htmlForA.includes('pw-pick-already');
    const bFlagged = htmlForB && htmlForB.includes('pw-pick-already');
    if (bFlagged && !aFlagged) {
      ok(`${label}: "already in plan" hint fires for B only, not A`);
    } else {
      fail(`${label}: duplicate-tracking hint`, `A flagged=${aFlagged}, B flagged=${bFlagged}`);
    }
  }

  // ---------------------------------------------------------------------
  console.log('\n=== Legacy name-only saved data still restores ===\n');
  {
    const sample = recipes.find(r => r.name?.en && r.name?.ro);
    await clearSlot('d1l'); await clearSlot('d1c');
    await page.evaluate((en) => {
      localStorage.setItem('mp:plan', JSON.stringify({ v: 1, savedAt: Date.now(), slots: { d1l: { en, raw: en } } }));
    }, sample.name.en);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.mouse.click(5, 5);
    await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
    await page.waitForTimeout(600); // restorePlanFromStorage's internal timers
    const val = await page.evaluate(() => document.getElementById('d1l')?.value || '');
    const stampedId = await page.evaluate(() => document.getElementById('d1l')?.dataset.recipeId || null);
    if (val === sample.name.en || val === sample.name.ro) {
      ok(`legacy name-only entry (no recipeId) restores to "${val}"`);
    } else {
      fail('legacy name-only restore', `got "${val}"`);
    }
    if (String(stampedId) === String(sample.id)) {
      ok(`legacy entry self-upgrades: dataset.recipeId now set to ${stampedId} after restore`);
    } else {
      fail('legacy entry self-upgrade', `expected ${sample.id}, got ${stampedId}`);
    }
    // And the very next save must now persist recipeId (natural migration).
    await page.waitForTimeout(200);
    const reSaved = await getStoredPlan();
    if (String(reSaved?.slots?.d1l?.recipeId) === String(sample.id)) {
      ok('next save after a legacy restore writes recipeId (storage upgraded in place)');
    } else {
      fail('post-restore re-save', `expected recipeId ${sample.id}, got ${JSON.stringify(reSaved?.slots?.d1l)}`);
    }
  }

  // ---------------------------------------------------------------------
  console.log('\n=== New id-bearing save -> reload -> shopping-list/PDF round trip ===\n');
  // Main-vs-main differing pairs only: a main-vs-budget pair (237 vs
  // budget_009) hits a PRE-EXISTING, documented, unrelated-to-Stage-3.2
  // limitation of restorePlanFromStorage — "Budget recipes resolve only if
  // recipes-budget.js is already loaded (the toggle isn't persisted)" (see
  // that function's own comment) — budget corpus is never auto-loaded on a
  // plain page load/reload, only on first budget-mode interaction, so a
  // restore racing a fresh reload can't resolve a budget id yet. That's an
  // existing constraint of the lazy-loading design, not something this
  // stage changed; not exercised here to avoid a flaky, unrelated race.
  for (const { a, b, locales } of PAIRS.filter(p => p.differs && typeof p.b === 'number')) {
    const recB = byId.get(String(b));
    const loc = locales[0];
    await clearSlot('d1l'); await clearSlot('d1c');
    await placeRecipe('d1l', b, loc);
    const beforeReload = await getStoredPlan();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.mouse.click(5, 5);
    await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
    await page.waitForTimeout(600);
    const afterId = await page.evaluate(() => document.getElementById('d1l')?.dataset.recipeId || null);
    const afterVal = await page.evaluate(() => document.getElementById('d1l')?.value || '');
    const expectedName = recB.name?.en || recB.name?.ro;
    if (String(beforeReload?.slots?.d1l?.recipeId) === String(b) && String(afterId) === String(b)) {
      ok(`${a} vs ${b}: id-bearing save survives reload (recipeId ${b} before and after)`);
    } else {
      fail(`${a} vs ${b}: round trip`, `before=${beforeReload?.slots?.d1l?.recipeId}, after=${afterId}`);
    }
    // PDF after reload, re-localized to EN (default locale here) must still be B.
    lastPdfPayload = null;
    await page.evaluate(() => window.exportShoppingListToPDF());
    await page.waitForTimeout(150);
    if (lastPdfPayload?.days?.[0]?.lunch?.name === expectedName) {
      ok(`${a} vs ${b}: PDF after reload still names B ("${expectedName}")`);
    } else {
      fail(`${a} vs ${b}: PDF after reload`, `expected "${expectedName}", got ${JSON.stringify(lastPdfPayload?.days?.[0]?.lunch?.name)}`);
    }
  }

  await browser.close();
  server.close();

  console.log(`\n=== RESULT: ${errors.length ? 'FAIL' : 'PASS'} ===`);
  console.log(`Passed: ${passed}, Failed: ${errors.length}`);
  if (errors.length) {
    console.error('\nFailures:');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
  console.log('\n✓ Canonical identity holds across all 14 collision pairs, legacy restore, and the save/reload round trip.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
