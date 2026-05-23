// api/generate-pdf.js
// PHASE 1 SCAFFOLD — opt-in only, EN locale only, no images, no QR, no fonts.
// Purpose: validate Vercel compatibility + server-side render stability +
// pagination + download UX. The existing html2pdf path remains the production
// default; this endpoint is reached only when the client sets pdfV2 = true.
//
// Implementation note: this file uses React.createElement directly instead
// of JSX so it runs as plain ESM on @vercel/node without a build step.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const h = React.createElement;

// ── Design tokens ──────────────────────────────────────────────────────────
// Restrained palette. Brand is reserved for sectioning (day labels, section
// headings). Body text is near-black; meta is cool grey. No fills, no shadows.
const INK        = '#1a1a2e';
const INK_SOFT   = '#3f4a5b';
const INK_MUTED  = '#7a8597';
const BRAND      = '#1e7d3a';
const HAIRLINE   = '#e2e8f0';
const DOT        = '#c9d2cb';

const styles = StyleSheet.create({
  // A4: 595.28 × 841.89 pt. 36pt side margins ≈ 12.7mm.
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: INK,
    lineHeight: 1.4,
  },

  // ── Page masthead ────────────────────────────────────────────────────────
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 6,
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
  },
  brand:       { fontSize: 10, fontFamily: 'Helvetica-Bold', color: INK, letterSpacing: 0.3 },
  brandDot:    { color: BRAND },
  mastheadRight: { alignItems: 'flex-end' },
  planTitle:   { fontSize: 9, fontFamily: 'Helvetica-Bold', color: INK, letterSpacing: 0.2 },
  weekLabel:   { fontSize: 7.5, color: INK_MUTED, marginTop: 1 },

  // ── Day block (one per day) ──────────────────────────────────────────────
  dayBlock: { marginBottom: 10 },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    letterSpacing: 1.6,
  },
  dayRule: {
    flex: 1,
    height: 0.5,
    backgroundColor: HAIRLINE,
    marginLeft: 8,
    marginBottom: 2,
  },

  mealRow: { flexDirection: 'row' },
  mealCol: { flex: 1 },
  mealColLeft: { paddingRight: 14 },
  mealColRight: {
    paddingLeft: 14,
    borderLeftWidth: 0.5,
    borderLeftColor: HAIRLINE,
  },

  mealKind: {
    fontSize: 6.5,
    color: INK_MUTED,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  mealMeta: {
    fontSize: 7,
    color: INK_SOFT,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  mealIngr: {
    fontSize: 7.5,
    color: INK_SOFT,
    lineHeight: 1.45,
  },
  mealEmpty: { fontSize: 8, color: INK_MUTED, fontStyle: 'italic' },

  // ── Shopping section ────────────────────────────────────────────────────
  shopSection: { marginTop: 14 },
  shopHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  shopTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    letterSpacing: 1.8,
  },
  shopRule: {
    flex: 1,
    height: 0.5,
    backgroundColor: HAIRLINE,
    marginLeft: 8,
    marginBottom: 2,
  },
  shopSubLabel: {
    fontSize: 7,
    color: INK_MUTED,
    letterSpacing: 0.4,
    marginLeft: 10,
  },
  shopRuleTrail: { flex: 1, height: 0.5, backgroundColor: HAIRLINE, marginLeft: 10, marginBottom: 2 },

  shopGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  shopGroup: { width: '50%', paddingRight: 14, marginBottom: 10 },
  shopGroupTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: INK_MUTED,
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  shopItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 1.5,
  },
  shopItemName: { fontSize: 8, color: INK },
  shopItemLeader: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 2,
    height: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: DOT,
    borderBottomStyle: 'dotted',
  },
  shopItemQty: {
    fontSize: 7.5,
    color: INK_MUTED,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 36,
    right: 36,
    height: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
  },
  footerLeft:  { fontSize: 6.5, color: INK_MUTED, letterSpacing: 0.3 },
  footerRight: { fontSize: 6.5, color: INK_MUTED, letterSpacing: 0.3 },
});

function mealCell(meal, kindLabel) {
  if (!meal || !meal.name) {
    return h(View, null,
      h(Text, { style: styles.mealKind }, kindLabel),
      h(Text, { style: styles.mealEmpty }, '—')
    );
  }
  const metaParts = [];
  if (meal.time)     metaParts.push(`${meal.time} min`);
  if (meal.servings) metaParts.push(`${meal.servings} servings`);
  if (meal.cost)     metaParts.push(String(meal.cost));
  const ingr = Array.isArray(meal.ingredients) ? meal.ingredients : [];
  const ingrShort = ingr.length
    ? ingr.slice(0, 6).join(', ') + (ingr.length > 6 ? `, +${ingr.length - 6} more` : '')
    : '';
  const children = [
    h(Text, { key: 'k', style: styles.mealKind }, kindLabel),
    h(Text, { key: 'n', style: styles.mealName }, meal.name),
  ];
  if (metaParts.length) children.push(h(Text, { key: 'm', style: styles.mealMeta }, metaParts.join('  ·  ')));
  if (ingrShort)        children.push(h(Text, { key: 'i', style: styles.mealIngr }, ingrShort));
  return h(View, null, ...children);
}

function dayBlock(d, idx) {
  return h(View, { key: idx, style: styles.dayBlock, wrap: false },
    h(View, { style: styles.dayHeader },
      h(Text, { style: styles.dayName }, (d.day || `Day ${idx + 1}`).toUpperCase()),
      h(View, { style: styles.dayRule }),
    ),
    h(View, { style: styles.mealRow },
      h(View, { style: [styles.mealCol, styles.mealColLeft] }, mealCell(d.lunch, 'LUNCH')),
      h(View, { style: [styles.mealCol, styles.mealColRight] }, mealCell(d.dinner, 'DINNER')),
    ),
  );
}

function shopItemRow(it, idx) {
  const name = typeof it === 'string' ? it : it.name;
  const qty  = typeof it === 'string' ? ''  : (it.qty || '');
  return h(View, { key: idx, style: styles.shopItem, wrap: false },
    h(Text, { style: styles.shopItemName }, name),
    h(View, { style: styles.shopItemLeader }),
    qty ? h(Text, { style: styles.shopItemQty }, qty) : null,
  );
}

function shopGroup(g, gi) {
  return h(View, { key: gi, style: styles.shopGroup, wrap: false },
    h(Text, { style: styles.shopGroupTitle }, (g.label || g.id || '').toUpperCase()),
    ...(g.items || []).map(shopItemRow),
  );
}

function MealPlanDocument(plan) {
  const days   = Array.isArray(plan.days) ? plan.days : [];
  const groups = Array.isArray(plan.shoppingGroups) ? plan.shoppingGroups : [];
  const totalItems = groups.reduce((n, g) => n + (g.items?.length || 0), 0);

  const mastheadEl = h(View, { style: styles.masthead, fixed: true },
    h(Text, { style: styles.brand }, 'Meal-Planner', h(Text, { style: styles.brandDot }, '.ro')),
    h(View, { style: styles.mastheadRight },
      h(Text, { style: styles.planTitle }, plan.title || 'Weekly plan'),
      plan.weekLabel ? h(Text, { style: styles.weekLabel }, plan.weekLabel) : null,
    ),
  );

  const dayEls = days.map(dayBlock);

  // Heading + grid render as one atomic block (wrap:false) so the section
  // title never orphans. For a typical 50–100-item list across 6 groups in
  // 2 columns, the block fits comfortably on a single A4 page.
  const shopEls = groups.length ? [
    h(View, { key: 'sh', style: styles.shopSection, wrap: false },
      h(View, { style: styles.shopHeading },
        h(Text, { style: styles.shopTitle }, 'SHOPPING LIST'),
        totalItems ? h(Text, { style: styles.shopSubLabel }, `${totalItems} items`) : null,
        h(View, { style: styles.shopRuleTrail }),
      ),
      h(View, { style: styles.shopGrid }, ...groups.map(shopGroup)),
    ),
  ] : [];

  const today = new Date().toLocaleDateString('en-GB');
  const footerEl = h(View, { style: styles.footer, fixed: true },
    h(Text, { style: styles.footerLeft }, `Meal-Planner.ro  ·  ${today}`),
    h(Text, { style: styles.footerRight }, plan.title || ''),
  );

  const pageEl = h(Page, { size: 'A4', style: styles.page, wrap: true },
    mastheadEl,
    ...dayEls,
    ...shopEls,
    footerEl,
  );

  return h(Document, { title: plan.title || 'Weekly meal plan', author: 'Meal-Planner.ro' }, pageEl);
}

// Minimal demo payload used when the request body is empty / GET. Lets us
// smoke-test the endpoint from a browser address bar without wiring the UI.
const DEMO_PLAN = {
  title: 'Mediterranean week',
  weekLabel: 'Week of 23 May 2026',
  days: [
    { day: 'Mon', lunch: { name: 'Spaghetti Carbonara', time: 30, servings: 4, cost: '€14', ingredients: ['Spaghetti','Guanciale','Eggs','Pecorino','Black pepper','Salt'] },
                  dinner: { name: 'Moussaka', time: 90, servings: 6, cost: '€22', ingredients: ['Aubergine','Lamb mince','Onion','Tomato','Béchamel','Cinnamon','Nutmeg','Olive oil'] } },
    { day: 'Tue', lunch: { name: 'Gazpacho', time: 15, servings: 4, cost: '€8', ingredients: ['Tomato','Cucumber','Bell pepper','Garlic','Olive oil','Vinegar'] },
                  dinner: { name: 'Ratatouille', time: 60, servings: 4, cost: '€10', ingredients: ['Aubergine','Courgette','Tomato','Bell pepper','Garlic','Herbs'] } },
    { day: 'Wed', lunch: { name: 'Quiche Lorraine', time: 50, servings: 4, cost: '€11', ingredients: ['Pastry','Eggs','Cream','Bacon','Gruyère'] },
                  dinner: { name: 'Souvlaki', time: 35, servings: 4, cost: '€13', ingredients: ['Pork shoulder','Lemon','Oregano','Olive oil','Garlic','Pita'] } },
    { day: 'Thu', lunch: { name: 'Risotto', time: 45, servings: 4, cost: '€12', ingredients: ['Arborio rice','Stock','Onion','Parmesan','Butter','White wine'] },
                  dinner: { name: 'Tagine', time: 90, servings: 4, cost: '€16', ingredients: ['Lamb shoulder','Preserved lemon','Olives','Onion','Spices'] } },
    { day: 'Fri', lunch: { name: 'Paella', time: 50, servings: 4, cost: '€18', ingredients: ['Rice','Chicken','Prawns','Mussels','Saffron','Stock','Peas'] },
                  dinner: { name: 'Boeuf Bourguignon', time: 180, servings: 6, cost: '€26', ingredients: ['Beef chuck','Red wine','Bacon','Carrots','Pearl onions','Mushrooms','Stock'] } },
    { day: 'Sat', lunch: { name: 'Pasta e Fagioli', time: 40, servings: 4, cost: '€7', ingredients: ['Pasta','Beans','Pancetta','Tomato','Rosemary','Parmesan rind'] },
                  dinner: { name: 'Spanakopita', time: 60, servings: 6, cost: '€10', ingredients: ['Spinach','Feta','Eggs','Dill','Spring onions','Phyllo'] } },
    { day: 'Sun', lunch: { name: 'Pasta alla Norma', time: 30, servings: 4, cost: '€8', ingredients: ['Pasta','Aubergine','Tomato','Garlic','Ricotta salata','Basil'] },
                  dinner: { name: 'Harira', time: 75, servings: 6, cost: '€9', ingredients: ['Lentils','Chickpeas','Lamb','Tomato','Celery','Coriander','Spices'] } },
  ],
  shoppingGroups: [
    { id: 'vegetables', label: 'Vegetables & herbs',
      items: [{ name: 'Tomatoes', qty: '1.6 kg' }, { name: 'Aubergine', qty: '2 kg' }, { name: 'Courgette', qty: '400 g' }, { name: 'Cucumber', qty: '200 g' }, { name: 'Bell peppers', qty: '200 g' }, { name: 'Onion', qty: '450 g' }, { name: 'Garlic' }, { name: 'Spinach', qty: '1 kg' }, { name: 'Fresh herbs', qty: '50 g' }] },
    { id: 'meat', label: 'Meat & fish',
      items: [{ name: 'Beef chuck', qty: '1.5 kg' }, { name: 'Lamb mince', qty: '500 g' }, { name: 'Lamb shoulder', qty: '1.4 kg' }, { name: 'Pork shoulder', qty: '700 g' }, { name: 'Chicken', qty: '800 g' }, { name: 'Prawns', qty: '300 g' }, { name: 'Mussels', qty: '400 g' }, { name: 'Bacon', qty: '400 g' }, { name: 'Guanciale', qty: '200 g' }, { name: 'Pancetta', qty: '100 g' }] },
    { id: 'dairy', label: 'Dairy & eggs',
      items: [{ name: 'Eggs', qty: '12 large' }, { name: 'Feta', qty: '300 g' }, { name: 'Pecorino', qty: '75 g' }, { name: 'Parmesan', qty: '50 g' }, { name: 'Ricotta salata', qty: '100 g' }, { name: 'Gruyère', qty: '50 g' }, { name: 'Cream', qty: '300 ml' }, { name: 'Milk', qty: '700 ml' }, { name: 'Butter', qty: '100 g' }] },
    { id: 'dry', label: 'Dry goods',
      items: [{ name: 'Spaghetti', qty: '400 g' }, { name: 'Pasta short', qty: '500 g' }, { name: 'Rice (arborio)', qty: '500 g' }, { name: 'Rice (paella)', qty: '400 g' }, { name: 'Lentils', qty: '300 g' }, { name: 'Chickpeas', qty: '300 g' }, { name: 'Phyllo pastry', qty: '500 g' }, { name: 'Beans', qty: '400 g' }] },
    { id: 'sauces', label: 'Sauces & oils',
      items: [{ name: 'Olive oil', qty: '500 ml' }, { name: 'Red wine', qty: '750 ml' }, { name: 'White wine', qty: '250 ml' }, { name: 'Vinegar', qty: '100 ml' }, { name: 'Stock', qty: '2 L' }] },
    { id: 'pantry', label: 'Pantry staples',
      items: ['Black pepper', 'Salt', 'Cinnamon', 'Nutmeg', 'Oregano', 'Rosemary', 'Saffron', 'Bay leaves', 'Dill', 'Basil', 'Coriander'] },
  ],
};

export default async function handler(req, res) {
  try {
    let plan = DEMO_PLAN;
    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : null;
      if (body && (Array.isArray(body.days) || Array.isArray(body.shoppingGroups))) {
        plan = body;
      }
    }

    const t0 = Date.now();
    const buffer = await renderToBuffer(MealPlanDocument(plan));
    const ms = Date.now() - t0;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="meal-plan.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-PDF-Render-Ms', String(ms));
    res.status(200).send(buffer);
  } catch (err) {
    console.error('generate-pdf error:', err);
    res.status(500).json({ error: 'PDF generation failed', detail: String(err && err.message || err) });
  }
}
