#!/usr/bin/env node
/* ================================================================
   audit-images.mjs — deterministic image QA over all 175 recipes.

   Inspects (without network calls):
     - public/js/recipe-images.js  (ID → external URL map)
     - public/js/recipes.js        (recipe metadata)
     - public/images/<slug>.{jpg,webp}  (local overrides, take precedence)

   Emits:
     - docs/ai/IMAGE_QA_REPORT.md       per-recipe table + flags + priority
     - docs/ai/FLAGSHIP_IMAGE_PRIORITY.md  curated 20-recipe deep-dive

   Re-run after every image-fetch tool batch to verify state.

   Constraints noted in CLAUDE.md / RECIPE_IMAGES_MISSING.md:
     - recipe-images.js is auto-generated, do not hand-edit.
     - Sandbox blocks Spoonacular + Wikipedia, so URL liveness is
       not validated here — only mapping presence and shape.
   ================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { recipes } from '../public/js/recipes.js';
import { recipeImages } from '../public/js/recipe-images.js';

const PUBLIC = path.join(process.cwd(), 'public');
const IMG_DIR = path.join(PUBLIC, 'images');
const DOCS = path.join(process.cwd(), 'docs', 'ai');

// content.js carries a parallel IMG map (recipe-name → URL) used to inject
// images client-side. It pre-dates recipe-images.js and now diverges from it.
// As of Phase I.2 content.js no longer overwrites SSR-rendered <img>s, but
// the data can still drift. Parse it once so the audit flags divergence.
function readContentJsImgMap() {
  try {
    const src = fs.readFileSync(path.join(PUBLIC, 'js', 'content.js'), 'utf8');
    const start = src.indexOf('const IMG =');
    const end = src.indexOf('};', start);
    if (start < 0 || end < 0) return {};
    const block = src.slice(start, end);
    const out = {};
    for (const m of block.matchAll(/^\s*"([a-z0-9 \-]+)":\s*"(https?:[^"]+)"/gmi)) {
      out[m[1].toLowerCase()] = m[2];
    }
    return out;
  } catch { return {}; }
}
const CONTENT_JS_IMG = readContentJsImgMap();

// Slug derivation must mirror generate-content.mjs's local helper. Any drift
// here means local override files won't be detected.
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// 20 flagship recipes by exact English name. Order = visible-impact priority.
// "Tacos" and "Chicken Curry" stand in for the user-spec "Tacos al Pastor" and
// "Butter Chicken" — those exact names don't exist in recipes.js but the
// closest cultural equivalents do.
const FLAGSHIP_NAMES = [
  'Sushi', 'Dhal', 'Poutine', 'Pozole',
  'Tonkotsu Ramen', 'Shoyu Ramen', 'Miso Ramen',
  'Tacos', 'Chicken Curry', 'Pho', 'Paella', 'Bibimbap',
  'Spaghetti Carbonara', 'French Onion Soup', 'Pad Thai', 'Shakshuka',
  'Tom Yum', 'Biryani', 'Fish and Chips', 'Moussaka',
];

// Read JPEG/PNG/WebP dimensions via `file` (always installed). Returns null
// if the binary doesn't recognise the format or the file is missing.
function imageDimensions(filePath) {
  try {
    const out = execSync(`file -b ${JSON.stringify(filePath)}`, { encoding: 'utf-8' });
    // Examples (depends on format):
    //   "JPEG image data, ..., density 72x72, ..., 6000x4000, components 3"
    //   "PNG image data, 800 x 600, 8-bit/color RGB, ..."
    //   "Web/P image, VP8 encoding, 1200x800, ..."
    // `file` sometimes emits BOTH "density 72x72" (DPI) and "WxH" (real
    // dimensions). Pick the largest WxH so we don't return DPI density.
    const matches = [...out.matchAll(/(\d{2,5})\s*x\s*(\d{2,5})/g)]
      .map(m => ({ w: +m[1], h: +m[2] }));
    if (!matches.length) return null;
    const best = matches.reduce((a, b) => (a.w * a.h >= b.w * b.h ? a : b));
    return { ...best, raw: out.trim() };
  } catch { return null; }
}

function classifyMapping(url) {
  if (!url) return 'none';
  if (/img\.spoonacular\.com/.test(url)) return 'spoonacular';
  if (/upload\.wikimedia\.org|wikipedia/.test(url)) return 'wikipedia';
  if (/meal-planner\.ro\/images/.test(url)) return 'local-domain';
  return 'other';
}

// Heuristic: filename hints that don't match the dish/category. We can't see
// the actual image bytes, so we flag known-bad fragments documented in
// RECIPE_IMAGES_MISSING.md plus a couple of generic patterns.
const SUSPICIOUS_PATTERNS = [
  { re: /3_types_of_lentil/i, why: 'documented bad: raw lentils, not cooked dal' },
  { re: /Wikimanian|conference/i, why: 'documented bad: generic wikimedia event photo' },
  // Word-boundary match so "Stockholm" doesn't trip the "stock" filter.
  { re: /\b(placeholder|noimage|nopicture)\b/i, why: 'placeholder-looking filename' },
  { re: /(istockphoto|gettyimages|alamy|shutterstock)\b/i, why: 'commercial stock-photo source' },
];

function auditRecipe(r) {
  const id = r.id;
  const nameEn = r.name?.en || r.name?.ro || `(id ${id})`;
  const nameRo = r.name?.ro || nameEn;
  const origin = r.origin?.en || r.origin?.ro || '';
  const rslug = slug(r.name?.en || r.name?.ro || '');
  const isFlagship = FLAGSHIP_NAMES.includes(nameEn);

  const mappingUrl = recipeImages[id] || null;
  const mappingSrc = classifyMapping(mappingUrl);

  // Local overrides take precedence at build time. Order matches
  // resolveRecipeImage() in generate-content.mjs: .webp first, then .jpg.
  const localWebp = path.join(IMG_DIR, `${rslug}.webp`);
  const localJpg  = path.join(IMG_DIR, `${rslug}.jpg`);
  let localFile = null, localDims = null;
  if (fs.existsSync(localWebp)) { localFile = localWebp; localDims = imageDimensions(localWebp); }
  else if (fs.existsSync(localJpg)) { localFile = localJpg; localDims = imageDimensions(localJpg); }

  // Effective source the SSR-rendered <img> + OG meta image use. Note:
  // content.js's runtime IMG map injects images client-side AFTER the page
  // loads, so users see them — but Open Graph meta-image, social share
  // previews, and search-engine crawlers see only the SSR URL. That makes
  // a `client-only` recipe still SEO/share-broken even if visually fine.
  const contentKey = nameEn.toLowerCase();
  const contentUrl = CONTENT_JS_IMG[contentKey];
  let effective;
  if (localFile) effective = localFile.endsWith('.webp') ? 'local-webp' : 'local-jpg';
  else if (mappingUrl) effective = mappingSrc;
  else if (contentUrl) effective = 'client-only';     // visible but OG=cover2
  else effective = 'fallback';                         // emoji + OG=cover2

  const flags = [];
  if (effective === 'fallback') flags.push('FALLBACK');
  if (effective === 'client-only') flags.push('CLIENT_ONLY');
  if (!mappingUrl && !localFile && !contentUrl) flags.push('NO_MAPPING');
  if (localDims && localDims.w < 600) flags.push('LOWRES');
  if (localFile) {
    // File-size heuristic: anything > 500 KB is expensive on mobile.
    // Optimised cover photos are typically 60–150 KB at 1200×800.
    const sz = fs.statSync(localFile).size;
    if (sz > 500 * 1024) flags.push(`OVERSIZED:${Math.round(sz/1024)}KB`);
  }
  if (localDims) {
    const ar = localDims.w / localDims.h;
    if (ar < 1.0 || ar > 2.2) flags.push('UNUSUAL_AR');
  }
  for (const p of SUSPICIOUS_PATTERNS) {
    if (mappingUrl && p.re.test(mappingUrl)) flags.push(`SUSPICIOUS:${p.why}`);
  }
  // Divergence between recipe-images.js and content.js's parallel IMG map.
  // Same recipe name with different URLs in each file = data drift that
  // tends to surface as the "wrong image" bug after a re-fetch.
  if (mappingUrl && contentUrl && mappingUrl !== contentUrl) {
    flags.push('MAP_DIVERGENCE');
  }
  for (const p of SUSPICIOUS_PATTERNS) {
    if (contentUrl && p.re.test(contentUrl)) flags.push(`CONTENT_JS_SUSPICIOUS:${p.why}`);
  }
  if (isFlagship) flags.push('FLAGSHIP');

  // Priority:
  //   P0 = flagship + truly broken (fallback or suspicious URL anywhere)
  //   P1 = visible quality issue (low-res / unusual aspect / suspicious in
  //        either map) on any recipe
  //   P2 = generic miss: cover2 fallback on a long-tail recipe, OR
  //        client-only (OG meta still shows cover2, bad for sharing)
  //   P3 = OK as-is (or nothing tractable from sandbox)
  let priority = 'P3';
  const isSuspicious = flags.some(f => f.startsWith('SUSPICIOUS') || f.startsWith('CONTENT_JS_SUSPICIOUS'));
  const hasSizeIssue = flags.includes('LOWRES') || flags.includes('UNUSUAL_AR') || flags.some(f => f.startsWith('OVERSIZED'));
  if (isFlagship && (effective === 'fallback' || isSuspicious)) priority = 'P0';
  else if (isSuspicious || hasSizeIssue) priority = 'P1';
  else if (effective === 'fallback') priority = 'P2';
  else if (effective === 'client-only') priority = isFlagship ? 'P1' : 'P2';

  let action;
  if (priority === 'P3') action = '—';
  else if (effective === 'fallback') action = isFlagship
    ? `Drop image into public/images/${rslug}.{webp,jpg}, OR fetch via Spoonacular tool`
    : 'Fetch via Spoonacular/Wikipedia tool';
  else if (effective === 'client-only') action = isFlagship
    ? `Promote URL from content.js IMG to recipe-images.js, OR drop public/images/${rslug}.{webp,jpg}`
    : 'Promote URL from content.js IMG to recipe-images.js (so OG / social share use it too)';
  else if (isSuspicious) action = 'Replace URL — flagged in RECIPE_IMAGES_MISSING.md';
  else if (flags.includes('LOWRES')) action = 'Replace local file with ≥600px wide source';
  else if (flags.some(f => f.startsWith('OVERSIZED'))) action = 'Re-encode local file (target ≤150 KB, 1200px wide, WebP if possible)';
  else if (flags.includes('UNUSUAL_AR')) action = 'Re-crop local file (target ~4:3 or 16:9)';
  else action = '—';

  return { id, nameEn, nameRo, origin, slug: rslug, isFlagship,
           mappingUrl, mappingSrc, localFile: localFile ? path.relative(PUBLIC, localFile) : null,
           localDims, effective, flags, priority, action };
}

const audits = recipes.map(auditRecipe).sort((a, b) => {
  // sort by priority (P0 first) then by flagship then by id
  const rank = p => ({ P0: 0, P1: 1, P2: 2, P3: 3 })[p];
  return rank(a.priority) - rank(b.priority)
      || (b.isFlagship - a.isFlagship)
      || (a.id - b.id);
});

// ── Stats ──
const byPriority = audits.reduce((m, a) => (m[a.priority] = (m[a.priority]||0)+1, m), {});
const bySource = audits.reduce((m, a) => (m[a.effective] = (m[a.effective]||0)+1, m), {});

// ── Main report ──
const mainTable = audits.map(a => `| ${a.id} | ${a.nameEn.replace(/\|/g,'\\|')} | ${a.origin} | ${a.effective} | ${a.flags.join(', ') || '—'} | **${a.priority}** | ${a.action} |`).join('\n');

const mainMd = `# IMAGE_QA_REPORT

Generated by \`scripts/audit-images.mjs\` on ${new Date().toISOString().slice(0,10)}.
Re-run with \`node scripts/audit-images.mjs\` after every image batch.

## Summary

| Metric | Count |
|---|---|
| Total recipes | ${recipes.length} |
| With external mapping | ${audits.filter(a => a.mappingUrl).length} |
| With local override (\`public/images/<slug>.{jpg,webp}\`) | ${audits.filter(a => a.localFile).length} |
| Effectively showing cover2.jpg fallback | ${audits.filter(a => a.effective === 'fallback').length} |
| Flagship recipes | ${audits.filter(a => a.isFlagship).length} |

### Effective source breakdown
${Object.entries(bySource).map(([k,v]) => `- **${k}**: ${v}`).join('\n')}

### Priority distribution
${Object.entries(byPriority).map(([k,v]) => `- **${k}**: ${v}`).join('\n')}

## Priority legend

- **P0** — Flagship recipe currently showing fallback OR a documented-bad image. Fix first.
- **P1** — Visible quality issue (low-res local file, weird aspect ratio, suspicious URL).
- **P2** — Generic miss: long-tail recipe using cover2.jpg fallback. Batch with the tool.
- **P3** — OK as-is (or unfixable in sandbox).

## Per-recipe audit

| ID | Name | Origin | Source | Flags | Priority | Action |
|---|---|---|---|---|---|---|
${mainTable}

## Constraints

- Image bytes are **not fetched** during this audit — sandbox network blocks \`img.spoonacular.com\` and \`upload.wikimedia.org\`. Mapping presence/shape is verified, not liveness.
- Local-file dimensions come from \`file -b\` (works for JPEG/PNG/WebP).
- "Suspicious" flagging uses substring patterns sourced from \`RECIPE_IMAGES_MISSING.md\` — extend that file when new bad URLs are discovered.

## Architecture note: two parallel image maps

The codebase ships **two** image maps that the audit cross-references:

1. \`public/js/recipe-images.js\` — auto-generated by external fetch tooling.
   Indexed by recipe **id**. The build (\`scripts/generate-content.mjs\`) consults
   this for the SSR \`<img>\` tag + the \`og:image\` meta. **Do not hand-edit.**
2. \`public/js/content.js\` — older, hand-maintained inline \`IMG\` map indexed by
   lowercased recipe **name**. Runs client-side after page load, appends an
   \`<img>\` to \`.recipe-photo-container\` only if no SSR img is present.

Recipes that exist in (2) but not (1) are flagged \`CLIENT_ONLY\` because:
- humans see the image fine (runtime injection succeeds),
- but \`og:image\`, social-share previews, and search-engine crawlers see only
  the SSR-resolved URL — which is \`cover2.jpg\` here.

Long-term fix: promote URLs from \`content.js\` into \`recipe-images.js\` (the
tool can do this idempotently). Once \`content.js\` is empty, delete it.
`;

fs.mkdirSync(DOCS, { recursive: true });
fs.writeFileSync(path.join(DOCS, 'IMAGE_QA_REPORT.md'), mainMd);
console.log('✅ docs/ai/IMAGE_QA_REPORT.md written');

// ── Flagship deep-dive ──
const flagshipRows = FLAGSHIP_NAMES.map(name => {
  const a = audits.find(x => x.nameEn === name);
  if (!a) return `| — | **${name}** (NOT FOUND in recipes.js) | — | — | replace name match or add recipe |`;
  const culturalOK = (() => {
    if (a.effective === 'fallback') return '❌ generic fallback';
    if (a.flags.some(f => f.startsWith('SUSPICIOUS'))) return '❌ flagged';
    if (a.effective === 'local-jpg' || a.effective === 'local-webp') return '✓ curated local';
    if (a.mappingSrc === 'spoonacular') return '⚠ spoonacular (verify match)';
    if (a.mappingSrc === 'wikipedia') return '⚠ wikipedia (verify match)';
    return '?';
  })();
  const cropOK = a.localDims
    ? (a.localDims.w / a.localDims.h >= 1.0 && a.localDims.w / a.localDims.h <= 2.2 ? '✓' : '⚠ unusual')
    : '? (external)';
  const replace = (a.effective === 'fallback' || a.flags.some(f => f.startsWith('SUSPICIOUS'))) ? 'YES' : 'no';
  return `| ${a.id} | **${name}** | ${a.effective} | ${culturalOK} | ${cropOK} | ${replace} |`;
}).join('\n');

const flagshipMd = `# FLAGSHIP_IMAGE_PRIORITY

The 20 recipes whose image quality drives the visible-credibility ceiling for
the whole site. If a first-time visitor lands on one of these, they form their
opinion of the catalogue from this single page — so these must be impeccable
before scaling QA to the long tail.

Generated by \`scripts/audit-images.mjs\` on ${new Date().toISOString().slice(0,10)}.

## Deep-dive

| ID | Recipe | Effective source | Cultural correctness | Mobile crop | Replace? |
|---|---|---|---|---|---|
${flagshipRows}

## Action list (P0 first)

${audits.filter(a => a.isFlagship && a.priority === 'P0').map(a => `1. **${a.nameEn}** (id ${a.id}) — ${a.action}`).join('\n') || '_None — flagship recipes are clean._'}

## How to replace fast

Three paths, in order of speed:

1. **Local override** (fastest, sandbox-friendly)
   - Drop a JPEG or WebP at \`public/images/<slug>.jpg\` (≥600px wide, aspect 4:3 or 16:9)
   - Slug = \`slug(recipe.name.en)\` — see \`scripts/audit-images.mjs\` for the exact derivation.
   - The generator already prefers local files over the external mapping
     (\`generate-content.mjs:2782\`), so no code change is needed.
   - Run \`npm run content\` to regenerate, then \`node scripts/audit-images.mjs\` to confirm.

2. **External image-fetch tool** (Spoonacular API + Wikipedia commons)
   - Tooling lives outside this repo (sandbox can't reach those hosts).
   - Pass it the list from \`RECIPE_IMAGES_MISSING.md\` + the P0/P1 IDs above.
   - It rewrites \`public/js/recipe-images.js\` directly — never hand-edit that file.

3. **Mapping fix-up** (for cases where the URL is wrong but recoverable)
   - Add the bad URL to the blacklist in \`RECIPE_IMAGES_MISSING.md\`.
   - Re-run the tool — it will skip that URL on next fetch.

## Constraints to honour

- \`public/js/recipe-images.js\` is auto-generated. Do **not** hand-edit it.
- Every multilingual field still needs all 14 language codes if you also touch
  \`recipes.js\` — but that's out of scope for image work.
- Local files in \`public/images/\` must be optimised: WebP ≤ 60 KB, JPEG ≤ 90 KB
  at 1200×800 to keep page weight low on slow connections.
`;

fs.writeFileSync(path.join(DOCS, 'FLAGSHIP_IMAGE_PRIORITY.md'), flagshipMd);
console.log('✅ docs/ai/FLAGSHIP_IMAGE_PRIORITY.md written');

// Build a refreshed RECIPE_IMAGES_MISSING list (just the IDs section)
const missingIds = audits.filter(a => a.effective === 'fallback')
  .sort((a,b) => a.id - b.id)
  .map(a => `| ${a.id} | ${a.nameEn} | ${a.origin} | ${a.priority} |`);
const missingMd = `

## Auto-generated missing list (refresh)

Generated by \`scripts/audit-images.mjs\` on ${new Date().toISOString().slice(0,10)}.
${missingIds.length} recipes currently fall back to \`cover2.jpg\`.

| ID | Recipe | Origin | Priority |
|---|---|---|---|
${missingIds.join('\n')}
`;
console.log(`\nℹ️  ${missingIds.length} fallback recipes detected — see IMAGE_QA_REPORT.md§Per-recipe audit`);
console.log(`ℹ️  ${audits.filter(a => a.priority === 'P0').length} P0 items, ${audits.filter(a => a.priority === 'P1').length} P1 items`);
