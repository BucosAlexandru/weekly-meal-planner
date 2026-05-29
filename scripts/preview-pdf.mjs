// scripts/preview-pdf.mjs
// Render a sample PDFv2 export using current recipes + the merged premium-
// polish handler (api/generate-pdf.js). Writes to /tmp/preview-pdf.pdf so the
// session can surface the file directly.
//
// Usage: node scripts/preview-pdf.mjs

import handler from '../api/generate-pdf.js';
import { recipes } from '../public/js/recipes.js';
import { recipesMeta } from '../public/js/recipes-meta.js';
import fs from 'fs';

// In-process Vercel-style invoker: feeds a POST body into the handler and
// captures the response buffer. Mirrors scripts/stress-test-pdf.mjs.
function callHandler(plan) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: plan,
    };
    const res = {
      _status: 200,
      _headers: {},
      _ended: false,
      statusCode: 200,
      setHeader(k, v) { this._headers[k.toLowerCase()] = v; },
      getHeader(k) { return this._headers[k.toLowerCase()]; },
      status(c) { this._status = c; this.statusCode = c; return this; },
      send(buf) {
        if (this._ended) return;
        this._ended = true;
        chunks.push(buf);
        resolve({ status: this._status, body: Buffer.concat(chunks.map(c =>
          Buffer.isBuffer(c) ? c : Buffer.from(c)
        )), headers: this._headers });
      },
      end(buf) { if (buf) chunks.push(buf); this.send(Buffer.alloc(0)); },
      json(o) { this.send(JSON.stringify(o)); },
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

// Find a recipe by EN name, hydrate with meta for the PDF tile.
function recipeTile(enName) {
  const r = recipes.find(x => x.name?.en === enName);
  if (!r) return { name: enName, time: null, servings: null, cost: null, ingredients: [] };
  const meta = recipesMeta[r.id] || {};
  // Pull short noun-style ingredient names — same pattern as the
  // front-end's shortIngredients() in app.js.
  const ingr = (r.ingredients?.en || []).slice(0, 8).map(s => {
    // Crude: drop everything after a comma; drop leading "X g/kg/ml/tsp/tbsp X"
    const cleaned = s
      .replace(/^[\d./]+\s*(?:g|kg|ml|l|tbsp|tsp|cup|oz)\s+/i, '')
      .replace(/,.*$/, '')
      .trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  });
  return {
    name: r.name.en,
    time: meta.time || (r.timeMins?.total || null),
    servings: r.servings || 4,
    cost: meta.costRon ? `~€${Math.round(meta.costRon / 4.6)}` : null,
    ingredients: ingr,
  };
}

// Build a "Mediterranean week" payload — uses recipes from the same PLAN
// definition the static plan-listing page renders, so the PDF reflects the
// real curated content.
const PLAN = {
  title: 'Mediterranean week',
  weekLabel: 'Preview · ' + new Date().toLocaleDateString('en-GB'),
  days: [
    { day: 'Mon', lunch: recipeTile('Spaghetti Carbonara'),
                  dinner: recipeTile('Moussaka') },
    { day: 'Tue', lunch: recipeTile('Gazpacho'),
                  dinner: recipeTile('Ratatouille') },
    { day: 'Wed', lunch: recipeTile('Quiche Lorraine'),
                  dinner: recipeTile('Souvlaki') },
    { day: 'Thu', lunch: recipeTile('Risotto'),
                  dinner: recipeTile('Tagine') },
    { day: 'Fri', lunch: recipeTile('Paella'),
                  dinner: recipeTile('Boeuf Bourguignon') },
    { day: 'Sat', lunch: recipeTile('Pasta e fagioli'),
                  dinner: recipeTile('Spanakopita') },
    { day: 'Sun', lunch: recipeTile('Pasta alla Norma'),
                  dinner: recipeTile('Harira') },
  ],
  // Minimal shopping groups — the front-end uses buildShoppingFromRawIngredients
  // for a richer per-meal aggregation, but a hand-crafted set is enough for
  // a preview render.
  shoppingGroups: [
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
  ],
};

console.log('Rendering PDFv2 preview with', PLAN.days.length, 'days,',
            PLAN.shoppingGroups.length, 'shopping groups...');
const t0 = Date.now();
const result = await callHandler(PLAN);
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
