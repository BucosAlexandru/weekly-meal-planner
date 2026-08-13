// Reusable integrator: splice a draft-JSON recipe into production source.
// Usage: node scripts/splice-recipe.mjs drafts/recipes/<file>.json
// Draft shape: { id, servings, tipType, pairingsType, origin{}, name{},
//   category{}, ingredients{lang:[]}, howIsMade{}, originText{},
//   meta:{ time, costRon, tags:[], desc{} } }  (all 14 locales)
// Does NOT run `npm run content` — content is regenerated once per batch.
import fs from 'fs';

const ORDER = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','tr','it','ko','hi'];
const draft = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { id, servings, tipType, pairingsType, origin, name, category,
        ingredients, howIsMade, originText, meta } = draft;

// validate all 14 locales present
for (const f of ['origin','name','category','ingredients','howIsMade','originText'])
  for (const l of ORDER)
    if (draft[f][l] == null) { console.error('MISSING locale', f, l); process.exit(1); }
for (const l of ORDER)
  if (!Array.isArray(ingredients[l]) || ingredients[l].length !== ingredients.en.length) {
    console.error('ingredient length mismatch for', l); process.exit(1);
  }

const q = s => JSON.stringify(s);
const langObj = (o, arr=false) =>
  '{\n' + ORDER.map(l => `      ${l}: ${arr ? JSON.stringify(o[l]) : q(o[l])}`).join(',\n') + '\n    }';

const fcLine = draft.featureCards
  ? '\n    featureCards: {\n' + ORDER.map(l => `      ${l}: ${JSON.stringify(draft.featureCards[l])}`).join(',\n') + '\n    },'
  : '';

const lit = `  {
    id: ${id},
    servings: ${servings},
    tipType: ${q(tipType)},
    pairingsType: ${q(pairingsType)},
    origin: ${langObj(origin)},
    name: ${langObj(name)},
    category: ${langObj(category)},${fcLine}
    ingredients: ${langObj(ingredients, true)},
    howIsMade: ${langObj(howIsMade)},
    originText: ${langObj(originText)}
  }`;

const rpath = 'public/js/recipes.js';
let rsrc = fs.readFileSync(rpath, 'utf8');
if (rsrc.includes(`id: ${id},`)) { console.error(`id ${id} already in recipes.js`); process.exit(1); }
const ci = rsrc.lastIndexOf('\n];');
rsrc = rsrc.slice(0, ci) + ',\n' + lit + rsrc.slice(ci);
fs.writeFileSync(rpath, rsrc, 'utf8');

const mpath = 'public/js/recipes-meta.js';
let msrc = fs.readFileSync(mpath, 'utf8');
const tags = '[' + meta.tags.map(t => `'${t}'`).join(',') + ']';
const metaEntry = `  ${id}: { time: ${meta.time}, costRon: ${meta.costRon}, tags: ${tags},\n         desc: d(${ORDER.map(l => JSON.stringify(meta.desc[l])).join(', ')}) },\n`;
const anchor = '\n};\n\n// ─── Auto-fill remaining recipes';
const ai = msrc.indexOf(anchor);
if (ai === -1) { console.error('meta anchor not found'); process.exit(1); }
msrc = msrc.slice(0, ai) + '\n' + metaEntry + msrc.slice(ai + 1);
fs.writeFileSync(mpath, msrc, 'utf8');

console.log(`spliced ${id} — ${name.en} OK`);
