// tests/pdf/inspect.test.mjs — PDF-001: text-matching helpers of the harness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeForMatch, matchStrings, missingStrings, devanagariSkeleton, inspectBuiltin,
} from '../../scripts/pdf/pdf-inspect.mjs';

test('normalizeForMatch drops whitespace (wrapped lines, spaced CJK) and case', () => {
  assert.equal(normalizeForMatch('Spaghetti\nCarbonara'), normalizeForMatch('spaghetti carbonara'));
  assert.equal(normalizeForMatch('意 大 利 面'), normalizeForMatch('意大利面'));
});

test('missingStrings reports exactly the absent needles', () => {
  assert.deepEqual(missingStrings('Moussaka · 45 min\nRatatouille', ['Moussaka', 'Ratatouille', 'Paella']), ['Paella']);
});

// Real pdftotext output observed for the hi fixture PDF (visual glyph order).
const HI_EXTRACTED = 'साप्तािहक भोजन योजना\nस्पैगेटी काबार्नारा · 30 min\nिक्वश लोरेन · 75 min\nपास्ता अला नोमा';

test('Devanagari: visual-order extraction matches via the skeleton fallback (weak)', () => {
  const needles = ['साप्ताहिक भोजन योजना', 'स्पैगेटी कार्बोनारा', 'क्विश लोरेन', 'पास्ता अला नोर्मा'];
  const r = matchStrings(HI_EXTRACTED, needles);
  assert.deepEqual(r.missing, []);
  assert.ok(r.weak.length >= 3, 'expected the reordered names to be reported as weak matches');
});

test('Devanagari skeleton fallback still rejects names that are not there', () => {
  const r = matchStrings(HI_EXTRACTED, ['रिसोट्टो', 'चिकन तजीन', 'हरीरा']);
  assert.deepEqual(r.missing, ['रिसोट्टो', 'चिकन तजीन', 'हरीरा']);
});

test('devanagariSkeleton ignores matras, virama, nukta and reph र', () => {
  assert.equal(devanagariSkeleton('कार्बोनारा'), devanagariSkeleton('काबार्नारा'));
  assert.equal(devanagariSkeleton('नोर्मा'), devanagariSkeleton('नोमा'));
  assert.notEqual(devanagariSkeleton('मूसाका'), devanagariSkeleton('रतातुई'));
});

test('inspectBuiltin counts /Type /Page objects but not /Pages', () => {
  const fake = Buffer.from('%PDF-1.3\n1 0 obj <</Type /Pages /Kids [2 0 R 3 0 R]>>\n' +
    '2 0 obj <</Type /Page>>\n3 0 obj <</Type/Page /Parent 1 0 R>>\ntrailer\n%%EOF\n', 'latin1');
  assert.deepEqual(inspectBuiltin(fake), { validHeader: true, validTrailer: true, pages: 2 });
  assert.equal(inspectBuiltin(Buffer.from('hello')).validHeader, false);
});
