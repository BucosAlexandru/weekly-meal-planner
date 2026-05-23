#!/usr/bin/env node
/* ================================================================
   batch-image-add.mjs — process a manifest of recipe-image additions.

   Usage:
     node scripts/batch-image-add.mjs data/image-batch.json
     node scripts/batch-image-add.mjs data/image-batch.json --dry-run

   Manifest format (data/image-batch.json):
     [
       { "id": 12,  "source": "./sources/dhal.jpg",   "credit": "user-supplied" },
       { "id": 39,  "source": "https://raw.githubusercontent.com/me/food/main/poutine.jpg" },
       { "id": 149, "source": "./sources/pozole.webp", "force": true }
     ]

   For each entry:
     1. Calls add-recipe-image.mjs with --no-build (defer rebuild to the end).
     2. Collects success/failure per id.
   Then once:
     3. Runs `npm run content` (one rebuild for the whole batch).
     4. Runs the audit and prints before/after delta:
          - P0 count: X → Y
          - P1 count: X → Y
          - Bucket-1 (local): X → Y
          - Bucket-3+4 (SSR emoji): X → Y

   Production safety: same as add-recipe-image.mjs — additive only,
   skips on existing files unless force=true in the manifest entry.
   ================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { recipes } from '../public/js/recipes.js';
import { recipeImages } from '../public/js/recipe-images.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const slug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

// Snapshot the current state so we can show "before → after" coverage.
function snapshotEffective() {
  const IMG = path.join(ROOT, 'public', 'images');
  const out = { local: 0, mapped: 0, clientOnly: 0, fallback: 0 };
  // Re-derive content.js IMG keys (same parser as audit-images.mjs).
  const src = fs.readFileSync(path.join(ROOT, 'public', 'js', 'content.js'), 'utf8');
  const block = src.slice(src.indexOf('const IMG ='), src.indexOf('};', src.indexOf('const IMG =')));
  const contentKeys = new Set();
  for (const m of block.matchAll(/^\s*"([a-z0-9 \-]+)":\s*"https?:/gmi)) contentKeys.add(m[1].toLowerCase());

  for (const r of recipes) {
    const rslug = slug(r.name?.en || r.name?.ro || '');
    if (fs.existsSync(path.join(IMG, `${rslug}.webp`)) || fs.existsSync(path.join(IMG, `${rslug}.jpg`))) out.local++;
    else if (recipeImages[r.id]) out.mapped++;
    else if (contentKeys.has((r.name?.en || '').toLowerCase())) out.clientOnly++;
    else out.fallback++;
  }
  return out;
}

const args = process.argv.slice(2);
const manifestPath = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
if (!manifestPath) {
  console.error('usage: node scripts/batch-image-add.mjs <manifest.json> [--dry-run]');
  process.exit(2);
}
if (!fs.existsSync(manifestPath)) {
  console.error(`manifest not found: ${manifestPath}`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
if (!Array.isArray(manifest) || !manifest.length) {
  console.error('manifest must be a non-empty array');
  process.exit(2);
}

console.log(`\nManifest: ${manifest.length} entries`);
const before = snapshotEffective();
console.log(`Before: local=${before.local} mapped=${before.mapped} client-only=${before.clientOnly} fallback=${before.fallback}`);

const results = { ok: [], failed: [] };
for (const entry of manifest) {
  if (!entry.id || !entry.source) {
    console.error(`skip: malformed entry (need id + source): ${JSON.stringify(entry)}`);
    results.failed.push(entry);
    continue;
  }
  const recipe = recipes.find(r => r.id === entry.id);
  if (!recipe) {
    console.error(`skip: no recipe with id=${entry.id}`);
    results.failed.push(entry);
    continue;
  }
  console.log(`\n— id=${entry.id} "${recipe.name?.en || recipe.name?.ro}"`);
  const argv = ['scripts/add-recipe-image.mjs', '--id', String(entry.id), '--source', entry.source, '--no-build'];
  if (entry.force) argv.push('--force');
  if (dryRun) argv.push('--dry-run');
  const r = spawnSync('node', argv, { stdio: 'inherit' });
  (r.status === 0 ? results.ok : results.failed).push(entry);
}

if (dryRun) {
  console.log('\n[dry-run] no rebuild, no commit. Re-run without --dry-run to apply.');
  process.exit(0);
}

if (!results.ok.length) {
  console.error('\nNo entries succeeded — skipping rebuild.');
  process.exit(1);
}

console.log(`\n${results.ok.length} ok, ${results.failed.length} failed. Rebuilding ...`);
execSync('npm run content', { stdio: 'inherit' });

const after = snapshotEffective();
console.log(`\n── Coverage delta ──`);
console.log(`local:       ${before.local} → ${after.local}   (Δ ${after.local - before.local >= 0 ? '+' : ''}${after.local - before.local})`);
console.log(`mapped:      ${before.mapped} → ${after.mapped}`);
console.log(`client-only: ${before.clientOnly} → ${after.clientOnly}   (Δ ${after.clientOnly - before.clientOnly})`);
console.log(`fallback:    ${before.fallback} → ${after.fallback}   (Δ ${after.fallback - before.fallback})`);
console.log(`SSR-emoji (bucket 3+4): ${before.clientOnly + before.fallback} → ${after.clientOnly + after.fallback}`);

console.log(`\nFull audit:`);
execSync('node scripts/audit-images.mjs', { stdio: 'inherit' });

if (results.failed.length) {
  console.error(`\n⚠️  ${results.failed.length} entries failed — see logs above.`);
  process.exit(1);
}
