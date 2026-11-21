// scripts/pdf/pdf-inspect.mjs
// PDF-001 — minimal PDF inspection for the offline harness.
//
// Two modes, chosen automatically:
//   - poppler  : pdfinfo (page count), pdftotext (extracted text), pdffonts
//                (embedded fonts). Used when the binaries are on PATH.
//   - builtin  : pure-JS structural checks only (header/trailer, page-object
//                count). No text extraction — @react-pdf writes compressed
//                content streams with subset fonts, so text checks need poppler.
// Set PDF_HARNESS_NO_POPPLER=1 to force the builtin mode (used by the tests to
// prove the harness works on machines without poppler).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let _poppler;
/** True when pdfinfo + pdftotext + pdffonts are runnable (and not disabled). */
export function hasPoppler() {
  if (process.env.PDF_HARNESS_NO_POPPLER === '1') return false;
  if (_poppler === undefined) {
    try {
      for (const bin of ['pdfinfo', 'pdftotext', 'pdffonts']) {
        execFileSync(bin, ['-v'], { stdio: 'ignore' });
      }
      _poppler = true;
    } catch (_) {
      _poppler = false;
    }
  }
  return _poppler;
}

/** Builtin structural inspection — never throws, never shells out. */
export function inspectBuiltin(buf) {
  const head = buf.subarray(0, 8).toString('latin1');
  const tail = buf.subarray(Math.max(0, buf.length - 1024)).toString('latin1');
  const body = buf.toString('latin1');
  // Page objects: "/Type /Page" not followed by "s" (that would be /Pages).
  const pages = (body.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
  return {
    validHeader: head.startsWith('%PDF-'),
    validTrailer: tail.includes('%%EOF'),
    pages,
  };
}

/**
 * Inspect a PDF buffer. Returns
 *   { mode, bytes, validHeader, validTrailer, pages, text|null, fonts|null }
 * `text` / `fonts` ([{ name, embedded }]) are null in builtin mode.
 */
export function inspectPdf(buf) {
  const base = { bytes: buf.length, ...inspectBuiltin(buf) };
  if (!hasPoppler()) return { mode: 'builtin', ...base, text: null, fonts: null };

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-inspect-'));
  const file = path.join(dir, 'doc.pdf');
  try {
    fs.writeFileSync(file, buf);
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    const m = info.match(/^Pages:\s+(\d+)/m);
    const text = execFileSync('pdftotext', ['-enc', 'UTF-8', file, '-'], { encoding: 'utf8' });
    const fontsOut = execFileSync('pdffonts', [file], { encoding: 'utf8' });
    // Columns: name type... encoding emb sub uni objectID gen — `type` can
    // contain spaces ("CID TrueType"), so read emb from the end.
    const fonts = fontsOut.split('\n').slice(2).filter(Boolean).map(line => {
      const t = line.trim().split(/\s+/);
      return { name: t[0], embedded: t[t.length - 5] === 'yes' };
    });
    return { mode: 'poppler', ...base, pages: m ? Number(m[1]) : base.pages, text, fonts };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Normalize text for containment checks: NFC, drop ALL whitespace (layout
 * wraps long names across lines; pdftotext may space CJK glyphs) and soft
 * hyphens, then lower-case.
 */
export function normalizeForMatch(s) {
  return String(s || '').normalize('NFC').replace(/[\s­​-‍]+/g, '').toLowerCase();
}

const DEVANAGARI = /[\u0900-\u097F]/;
const MIN_SKELETON = 3;

/**
 * Order-insensitive "consonant skeleton" of a Devanagari string, for
 * comparing against pdftotext output. pdftotext extracts Devanagari in VISUAL
 * glyph order, not logical order: the pre-base i-matra (ि) comes out before
 * its consonant cluster ("साहिक" → "सािहक"), a reph (र्) is moved after the
 * following cluster or dropped ("कार्बोनारा" → "काबार्नारा", "नोर्मा" →
 * "नोमा"), and two-part vowel signs can split. The skeleton keeps only base
 * letters (consonants + independent vowels), in order, minus र (the only
 * letter reph reordering moves), after NFD (so nukta forms decompose) and
 * with every combining sign removed. Weaker than an exact match — callers
 * report when they had to fall back to it.
 */
export function devanagariSkeleton(s) {
  return String(s || '').normalize('NFD')
    .replace(/[^\u0904-\u0939\u0960\u0961\u0972-\u097F]/g, '')
    .replace(/\u0930/g, '');
}

/** Return the subset of `needles` NOT found in `haystack` (normalized). */
export function missingStrings(haystack, needles) {
  return matchStrings(haystack, needles).missing;
}

/**
 * Exact (normalized) containment first; for Devanagari needles that miss,
 * retry with devanagariSkeleton() on both sides.
 * @returns {{ missing: string[], weak: string[] }} `weak` = needles that only
 *          matched via the skeleton fallback.
 */
export function matchStrings(haystack, needles) {
  const hay = normalizeForMatch(haystack);
  let haySkel = null;
  const missing = [], weak = [];
  for (const n of needles) {
    if (hay.includes(normalizeForMatch(n))) continue;
    if (DEVANAGARI.test(n)) {
      if (haySkel === null) haySkel = devanagariSkeleton(haystack);
      const sk = devanagariSkeleton(n);
      // Skeletons shorter than 3 letters are too unspecific to count (e.g.
      // "हरीरा" → "ह" occurs in almost any Hindi text) — those stay missing.
      if (sk.length >= MIN_SKELETON && haySkel.includes(sk)) { weak.push(n); continue; }
    }
    missing.push(n);
  }
  return { missing, weak };
}
