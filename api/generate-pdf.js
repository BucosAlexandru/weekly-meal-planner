// api/generate-pdf.js
// PHASE 1 SCAFFOLD — opt-in only, EN locale only, no images, no QR, no fonts.
// Purpose: validate Vercel compatibility + server-side render stability +
// pagination + download UX. The existing html2pdf path remains the production
// default; this endpoint is reached only when the client sets pdfV2 = true.
//
// Implementation note: this file uses React.createElement directly instead
// of JSX so it runs as plain ESM on @vercel/node without a build step.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from '@react-pdf/renderer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { isPremiumEmail } from './_lib/requirePremium.js';
import { checkRateLimit } from './_lib/rateLimiter.js';

const h = React.createElement;

// ── Access gating (server-authoritative) ────────────────────────────────────
// SECURITY: the SERVER decides how much of the plan it renders, never the
// browser. Free / unverified requests get at most FREE_DAYS days regardless of
// what the client sends (window.hasUnlimited, a fat payload, or a raw curl
// cannot unlock the full plan — only a premium email validated against Supabase
// can). Free generation is also rate-limited per email/IP.
const FREE_DAYS           = 2;
const FREE_PDF_LIMIT      = 8;                // free PDFs allowed per window …
const FREE_PDF_WINDOW_MS  = 60 * 60 * 1000;   // … per rolling hour, per email/IP

/**
 * Clamp a plan to what the requester is entitled to. Pure + synchronous so it
 * is unit-testable without Supabase.
 *
 *  - premium  → plan returned unchanged (full 7-day plan allowed).
 *  - non-premium → days capped at FREE_DAYS. If the client tried to send more
 *    than the free allowance, the shopping list is dropped too (it can't be
 *    trusted/mapped to the 2 visible days) and a locked-days upsell notice is
 *    injected when one isn't already present.
 *
 * @param {object} plan
 * @param {boolean} isPremium
 * @returns {object}
 */
export function gatePlanForAccess(plan, isPremium) {
  if (isPremium) return plan;
  const days = Array.isArray(plan && plan.days) ? plan.days : [];
  if (days.length <= FREE_DAYS) return plan; // legitimate free preview — leave as-is
  const locked = plan.locked || {
    title: 'The full 7-day plan is Premium',
    sub:   'Upgrade to unlock every day, the full shopping list and the weekly budget menu.',
    cta:   'Get Premium → meal-planner.ro',
  };
  return { ...plan, days: days.slice(0, FREE_DAYS), shoppingGroups: [], locked };
}

/** Best-effort client IP for rate-limit keying behind Vercel's proxy. */
function clientIp(req) {
  const xff = req && req.headers && req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req && req.socket && req.socket.remoteAddress) || 'anon';
}

// ── Font registration ──────────────────────────────────────────────────────
// One font family per script. The handler picks the right family at render
// time via the plan.lang field; locales without a registered family fall
// back to Roboto and render with missing glyphs (won't happen for any of
// the 14 supported site locales after this commit).
//
//   Roboto                — Latin + Cyrillic  → ro en es fr de pt ru it tr
//   NotoSansArabic        — Arabic            → ar
//   NotoSansDevanagari    — Hindi             → hi
//   NotoSansSC            — Simplified Han    → zh
//   NotoSansJP            — Japanese kana+kanji→ ja
//   NotoSansKR            — Hangul            → ko
//
// SC/JP/KR are variable-axis TTFs that handle Regular and Bold from the
// same file (the `wght` axis covers 100-900). Registering the same src
// twice with different fontWeight values is intentional — @react-pdf
// rasterises the appropriate axis position per weight.
const FONTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '_fonts');

Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(FONTS_DIR, 'Roboto-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'Roboto-Bold.ttf'),    fontWeight: 700 },
    { src: path.join(FONTS_DIR, 'Roboto-Italic.ttf'),  fontWeight: 400, fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'NotoSansArabic',
  fonts: [
    { src: path.join(FONTS_DIR, 'NotoSansArabic-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'NotoSansArabic-Bold.ttf'),    fontWeight: 700 },
    // Arabic script is cursive by default — there's no true italic. Map
    // the italic style back onto the regular weight so @react-pdf can
    // satisfy the style request without crashing the bidi pass.
    { src: path.join(FONTS_DIR, 'NotoSansArabic-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(FONTS_DIR, 'NotoSansArabic-Bold.ttf'),    fontWeight: 700, fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'NotoSansDevanagari',
  fonts: [
    { src: path.join(FONTS_DIR, 'NotoSansDevanagari-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'NotoSansDevanagari-Bold.ttf'),    fontWeight: 700 },
    { src: path.join(FONTS_DIR, 'NotoSansDevanagari-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'NotoSansSC',
  fonts: [
    { src: path.join(FONTS_DIR, 'NotoSansSC-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'NotoSansSC-Regular.ttf'), fontWeight: 700 },
    { src: path.join(FONTS_DIR, 'NotoSansSC-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'NotoSansJP',
  fonts: [
    { src: path.join(FONTS_DIR, 'NotoSansJP-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'NotoSansJP-Regular.ttf'), fontWeight: 700 },
    { src: path.join(FONTS_DIR, 'NotoSansJP-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: path.join(FONTS_DIR, 'NotoSansKR-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'NotoSansKR-Regular.ttf'), fontWeight: 700 },
    { src: path.join(FONTS_DIR, 'NotoSansKR-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
  ],
});

// Disable word-break hyphenation so e.g. "supermarket" doesn't wrap as
// "su-permarket" in narrow shopping columns.
Font.registerHyphenationCallback(word => [word]);

// Per-locale font family resolver. Latin/Cyrillic locales (most of the
// catalogue) use Roboto. Non-Latin scripts get their own Noto Sans.
const FONT_FOR_LOCALE = {
  ro: 'Roboto', en: 'Roboto', es: 'Roboto', fr: 'Roboto', de: 'Roboto',
  pt: 'Roboto', it: 'Roboto', tr: 'Roboto', ru: 'Roboto',
  ar: 'NotoSansArabic',
  hi: 'NotoSansDevanagari',
  zh: 'NotoSansSC',
  ja: 'NotoSansJP',
  ko: 'NotoSansKR',
};
const fontFor = (lang) => FONT_FOR_LOCALE[lang] || 'Roboto';

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

function makeStyles(fontFamily) { return StyleSheet.create({
  // A4: 595.28 × 841.89 pt. 30pt side margins ≈ 10.6mm.
  // Compacted from 30/38/36 to give more usable area without crowding.
  page: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily,
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
    fontFamily, fontWeight: 700,
    textAlign: 'center',
    paddingTop: 2.5,
  },
  brand:       { fontSize: 10.5, fontFamily, fontWeight: 700, color: INK, letterSpacing: 0.4 },
  mastheadRight: { alignItems: 'flex-end' },
  planTitle:   { fontSize: 10, fontFamily, fontWeight: 700, color: INK, letterSpacing: 0.2 },
  // Tiny left padding stops italic glyphs with a negative left-side
  // bearing (e.g. Roboto-Italic 'S' in 'Settimana', 'C' in 'Ce…') from
  // having their overhang clipped at the container's left edge.
  weekLabel:   { fontSize: 7.5, color: INK_MUTED, fontFamily, fontStyle: 'italic', marginTop: 2, paddingLeft: 2 },

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
    fontFamily, fontWeight: 700,
    marginBottom: 3,
  },
  heroTitle: {
    fontSize: 19,
    fontFamily, fontWeight: 700,
    color: INK,
    letterSpacing: -0.3,
    lineHeight: 1.12,
    marginBottom: 4,
  },
  heroWeek: {
    fontSize: 9,
    color: INK_SOFT,
    fontFamily, fontStyle: 'italic',
  },
  heroStat: { flex: 1 },
  heroStatNum: {
    fontSize: 15,
    fontFamily, fontWeight: 700,
    color: BRAND_DARK,
    lineHeight: 1.1,
  },
  heroStatLabel: {
    fontSize: 6.4,
    color: INK_MUTED,
    letterSpacing: 1.3,
    marginTop: 2,
    fontFamily, fontWeight: 700,
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
    fontFamily, fontWeight: 700,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily, fontWeight: 700,
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

  // ── Week-at-a-glance grid (section 01, "fridge moment") ─────────────────
  // Compact 7-row table: day abbrev | lunch name · time | dinner name · time.
  // Thin rules between rows; the whole grid stays under ~1/3 of a page.
  glanceGrid: { marginBottom: 12 },
  glanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2.6, paddingBottom: 2.2,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE_2,
  },
  glanceDay: {
    width: 34,
    fontSize: 7,
    fontFamily, fontWeight: 700,
    color: BRAND_DARK,
    letterSpacing: 0.8,
  },
  glanceCell: { flex: 1, paddingRight: 8 },
  glanceName: { fontSize: 8.2, color: INK, fontFamily, fontWeight: 700, lineHeight: 1.2 },
  glanceMeta: { fontSize: 6.6, color: INK_MUTED, fontFamily, fontWeight: 400 },
  glanceEmpty: { fontSize: 8.2, color: INK_FAINT },

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
    fontFamily, fontWeight: 700,
    textAlign: 'center',
    paddingTop: 2.6,
    marginRight: 7,
  },
  dayName: {
    fontSize: 8.6,
    fontFamily, fontWeight: 700,
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
    fontFamily, fontWeight: 700,
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
    fontFamily, fontWeight: 700,
    // Reclaim the half-letter-spacing the renderer eats off the left edge,
    // otherwise letter-spaced labels starting with 'C' (CENA) or 'S' get
    // their first glyph clipped at the container start.
    paddingLeft: 1,
  },
  mealName: {
    fontSize: 11,
    fontFamily, fontWeight: 700,
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
    fontFamily, fontWeight: 700,
  },
  mealIngrLabel: {
    fontSize: 5.6,
    color: INK_FAINT,
    letterSpacing: 1.2,
    fontFamily, fontWeight: 700,
    marginBottom: 1.5,
  },
  mealIngr: {
    fontSize: 7.4,
    color: INK_SOFT,
    lineHeight: 1.4,
  },
  // Full ingredient lines (with quantities), 2 columns per meal — the
  // "kitchen moment": everything needed to cook the recipe, small and tight.
  mealIngrCols: { flexDirection: 'row', marginTop: 1 },
  mealIngrCol: { flex: 1, paddingRight: 7 },
  mealIngrColLast: { paddingRight: 0 },
  mealIngrLine: {
    fontSize: 7.5,
    color: INK_SOFT,
    lineHeight: 1.3,
    marginBottom: 1,
  },
  mealEmpty: { fontSize: 7.8, color: INK_FAINT, fontStyle: 'italic' },

  // ── Shopping section ────────────────────────────────────────────────────
  shopSection: { marginTop: 4 },
  // Vertical-column layout: 3 column Views in a row, each containing its
  // assigned groups stacked top-to-bottom. Greedy bin-pack distributes
  // groups by item count so columns end at similar heights — eliminates
  // the ragged whitespace the prior flex-wrap row layout produced when
  // categories had very different sizes.
  shopGrid: { flexDirection: 'row' },
  shopColumn:     { flex: 1, paddingRight: 10 },
  shopColumnLast: { paddingRight: 0 },
  shopGroup: { marginBottom: 6 },
  shopGroupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
    marginBottom: 3,
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
    fontFamily, fontWeight: 700,
    color: BRAND_DARK,
    letterSpacing: 1.6,
    paddingLeft: 1,
  },

  // Each shop item used to render ~24pt tall (baseline alignment + implicit
  // line-height inherited from page). Now we lock alignment to center,
  // tighten vertical padding and set explicit small line-heights so each
  // row is ~13pt — without shrinking the actual font size.
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0.4,
  },
  shopCheck: {
    width: 6, height: 6,
    borderWidth: 0.6,
    borderColor: INK_FAINT,
    borderRadius: 1,
    marginRight: 5,
  },
  shopItemName: { fontSize: 7.8, color: INK, lineHeight: 1.2 },
  shopItemLeader: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 1.5,
    height: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: DOT,
    borderBottomStyle: 'dotted',
  },
  shopItemQty: {
    fontSize: 7,
    fontFamily, fontWeight: 700,
    color: INK_SOFT,
    lineHeight: 1.2,
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
    fontFamily, fontWeight: 700,
    color: ACCENT,
    letterSpacing: 1.6,
    marginRight: 8,
    paddingLeft: 1,
  },
  tipText: { fontSize: 7.6, color: INK_SOFT, lineHeight: 1.35, flex: 1 },

  // ── Locked-days notice (free preview) ───────────────────────────────────
  // Rendered after the meal-plan grid when the payload includes a `locked`
  // block. Mirrors the "Days N–M are Premium" upsell that the legacy
  // html2pdf exporter shows for free users so the perceived value of the
  // export stays consistent across both engines.
  lockedBox: {
    marginTop: 8,
    paddingTop: 10, paddingBottom: 10, paddingHorizontal: 14,
    backgroundColor: BRAND_TINT,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
  },
  lockedTitle: {
    fontSize: 10,
    fontFamily, fontWeight: 700,
    color: BRAND_DARK,
    marginBottom: 4,
  },
  lockedSub: {
    fontSize: 8.4,
    color: INK_SOFT,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  lockedCta: {
    fontSize: 8,
    fontFamily, fontWeight: 700,
    color: BRAND,
    letterSpacing: 0.3,
  },

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
    fontFamily, fontWeight: 700,
    textAlign: 'center',
    position: 'absolute',
    left: 0, right: 0, top: 7,
  },
  footerRight: { fontSize: 7, color: INK_MUTED, letterSpacing: 0.5 },
}); }

// Cache the StyleSheet per font family — StyleSheet.create() is cheap but
// runs through @react-pdf's prop validation; one call per family is enough.
const _stylesCache = {};
function getStyles(fontFamily) {
  if (!_stylesCache[fontFamily]) _stylesCache[fontFamily] = makeStyles(fontFamily);
  return _stylesCache[fontFamily];
}

function mealCell(meal, kind, L, styles) {
  const kindLabel = kind === 'lunch' ? (L.lunch || 'LUNCH') : (L.dinner || 'DINNER');
  const kindLetter = kindLabel.charAt(0);
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
  // Complete localized ingredient lines WITH quantities (the "kitchen
  // moment") — a cook must be able to make the recipe from the PDF alone.
  const full = Array.isArray(meal.ingredientsFull) && meal.ingredientsFull.length
    ? meal.ingredientsFull : null;
  const MAX = 5;
  const moreWord = L.moreSuffix || 'more';
  const ingrShort = ingr.length
    ? ingr.slice(0, MAX).join(' · ') + (ingr.length > MAX ? ` · +${ingr.length - MAX} ${moreWord}` : '')
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
  if (meal.servings) chips.push(h(Text, { key: 'cs', style: styles.mealMetaChip }, `${meal.servings} ${L.servingsWord || 'servings'}`));
  if (meal.cost)     chips.push(h(Text, { key: 'cc', style: [styles.mealMetaChip, styles.mealMetaChipCost] }, String(meal.cost)));
  if (chips.length)  children.push(h(View, { key: 'm', style: styles.mealMeta }, ...chips));
  if (full) {
    // ALL ingredient lines, quantities included, laid out in 2 tight columns.
    const mid = Math.ceil(full.length / 2);
    const colA = full.slice(0, mid);
    const colB = full.slice(mid);
    children.push(h(Text, { key: 'il', style: styles.mealIngrLabel }, L.ingredients || 'INGREDIENTS'));
    children.push(h(View, { key: 'ic', style: styles.mealIngrCols },
      h(View, { style: styles.mealIngrCol },
        ...colA.map((line, i) => h(Text, { key: `a${i}`, style: styles.mealIngrLine }, String(line)))),
      h(View, { style: [styles.mealIngrCol, styles.mealIngrColLast] },
        ...colB.map((line, i) => h(Text, { key: `b${i}`, style: styles.mealIngrLine }, String(line)))),
    ));
  } else if (ingrShort) {
    // Backward compat: old payloads without ingredientsFull keep the compact
    // noun-list preview.
    children.push(h(Text, { key: 'il', style: styles.mealIngrLabel }, L.ingredients || 'INGREDIENTS'));
    children.push(h(Text, { key: 'i',  style: styles.mealIngr }, ingrShort));
  }
  return h(View, null, ...children);
}

function dayBlock(d, idx, L, styles) {
  const totalMin = (d.lunch && d.lunch.time ? d.lunch.time : 0)
                 + (d.dinner && d.dinner.time ? d.dinner.time : 0);
  const meals = (d.lunch ? 1 : 0) + (d.dinner ? 1 : 0);
  const metaBits = [];
  if (meals)    metaBits.push(`${meals} ${L.mealsSuffix || 'meals'}`);
  if (totalMin) metaBits.push(`${totalMin} ${L.minTotal || 'min total'}`);
  // Real cost of the day (sum of the two meals), computed client-side.
  if (d.costLabel) metaBits.push(String(d.costLabel));
  // Pagination: the day block itself may flow to the next page (full
  // ingredient lists make 7 days taller than one page), but a meal pair
  // must never split mid-recipe — the mealRow is the atomic unit and the
  // header uses minPresenceAhead so it can't orphan at a page bottom.
  return h(View, { key: idx, style: styles.dayBlock },
    h(View, { style: styles.dayHeader, minPresenceAhead: 60 },
      h(Text, { style: styles.dayBadge }, String(idx + 1)),
      h(Text, { style: styles.dayName }, (d.day || `Day ${idx + 1}`).toUpperCase()),
      metaBits.length ? h(View, { style: styles.dayDot }) : null,
      metaBits.length ? h(Text, { style: styles.dayMeta }, metaBits.join(' · ')) : null,
      h(View, { style: styles.dayRule }),
    ),
    h(View, { style: styles.mealRow, wrap: false },
      h(View, { style: [styles.mealCol, styles.mealColLeft] },  mealCell(d.lunch,  'lunch',  L, styles)),
      h(View, { style: [styles.mealCol, styles.mealColRight] }, mealCell(d.dinner, 'dinner', L, styles)),
    ),
  );
}

// One row of the week-at-a-glance grid: day abbrev | lunch | dinner.
function glanceRow(d, idx, L, styles) {
  const cell = (meal) => {
    if (!meal || !meal.name) return h(View, { style: styles.glanceCell }, h(Text, { style: styles.glanceEmpty }, ' '));
    return h(View, { style: styles.glanceCell },
      h(Text, { style: styles.glanceName },
        String(meal.name),
        meal.time ? h(Text, { style: styles.glanceMeta }, `  ·  ${meal.time} min`) : null,
      ),
    );
  };
  return h(View, { key: `g${idx}`, style: styles.glanceRow },
    h(Text, { style: styles.glanceDay }, String(d.day || idx + 1).toUpperCase()),
    cell(d.lunch),
    cell(d.dinner),
  );
}

function shopItemRow(it, idx, styles) {
  const name = typeof it === 'string' ? it : it.name;
  const qty  = typeof it === 'string' ? ''  : (it.qty || '');
  return h(View, { key: idx, style: styles.shopItem, wrap: false },
    h(View, { style: styles.shopCheck }),
    h(Text, { style: styles.shopItemName }, name),
    h(View, { style: styles.shopItemLeader }),
    qty ? h(Text, { style: styles.shopItemQty }, qty) : null,
  );
}

function shopGroup(g, gi, styles) {
  // wrap policy (production bug, 9 iul — meal-plan-6.pdf): a big group
  // (Vegetables on a rich 7-day plan can exceed 30 items) with wrap:false
  // that lands in the leftover space at a page bottom overflows and
  // OVERPRINTS itself. Small groups keep the tidy no-split behaviour;
  // large ones flow across the page break, with the group header pinned
  // to at least its first rows via minPresenceAhead.
  const items = g.items || [];
  const noSplit = items.length <= 12;
  return h(View, { key: gi, style: styles.shopGroup, wrap: !noSplit },
    h(View, { style: styles.shopGroupHead, minPresenceAhead: 48 },
      h(View, { style: styles.shopGroupDot }),
      h(Text, { style: styles.shopGroupTitle }, (g.label || g.id || '').toUpperCase()),
    ),
    ...items.map((it, idx) => shopItemRow(it, idx, styles)),
  );
}

// Exported for local tooling (scripts/preview-pdf.mjs, stress-test-pdf.mjs)
// so they can render the FULL premium view of a plan without going through
// the HTTP handler. This is a pure render function — access control lives in
// the default handler (isPremiumEmail + gatePlanForAccess) and is unchanged.
export function MealPlanDocument(plan) {
  const days   = Array.isArray(plan.days) ? plan.days : [];
  const groups = Array.isArray(plan.shoppingGroups) ? plan.shoppingGroups : [];
  // Resolve the font family for this locale. Latin/Cyrillic → Roboto;
  // Arabic/Devanagari/CJK each get their own Noto Sans. Then build the
  // localized StyleSheet (cached across renders).
  const styles = getStyles(fontFor(plan.lang));
  // Localized labels shipped from the client. We keep the EN strings as
  // fallbacks so direct GET smoke-tests and pre-i18n callers still render.
  const L = (plan.labels && typeof plan.labels === 'object') ? plan.labels : {};
  const LStats = (L.stats && typeof L.stats === 'object') ? L.stats : {};

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
  // A stat has to EARN its box: unknown/zero values are dropped entirely
  // (no '—' placeholders). The real weekly cost joins when the client
  // computed one.
  const statDefs = [];
  statDefs.push([String(days.length || 0), LStats.days || 'DAYS']);
  statDefs.push([String(mealCount), LStats.meals || 'MEALS']);
  if (avgMin)   statDefs.push([`${avgMin}'`, LStats.avg || 'AVG']);
  if (cuisines) statDefs.push([String(cuisines), LStats.cuisines || 'CUISINES']);
  if (plan.weekCost) statDefs.push([String(plan.weekCost), LStats.cost || 'BUDGET']);
  const heroStats = [];
  statDefs.forEach(([num, label], i) => {
    if (i) heroStats.push(h(View, { key: `d${i}`, style: styles.heroStatDivider }));
    heroStats.push(
      h(View, { key: `s${i}`, style: styles.heroStat },
        h(Text, { style: styles.heroStatNum }, num),
        h(Text, { style: styles.heroStatLabel }, label),
      ),
    );
  });

  const heroEl = h(View, { style: styles.hero },
    h(View, { style: styles.heroLeft },
      h(Text, { style: styles.heroEyebrow }, 'MEAL-PLANNER.RO'),
      h(Text, { style: styles.heroTitle }, plan.title || 'Weekly Meal Plan'),
      plan.weekLabel ? h(Text, { style: styles.heroWeek }, plan.weekLabel) : null,
    ),
    h(View, { style: styles.heroRight }, ...heroStats),
  );

  // ── Section 01: THE WEEK AT A GLANCE (fridge moment) ──
  // Compact grid answering "what are we eating today?" — one row per day.
  const glanceEls = days.length ? [
    h(View, { key: 'gh', style: styles.sectionHead, minPresenceAhead: 60 },
      h(Text, { style: styles.sectionEyebrow }, '01'),
      h(Text, { style: styles.sectionTitle }, L.weekAtGlance || 'The week at a glance'),
      h(View, { style: styles.sectionRule }),
    ),
    h(View, { key: 'gg', style: styles.glanceGrid, wrap: false },
      ...days.map((d, i) => glanceRow(d, i, L, styles)),
    ),
  ] : [];

  // ── Section 02: DAY BY DAY (kitchen moment) ──
  const planHeadingEl = h(View, { style: styles.sectionHead, minPresenceAhead: 80 },
    h(Text, { style: styles.sectionEyebrow }, '02'),
    h(Text, { style: styles.sectionTitle }, L.dayByDay || L.sectionPlan || 'Day by day'),
    h(View, { style: styles.sectionRule }),
  );

  const dayEls = days.map((d, i) => dayBlock(d, i, L, styles));

  // ── Locked-days notice (free preview only) ──
  // Roboto ships Latin Extended + Cyrillic only — no emoji or supplementary
  // pictographs. Strip those code points before rendering so the lock title
  // doesn't show a tofu box where 🔒 used to be. Same for the right-arrow
  // suffix common in i18n strings: substitute the ASCII "->".
  const sanitizePdfText = (s) => String(s || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]\s*/gu, '')
    .replace(/→/g, '->');
  const lockedEl = (plan.locked && plan.locked.title) ? h(View, { style: styles.lockedBox, wrap: false },
    h(Text, { style: styles.lockedTitle }, sanitizePdfText(plan.locked.title)),
    plan.locked.sub ? h(Text, { style: styles.lockedSub }, sanitizePdfText(plan.locked.sub)) : null,
    plan.locked.cta ? h(Text, { style: styles.lockedCta }, `${sanitizePdfText(plan.locked.cta)}  meal-planner.ro`) : null,
  ) : null;

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
  // ── Section 03: SHOPPING LIST (store moment) ──
  const shopHeadingEl = h(View, { style: styles.sectionHead, minPresenceAhead: 80 },
    h(Text, { style: styles.sectionEyebrow }, '03'),
    h(Text, { style: styles.sectionTitle }, L.sectionShop || 'Shopping list'),
    h(View, { style: styles.sectionRule }),
  );
  const tipEl = groups.length ? h(View, { style: [styles.tipBox, { width: 360 }], wrap: false },
    h(Text, { style: styles.tipLabel }, L.tipLabel || 'PRO TIP'),
    h(Text, { style: styles.tipText },
      L.tipText || 'Items are grouped by supermarket aisle — tick boxes as you shop. Produce and proteins last keeps everything fresh.'),
  ) : null;

  // Greedy bin-pack: sort groups by item count desc, assign each to the
  // currently-shortest column. Tends to give 3 columns of near-equal height
  // even when one category dominates (e.g. Vegetables 24 vs Meat 10).
  const COLUMNS = 3;
  const sortedGroups = groups.slice().sort((a, b) => {
    const an = Array.isArray(a.items) ? a.items.length : 0;
    const bn = Array.isArray(b.items) ? b.items.length : 0;
    return bn - an;
  });
  const cols = Array.from({ length: COLUMNS }, () => ({ groups: [], total: 0 }));
  for (const g of sortedGroups) {
    const itemCount = Array.isArray(g.items) ? g.items.length : 0;
    let minIdx = 0;
    for (let i = 1; i < COLUMNS; i++) {
      if (cols[i].total < cols[minIdx].total) minIdx = i;
    }
    cols[minIdx].groups.push(g);
    cols[minIdx].total += itemCount;
  }
  const colEls = cols.map((col, i) => {
    const isLast = i === COLUMNS - 1;
    const children = col.groups.map((g, gi) => shopGroup(g, `${i}-${gi}`, styles));
    return h(View,
      { key: `c${i}`, style: [styles.shopColumn, isLast ? styles.shopColumnLast : null] },
      ...children,
    );
  });

  const shopEls = groups.length ? [
    h(View, { key: 'sh', style: styles.shopSection },
      shopHeadingEl,
      h(View, { style: styles.shopGrid }, ...colEls),
      // PRO TIP: centered under the whole list, always in the same place
      // (producer feedback, 9 iul — riding a column made it land left or
      // right depending on the plan, which read as random).
      tipEl ? h(View, { style: { alignItems: 'center', marginTop: 14 }, wrap: false }, tipEl) : null,
    ),
  ] : [];

  const today = new Date().toLocaleDateString('en-GB');
  // pageOf is a tiny template ("Page {n} of {t}") so the locale chooses
  // word order ("Pagina {n} din {t}" in RO, "{n}/{t} ページ" in JA).
  const pageOfTpl = L.pageOf || 'Page {n} of {t}';
  const footerEl = h(View, { style: styles.footer, fixed: true },
    h(Text, { style: styles.footerLeft }, `Meal-Planner.ro  ·  ${today}`),
    h(Text, {
      style: styles.footerCenter,
      render: ({ pageNumber, totalPages }) =>
        pageOfTpl.replace('{n}', pageNumber).replace('{t}', totalPages),
    }),
    h(Text, { style: styles.footerRight }, plan.title || 'Weekly plan'),
  );

  const pageEl = h(Page, { size: 'A4', style: styles.page, wrap: true },
    topAccent,
    mastheadEl,
    heroEl,
    ...glanceEls,
    planHeadingEl,
    ...dayEls,
    lockedEl,
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
    let email = '';
    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : null;
      if (body && typeof body.email === 'string') email = body.email.trim();
      if (body && (Array.isArray(body.days) || Array.isArray(body.shoppingGroups))) {
        plan = body;
      }
    }

    // SECURITY: server decides the entitlement, not the browser. Validate the
    // email against Supabase (fail-closed). window.hasUnlimited / a fat payload
    // are irrelevant here.
    const premium = await isPremiumEmail(email);

    // Rate-limit free generation (premium users are paying — skip).
    if (!premium) {
      const key = 'pdf:' + (email || clientIp(req));
      const { allowed, retryAfterSec } = checkRateLimit(key, FREE_PDF_LIMIT, FREE_PDF_WINDOW_MS);
      if (!allowed) {
        res.setHeader('Retry-After', String(retryAfterSec));
        res.status(429).json({
          error: 'Too many free PDF requests. Please try again later or upgrade to Premium.',
          retryAfterSec,
        });
        return;
      }
    }

    // Clamp the plan to what the requester is entitled to (free → ≤2 days).
    plan = gatePlanForAccess(plan, premium);

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
