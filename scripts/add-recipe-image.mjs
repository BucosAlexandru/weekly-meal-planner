#!/usr/bin/env node
/* ================================================================
   add-recipe-image.mjs — drop one curated image into public/images/,
   optimise it, verify SSR picks it up.

   Usage:
     node scripts/add-recipe-image.mjs --id 12 --source ./dhal.jpg
     node scripts/add-recipe-image.mjs --id 12 --source https://raw.githubusercontent.com/user/repo/main/dhal.jpg
     node scripts/add-recipe-image.mjs --id 12 --source ./dhal.jpg --no-optimize
     node scripts/add-recipe-image.mjs --id 12 --source ./dhal.jpg --dry-run

   What it does:
     1. Resolve recipe id → slug (matches scripts/generate-content.mjs's slug()).
     2. Read bytes from --source (local file OR URL the sandbox can reach).
     3. Validate it's actually a JPEG/PNG/WebP.
     4. Optimise via sharp:
          - resize to max 1200px wide
          - convert to WebP @ quality 80
          - target ≤200 KB
     5. Write to public/images/<slug>.webp (or .jpg with --no-optimize).
     6. Run `npm run content` so SSR HTML picks up the new file.
     7. Re-run audit, print diff (was → now).

   Sandbox network reality:
     Only `github.com` / `raw.githubusercontent.com` are reachable from this
     environment — every food-photo host (Wikipedia, Spoonacular, Unsplash,
     Pexels, Pixabay, themealdb, weserv, cloudinary) returns 403. To use a
     URL `source`, host the image on GitHub OR pass a local file path.

   Production safety:
     - Pure additive write to public/images/. No edits to recipe-images.js or
       content.js. Reversible: just delete the file.
     - sharp is a devDependency, so Vercel build doesn't touch it.
     - Skips with a clear error if no recipe matches the id.
     - Refuses to overwrite an existing local file unless --force passed.
   ================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { recipes } from '../public/js/recipes.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMG_DIR = path.join(ROOT, 'public', 'images');

// Mirror generate-content.mjs's slug() exactly. Drift here means we write to
// the wrong filename and the build resolver won't find it.
const slug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--id') out.id = +argv[++i];
    else if (a === '--source') out.source = argv[++i];
    else if (a === '--no-optimize') out.noOptimize = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--force') out.force = true;
    else if (a === '--no-build') out.noBuild = true;
    else { console.error(`unknown arg: ${a}`); process.exit(2); }
  }
  if (!out.id || !out.source) {
    console.error('usage: --id N --source PATH_OR_URL [--no-optimize] [--dry-run] [--force] [--no-build]');
    process.exit(2);
  }
  return out;
}

async function loadSourceBytes(source) {
  if (/^https?:\/\//.test(source)) {
    // Sandbox blocks every food-photo host except github.com. Fail loudly if
    // the host isn't reachable instead of writing a 403 HTML page to disk.
    process.stdout.write(`  fetching ${source} ... `);
    const resp = await fetch(source);
    if (!resp.ok) {
      console.log('FAIL');
      throw new Error(`HTTP ${resp.status} — sandbox can usually only reach github.com / raw.githubusercontent.com.`);
    }
    const buf = Buffer.from(await resp.arrayBuffer());
    console.log(`${buf.length} bytes`);
    return buf;
  }
  // Local file path.
  const p = path.resolve(source);
  if (!fs.existsSync(p)) throw new Error(`source file not found: ${p}`);
  return fs.readFileSync(p);
}

function detectFormat(buf) {
  // Magic-byte sniff. We need a real image, not an HTML error page.
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
      && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'webp';
  return null;
}

async function optimise(buf) {
  const { default: sharp } = await import('sharp');
  // 1200px wide is enough for a hero image at @2x on a 600px CSS container.
  // WebP @ q=80 typically lands at 60–180 KB for food photos.
  return sharp(buf)
    .rotate()                                     // honour EXIF orientation
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer({ resolveWithObject: true });
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const recipe = recipes.find(r => r.id === args.id);
  if (!recipe) { console.error(`no recipe with id=${args.id}`); process.exit(1); }
  const enName = recipe.name?.en || recipe.name?.ro || '';
  const rslug = slug(enName);
  console.log(`\nRecipe id=${args.id}  name="${enName}"  slug=${rslug}`);

  const targetWebp = path.join(IMG_DIR, `${rslug}.webp`);
  const targetJpg = path.join(IMG_DIR, `${rslug}.jpg`);
  // Build resolves .webp before .jpg — flag conflict explicitly so user
  // doesn't end up with a stale .jpg shadowed by a new .webp.
  for (const t of [targetWebp, targetJpg]) {
    if (fs.existsSync(t) && !args.force) {
      console.error(`✗ ${path.relative(ROOT, t)} already exists. Pass --force to overwrite, or delete it manually.`);
      process.exit(1);
    }
  }

  console.log(`\nLoading source: ${args.source}`);
  const srcBuf = await loadSourceBytes(args.source);
  const fmt = detectFormat(srcBuf);
  if (!fmt) {
    console.error(`✗ source does not look like a JPEG/PNG/WebP (first bytes: ${srcBuf.slice(0,8).toString('hex')})`);
    console.error('  If you fetched from a URL it may have returned HTML (403/404). Try a local file or a github.com URL.');
    process.exit(1);
  }
  console.log(`  detected: ${fmt}  size: ${srcBuf.length} bytes`);

  let outBuf, outPath, outInfo;
  if (args.noOptimize) {
    outPath = path.join(IMG_DIR, `${rslug}.${fmt === 'jpeg' ? 'jpg' : fmt}`);
    outBuf = srcBuf;
    outInfo = { width: '?', height: '?' };
  } else {
    console.log('\nOptimising via sharp (resize ≤1200px, WebP q=80) ...');
    const { data, info } = await optimise(srcBuf);
    outBuf = data;
    outPath = targetWebp;
    outInfo = info;
    console.log(`  → ${info.width}×${info.height}  ${Math.round(data.length/1024)} KB`);
  }

  if (args.dryRun) {
    console.log(`\n[dry-run] would write ${path.relative(ROOT, outPath)} (${outBuf.length} bytes)`);
    return;
  }

  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.writeFileSync(outPath, outBuf);
  console.log(`\n✓ wrote ${path.relative(ROOT, outPath)}`);

  if (args.noBuild) {
    console.log('\nSkipping rebuild (--no-build). Run `npm run content` then `node scripts/audit-images.mjs` manually.');
    return;
  }

  // Rebuild + verify the SSR HTML picks the new file. Anything else means
  // we wrote to the wrong slug — fail loud rather than silent.
  console.log('\nRebuilding content ...');
  execSync('npm run content', { stdio: 'inherit' });

  const en = recipe.name?.en || recipe.name?.ro;
  const pagePath = path.join(ROOT, 'public', 'en', 'recipes', slug(en), 'index.html');
  if (fs.existsSync(pagePath)) {
    const html = fs.readFileSync(pagePath, 'utf-8');
    const expectedSrc = `https://meal-planner.ro/images/${rslug}.${outPath.endsWith('.webp') ? 'webp' : 'jpg'}`;
    if (html.includes(expectedSrc)) {
      console.log(`✓ SSR HTML now references ${expectedSrc}`);
    } else {
      console.error(`✗ SSR HTML does NOT reference the new file. Expected: ${expectedSrc}`);
      console.error('  Check that scripts/generate-content.mjs:resolveRecipeImage picks .webp before mapped URL.');
      process.exit(1);
    }
  }

  console.log('\nRe-running audit ...');
  execSync('node scripts/audit-images.mjs', { stdio: 'inherit' });
})().catch(e => { console.error('✗', e.message); process.exit(1); });
