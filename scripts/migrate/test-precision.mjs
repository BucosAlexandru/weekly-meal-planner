// Phase 3A — expanded precision quality gates for the ingredient suggester.
//   node scripts/migrate/test-precision.mjs
//
// Every derived/compound product resolves to its OWN concept and NEVER
// collapses into the base food. Alias gaps (chillies→chili, aubergine→eggplant)
// are closed. False positives are blocking.

import { buildKnown, suggestLine } from './lib.mjs';

const known = buildKnown();
let pass = 0, fail = 0; const fails = [];
const s = line => suggestLine(0, line, known);

function expect(label, ok, detail) {
  if (ok) pass++; else { fail++; fails.push(`${label} — ${detail}`); }
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '   → ' + detail}`);
}
const matched = (r, id) => r.status === 'matched' && r.suggestedIds.includes(id);
const has = (r, id) => r.suggestedIds.includes(id);
const notInto = (r, id) => !r.suggestedIds.includes(id);

// ── base ↔ derived/compound distinctions ─────────────────────────────────────
{ const a = s('800g bone-in chicken thighs and drumsticks, skin removed'), b = s('1L chicken or seafood stock');
  expect('chicken thighs → chicken', matched(a, 'chicken'), JSON.stringify(a));
  expect('chicken stock → stock, not chicken', matched(b, 'stock') && notInto(b, 'chicken'), JSON.stringify(b)); }

{ const a = s('700g beef chuck or shin, cut into 3cm cubes'), b = s('1 litre beef stock');
  expect('beef chuck → beef', matched(a, 'beef'), JSON.stringify(a));
  expect('beef stock → stock, not beef', matched(b, 'stock') && notInto(b, 'beef'), JSON.stringify(b)); }

{ const a = s('2 ripe Roma tomatoes, deseeded and diced'), b = s('2 tbsp tomato paste');
  expect('tomatoes → tomato', matched(a, 'tomato'), JSON.stringify(a));
  expect('tomato paste → tomato_paste, not tomato', matched(b, 'tomato_paste') && notInto(b, 'tomato'), JSON.stringify(b)); }

{ const a = s('2 cups Japanese short-grain sushi rice'), b = s('60ml rice vinegar');
  expect('sushi rice → rice', matched(a, 'rice'), JSON.stringify(a));
  expect('rice vinegar → vinegar, not rice', matched(b, 'vinegar') && notInto(b, 'rice'), JSON.stringify(b)); }

{ const a = s('3 tbsp sesame oil'), b = s('1 tsp toasted sesame seeds');
  expect('sesame oil → sesame_oil', matched(a, 'sesame_oil'), JSON.stringify(a));
  expect('sesame seeds ↛ sesame_oil', notInto(b, 'sesame_oil'), JSON.stringify(b)); }

{ const a = s('400ml full-fat coconut milk'), b = s('240ml whole milk');
  expect('coconut milk → coconut_milk, not milk', matched(a, 'coconut_milk') && notInto(a, 'milk'), JSON.stringify(a));
  expect('whole milk → milk, not coconut_milk', matched(b, 'milk') && notInto(b, 'coconut_milk'), JSON.stringify(b)); }

{ const a = s('2 tsp chili oil (la yu) for finishing'), b = s('3-4 Thai red chillies, halved');
  expect('chili oil → chili_oil, not chili', matched(a, 'chili_oil') && notInto(a, 'chili'), JSON.stringify(a));
  expect('chillies → chili', matched(b, 'chili'), JSON.stringify(b)); }

{ const a = s('200ml sour cream'), b = s('300ml double cream (min. 35% fat)');
  expect('sour cream → sour_cream, not generic cream', matched(a, 'sour_cream') && notInto(a, 'cream'), JSON.stringify(a));
  expect('double cream → cream, not sour_cream', matched(b, 'cream') && notInto(b, 'sour_cream'), JSON.stringify(b)); }

{ const a = s('3 tbsp sweet Hungarian paprika'), b = s('2 red bell peppers, diced');
  expect('paprika → paprika, not bell_pepper', matched(a, 'paprika') && notInto(a, 'bell_pepper'), JSON.stringify(a));
  expect('bell pepper → bell_pepper, not paprika', matched(b, 'bell_pepper') && notInto(b, 'paprika'), JSON.stringify(b)); }

{ const a = s('juice of 2 lemons (about 4 tbsp)'), b = s('180 ml fresh lime juice (about 8-10 limes)');
  expect('lemons → lemon, not lime', matched(a, 'lemon') && notInto(a, 'lime'), JSON.stringify(a));
  expect('lime juice → lime, not lemon', matched(b, 'lime') && notInto(b, 'lemon'), JSON.stringify(b)); }

// ── alias-gap closures ───────────────────────────────────────────────────────
expect('aubergine → eggplant', matched(s('1 large aubergine, cut into cubes'), 'eggplant'), JSON.stringify(s('1 large aubergine, cut into cubes')));
expect('courgette → zucchini', matched(s('1 medium courgette, julienned'), 'zucchini'), JSON.stringify(s('1 medium courgette, julienned')));
expect('methi → fenugreek', matched(s('1 tsp dried methi leaves'), 'fenugreek'), JSON.stringify(s('1 tsp dried methi leaves')));
expect('cilantro → coriander', matched(s('30g fresh cilantro, chopped'), 'coriander'), JSON.stringify(s('30g fresh cilantro, chopped')));
expect('scallion → spring_onion', matched(s('2 scallions, thinly sliced'), 'spring_onion'), JSON.stringify(s('2 scallions, thinly sliced')));

// ── new named concepts resolve to themselves ─────────────────────────────────
expect('white wine → wine', matched(s('100ml dry white wine'), 'wine'), JSON.stringify(s('100ml dry white wine')));
expect('coconut oil → coconut_oil, not (coconut_milk/oil)', matched(s('2 tbsp coconut oil'), 'coconut_oil'), JSON.stringify(s('2 tbsp coconut oil')));
expect('oyster sauce → oyster_sauce', matched(s('2 tbsp oyster sauce'), 'oyster_sauce'), JSON.stringify(s('2 tbsp oyster sauce')));
expect('ground turmeric → turmeric', matched(s('1 tsp ground turmeric'), 'turmeric'), JSON.stringify(s('1 tsp ground turmeric')));

console.log(`\n──────── ${pass} passed, ${fail} failed ────────`);
if (fail) { console.log('\nFAILURES:'); for (const f of fails) console.log('  ✗ ' + f); process.exit(1); }
