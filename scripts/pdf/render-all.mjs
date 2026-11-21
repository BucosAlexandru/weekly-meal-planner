// scripts/pdf/render-all.mjs
// PDF-001 — offline PDF harness: render the deterministic fixture plan in all
// 14 site locales through the REAL render path of api/generate-pdf.js and
// check every file. No network, no secrets, no Supabase, no Stripe.
//
// Usage:
//   node scripts/pdf/render-all.mjs [--out DIR] [--langs ro,en,...] [--days N] [--json]
//
// Per locale the result status is one of:
//   ok                — rendered, structurally valid, pages > 0, and (with
//                       poppler) title + every recipe name found in the text
//                       (Devanagari may match via a weaker consonant-skeleton
//                       comparison — reported as weakMatches, see
//                       pdf-inspect.mjs devanagariSkeleton())
//   blocked-by-guard  — pdfLanguageGuard() refuses the locale (today: ar →
//                       422 pdf_unavailable_for_language). Expected, reported
//                       explicitly; NOT rendered (an ar render poisons shared
//                       font state for later locales in the same process).
//   (ok records may carry non-fatal `warnings` about fonts — see below)
//   fail              — anything else (render threw, invalid PDF, 0 pages,
//                       missing text). Exit code 1.
//
// Render path: pdfLanguageGuard(plan) → renderPlanPdf(plan) — the same two
// functions the HTTP handler calls. Entitlement (isPremiumEmail +
// gatePlanForAccess) is NOT involved: the fixture is rendered as the full
// premium view, the way a paying user receives it. The handler's free-tier
// clamp is covered separately by tests/pdf/handler-offline.test.mjs.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfLanguageGuard, renderPlanPdf } from '../../api/generate-pdf.js';
import { PDF_LOCALES, buildFixturePlan, fixtureRecipeNames } from './fixture-plan.mjs';
import { inspectPdf, matchStrings, hasPoppler } from './pdf-inspect.mjs';

/**
 * Render + check one locale. Never throws; returns a result record.
 * @param {string} lang
 * @param {{ outDir?: string|null, days?: number }} [opts]
 */
export async function renderLocale(lang, { outDir = null, days = 7 } = {}) {
  const plan = buildFixturePlan(lang, { days });
  const rec = { lang, status: 'fail', pages: 0, bytes: 0, ms: 0, mode: null,
                missing: [], weakMatches: [], warnings: [], fonts: null, file: null, error: null, guard: null };

  const blocked = pdfLanguageGuard(plan);
  if (blocked) {
    rec.status = 'blocked-by-guard';
    rec.guard = { status: blocked.status, ...blocked.body };
    return rec;
  }

  let buf;
  const t0 = Date.now();
  try {
    buf = await renderPlanPdf(plan);
  } catch (err) {
    rec.error = `render threw: ${err && err.message || err}`;
    return rec;
  }
  rec.ms = Date.now() - t0;

  if (outDir) {
    rec.file = path.join(outDir, `meal-plan-${lang}.pdf`);
    fs.writeFileSync(rec.file, buf);
  }

  let info;
  try { info = inspectPdf(buf); }
  catch (err) { rec.error = `inspect failed: ${err && err.message || err}`; return rec; }
  Object.assign(rec, { pages: info.pages, bytes: info.bytes, mode: info.mode, fonts: info.fonts });

  // Non-fatal font findings (baseline for PDF-005 glyph coverage):
  //  - a font that is not embedded means the locale's font lacked a glyph and
  //    @react-pdf fell back to a standard-14 font (Helvetica) — the viewer then
  //    substitutes whatever it has;
  //  - a "-Thin" instance means a variable font was embedded at its default
  //    wght axis position (100) instead of Regular/Bold.
  for (const f of info.fonts || []) {
    if (!f.embedded) rec.warnings.push(`non-embedded fallback font: ${f.name}`);
    if (/-Thin$/i.test(f.name)) rec.warnings.push(`variable font embedded at Thin weight: ${f.name}`);
  }

  if (!info.validHeader || !info.validTrailer) { rec.error = 'not a structurally valid PDF'; return rec; }
  if (!(info.pages > 0)) { rec.error = 'PDF has 0 pages'; return rec; }
  if (info.text !== null) {
    const m = matchStrings(info.text, [plan.title, ...fixtureRecipeNames(lang, { days })]);
    rec.missing = m.missing;
    rec.weakMatches = m.weak;
    if (rec.missing.length) { rec.error = `${rec.missing.length} expected string(s) missing from extracted text`; return rec; }
  }
  rec.status = 'ok';
  return rec;
}

/** Render every requested locale sequentially (same process, like a warm instance). */
export async function renderAll({ langs = PDF_LOCALES, outDir = null, days = 7 } = {}) {
  const results = [];
  for (const lang of langs) results.push(await renderLocale(lang, { outDir, days }));
  return results;
}

function parseArgs(argv) {
  const a = { out: path.join(os.tmpdir(), 'pdf-001'), langs: PDF_LOCALES, days: 7, json: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--out') a.out = argv[++i];
    else if (k === '--langs') a.langs = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    else if (k === '--days') a.days = Number(argv[++i]);
    else if (k === '--json') a.json = true;
    else if (k === '-h' || k === '--help') {
      console.log('node scripts/pdf/render-all.mjs [--out DIR] [--langs ro,en,...] [--days N] [--json]');
      process.exit(0);
    } else throw new Error(`unknown argument: ${k}`);
  }
  return a;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.out, { recursive: true });
  const results = await renderAll({ langs: args.langs, outDir: args.out, days: args.days });
  fs.writeFileSync(path.join(args.out, 'results.json'), JSON.stringify(results, null, 2));

  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`PDF-001 offline harness — ${results.length} locale(s), ${args.days}-day fixture, ` +
                `inspection: ${hasPoppler() ? 'poppler' : 'builtin (no poppler: no text checks)'}`);
    console.log(`Output: ${args.out}\n`);
    for (const r of results) {
      const tag = r.status === 'ok' ? 'OK     ' : r.status === 'blocked-by-guard' ? 'BLOCKED' : 'FAIL   ';
      let line = `  ${tag} ${r.lang}`;
      if (r.status === 'blocked-by-guard') line += `  guard ${r.guard.status} ${r.guard.error} (expected)`;
      else line += `  pages=${r.pages} bytes=${r.bytes} ${r.ms}ms`;
      if (r.error) line += `  — ${r.error}`;
      console.log(line);
      if (r.missing.length) for (const m of r.missing) console.log(`            missing: ${m}`);
      for (const w of r.warnings) console.log(`            warning: ${w}`);
      if (r.weakMatches.length) {
        console.log(`            ${r.weakMatches.length} string(s) matched only via the Devanagari ` +
                    'skeleton fallback (pdftotext extracts visual order)');
      }
    }
    const n = s => results.filter(r => r.status === s).length;
    console.log(`\n  ok=${n('ok')}  blocked-by-guard=${n('blocked-by-guard')}  fail=${n('fail')}`);
  }
  process.exit(results.some(r => r.status === 'fail') ? 1 : 0);
}
