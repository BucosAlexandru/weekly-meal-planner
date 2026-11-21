// scripts/pdf/fixture-plan.mjs
// PDF-001 — deterministic fixture plan for the offline PDF harness.
//
// buildFixturePlan(lang) returns the SAME payload shape the production
// frontend sends to /api/generate-pdf (public/js/app.js → buildPdfV2Payload),
// for a FIXED 7-day menu and a FIXED date, in any of the 14 site locales.
// Same input → same plan, byte for byte (asserted in tests/pdf/).
//
// Parity with the frontend:
//   - recipe names / ingredient lines come from public/js/recipes.js in the
//     requested locale (EN fallback, as app.js does);
//   - time / costRon come from public/js/recipes-meta.js (app.js applies the
//     same meta at runtime);
//   - the shopping list goes through the real engine
//     (buildShoppingFromRawIngredients with aligned { en, loc } pairs);
//   - the localized PDF chrome labels (PDF_LABELS), the "Week of" prefix
//     (WEEK_OF), the per-locale BCP-47 map (localeMap) and the weekday
//     abbreviation overrides (DAY_ABBREV) are READ FROM app.js at load time —
//     they live inside a closure there and are not importable. Reading them
//     (instead of copying) means the harness can never drift from what users
//     actually get.
//
// No network, no secrets, no Supabase.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recipes } from '../../public/js/recipes.js';
import { recipesMeta } from '../../public/js/recipes-meta.js';
import { i18n } from '../../public/js/i18n.js';
import { parseIngredient, buildShoppingFromRawIngredients } from '../../public/js/shopping-list.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const PDF_LOCALES = Object.freeze(
  ['ro', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'zh', 'ja', 'hi', 'tr', 'it', 'ko']);

// Fixed menu, pinned by recipe id (ids are stable; EN names can be renamed).
// [lunchId, dinnerId] per day, Mon..Sun. Every recipe here has a name and an
// ingredient list in all 14 locales (asserted in tests/pdf/fixture.test.mjs).
export const FIXTURE_MENU = Object.freeze([
  [1, 55],    // Spaghetti Carbonara · Moussaka
  [4, 10],    // Gazpacho · Ratatouille
  [3, 11],    // Quiche Lorraine · Souvlaki
  [26, 118],  // Risotto · Chicken Tagine
  [22, 178],  // Paella · Boeuf Bourguignon
  [123, 96],  // Pasta e fagioli · Spanakopita
  [135, 75],  // Pasta alla Norma · Harira
]);

// Fixed "today" for the week label: Monday 25 May 2026, noon UTC (noon so no
// timezone can push it to another calendar day).
export const FIXTURE_DATE = new Date(Date.UTC(2026, 4, 25, 12, 0, 0));

// ── Read the label tables out of app.js ────────────────────────────────────
function extractObjectLiteral(src, decl) {
  const at = src.indexOf(decl);
  if (at < 0) throw new Error(`fixture-plan: "${decl}" not found in public/js/app.js`);
  const open = src.indexOf('{', at);
  let depth = 0, quote = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) {
      // Pure data literal (strings / arrays / nested objects) — evaluate it in
      // an empty scope.
      return new Function(`"use strict"; return (${src.slice(open, i + 1)});`)();
    }
  }
  throw new Error(`fixture-plan: unbalanced literal for "${decl}"`);
}

const APP_SRC = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf8');
export const PDF_LABELS = extractObjectLiteral(APP_SRC, 'const PDF_LABELS = {');
const WEEK_OF = extractObjectLiteral(APP_SRC, 'const WEEK_OF = {');
const LOCALE_MAP = extractObjectLiteral(APP_SRC, 'const localeMap = {');
const DAY_ABBREV = extractObjectLiteral(APP_SRC, 'const DAY_ABBREV = {');

// ── Helpers mirroring buildPdfV2Payload() ──────────────────────────────────
const byId = new Map(recipes.map(r => [r.id, r]));

export function fixtureRecipe(id) {
  const r = byId.get(id);
  if (!r) throw new Error(`fixture-plan: recipe id ${id} not found in recipes.js`);
  const meta = recipesMeta[id] || {};
  return { ...r, time: meta.time ?? r.time, costRon: meta.costRon ?? r.costRon };
}

function shortIngredients(rawList) {
  const seen = new Set();
  const out = [];
  for (const raw of rawList) {
    const p = parseIngredient(raw);
    if (!p || !p.name) continue;
    const key = p.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p.name.charAt(0).toUpperCase() + p.name.slice(1));
  }
  return out;
}

function fmtCost(lang, ron) {
  if (!ron) return null;
  return lang === 'ro' ? `~${Math.round(ron)} RON` : `~€${Math.round(ron / 4.97)}`;
}

function mealPayload(lang, r) {
  const rawIngr = r.ingredients?.[lang] || r.ingredients?.en || r.ingredients?.ro || [];
  return {
    name: r.name?.[lang] || r.name?.en || r.name?.ro,
    time: r.time || null,
    servings: r.servings || null,
    cost: r.costRon ? fmtCost(lang, r.costRon) : null,
    ingredients: shortIngredients(rawIngr),
    ingredientsFull: rawIngr.map(s => String(s).trim()).filter(Boolean),
  };
}

/** Expected localized recipe names, in menu order (for text assertions). */
export function fixtureRecipeNames(lang, { days = 7 } = {}) {
  return FIXTURE_MENU.slice(0, days).flat().map(id => {
    const r = fixtureRecipe(id);
    return r.name?.[lang] || r.name?.en || r.name?.ro;
  });
}

/**
 * Build the deterministic plan payload for `lang`.
 * @param {string} lang one of PDF_LOCALES
 * @param {{ days?: number }} [opts] number of menu days (1..7), default 7
 */
export function buildFixturePlan(lang, { days: nDays = 7 } = {}) {
  if (!PDF_LOCALES.includes(lang)) throw new Error(`fixture-plan: unsupported locale "${lang}"`);
  const lcStrings = i18n[lang] || i18n.en || {};
  const fullDays = Array.isArray(lcStrings.weekdays) && lcStrings.weekdays.length === 7
    ? lcStrings.weekdays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const localizedDays = DAY_ABBREV[lang] || fullDays.map(s => String(s || '').trim().slice(0, 3));

  const menu = FIXTURE_MENU.slice(0, nDays);
  let weekCostRon = 0;
  const days = menu.map(([lunchId, dinnerId], i) => {
    const lunch = fixtureRecipe(lunchId), dinner = fixtureRecipe(dinnerId);
    const dayRon = (lunch.costRon || 0) + (dinner.costRon || 0);
    weekCostRon += dayRon;
    return {
      day: localizedDays[i] || `Day ${i + 1}`,
      lunch: mealPayload(lang, lunch),
      dinner: mealPayload(lang, dinner),
      costLabel: fmtCost(lang, dayRon),
    };
  });

  const ingredientPairs = [];
  menu.flat().forEach(id => {
    const r = fixtureRecipe(id);
    const enArr = r.ingredients?.en || r.ingredients?.ro || [];
    const locArr = r.ingredients?.[lang] || enArr;
    enArr.forEach((en, i) => ingredientPairs.push({ en, loc: locArr[i] != null ? locArr[i] : en }));
  });
  const shoppingGroups = buildShoppingFromRawIngredients(ingredientPairs, lang);

  const dateStr = FIXTURE_DATE.toLocaleDateString(LOCALE_MAP[lang] || 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const L = PDF_LABELS[lang] || PDF_LABELS.en;
  const labels = {
    sectionPlan: L.sectionPlan,
    weekAtGlance: L.weekAtGlance,
    dayByDay: L.dayByDay,
    sectionShop: lcStrings.shoppingList || 'Shopping list',
    lunch: L.lunch,
    dinner: L.dinner,
    ingredients: lcStrings['col.ingredients'] ? lcStrings['col.ingredients'].toUpperCase() : 'INGREDIENTS',
    stats: L.stats,
    mealsSuffix: L.mealsSuffix,
    minTotal: L.minTotal,
    moreSuffix: L.moreSuffix,
    tipLabel: L.tipLabel,
    tipText: L.tipText,
    pageOf: L.pageOf,
    servingsWord: L.servingsWord,
  };

  return {
    lang,
    title: lcStrings.title || 'Weekly Meal Plan',
    weekLabel: `${WEEK_OF[lang] || WEEK_OF.en} ${dateStr}`,
    days,
    weekCost: fmtCost(lang, weekCostRon),
    shoppingGroups,
    labels,
    locked: null,
  };
}
