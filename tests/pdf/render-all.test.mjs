// tests/pdf/render-all.test.mjs — PDF-001: the real PDF render path produces a
// valid PDF for the deterministic fixture in all 14 locales (ar = blocked by
// guard), with and without poppler. No network, no secrets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAll, renderLocale } from '../../scripts/pdf/render-all.mjs';
import { PDF_LOCALES } from '../../scripts/pdf/fixture-plan.mjs';
import { hasPoppler } from '../../scripts/pdf/pdf-inspect.mjs';

test('all 14 locales: 13 render OK, ar is reported as blocked-by-guard', async () => {
  const results = await renderAll();
  assert.equal(results.length, 14);
  assert.deepEqual(results.map(r => r.lang), [...PDF_LOCALES]);

  for (const r of results) {
    if (r.lang === 'ar') {
      assert.equal(r.status, 'blocked-by-guard', 'ar must be reported as blocked by the guard');
      assert.equal(r.guard.status, 422);
      assert.equal(r.guard.error, 'pdf_unavailable_for_language');
      assert.equal(r.bytes, 0, 'ar must not be rendered');
      continue;
    }
    assert.equal(r.status, 'ok', `${r.lang}: ${r.error}`);
    assert.ok(r.pages > 0, `${r.lang}: pages`);
    assert.ok(r.bytes > 10_000, `${r.lang}: bytes`);
    assert.equal(r.mode, hasPoppler() ? 'poppler' : 'builtin');
    if (hasPoppler()) {
      assert.deepEqual(r.missing, [], `${r.lang}: missing text`);
      // Exact text match is required for every script except Devanagari,
      // where pdftotext returns visual order (see pdf-inspect.mjs).
      if (r.lang !== 'hi') assert.deepEqual(r.weakMatches, [], `${r.lang}: unexpected weak matches`);
    }
  }
});

test('builtin mode (no poppler) still renders and counts pages', async () => {
  const prev = process.env.PDF_HARNESS_NO_POPPLER;
  process.env.PDF_HARNESS_NO_POPPLER = '1';
  try {
    const r = await renderLocale('en', { days: 2 });
    assert.equal(r.status, 'ok', r.error);
    assert.equal(r.mode, 'builtin');
    assert.ok(r.pages > 0);
    const ar = await renderLocale('ar');
    assert.equal(ar.status, 'blocked-by-guard');
  } finally {
    if (prev === undefined) delete process.env.PDF_HARNESS_NO_POPPLER;
    else process.env.PDF_HARNESS_NO_POPPLER = prev;
  }
});
