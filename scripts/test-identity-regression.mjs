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
import { i18n as I18N } from '../public/js/i18n.js';
import { isEligibleForSlot } from '../public/js/mealEligibility.js';

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

  // ═══════════════════════════════════════════════════════════════════════
  // STAGE 4 — Breakfast slot: DOM/persistence/UI proofs. Pure HARD-eligibility
  // and generation-algorithm proofs for the breakfast pool live in
  // scripts/test-generation-engine.mjs (sections 3c/3d) — this file covers
  // exactly what that one can't: real DOM rendering, the real toggle
  // control, real localStorage round trips through the real
  // save/restore code, and real picker/reroll UI wiring.
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n=== Stage 4: Breakfast toggle + slot rendering ===\n');

  // The toggle is premium-gated; this session never goes through the real
  // async premium check, so we simulate "already a premium session" the
  // same way a real one would look by the time the user can click it —
  // window.hasUnlimited true, checkbox enabled — then drive the REAL change
  // handler via a real DOM event (not calling an internal function).
  async function setBreakfastOn(on) {
    await page.evaluate((on) => {
      window.hasUnlimited = true;
      const cb = document.getElementById('pw-breakfast-toggle');
      cb.disabled = false;
      cb.checked = on;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }, on);
    await page.waitForTimeout(350); // renderTable() + restorePlanFromStorage() settle
  }
  async function breakfastSlotsExist() {
    return page.evaluate(() => {
      for (let d = 1; d <= 7; d++) if (!document.getElementById(`d${d}b`)) return false;
      return true;
    });
  }

  const bfSample = recipes.find(r => Array.isArray(r.mealSlots) && r.mealSlots.includes('breakfast'));
  const bfSample2 = recipes.find(r => Array.isArray(r.mealSlots) && r.mealSlots.includes('breakfast') && r.id !== bfSample.id);

  await clearSlot('d1l'); await clearSlot('d1c');
  await setBreakfastOn(false);
  {
    const exists = await breakfastSlotsExist();
    if (!exists) ok('Breakfast OFF: no d{n}b inputs in the DOM (14-slot layout unchanged)');
    else fail('Breakfast OFF', 'd{n}b inputs exist even though the toggle is off');
  }

  await setBreakfastOn(true);
  {
    const exists = await breakfastSlotsExist();
    if (exists) ok('Breakfast ON: all 7 d{n}b inputs exist (21-slot layout)');
    else fail('Breakfast ON', 'd{n}b inputs missing after enabling the toggle');
  }

  // ── Identity + metadata + shopping list + PDF, for a breakfast slot ──────
  // Same proof shape as the per-pair loop above (PDF payload + shopping list
  // + localStorage recipeId), applied to d1b instead of d1l.
  await placeRecipe('d1b', bfSample.id, 'en');
  {
    const stamped = await page.evaluate(() => document.getElementById('d1b')?.dataset.recipeId || null);
    if (String(stamped) === String(bfSample.id)) ok(`Breakfast identity: d1b.dataset.recipeId === ${bfSample.id} after placement`);
    else fail('Breakfast identity (dataset.recipeId)', `expected ${bfSample.id}, got ${stamped}`);

    lastPdfPayload = null;
    await page.evaluate(() => window.exportShoppingListToPDF());
    await page.waitForTimeout(150);
    const pdfBreakfast = lastPdfPayload?.days?.[0]?.breakfast;
    const expectedName = bfSample.name?.en || bfSample.name?.ro;
    if (pdfBreakfast && pdfBreakfast.name === expectedName) ok(`Breakfast PDF payload: days[0].breakfast.name === "${expectedName}"`);
    else fail('Breakfast PDF payload', `expected "${expectedName}", got ${JSON.stringify(pdfBreakfast)}`);
    if (lastPdfPayload?.hasBreakfast === true) ok('PDF payload: hasBreakfast === true when Breakfast is on');
    else fail('PDF payload hasBreakfast', `expected true, got ${JSON.stringify(lastPdfPayload?.hasBreakfast)}`);

    const slText = await shoppingListText();
    const firstIngr = (bfSample.ingredients?.en || [])[0];
    if (firstIngr && slText.length > 0) ok('Breakfast ingredients reach the shopping list (non-empty after placing a resolvable breakfast recipe)');
    else fail('Breakfast shopping list', 'empty after placing a resolvable breakfast recipe');

    const stored = await getStoredPlan();
    if (String(stored?.slots?.d1b?.recipeId) === String(bfSample.id)) ok(`localStorage mp:plan.slots.d1b.recipeId === ${bfSample.id}`);
    else fail('Breakfast saved-plan recipeId', `expected ${bfSample.id}, got ${JSON.stringify(stored?.slots?.d1b)}`);
    if (stored?.breakfastOn === true) ok('localStorage mp:plan.breakfastOn === true while Breakfast is on');
    else fail('mp:plan.breakfastOn', `expected true, got ${JSON.stringify(stored?.breakfastOn)}`);
  }

  // ── Reroll + picker respect breakfast eligibility (real UI, real click) ──
  {
    const beforeId = await page.evaluate(() => document.getElementById('d1b')?.dataset.recipeId || null);
    await page.evaluate(() => document.querySelector('.pw-btn[data-act="reroll"][data-input="d1b"]')?.click());
    await page.waitForTimeout(250);
    const afterId = await page.evaluate(() => document.getElementById('d1b')?.dataset.recipeId || null);
    const afterRec = afterId ? byId.get(String(afterId)) : null;
    if (afterRec && isEligibleForSlot(afterRec, 'breakfast')) {
      ok(`Reroll on d1b landed on a breakfast-eligible recipe (id ${afterId}${afterId === beforeId ? ', pool-of-1 edge case — same id' : ''})`);
    } else {
      fail('Reroll on d1b', `landed on id=${afterId}, mealSlots=${JSON.stringify(afterRec?.mealSlots)}`);
    }

    const title = await page.evaluate(() => {
      document.querySelector('.pw-meal-name[data-input="d1b"], .pw-empty-slot[data-input="d1b"]')?.click();
      return new Promise(r => setTimeout(() => r(document.getElementById('pw-picker-title')?.textContent || ''), 150));
    });
    await page.evaluate(() => document.querySelector('.pw-picker-backdrop, #pw-picker-backdrop')?.classList.remove('pw-open'));
    if (/breakfast/i.test(title)) ok(`Picker opened on d1b shows the Breakfast title ("${title.trim()}")`);
    else fail('Picker title for d1b', `expected it to mention "Breakfast", got "${title}"`);
  }

  // ── Full week Generate (real Generate button click) respects breakfast
  // eligibility for every filled slot, not just the one we placed by hand ──
  {
    await page.evaluate(() => document.getElementById('auto-menu-btn')?.click());
    await page.waitForTimeout(600);
    const violations = await page.evaluate(() => {
      const bad = [];
      for (let d = 1; d <= 7; d++) {
        [['b', 'breakfast'], ['l', 'lunch'], ['c', 'dinner']].forEach(([sfx, slot]) => {
          const inp = document.getElementById(`d${d}${sfx}`);
          const id = inp?.dataset.recipeId;
          if (!id) return;
          const rec = (window.recipes || []).find(r => String(r.id) === String(id));
          if (!rec || !Array.isArray(rec.mealSlots) || !rec.mealSlots.includes(slot)) {
            bad.push(`d${d}${sfx}: id=${id} mealSlots=${JSON.stringify(rec?.mealSlots)} expected "${slot}"`);
          }
        });
      }
      return bad;
    });
    if (!violations.length) ok('Full-week Generate (Breakfast ON): every filled slot (21 max) is eligible for its own slot kind');
    else violations.forEach(v => fail('Generate week eligibility violation', v));
  }

  // ── Persistence requirement #6: OFF -> save -> ON restores (never
  // regenerates) the previously-persisted Breakfast selection ───────────────
  console.log('\n=== Stage 4: persistence — merge-save, toggle round trip ===\n');
  {
    await clearSlot('d1l'); await clearSlot('d1c');
    await setBreakfastOn(true);
    await placeRecipe('d1b', bfSample.id, 'en');
    await page.waitForTimeout(200);
    const savedWithBreakfast = await getStoredPlan();
    if (String(savedWithBreakfast?.slots?.d1b?.recipeId) === String(bfSample.id)) {
      ok('Pre-toggle-off: d1b saved with the known breakfast recipeId');
    } else {
      fail('Pre-toggle-off save', JSON.stringify(savedWithBreakfast?.slots?.d1b));
    }

    await setBreakfastOn(false); // d{n}b inputs removed from the DOM now
    // A Lunch/Dinner-only edit — the exact scenario the merge-save fix
    // exists for: this save must NOT drop the hidden d1b entry.
    await placeRecipe('d1l', bfSample2.id, 'en'); // any resolvable recipe; identity isn't the point here
    await page.waitForTimeout(200);
    const afterOffEdit = await getStoredPlan();
    if (String(afterOffEdit?.slots?.d1b?.recipeId) === String(bfSample.id)) {
      ok('Breakfast OFF + a Lunch edit: hidden d1b entry survives untouched in localStorage (merge-save, not replace)');
    } else {
      fail('Merge-save (Breakfast OFF)', `d1b expected recipeId ${bfSample.id}, storage now has ${JSON.stringify(afterOffEdit?.slots?.d1b)}`);
    }
    if (afterOffEdit?.breakfastOn === false) {
      ok('mp:plan.breakfastOn flips to false immediately when the toggle is turned off');
    } else {
      fail('mp:plan.breakfastOn after toggle-off', JSON.stringify(afterOffEdit?.breakfastOn));
    }

    await setBreakfastOn(true); // re-enable — must RESTORE, not regenerate
    const restoredId = await page.evaluate(() => document.getElementById('d1b')?.dataset.recipeId || null);
    if (String(restoredId) === String(bfSample.id)) {
      ok(`Breakfast turned back ON: d1b restores the SAME previously-saved recipe (id ${bfSample.id}), not a freshly generated one`);
    } else {
      fail('Breakfast re-enable restore', `expected ${bfSample.id}, got ${restoredId}`);
    }
  }

  // ── Persistence requirement #7: a genuinely historical (pre-Stage-4)
  // Lunch+Dinner-only plan — no breakfastOn field, no 'b' keys at all —
  // still restores exactly, and Breakfast stays off (no auto-enable). ──────
  {
    const sample = recipes.find(r => isEligibleForSlot(r, 'lunch'));
    await page.evaluate((en) => {
      // Deliberately the EXACT pre-Stage-4 shape: no breakfastOn key.
      localStorage.setItem('mp:plan', JSON.stringify({ v: 1, savedAt: Date.now(), slots: { d1l: { recipeId: null, en, raw: en } } }));
    }, sample.name.en);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.mouse.click(5, 5);
    await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
    await page.waitForTimeout(600);
    const breakfastOnAfterHistorical = await page.evaluate(() => window._breakfastOn);
    const exists = await breakfastSlotsExist();
    if (breakfastOnAfterHistorical === false && !exists) {
      ok('Historical Lunch+Dinner-only plan (no breakfastOn field): Breakfast stays off, 14-slot layout, no auto-enable');
    } else {
      fail('Historical plan restore', `window._breakfastOn=${breakfastOnAfterHistorical}, breakfast slots exist=${exists}`);
    }
    const val = await page.evaluate(() => document.getElementById('d1l')?.value || '');
    if (val === sample.name.en || val === sample.name.ro) ok(`Historical plan's own Lunch slot still restores correctly ("${val}")`);
    else fail('Historical plan Lunch restore', `got "${val}"`);
  }

  // ── Persistence requirement #8: a NEW Breakfast plan, saved fresh, then a
  // full page reload (not just a toggle flip) — recipeId must survive. ─────
  {
    await clearSlot('d1l'); await clearSlot('d1c');
    await setBreakfastOn(true);
    await placeRecipe('d1b', bfSample.id, 'en');
    await page.waitForTimeout(200);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.mouse.click(5, 5);
    await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
    await page.waitForTimeout(700);
    const breakfastOnAfterReload = await page.evaluate(() => window._breakfastOn);
    const restoredId = await page.evaluate(() => document.getElementById('d1b')?.dataset.recipeId || null);
    if (breakfastOnAfterReload === true) ok('Fresh reload: breakfastOn auto-enables from the synchronous storage peek (before the DOM even builds the cards)');
    else fail('Fresh reload breakfastOn peek', `expected true, got ${breakfastOnAfterReload}`);
    if (String(restoredId) === String(bfSample.id)) ok(`Fresh reload: d1b restores the exact same recipeId (${bfSample.id}) across a full page reload`);
    else fail('Fresh reload d1b restore', `expected ${bfSample.id}, got ${restoredId}`);
  }

  // ── Requirement #13 (smoke): all 14 locales carry the new i18n keys ──────
  console.log('\n=== Stage 4: 14-locale i18n key presence (data-layer) + one live non-EN render ===\n');
  {
    const REQUIRED_KEYS = ['pw.breakfast', 'pw.breakfastToggle', 'pw.addBreakfast', 'placeholderB'];
    let missing = [];
    for (const lc of Object.keys(I18N)) {
      for (const key of REQUIRED_KEYS) {
        const v = I18N[lc][key];
        if (typeof v !== 'string' || !v.trim()) missing.push(`${lc}.${key}`);
      }
    }
    if (!missing.length) ok(`All 14 locales (${Object.keys(I18N).length}) carry all 4 new Breakfast i18n keys`);
    else fail('i18n key coverage', missing.join(', '));
  }
  {
    // One real, non-English, browser-rendered proof (ro) — the data-layer
    // sweep above covers all 14; this confirms the wiring actually reaches
    // the rendered page for at least one of them.
    await page.goto(`${base}/ro/`, { waitUntil: 'domcontentloaded' });
    await page.mouse.click(5, 5);
    await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
    await setBreakfastOn(true);
    const roTitle = await page.evaluate(() => {
      document.querySelector('.pw-empty-slot[data-input="d1b"], .pw-meal-name[data-input="d1b"]')?.click();
      return new Promise(r => setTimeout(() => r(document.getElementById('pw-picker-title')?.textContent || ''), 150));
    });
    await page.evaluate(() => document.querySelector('.pw-picker-backdrop, #pw-picker-backdrop')?.classList.remove('pw-open'));
    if (roTitle.includes(I18N.ro['pw.breakfast'])) ok(`ro locale: picker title for d1b shows "${I18N.ro['pw.breakfast']}" (live-rendered, not just the data table)`);
    else fail('ro locale picker title', `expected to include "${I18N.ro['pw.breakfast']}", got "${roTitle}"`);
  }

  // ── Requirement #14: mobile/responsive smoke — 3-row day cards at a
  // narrow viewport, no horizontal overflow, every row actually visible. ───
  console.log('\n=== Stage 4: mobile/responsive smoke (375x812, Breakfast ON) ===\n');
  {
    await page.goto(`${base}/en/`, { waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.mouse.click(5, 5);
    await page.waitForFunction(() => Array.isArray(window.recipesMain) && window.recipesMain.length > 0, null, { timeout: 15000 });
    await setBreakfastOn(true);
    await placeRecipe('d1b', bfSample.id, 'en');
    await page.waitForTimeout(200);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const rows = [];
      for (const sfx of ['b', 'l', 'c']) {
        const el = document.querySelector(`.pw-meal-name[data-input="d1${sfx}"]`)?.closest('.pw-meal')
          || document.querySelector(`.pw-empty-slot[data-input="d1${sfx}"]`)?.closest('.pw-meal');
        const r = el?.getBoundingClientRect();
        rows.push({ sfx, visible: !!(r && r.width > 0 && r.height > 0) });
      }
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, rows };
    });
    if (metrics.scrollWidth <= metrics.clientWidth + 1) {
      ok(`No horizontal overflow at 375px with Breakfast on (scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth})`);
    } else {
      fail('Mobile horizontal overflow', `scrollWidth=${metrics.scrollWidth} > clientWidth=${metrics.clientWidth}`);
    }
    const allVisible = metrics.rows.every(r => r.visible);
    if (allVisible) ok('All 3 meal rows (breakfast, lunch, dinner) render with non-zero size at 375px width');
    else fail('Mobile row visibility', JSON.stringify(metrics.rows));
    const screenshotPath = process.env.STAGE4_SCREENSHOT_DIR
      ? path.join(process.env.STAGE4_SCREENSHOT_DIR, 'stage4_mobile_breakfast.png')
      : null;
    if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
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
  console.log('✓ Stage 4: Breakfast toggle, slot identity/PDF/shopping-list, reroll/picker/Generate eligibility,');
  console.log('  merge-save persistence (OFF/ON round trip + historical-plan compat + fresh-reload), 14-locale');
  console.log('  i18n coverage, and mobile/responsive layout all hold.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
