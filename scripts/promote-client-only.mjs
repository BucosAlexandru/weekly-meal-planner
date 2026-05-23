#!/usr/bin/env node
/* ================================================================
   promote-client-only.mjs — port client-only image URLs from
   public/js/content.js's runtime IMG map into the SSR-driven map in
   public/js/recipe-images.js.

   Background: as of Phase I.2, 86 recipes were classified `client-only`
   in IMAGE_QA_REPORT.md — they render emoji in the SSR HTML and og:image
   meta, then content.js client-side injects a Wikipedia/Spoonacular URL
   if one happens to be in its parallel IMG map. That is invisible to
   search engines, social-share previews, and JS-disabled visitors.

   Promotion moves the URL into recipe-images.js so generate-content.mjs's
   resolveRecipeImage() picks it up at build time. After this:
     - the SSR <img> renders the photo
     - og:image / twitter:image meta tags use the photo URL
     - bucket 3 → bucket 2

   What it does NOT do:
     - fetch the URL or verify it's still live (sandbox blocks every photo
       host). URL liveness has to be checked separately.
     - touch content.js (kept as runtime safety net for now). Long-term it
       can be deleted once every entry is promoted.
     - promote URLs flagged suspicious — they're listed in the skip report.

   Output:
     - rewrites public/js/recipe-images.js in place (sorted by id)
     - writes docs/ai/CONTENT_JS_PROMOTION_REPORT.md
   ================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { recipes } from '../public/js/recipes.js';
import { recipeImages } from '../public/js/recipe-images.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const REC_IMG_FILE = path.join(ROOT, 'public', 'js', 'recipe-images.js');
const CONTENT_JS  = path.join(ROOT, 'public', 'js', 'content.js');
const REPORT      = path.join(ROOT, 'docs', 'ai', 'CONTENT_JS_PROMOTION_REPORT.md');

// Reuse the audit's suspicious patterns so any URL that's been flagged
// in IMAGE_QA_REPORT.md never gets silently promoted.
const SUSPICIOUS = [
  { re: /3_types_of_lentil/i, why: 'documented bad: raw lentils, not cooked dal' },
  { re: /Wikimanian|conference/i, why: 'documented bad: generic wikimedia event photo' },
  { re: /\b(placeholder|noimage|nopicture)\b/i, why: 'placeholder-looking filename' },
  { re: /(istockphoto|gettyimages|alamy|shutterstock)\b/i, why: 'commercial stock-photo source' },
];

// URLs to never promote even if no SUSPICIOUS pattern matches, e.g. URLs
// the user has called out by hand. Add new entries here with a comment.
const HARD_SKIP_URLS = new Set([
  // empty for now
]);

function readContentJsImg() {
  const src = fs.readFileSync(CONTENT_JS, 'utf8');
  const start = src.indexOf('const IMG =');
  const end = src.indexOf('};', start);
  if (start < 0 || end < 0) throw new Error('Could not locate IMG map in content.js');
  const block = src.slice(start, end);
  const out = {};
  for (const m of block.matchAll(/^\s*"([a-z0-9 \-]+)":\s*"(https?:[^"]+)"/gmi)) {
    out[m[1].toLowerCase()] = m[2];
  }
  return out;
}

function urlLooksValid(url) {
  // Must be https. Wikipedia/Spoonacular both serve over https; an http URL
  // would be downgraded by HSTS and embarrass us with mixed-content warnings.
  if (!/^https:\/\//.test(url)) return 'not-https';
  // Must look like an image extension. Wikipedia thumb URLs end with the
  // filename (e.g. .../330px-Foo.jpg). Spoonacular URLs end in -312x231.jpg.
  if (!/\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(url)) return 'no-image-extension';
  for (const p of SUSPICIOUS) if (p.re.test(url)) return `suspicious: ${p.why}`;
  if (HARD_SKIP_URLS.has(url)) return 'hard-skip-list';
  return null;
}

function rewriteRecipeImages(additions) {
  // Strategy: parse the current file, build a Map of {id → url}, merge
  // additions, regenerate the file with the original header + comments
  // preserved for ids we don't touch.
  const orig = fs.readFileSync(REC_IMG_FILE, 'utf8');
  const headerEnd = orig.indexOf('export const recipeImages = {');
  const header = orig.slice(0, headerEnd) + 'export const recipeImages = {';
  const bodyEnd = orig.lastIndexOf('};');
  const body = orig.slice(headerEnd + 'export const recipeImages = {'.length, bodyEnd);

  // Parse existing entries AND comment lines (so we keep the "Dhal removed"
  // explanatory comments next to their ids).
  const lines = body.split('\n');
  const byId = new Map();           // id → { line: 'N: "url",', comment: '// ...' | null }
  const looseComments = [];          // comments not attached to an id
  let pendingComment = null;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { pendingComment = null; continue; }
    const idMatch = line.match(/^\s*(\d+):\s*['"].*['"]\s*,?\s*(?:\/\/.*)?$/);
    if (idMatch) {
      byId.set(+idMatch[1], { line: line.trim(), comment: pendingComment });
      pendingComment = null;
      continue;
    }
    const commentMatch = line.match(/^\s*\/\/\s*(\d+)\s+(.+)$/);
    if (commentMatch) {
      // Comment of the form `// 12 Dhal — image removed (was: ...)`
      // Treat it as attached to that id even if no entry follows.
      const id = +commentMatch[1];
      byId.set(id, { line: null, comment: line.trim() });
      pendingComment = null;
      continue;
    }
    // Any other comment line — try to attach to the next id.
    pendingComment = line.trim();
  }

  // Add new entries from additions
  for (const { id, url } of additions) {
    const existing = byId.get(id);
    byId.set(id, {
      line: `${id}: '${url}',`,
      comment: existing?.comment || null,
    });
  }

  // Emit sorted by id
  const ids = [...byId.keys()].sort((a, b) => a - b);
  const out = ids.map(id => {
    const { line, comment } = byId.get(id);
    const parts = [];
    if (comment) parts.push('  ' + comment);
    if (line) parts.push('  ' + line);
    return parts.join('\n');
  }).join('\n');

  const next = header + '\n' + out + '\n};\n';
  fs.writeFileSync(REC_IMG_FILE, next);
}

// ── Main ──
const contentImg = readContentJsImg();
const decisions = { promote: [], skip: [] };

for (const r of recipes) {
  if (recipeImages[r.id]) continue;                          // already mapped
  const nameEn = (r.name?.en || r.name?.ro || '').toLowerCase();
  const url = contentImg[nameEn];
  if (!url) continue;                                        // bucket 4, not 3
  const issue = urlLooksValid(url);
  if (issue) {
    decisions.skip.push({ id: r.id, name: r.name?.en || r.name?.ro, url, reason: issue });
  } else {
    decisions.promote.push({ id: r.id, name: r.name?.en || r.name?.ro, url });
  }
}

console.log(`Scanned ${recipes.length} recipes.`);
console.log(`Already mapped (skipped): ${recipes.filter(r => recipeImages[r.id]).length}`);
console.log(`Promote: ${decisions.promote.length}`);
console.log(`Skip (suspicious/malformed): ${decisions.skip.length}`);

if (decisions.promote.length === 0) {
  console.log('Nothing to promote. Exiting.');
} else {
  rewriteRecipeImages(decisions.promote);
  console.log(`✓ rewrote ${path.relative(ROOT, REC_IMG_FILE)} (+${decisions.promote.length} entries)`);
}

// ── Report ──
const reportMd = `# CONTENT_JS_PROMOTION_REPORT

Generated by \`scripts/promote-client-only.mjs\` on ${new Date().toISOString().slice(0,10)}.

## Summary

| Metric | Count |
|---|---|
| Recipes scanned | ${recipes.length} |
| Already in \`recipe-images.js\` (untouched) | ${recipes.filter(r => recipeImages[r.id]).length} |
| Promoted (URL valid, no suspicious pattern) | ${decisions.promote.length} |
| Skipped (suspicious or malformed URL) | ${decisions.skip.length} |
| Truly missing (no content.js entry either) | ${recipes.length - recipes.filter(r => recipeImages[r.id]).length - decisions.promote.length - decisions.skip.length} |

## Promoted entries

${decisions.promote.length ? '| ID | Name | URL |\n|---|---|---|\n' + decisions.promote.map(p => `| ${p.id} | ${p.name} | ${p.url} |`).join('\n') : '_(none)_'}

## Skipped — left in content.js for now

${decisions.skip.length ? '| ID | Name | Reason | URL |\n|---|---|---|---|\n' + decisions.skip.map(s => `| ${s.id} | ${s.name} | ${s.reason} | ${s.url} |`).join('\n') : '_(none)_'}

## What happens next

1. \`npm run content\` regenerates SSR HTML with new \`<img>\` tags.
2. \`node scripts/audit-images.mjs\` should show:
   - bucket 2 (mapped external) ↑ by ${decisions.promote.length}
   - bucket 3 (client-only) ↓ by ${decisions.promote.length}
   - SSR-emoji total ↓ by ${decisions.promote.length}
3. Pages whose external URL 404s in production will gracefully fall back
   to the SSR emoji via the \`onerror="this.remove()"\` handler added in
   Phase I.2.
4. \`og:image\` and \`twitter:image\` meta tags now reference the photo URL,
   so social-share previews stop showing cover2.jpg for these recipes.

## Constraints honoured

- URL liveness was NOT verified — sandbox blocks every photo host. Failures
  in production will degrade to emoji, not broken images.
- \`content.js\` IMG map left intact as a runtime safety net. Promoted
  entries are now duplicated between the two files; the long-term cleanup
  is to delete the IMG map once we're confident the SSR path is canonical.
- No recipe content, navigation, PDF, or homepage code was touched.
`;

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, reportMd);
console.log(`✓ wrote ${path.relative(ROOT, REPORT)}`);
