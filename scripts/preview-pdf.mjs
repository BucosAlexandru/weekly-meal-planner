// scripts/preview-pdf.mjs
// Render a sample PDFv2 export using current recipes + the merged premium-
// polish handler (api/generate-pdf.js). Writes to /tmp/preview-pdf.pdf so the
// session can surface the file directly.
//
// Usage: node scripts/preview-pdf.mjs

import { MealPlanDocument } from '../api/generate-pdf.js';
import { renderToBuffer } from '@react-pdf/renderer';
import { recipes } from '../public/js/recipes.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import { parseIngredient, buildShoppingFromRawIngredients } from '../public/js/shopping-list.js';
import fs from 'fs';

// Renders the FULL (premium-equivalent) view via the exported pure document
// builder. The HTTP handler's access gating (isPremiumEmail +
// gatePlanForAccess) is intentionally bypassed here — a local preview has no
// Supabase, so going through the handler would always produce the clamped
// 2-day free PDF and hide most of what we need to inspect. Gating itself is
// covered by scripts/stress-test-pdf.mjs's handler-path scenarios.
async function renderFull(plan) {
  const body = await renderToBuffer(MealPlanDocument(plan));
  return { status: 200, body };
}

// Mirror app.js buildPdfV2Payload conventions so the preview exercises the
// SAME payload shape the production frontend sends (ingredientsFull with
// quantities, short parsed ingredients, EUR cost at 4.97 RON/€).
const fmtCost = (ron) => (ron ? `~€${Math.round(ron / 4.97)}` : null);

function findRecipe(enName) {
  return recipes.find(x => x.name?.en === enName) || null;
}
function costRonOf(enName) {
  const r = findRecipe(enName);
  if (!r) return 0;
  const meta = recipesMeta[r.id] || {};
  return meta.costRon || r.costRon || 0;
}

// Find a recipe by EN name, hydrate with meta for the PDF tile.
function recipeTile(enName) {
  const r = findRecipe(enName);
  if (!r) return { name: enName, time: null, servings: null, cost: null, ingredients: [], ingredientsFull: [] };
  const meta = recipesMeta[r.id] || {};
  const rawIngr = r.ingredients?.en || [];
  // Short noun-style names — same engine call as app.js shortIngredients().
  const seen = new Set();
  const ingr = [];
  for (const raw of rawIngr) {
    const p = parseIngredient(raw);
    if (!p || !p.name || seen.has(p.name)) continue;
    seen.add(p.name);
    ingr.push(p.name.charAt(0).toUpperCase() + p.name.slice(1));
  }
  return {
    name: r.name.en,
    time: meta.time || (r.timeMins?.total || null),
    servings: r.servings || 4,
    cost: fmtCost(meta.costRon || r.costRon || 0),
    ingredients: ingr,
    // Full localized lines WITH quantities — the new pdfv2 kitchen section.
    ingredientsFull: rawIngr.map(s => String(s).trim()).filter(Boolean),
  };
}

// Build a "Mediterranean week" payload — uses recipes from the same PLAN
// definition the static plan-listing page renders, so the PDF reflects the
// real curated content.
const MENU = [
  ['Mon', 'Spaghetti Carbonara', 'Moussaka'],
  ['Tue', 'Gazpacho',            'Ratatouille'],
  ['Wed', 'Quiche Lorraine',     'Souvlaki'],
  ['Thu', 'Risotto',             'Chicken Tagine'],
  ['Fri', 'Paella',              'Boeuf Bourguignon'],
  ['Sat', 'Pasta e fagioli',     'Spanakopita'],
  ['Sun', 'Pasta alla Norma',    'Harira'],
];

let weekCostRon = 0;
const days = MENU.map(([day, lunchName, dinnerName]) => {
  const dayRon = costRonOf(lunchName) + costRonOf(dinnerName);
  weekCostRon += dayRon;
  return {
    day,
    lunch:  recipeTile(lunchName),
    dinner: recipeTile(dinnerName),
    costLabel: fmtCost(dayRon),
  };
});

// Shopping groups via the real normalization engine (same call path as the
// frontend), so the preview PDF exercises the step-2 data-cleanup fixes.
const allRawIngredients = MENU.flatMap(([, l, d]) => [l, d])
  .map(findRecipe).filter(Boolean)
  .flatMap(r => r.ingredients?.en || []);
const engineGroups = buildShoppingFromRawIngredients(allRawIngredients, 'en');

const PLAN = {
  title: 'Mediterranean week',
  weekLabel: 'Preview · ' + new Date().toLocaleDateString('en-GB'),
  days,
  weekCost: fmtCost(weekCostRon),
  shoppingGroups: engineGroups,
};

// Legacy hand-crafted groups, kept for reference of the old preview shape.
const LEGACY_SHOPPING_GROUPS = [
    { id: 'vegetables', label: 'Vegetables & herbs',
      items: [
        { name: 'Tomatoes', qty: '1.6 kg' },
        { name: 'Aubergine', qty: '2 kg' },
        { name: 'Courgette', qty: '400 g' },
        { name: 'Cucumber', qty: '200 g' },
        { name: 'Bell peppers', qty: '200 g' },
        { name: 'Onion', qty: '450 g' },
        { name: 'Garlic', qty: '2 heads' },
        { name: 'Spinach', qty: '1 kg' },
        { name: 'Fresh herbs', qty: '50 g' },
        { name: 'Lemons', qty: '4' },
        { name: 'Preserved lemons', qty: '60 g' },
      ] },
    { id: 'meat', label: 'Meat, fish & dairy',
      items: [
        { name: 'Guanciale', qty: '180 g' },
        { name: 'Lamb mince', qty: '700 g' },
        { name: 'Lamb shoulder', qty: '900 g' },
        { name: 'Beef chuck', qty: '1 kg' },
        { name: 'Pork shoulder', qty: '600 g' },
        { name: 'Bacon', qty: '200 g' },
        { name: 'Chicken thighs', qty: '600 g' },
        { name: 'Prawns', qty: '300 g' },
        { name: 'Mussels', qty: '500 g' },
        { name: 'Eggs', qty: '10' },
        { name: 'Pecorino', qty: '150 g' },
        { name: 'Parmesan', qty: '100 g' },
        { name: 'Feta', qty: '300 g' },
        { name: 'Gruyère', qty: '120 g' },
        { name: 'Ricotta salata', qty: '60 g' },
        { name: 'Butter', qty: '100 g' },
        { name: 'Cream', qty: '300 ml' },
      ] },
    { id: 'pantry', label: 'Pantry & spices',
      items: [
        { name: 'Spaghetti', qty: '400 g' },
        { name: 'Pasta', qty: '500 g' },
        { name: 'Arborio rice', qty: '300 g' },
        { name: 'Saffron rice', qty: '500 g' },
        { name: 'Beans', qty: '400 g' },
        { name: 'Lentils', qty: '300 g' },
        { name: 'Chickpeas', qty: '300 g' },
        { name: 'Flour', qty: '500 g' },
        { name: 'Olive oil', qty: '500 ml' },
        { name: 'Red wine', qty: '500 ml' },
        { name: 'White wine', qty: '200 ml' },
        { name: 'Black olives', qty: '100 g' },
        { name: 'Cinnamon, nutmeg, oregano', qty: 'pinch each' },
        { name: 'Saffron', qty: 'pinch' },
        { name: 'Phyllo pastry', qty: '1 pack' },
        { name: 'Pita bread', qty: '8' },
        { name: 'Pearl onions', qty: '200 g' },
        { name: 'Pancetta', qty: '120 g' },
      ] },
];
void LEGACY_SHOPPING_GROUPS; // unused — real groups come from the engine above

console.log('Rendering PDFv2 preview with', PLAN.days.length, 'days,',
            PLAN.shoppingGroups.length, 'shopping groups...');
const t0 = Date.now();
const result = await renderFull(PLAN);
const renderMs = Date.now() - t0;

console.log('  status:', result.status);
console.log('  bytes:', result.body.length);
console.log('  render time:', renderMs + 'ms');

if (result.status !== 200) {
  console.error('ERROR — preview body:', result.body.toString().slice(0, 500));
  process.exit(1);
}

const outPath = '/tmp/preview-pdf.pdf';
fs.writeFileSync(outPath, result.body);
console.log('\n✅ Written to', outPath);
