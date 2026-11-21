// tests/pdf/fixture.test.mjs — PDF-001: the harness fixture is deterministic,
// covers all 14 locales and really is localized. No network, no secrets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PDF_LOCALES, FIXTURE_MENU, PDF_LABELS, buildFixturePlan, fixtureRecipe, fixtureRecipeNames,
} from '../../scripts/pdf/fixture-plan.mjs';

const EXPECTED_LOCALES = ['ro', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'zh', 'ja', 'hi', 'tr', 'it', 'ko'];

test('fixture covers exactly the 14 site locales', () => {
  assert.deepEqual([...PDF_LOCALES].sort(), [...EXPECTED_LOCALES].sort());
});

test('PDF_LABELS read from app.js has an entry for every locale', () => {
  for (const lc of EXPECTED_LOCALES) {
    assert.ok(PDF_LABELS[lc], `PDF_LABELS.${lc} missing in public/js/app.js`);
    assert.equal(typeof PDF_LABELS[lc].pageOf, 'string');
    assert.ok(PDF_LABELS[lc].pageOf.includes('{n}') && PDF_LABELS[lc].pageOf.includes('{t}'));
  }
});

test('every fixture recipe has a name and ingredients in all 14 locales', () => {
  for (const id of FIXTURE_MENU.flat()) {
    const r = fixtureRecipe(id);
    for (const lc of EXPECTED_LOCALES) {
      assert.ok(r.name && r.name[lc], `recipe ${id} has no name.${lc}`);
      assert.ok(Array.isArray(r.ingredients?.[lc]) && r.ingredients[lc].length,
        `recipe ${id} has no ingredients.${lc}`);
    }
  }
});

test('buildFixturePlan is deterministic (same input → identical payload)', () => {
  for (const lc of EXPECTED_LOCALES) {
    assert.equal(JSON.stringify(buildFixturePlan(lc)), JSON.stringify(buildFixturePlan(lc)), lc);
  }
});

test('plan shape matches the production payload (7 days, 14 meals, shopping list)', () => {
  for (const lc of EXPECTED_LOCALES) {
    const p = buildFixturePlan(lc);
    assert.equal(p.lang, lc);
    // ar formats the date with Arabic-Indic digits (٢٠٢٦).
    assert.ok(p.title && /2026|٢٠٢٦/.test(p.weekLabel), `${lc}: title/weekLabel "${p.weekLabel}"`);
    assert.equal(p.days.length, 7);
    if (lc !== 'ar') { // ar: known defect, see the todo test below
      assert.equal(new Set(p.days.map(d => d.day)).size, 7, `${lc}: duplicate weekday labels`);
    }
    for (const d of p.days) {
      for (const k of ['lunch', 'dinner']) {
        assert.ok(d[k].name, `${lc}: ${k} name`);
        assert.ok(d[k].ingredientsFull.length > 0, `${lc}: ${k} ingredientsFull`);
      }
    }
    assert.ok(p.shoppingGroups.length > 0, `${lc}: shopping groups`);
    assert.ok(p.weekCost, `${lc}: weekCost`);
    assert.equal(p.locked, null);
  }
});

test('recipe names are in the requested locale, not an EN fallback', () => {
  const en = fixtureRecipeNames('en');
  for (const lc of ['ru', 'zh', 'ja', 'hi', 'ko', 'ar']) {
    const names = fixtureRecipeNames(lc);
    assert.equal(names.length, 14);
    const sameAsEn = names.filter((n, i) => n === en[i]);
    assert.equal(sameAsEn.length, 0, `${lc}: names identical to EN: ${sameAsEn.join(', ')}`);
  }
});

test('days option trims the menu', () => {
  const p = buildFixturePlan('en', { days: 2 });
  assert.equal(p.days.length, 2);
  assert.deepEqual(fixtureRecipeNames('en', { days: 2 }), p.days.flatMap(d => [d.lunch.name, d.dinner.name]));
});

test('unsupported locale is rejected', () => {
  assert.throws(() => buildFixturePlan('xx'), /unsupported locale/);
});

// KNOWN DEFECT (found by PDF-001, latent while ar is blocked by the guard):
// app.js abbreviates weekdays with slice(0, 3); every Arabic weekday starts
// with the article "ال", so the labels collapse to "ال" + one letter and
// Wednesday (الأربعاء) / Sunday (الأحد) both become "الأ" — the same class of
// bug as the Turkish P0 fixed with DAY_ABBREV.tr. Tracked for PDF-002 (needs a
// DAY_ABBREV.ar entry in public/js/app.js). Flip to a normal test once fixed.
test('ar weekday labels are unique', { todo: 'PDF-002: DAY_ABBREV.ar missing in app.js' }, () => {
  const p = buildFixturePlan('ar');
  assert.equal(new Set(p.days.map(d => d.day)).size, 7, p.days.map(d => d.day).join(' | '));
});
