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
// Editorial palette. Brand green anchors sectioning; ink scale provides
// hierarchy. Soft tints (mint/cream) used for filled blocks. Vector-only.
const INK        = '#0f172a';
const INK_SOFT   = '#374151';
const INK_MUTED  = '#6b7280';
const INK_FAINT  = '#9ca3af';
const BRAND      = '#1e7d3a';
const BRAND_DARK = '#15532a';
const BRAND_TINT = '#eaf5ec';
const ACCENT     = '#b45309';
const ACCENT_TINT= '#fef6e7';
const HAIRLINE   = '#e2e8f0';
const HAIRLINE_2 = '#edf1f5';
const DOT        = '#c9d2cb';

const styles = StyleSheet.create({
  // A4: 595.28 × 841.89 pt. 30pt side margins ≈ 10.6mm.
  // Compacted from 30/38/36 to give more usable area without crowding.
  page: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: INK,
    lineHeight: 1.4,
  },

  // ── Top accent bar (drawn at very top of each page) ──────────────────────
  topAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 4,
    backgroundColor: BRAND,
  },

  // ── Page masthead ────────────────────────────────────────────────────────
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 5,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandMark: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: BRAND,
    marginRight: 6,
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingTop: 2.5,
  },
  brand:       { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: INK, letterSpacing: 0.4 },
  mastheadRight: { alignItems: 'flex-end' },
  planTitle:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: INK, letterSpacing: 0.2 },
  weekLabel:   { fontSize: 7.5, color: INK_MUTED, fontFamily: 'Helvetica-Oblique', marginTop: 2 },

  // ── Hero (page 1 only) ──────────────────────────────────────────────────
  // Compact: title + week + 4 stats in a single visual block. The stats are
  // laid out side-by-side with the title to save vertical room (was a
  // 4-stat row stacked under the title — wasted ~40pt).
  hero: {
    backgroundColor: BRAND_TINT,
    paddingTop: 12, paddingBottom: 12, paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft:  { flex: 1.4, paddingRight: 18 },
  heroRight: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 14,
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(30,125,58,0.25)',
  },
  heroEyebrow: {
    fontSize: 7,
    color: BRAND_DARK,
    letterSpacing: 2.2,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  heroTitle: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    letterSpacing: -0.3,
    lineHeight: 1.12,
    marginBottom: 4,
  },
  heroWeek: {
    fontSize: 9,
    color: INK_SOFT,
    fontFamily: 'Helvetica-Oblique',
  },
  heroStat: { flex: 1 },
  heroStatNum: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK,
    lineHeight: 1.1,
  },
  heroStatLabel: {
    fontSize: 6.4,
    color: INK_MUTED,
    letterSpacing: 1.3,
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
  },
  heroStatDivider: {
    width: 0.5,
    backgroundColor: 'rgba(30,125,58,0.2)',
    marginHorizontal: 10,
  },

  // ── Section heading (THE PLAN, SHOPPING LIST) ───────────────────────────
  section: { marginBottom: 8 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 7,
    color: BRAND,
    letterSpacing: 2,
    fontFamily: 'Helvetica-Bold',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    letterSpacing: 0.1,
  },
  sectionRule: {
    flex: 1,
    height: 0.5,
    backgroundColor: HAIRLINE,
    marginLeft: 12,
    marginBottom: 3,
  },

  // ── Day block (one per day) ──────────────────────────────────────────────
  dayBlock: { marginBottom: 7 },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayBadge: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: BRAND,
    color: '#fff',
    fontSize: 7.4,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingTop: 2.6,
    marginRight: 7,
  },
  dayName: {
    fontSize: 8.6,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    letterSpacing: 1.5,
  },
  dayDot: {
    width: 2.2, height: 2.2, borderRadius: 1.1,
    backgroundColor: INK_FAINT,
    marginHorizontal: 6,
  },
  dayMeta: {
    fontSize: 6.8,
    color: INK_MUTED,
    letterSpacing: 0.7,
  },
  dayRule: {
    flex: 1,
    height: 0.5,
    backgroundColor: HAIRLINE,
    marginLeft: 8,
  },

  mealRow: { flexDirection: 'row' },
  mealCol: { flex: 1 },
  mealColLeft:  { paddingRight: 12 },
  mealColRight: { paddingLeft: 12, borderLeftWidth: 0.5, borderLeftColor: HAIRLINE_2 },

  mealHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  mealKindBadge: {
    width: 9, height: 9, borderRadius: 4.5,
    fontSize: 5.6,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    textAlign: 'center',
    paddingTop: 1.8,
    marginRight: 4,
  },
  mealKindLunch:  { backgroundColor: ACCENT },
  mealKindDinner: { backgroundColor: BRAND_DARK },
  mealKindText: {
    fontSize: 6,
    color: INK_MUTED,
    letterSpacing: 1.4,
    fontFamily: 'Helvetica-Bold',
  },
  mealName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    marginBottom: 2,
    lineHeight: 1.15,
  },
  mealMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  mealMetaChip: {
    fontSize: 6.6,
    color: INK_SOFT,
    letterSpacing: 0.3,
    backgroundColor: HAIRLINE_2,
    paddingHorizontal: 5,
    paddingTop: 2.2,
    paddingBottom: 1.4,
    marginRight: 4,
    marginBottom: 2,
    borderRadius: 8,
  },
  mealMetaChipCost: {
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontFamily: 'Helvetica-Bold',
  },
  mealIngrLabel: {
    fontSize: 5.6,
    color: INK_FAINT,
    letterSpacing: 1.2,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1.5,
  },
  mealIngr: {
    fontSize: 7.4,
    color: INK_SOFT,
    lineHeight: 1.4,
  },
  mealEmpty: { fontSize: 7.8, color: INK_FAINT, fontStyle: 'italic' },

  // ── Shopping section ────────────────────────────────────────────────────
  shopSection: { marginTop: 4 },
  // 3 columns instead of 2 — denser, fits more groups per page without
  // shrinking type. Each column is ~165pt wide @ A4 32pt side margins
  // (530pt content / 3 ≈ 177pt before padding).
  shopGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  shopGroup: { width: '33.33%', paddingRight: 12, marginBottom: 9 },
  shopGroupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 3,
    marginBottom: 4,
    borderBottomWidth: 0.6,
    borderBottomColor: BRAND,
  },
  shopGroupDot: {
    width: 4.5, height: 4.5, borderRadius: 2.25,
    backgroundColor: BRAND,
    marginRight: 5,
  },
  shopGroupTitle: {
    fontSize: 7.4,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_DARK,
    letterSpacing: 1.6,
  },

  shopItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 1.2,
  },
  shopCheck: {
    width: 6, height: 6,
    borderWidth: 0.6,
    borderColor: INK_FAINT,
    borderRadius: 1,
    marginRight: 5,
  },
  shopItemName: { fontSize: 7.8, color: INK },
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
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: INK_SOFT,
  },

  // ── Tip box (compact, inline after shopping list) ────────────────────────
  // Single-line text; sits at the end of the section without occupying its
  // own page. Falls onto the next page only when the last group is full.
  tipBox: {
    marginTop: 6,
    paddingTop: 6, paddingBottom: 6, paddingHorizontal: 10,
    backgroundColor: ACCENT_TINT,
    borderLeftWidth: 2,
    borderLeftColor: ACCENT,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: 6.4,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 1.6,
    marginRight: 8,
  },
  tipText: { fontSize: 7.6, color: INK_SOFT, lineHeight: 1.35, flex: 1 },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 32,
    right: 32,
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
  },
  footerLeft:  { fontSize: 7, color: INK_MUTED, letterSpacing: 0.5 },
  footerCenter:{
    fontSize: 7,
    color: INK_MUTED,
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    position: 'absolute',
    left: 0, right: 0, top: 7,
  },
  footerRight: { fontSize: 7, color: INK_MUTED, letterSpacing: 0.5 },
});

function mealCell(meal, kind) {
  const kindLabel = kind.toUpperCase();
  const kindLetter = kind.charAt(0).toUpperCase();
  const kindStyle = kind === 'lunch' ? styles.mealKindLunch : styles.mealKindDinner;
  if (!meal || !meal.name) {
    return h(View, null,
      h(View, { style: styles.mealHead },
        h(Text, { style: [styles.mealKindBadge, kindStyle] }, kindLetter),
        h(Text, { style: styles.mealKindText }, kindLabel),
      ),
      h(Text, { style: styles.mealEmpty }, '—')
    );
  }
  const ingr = Array.isArray(meal.ingredients) ? meal.ingredients : [];
  // Cap at 5 ingredients — typically fits on one line at the new column
  // width, so day blocks stay predictable in height. " +X more" suffix
  // signals truncation without burning extra vertical room.
  const MAX = 5;
  const ingrShort = ingr.length
    ? ingr.slice(0, MAX).join(' · ') + (ingr.length > MAX ? ` · +${ingr.length - MAX} more` : '')
    : '';
  const children = [
    h(View, { key: 'h', style: styles.mealHead },
      h(Text, { style: [styles.mealKindBadge, kindStyle] }, kindLetter),
      h(Text, { style: styles.mealKindText }, kindLabel),
    ),
    h(Text, { key: 'n', style: styles.mealName }, meal.name),
  ];
  const chips = [];
  if (meal.time)     chips.push(h(Text, { key: 'ct', style: styles.mealMetaChip }, `${meal.time} min`));
  if (meal.servings) chips.push(h(Text, { key: 'cs', style: styles.mealMetaChip }, `${meal.servings} servings`));
  if (meal.cost)     chips.push(h(Text, { key: 'cc', style: [styles.mealMetaChip, styles.mealMetaChipCost] }, String(meal.cost)));
  if (chips.length)  children.push(h(View, { key: 'm', style: styles.mealMeta }, ...chips));
  if (ingrShort) {
    children.push(h(Text, { key: 'il', style: styles.mealIngrLabel }, 'INGREDIENTS'));
    children.push(h(Text, { key: 'i',  style: styles.mealIngr }, ingrShort));
  }
  return h(View, null, ...children);
}

function dayBlock(d, idx) {
  // Total active minutes for the day (lunch + dinner)
  const totalMin = (d.lunch && d.lunch.time ? d.lunch.time : 0)
                 + (d.dinner && d.dinner.time ? d.dinner.time : 0);
  const meals = (d.lunch ? 1 : 0) + (d.dinner ? 1 : 0);
  const metaBits = [];
  if (meals)    metaBits.push(`${meals} meal${meals > 1 ? 's' : ''}`);
  if (totalMin) metaBits.push(`${totalMin} min total`);
  return h(View, { key: idx, style: styles.dayBlock, wrap: false },
    h(View, { style: styles.dayHeader },
      h(Text, { style: styles.dayBadge }, String(idx + 1)),
      h(Text, { style: styles.dayName }, (d.day || `Day ${idx + 1}`).toUpperCase()),
      metaBits.length ? h(View, { style: styles.dayDot }) : null,
      metaBits.length ? h(Text, { style: styles.dayMeta }, metaBits.join(' · ')) : null,
      h(View, { style: styles.dayRule }),
    ),
    h(View, { style: styles.mealRow },
      h(View, { style: [styles.mealCol, styles.mealColLeft] },  mealCell(d.lunch,  'lunch')),
      h(View, { style: [styles.mealCol, styles.mealColRight] }, mealCell(d.dinner, 'dinner')),
    ),
  );
}

function shopItemRow(it, idx) {
  const name = typeof it === 'string' ? it : it.name;
  const qty  = typeof it === 'string' ? ''  : (it.qty || '');
  return h(View, { key: idx, style: styles.shopItem, wrap: false },
    h(View, { style: styles.shopCheck }),
    h(Text, { style: styles.shopItemName }, name),
    h(View, { style: styles.shopItemLeader }),
    qty ? h(Text, { style: styles.shopItemQty }, qty) : null,
  );
}

function shopGroup(g, gi) {
  return h(View, { key: gi, style: styles.shopGroup, wrap: false },
    h(View, { style: styles.shopGroupHead },
      h(View, { style: styles.shopGroupDot }),
      h(Text, { style: styles.shopGroupTitle }, (g.label || g.id || '').toUpperCase()),
    ),
    ...(g.items || []).map(shopItemRow),
  );
}

function MealPlanDocument(plan) {
  const days   = Array.isArray(plan.days) ? plan.days : [];
  const groups = Array.isArray(plan.shoppingGroups) ? plan.shoppingGroups : [];

  // ── Weekly stats for the hero ─────────────────────────────────────────
  let mealCount = 0, totalMin = 0, cuisines = 0;
  const cuisineSet = new Set();
  days.forEach(d => {
    ['lunch','dinner'].forEach(k => {
      const m = d[k];
      if (m && m.name) {
        mealCount++;
        if (m.time) totalMin += m.time;
        if (m.origin) cuisineSet.add(String(m.origin).toLowerCase());
      }
    });
  });
  cuisines = cuisineSet.size;
  const avgMin = mealCount ? Math.round(totalMin / mealCount) : 0;

  const topAccent = h(View, { style: styles.topAccent, fixed: true });

  const mastheadEl = h(View, { style: styles.masthead, fixed: true },
    h(View, { style: styles.brandRow },
      h(Text, { style: styles.brandMark }, 'M'),
      h(Text, { style: styles.brand }, 'Meal-Planner.ro'),
    ),
    h(View, { style: styles.mastheadRight },
      h(Text, { style: styles.planTitle }, plan.title || 'Weekly plan'),
      plan.weekLabel ? h(Text, { style: styles.weekLabel }, plan.weekLabel) : null,
    ),
  );

  // ── Hero block (page 1) — title left, stats right ──
  const heroStats = [];
  heroStats.push(
    h(View, { key: 's1', style: styles.heroStat },
      h(Text, { style: styles.heroStatNum }, String(days.length || 0)),
      h(Text, { style: styles.heroStatLabel }, 'DAYS'),
    ),
    h(View, { key: 'd1', style: styles.heroStatDivider }),
    h(View, { key: 's2', style: styles.heroStat },
      h(Text, { style: styles.heroStatNum }, String(mealCount)),
      h(Text, { style: styles.heroStatLabel }, 'MEALS'),
    ),
    h(View, { key: 'd2', style: styles.heroStatDivider }),
    h(View, { key: 's3', style: styles.heroStat },
      h(Text, { style: styles.heroStatNum }, avgMin ? `${avgMin}'` : '—'),
      h(Text, { style: styles.heroStatLabel }, 'AVG'),
    ),
    h(View, { key: 'd3', style: styles.heroStatDivider }),
    h(View, { key: 's4', style: styles.heroStat },
      h(Text, { style: styles.heroStatNum }, cuisines ? String(cuisines) : `${groups.length || '—'}`),
      h(Text, { style: styles.heroStatLabel }, cuisines ? 'CUISINES' : 'GROUPS'),
    ),
  );

  const heroEl = h(View, { style: styles.hero },
    h(View, { style: styles.heroLeft },
      h(Text, { style: styles.heroEyebrow }, 'MEAL-PLANNER.RO  ·  AUTO-GENERATED'),
      h(Text, { style: styles.heroTitle }, plan.title || 'Weekly Meal Plan'),
      plan.weekLabel ? h(Text, { style: styles.heroWeek }, plan.weekLabel) : null,
    ),
    h(View, { style: styles.heroRight }, ...heroStats),
  );

  // ── Section heading: THE PLAN ──
  const planHeadingEl = h(View, { style: styles.sectionHead },
    h(Text, { style: styles.sectionEyebrow }, '01'),
    h(Text, { style: styles.sectionTitle }, 'The week, day by day'),
    h(View, { style: styles.sectionRule }),
  );

  const dayEls = days.map(dayBlock);

  // Heading + grid render as one atomic block (wrap:false) so the section
  // title never orphans. For a typical 50–100-item list across 6 groups in
  // 2 columns, the block fits comfortably on a single A4 page.
  // Shopping section: groups wrap naturally between pages. Each individual
  // group is still wrap:false so a category never splits mid-list. The
  // heading uses minPresenceAhead so it never orphans alone at the bottom
  // of a page — it'll push to the next page if the first group can't fit
  // beside it.
  // Old approach (wrap:false on the whole section) atomically failed for
  // 7-day premium plans where the shopping list (~85 items) is too tall to
  // fit even on a fresh page; React-PDF then collapsed all content onto
  // page 1 with row overlap. Letting groups wrap fixes this — premium
  // exports paginate naturally to 2–3 pages instead of compressing.
  // Force a page break before the shopping section when the day grid is
  // dense (more than 3 days). For premium 7-day plans this keeps the
  // SHOPPING LIST heading + first groups together on page 2, instead of
  // orphaning the heading at the bottom of page 1. For free 2-day
  // previews, no break — heading + shopping flow naturally after the
  // (small) day grid and the whole document fits on one page.
  // Individual shopGroup views remain wrap:false so a category never
  // splits mid-list; the parent grid wraps freely between groups.
  const shopHeadingEl = h(View, { style: styles.sectionHead, minPresenceAhead: 80 },
    h(Text, { style: styles.sectionEyebrow }, '02'),
    h(Text, { style: styles.sectionTitle }, 'Shopping list'),
    h(View, { style: styles.sectionRule }),
  );
  // Single-line PRO TIP — sits inline after the grid without orphaning to
  // a near-empty trailing page.
  const tipEl = groups.length ? h(View, { style: styles.tipBox, wrap: false },
    h(Text, { style: styles.tipLabel }, 'PRO TIP'),
    h(Text, { style: styles.tipText },
      'Items are grouped by supermarket aisle — tick boxes as you shop. Produce and proteins last keeps everything fresh.'),
  ) : null;

  // Sort groups by item count descending so the tallest categories flow
  // first and 3-column packing leaves less ragged whitespace.
  const sortedGroups = groups.slice().sort((a, b) => {
    const an = Array.isArray(a.items) ? a.items.length : 0;
    const bn = Array.isArray(b.items) ? b.items.length : 0;
    return bn - an;
  });

  const shopEls = groups.length ? [
    h(View, { key: 'sh', style: styles.shopSection },
      shopHeadingEl,
      h(View, { style: styles.shopGrid }, ...sortedGroups.map(shopGroup)),
      tipEl,
    ),
  ] : [];

  const today = new Date().toLocaleDateString('en-GB');
  const footerEl = h(View, { style: styles.footer, fixed: true },
    h(Text, { style: styles.footerLeft }, `Meal-Planner.ro  ·  ${today}`),
    h(Text, {
      style: styles.footerCenter,
      render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`,
    }),
    h(Text, { style: styles.footerRight }, plan.title || 'Weekly plan'),
  );

  const pageEl = h(Page, { size: 'A4', style: styles.page, wrap: true },
    topAccent,
    mastheadEl,
    heroEl,
    planHeadingEl,
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
