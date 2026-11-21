// tests/pdf/handler-offline.test.mjs — PDF-001: api/generate-pdf.js imports
// and runs with NO Supabase/Stripe env and no network, and doing so does NOT
// weaken the premium gate (offline ⇒ fail closed ⇒ free 2-day preview).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

// Strip every production secret BEFORE the API modules are imported.
for (const k of Object.keys(process.env)) {
  if (/^(SUPABASE_|STRIPE_|OPENAI_)/.test(k)) delete process.env[k];
}

let api, premium, fixture, inspect;
before(async () => {
  api = await import('../../api/generate-pdf.js');
  premium = await import('../../api/_lib/requirePremium.js');
  fixture = await import('../../scripts/pdf/fixture-plan.mjs');
  inspect = await import('../../scripts/pdf/pdf-inspect.mjs');
});

let ipSeq = 0;
async function callHandler(body, method = 'POST') {
  let status = 200, payload, headers = {};
  const res = {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    status: (c) => { status = c; return res; },
    send: (b) => { payload = b; return res; },
    json: (j) => { payload = j; return res; },
  };
  // Distinct IP per call so the in-memory free-tier rate limit never trips.
  const req = { method, body, headers: { 'x-forwarded-for': `10.200.0.${++ipSeq}` } };
  await api.default(req, res);
  return { status, payload, headers };
}

test('api/generate-pdf.js imports without Supabase env and exposes the render path', () => {
  assert.equal(typeof api.default, 'function');
  assert.equal(typeof api.renderPlanPdf, 'function');
  assert.equal(typeof api.pdfLanguageGuard, 'function');
  assert.equal(typeof api.MealPlanDocument, 'function');
});

test('isPremiumEmail fails closed without Supabase env (no bypass)', async () => {
  assert.equal(await premium.isPremiumEmail('someone@example.com'), false);
  assert.equal(await premium.isPremiumEmail(''), false);
});

test('requirePremium still refuses (missing email → 401, no env → throws, never grants)', async () => {
  let code;
  const res = { status: (c) => { code = c; return res; }, json: () => res };
  assert.equal(await premium.requirePremium({ body: {} }, res), null);
  assert.equal(code, 401);
  await assert.rejects(premium.requirePremium({ body: { email: 'a@example.com' } }, res), /supabaseUrl/i);
});

test('pdfLanguageGuard: ar → 422 pdf_unavailable_for_language, every other locale passes', () => {
  assert.deepEqual(api.PDF_BLOCKED_LANGS, ['ar']);
  assert.deepEqual(api.pdfLanguageGuard({ lang: 'ar' }),
    { status: 422, body: { error: 'pdf_unavailable_for_language', lang: 'ar' } });
  for (const lc of fixture.PDF_LOCALES.filter(l => l !== 'ar')) {
    assert.equal(api.pdfLanguageGuard({ lang: lc }), null, lc);
  }
  assert.equal(api.pdfLanguageGuard({}), null);
  assert.equal(api.pdfLanguageGuard(null), null);
});

test('handler: ar POST → 422 JSON before any render', async () => {
  const r = await callHandler(fixture.buildFixturePlan('ar'));
  assert.equal(r.status, 422);
  assert.deepEqual(r.payload, { error: 'pdf_unavailable_for_language', lang: 'ar' });
  assert.equal(r.headers['content-type'], undefined);
});

test('handler offline: a 7-day plan with an email is clamped to the free 2-day preview', async () => {
  const plan = { ...fixture.buildFixturePlan('en'), email: 'paying-customer@example.com' };
  const r = await callHandler(plan);
  assert.equal(r.status, 200);
  assert.equal(r.headers['content-type'], 'application/pdf');
  assert.ok(Buffer.isBuffer(r.payload) && r.payload.subarray(0, 5).toString() === '%PDF-');

  const full = await api.renderPlanPdf(fixture.buildFixturePlan('en'));
  const freeInfo = inspect.inspectPdf(r.payload);
  const fullInfo = inspect.inspectPdf(full);
  assert.ok(freeInfo.pages > 0);
  assert.ok(freeInfo.pages < fullInfo.pages,
    `free preview (${freeInfo.pages}p) must be shorter than the full plan (${fullInfo.pages}p)`);

  if (freeInfo.text !== null) {
    const names = fixture.fixtureRecipeNames('en');
    assert.deepEqual(inspect.missingStrings(freeInfo.text, names.slice(0, 4)), [], 'days 1-2 present');
    const leaked = names.slice(4).filter(n => !inspect.missingStrings(freeInfo.text, [n]).length);
    assert.deepEqual(leaked, [], 'days 3-7 must not appear in the free preview');
    assert.ok(freeInfo.text.includes('Premium'), 'locked-days notice rendered');
  }
});
