// tests/shopping-list-regressions.mjs
// Regression cases for the shopping-list normalization engine, pinned to the
// EXACT raw recipe strings that produced parsing artifacts in the real PDF
// export (PDF_EXPERIENCE_PLAN.md, step 2).
//
// Run: node tests/shopping-list-regressions.mjs
// Exit code: 0 = all green, 1 = at least one regression.

import { parseIngredient, buildShoppingFromRawIngredients } from '../public/js/shopping-list.js';

let failures = 0;
function check(desc, actual, expected) {
  const okEq = actual === expected;
  if (okEq) console.log(`  ✓ ${desc} → ${JSON.stringify(actual)}`);
  else { console.log(`  ✗ ${desc}\n      expected ${JSON.stringify(expected)}\n      got      ${JSON.stringify(actual)}`); failures++; }
}
function checkTrue(desc, cond, detail) {
  if (cond) console.log(`  ✓ ${desc}`);
  else { console.log(`  ✗ ${desc}${detail ? ` — ${detail}` : ''}`); failures++; }
}

// Flatten a grouped list into [{name, qty, category}] for assertions.
function flat(groups) {
  const out = [];
  for (const g of groups) for (const it of g.items) out.push({ name: it.name, qty: it.qty || '', category: g.id });
  return out;
}
function names(groups) { return flat(groups).map(i => i.name); }

console.log('── parseIngredient: noun must survive ──');
check('Swedish Meatballs mince',
  parseIngredient('500g mixed ground pork and beef (50/50)').name, 'pork and beef mince');
check('A small piece of dark chocolate',
  parseIngredient('A small piece of dark chocolate for shaving (optional)').name, 'dark chocolate');
check('A small piece of fresh ginger',
  parseIngredient('A small piece of fresh ginger, julienned, to finish').name, 'ginger');
check('Bone-in chicken thighs keeps the cut',
  parseIngredient('800g bone-in chicken thighs and drumsticks, skin removed').name, 'chicken thighs and drumsticks');
check('Thinly sliced pork belly keeps the noun',
  parseIngredient('200g thinly sliced pork belly (buta bara), cut into 5 cm pieces').name, 'pork belly');
check('Sliced onion merges with onion',
  parseIngredient('sliced onion, tomato, and pickles to serve').name, 'onion');
check('Ice-cold lager loses the temperature epithet',
  parseIngredient('300ml ice-cold lager or pale ale').name, 'lager');
check('Ice-cold beef stock loses the temperature epithet',
  parseIngredient('200 ml ice-cold beef stock or cold water (releases steam slowly during boiling — this is what creates the famous broth pocket)').name, 'beef stock');
check('Littleneck clams: variety word survives left-split',
  parseIngredient('1.5 kg fresh littleneck or quahog clams in shells (or 2 × 200 g cans whole baby clams in juice as substitute for landlocked cooks)').name, 'littleneck');

console.log('\n── buildShoppingFromRawIngredients: canonical + category ──');
const groups = buildShoppingFromRawIngredients([
  '500g mixed ground pork and beef (50/50)',
  'A small piece of dark chocolate for shaving (optional)',
  'A small piece of fresh ginger, julienned, to finish',
  '800g bone-in chicken thighs and drumsticks, skin removed',
  '1.5 kg fresh littleneck or quahog clams in shells (or 2 × 200 g cans whole baby clams in juice as substitute for landlocked cooks)',
  '500 ml fresh clam juice or fish stock (reserve all the steaming liquid if using fresh clams)',
  '200g thinly sliced pork belly (buta bara), cut into 5 cm pieces',
  '300ml ice-cold lager or pale ale',
  '200 ml ice-cold beef stock or cold water (releases steam slowly)',
  'sliced onion, tomato, and pickles to serve',
  '1 medium onion, grated',
], 'en');
const items = flat(groups);
const all = names(groups);

check('Mixed mince canonical', all.includes('Beef & pork mince') ? 'Beef & pork mince' : all.join('|'), 'Beef & pork mince');
checkTrue('Mixed mince keeps its 500 g quantity',
  items.some(i => i.name === 'Beef & pork mince' && i.qty === '500 g'),
  JSON.stringify(items.filter(i => /mince/i.test(i.name))));
checkTrue('No bare "Mixed" item', !all.some(n => /^mixed$/i.test(n)));
checkTrue('No "A small piece of…" item', !all.some(n => /small piece/i.test(n)));
checkTrue('No bare "Bone-in" item', !all.some(n => /^bone[- ]?in$/i.test(n)));
checkTrue('Chicken thighs present', all.includes('Chicken thighs'), all.join('|'));
checkTrue('No bare "Littleneck" item', !all.some(n => /^littleneck$/i.test(n)));
checkTrue('Clams present (littleneck canonicalized)', all.includes('Clams'), all.join('|'));
checkTrue('No bare "Thinly" item', !all.some(n => /^thinly$/i.test(n)));
checkTrue('Pork belly present', all.includes('Pork belly'), all.join('|'));
checkTrue('No "Ice-cold …" items', !all.some(n => /ice[- ]?cold/i.test(n)));
checkTrue('Beef stock categorized under sauces (not meat)',
  items.some(i => i.name === 'Beef stock' && i.category === 'sauces'),
  JSON.stringify(items.filter(i => /stock/i.test(i.name))));
checkTrue('Clam juice → fish stock under sauces (not meat)',
  items.some(i => i.name === 'Fish stock' && i.category === 'sauces'),
  JSON.stringify(items.filter(i => /stock|clam/i.test(i.name))));
checkTrue('Exactly one Onion row (sliced onion merged)',
  all.filter(n => /^onion$/i.test(n)).length === 1 && !all.some(n => /^sliced onion$/i.test(n)),
  all.filter(n => /onion/i.test(n)).join('|'));

console.log('\n── quantifier-only fragments never surface ──');
const fragGroups = buildShoppingFromRawIngredients(['A small piece of', 'Bone-in', 'Thinly', 'Mixed'], 'en');
checkTrue('fragments filtered out entirely', flat(fragGroups).length === 0, JSON.stringify(names(fragGroups)));

console.log('\n── guard: digit-led quantities unaffected ──');
const p2 = parseIngredient('2 slices of bread');
checkTrue('"2 slices of bread" keeps qty=2 unit=slices name=bread',
  p2.qty === 2 && /^slices?$/.test(p2.unit) && p2.name === 'bread', JSON.stringify(p2));
// Leading "chopped" must NOT be stripped (it is load-bearing for the
// canned-tomatoes canonical: "chopped tomatoes" → 'canned tomatoes').
const p3 = parseIngredient('400g chopped tomatoes');
checkTrue('"chopped tomatoes" keeps its leading participle',
  p3.name === 'chopped tomatoes', JSON.stringify(p3));
// "minced beef" must survive intact ('minced' deliberately absent from the
// bare leading-participle strip) so it canonicalizes to 'beef mince'.
const p4 = parseIngredient('500g minced beef');
checkTrue('"minced beef" keeps its leading participle',
  p4.name === 'minced beef', JSON.stringify(p4));

if (failures) { console.log(`\n${failures} regression(s) FAILED`); process.exit(1); }
console.log('\nAll shopping-list regressions green.');
