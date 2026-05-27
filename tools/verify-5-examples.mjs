// Runtime verifier — imports the actual recipesMeta module (after the
// fillDefaults IIFE runs) and dumps the live `recipesMeta[id]` object for
// five INTRO_ONLY example recipes, alongside their originText.en from
// public/js/recipes.js. Proves:
//   - originText exists
//   - recipesMeta.desc is absent / null after the IIFE
//   - no existing desc would be overwritten

import { recipesMeta } from '../public/js/recipes-meta.js';
import { recipes } from '../public/js/recipes.js';

const SLUG_RE = /[^a-z0-9]+/g;
function slug(s) { return (s || '').toLowerCase().replace(SLUG_RE, '-').replace(/^-|-$/g, ''); }

const EXAMPLES = [
  { id: 77,  label: 'Algeria — Chakhchoukha'      },
  { id: 178, label: 'France — Boeuf Bourguignon'  },
  { id: 162, label: 'Mexico — Tlayudas'           },
  { id: 23,  label: 'South Korea — Bibimbap'      },
  { id: 26,  label: 'Italy — Risotto'             },
];

for (const ex of EXAMPLES) {
  const recipe = recipes.find(r => r.id === ex.id);
  const meta   = recipesMeta[ex.id];
  const slugEn = slug(recipe?.name?.en || recipe?.name?.ro || '');

  console.log('━'.repeat(80));
  console.log(`  ${ex.label}`);
  console.log(`  recipe.id: ${ex.id}`);
  console.log(`  slug: /${slugEn}/`);
  console.log('━'.repeat(80));

  // existing originText.en (first 300 chars)
  const otEn = recipe?.originText?.en || '';
  console.log(`\n  recipe.originText.en (${otEn.length} chars total):`);
  console.log(`    ${otEn.slice(0, 300)}${otEn.length > 300 ? '…' : ''}`);

  // Current recipesMeta[id] — as live JS object
  console.log(`\n  Current recipesMeta[${ex.id}] (after fillDefaults IIFE):`);
  console.log('    ' + JSON.stringify(meta, null, 2).split('\n').join('\n    '));

  // Probes
  const hasDesc = !!(meta && meta.desc);
  const descAbsent = meta && (meta.desc === null || meta.desc === undefined);
  console.log(`\n  Field-path checks:`);
  console.log(`    recipesMeta[${ex.id}].desc       = ${JSON.stringify(meta?.desc)}`);
  console.log(`    recipesMeta[${ex.id}].desc?.en   = ${JSON.stringify(meta?.desc?.en)}`);
  console.log(`    originText.en exists?            ${otEn.length > 0}`);
  console.log(`    meta.desc absent?                ${descAbsent}`);
  console.log(`    safe to write (no overwrite)?    ${!hasDesc && otEn.length > 0}`);
  console.log('');
}
