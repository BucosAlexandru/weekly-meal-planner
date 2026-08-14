// Phase 3A — full taxonomy generation for all 225 MAIN recipes.
//   node scripts/migrate/build-taxonomy.mjs
//
// READ-ONLY over recipes.js. Produces, in memory (and as JSON artifacts):
//   • ingredient registry  : conceptId → per-locale aliases + quality tier
//   • recipe taxonomy      : id → { cuisineId, mealType, ingredientIds[] }
//   • review queue         : grouped unresolved/high-risk items
//
// Quality tiers (per the phase's alias policy):
//   VALIDATED       — Phase-2 registry + budget-I (hand-checked 14-locale) + my
//                     hand-authored EN aliases for new concepts.
//   CANDIDATE       — machine-extracted from the aligned 14-locale ingredient
//                     arrays, structurally clean.
//   REVIEW_REQUIRED — extraction unclean/uncertain → NOT put in the index,
//                     surfaced in the review queue. Never fabricated.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { recipes } from '../../public/js/recipes.js';
import { recipesMeta } from '../../public/js/recipes-meta.js';
import { PILOT } from '../taxonomy/pilot.mjs';
import { cuisineIdForOrigin } from '../taxonomy/cuisines.mjs';
import { MEAL_TYPE_SET } from '../taxonomy/meal-types.mjs';
import { ALIAS_LOCALES } from '../taxonomy/ingredients.mjs';
import { DESCRIPTORS, CLEANUP_MERGE, CLEANUP_DROP } from '../taxonomy/concept-rules.mjs';
import { buildKnown, suggestLine, normalizeEn, extractCandidateAliases } from './lib.mjs';
import { pwNorm } from '../../public/js/recipe-search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// category.en → mealType (dish-type categories fall to their usual slot).
const CATEGORY_TO_MEALTYPE = {
  Breakfast: 'breakfast', Lunch: 'lunch', Dinner: 'dinner', Snack: 'snack',
  Dessert: 'dessert', Salad: 'side', Appetizer: 'appetizer', 'Side dish': 'side',
  Soup: 'lunch', Curry: 'dinner', Pasta: 'dinner', Pizza: 'dinner', Fish: 'dinner',
  Main: 'dinner', 'Noodle soup': 'lunch',
};

const IRREGULAR = { leaves: 'leaf', berries: 'berry', strawberries: 'strawberry', radishes: 'radish',
  mangoes: 'mango', molasses: 'molasses', potatoes: 'potato', tomatoes: 'tomato', loaves: 'loaf' };
const singular = t => IRREGULAR[t] || (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);

// Structural / too-generic single-word ids that must never become a concept
// (they leak from "for the sauce", "as needed", "leftover meat", …).
const ID_REJECT = new Set(['sauce', 'oil', 'paste', 'broth', 'stock', 'filling', 'dough', 'batter',
  'topping', 'garnish', 'marinade', 'dressing', 'seasoning', 'spice', 'mix', 'meat', 'fat', 'base',
  'water', 'ice', 'needed', 'fries', 'frie', 'piece', 'part']);

// Auto-derive a concept id from a new_concept line: strip descriptors, keep the
// 1–2 head nouns. Return null (→ review) if the result is messy/too generic.
function autoDeriveId(norm) {
  const toks = norm.coreTokens
    .map(pwNorm)
    .filter(t => /^[a-zà-ÿ]+$/i.test(t) && t.length >= 3 && !DESCRIPTORS.has(t));
  if (toks.length === 0 || toks.length > 2) return null;
  let id = toks.map(singular).join('_');
  if (CLEANUP_DROP.has(id)) return null;      // structural junk → unassigned/review
  id = CLEANUP_MERGE[id] || id;               // 3B.0 merge/rename to canonical
  if (ID_REJECT.has(id)) return null;
  return id;
}

function candidateClean(text) {
  if (!text) return false;
  if (/\d/.test(text)) return false;                 // leftover quantity (also catches CJK 小さじ1)
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 5 && text.length <= 40;
}

export function buildTaxonomy() {
  const known = buildKnown();
  const registry = new Map();          // id → { source, aliases: {lc: {text, tier}} }
  const occurrences = new Map();       // id → [{recipeId, index}]  (for extraction)
  const taxonomy = {};                 // recipeId → { cuisineId, mealType, ingredientIds }
  const review = [];                   // raw review rows (grouped later)

  // seed registry with the VALIDATED known concepts (registry + budget + new EN)
  for (const [id, c] of known.concepts) {
    const aliases = {};
    for (const lc of ALIAS_LOCALES) {
      const arr = c.all?.[lc];
      if (Array.isArray(arr) && arr.length) aliases[lc] = { text: arr, tier: 'VALIDATED' };
    }
    registry.set(id, { source: c.source, aliases });
  }
  const noteOccurrence = (id, recipeId, index) => {
    if (!occurrences.has(id)) occurrences.set(id, []);
    occurrences.get(id).push({ recipeId, index });
  };

  // ── per-recipe pass ─────────────────────────────────────────────────────
  for (const r of recipes) {
    const cuisineId = cuisineIdForOrigin(r.origin?.en);
    const mealType = PILOT[r.id]?.mealType || CATEGORY_TO_MEALTYPE[r.category?.en] || 'dinner';

    // Pilot recipes: use the hand-curated ingredientIds as the FOUNDATION
    // (all reference VALIDATED registry concepts — no extraction needed).
    if (PILOT[r.id]) {
      taxonomy[r.id] = { cuisineId, mealType, ingredientIds: PILOT[r.id].ingredientIds.slice() };
      continue;
    }

    const ids = new Set();
    const lines = r.ingredients?.en || [];

    lines.forEach((line, index) => {
      const sug = suggestLine(r.id, line, known);
      if (sug.status === 'trivial') return;
      if (sug.status === 'matched' || sug.status === 'ambiguous') {
        for (const id of sug.suggestedIds) { ids.add(id); noteOccurrence(id, r.id, index); }
        return;
      }
      if (sug.status === 'new_concept') {
        const id = autoDeriveId(normalizeEn(line));
        if (id) {
          ids.add(id);
          noteOccurrence(id, r.id, index);
          if (!registry.has(id)) registry.set(id, { source: 'auto', aliases: { en: { text: [id.replace(/_/g, ' ')], tier: 'CANDIDATE' } } });
        } else {
          review.push({ recipeId: r.id, index, line, reason: 'unresolved_line', note: sug.note || '' });
        }
        return;
      }
      // review_required (derived product with no concept, empty, etc.)
      review.push({ recipeId: r.id, index, line, reason: sug.status, note: sug.note || '' });
    });

    taxonomy[r.id] = { cuisineId, mealType, ingredientIds: [...ids] };
  }

  // ── extraction pass: fill missing locales for non-fully-validated concepts ─
  for (const [id, occ] of occurrences) {
    const entry = registry.get(id);
    if (!entry) continue;
    for (const lc of ALIAS_LOCALES) {
      if (entry.aliases[lc]) continue; // already validated
      // gather clean candidates across all occurrences, choose the shortest
      const cands = [];
      for (const { recipeId, index } of occ) {
        const rec = recipes.find(r => r.id === recipeId);
        const ex = extractCandidateAliases(rec, index)[lc];
        if (ex && candidateClean(ex.candidate)) cands.push(ex.candidate.trim());
      }
      if (cands.length) {
        cands.sort((a, b) => a.length - b.length);
        entry.aliases[lc] = { text: [cands[0]], tier: 'CANDIDATE' };
      } else {
        // no trustworthy alias in this locale → REVIEW, excluded from index
        entry.aliases[lc] = { text: [], tier: 'REVIEW_REQUIRED' };
        review.push({ conceptId: id, locale: lc, sourceRecipeIds: occ.slice(0, 6).map(o => o.recipeId),
          sourceLines: occ.slice(0, 3).map(o => (recipes.find(r => r.id === o.recipeId)?.ingredients?.[lc]?.[o.index]) || ''),
          candidateAlias: '', reason: 'no_clean_alias_extracted' });
      }
    }
  }

  return { registry, taxonomy, review, known };
}

// ── group review rows by concept (review a concept once, not per-recipe) ─────
function groupReview(review) {
  const byConcept = new Map();
  const looseLines = [];
  for (const row of review) {
    if (row.conceptId) {
      const key = row.conceptId + '|' + row.locale;
      if (!byConcept.has(key)) byConcept.set(key, { conceptId: row.conceptId, locale: row.locale, sourceRecipeIds: new Set(), sourceLines: new Set(), reason: row.reason });
      const g = byConcept.get(key);
      (row.sourceRecipeIds || []).forEach(x => g.sourceRecipeIds.add(x));
      (row.sourceLines || []).forEach(x => x && g.sourceLines.add(x));
    } else {
      looseLines.push(row);
    }
  }
  const grouped = [...byConcept.values()].map(g => ({
    conceptId: g.conceptId, locale: g.locale,
    sourceRecipeIds: [...g.sourceRecipeIds].slice(0, 12),
    sourceLines: [...g.sourceLines].slice(0, 3),
    candidateAlias: '', reason: g.reason,
  }));
  return { grouped, looseLines };
}

// ── CLI: write artifacts + summary ───────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { registry, taxonomy, review } = buildTaxonomy();
  const outDir = path.join(__dirname, '..', 'taxonomy', 'generated');
  const scratch = path.join(__dirname, '..', '..', 'scratch_phase2');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(scratch, { recursive: true });

  // registry JSON
  const regObj = {};
  for (const [id, e] of registry) regObj[id] = e;
  fs.writeFileSync(path.join(outDir, 'ingredient-registry.json'), JSON.stringify(regObj, null, 1));
  fs.writeFileSync(path.join(outDir, 'recipe-taxonomy.json'), JSON.stringify(taxonomy, null, 1));

  const { grouped, looseLines } = groupReview(review);
  fs.writeFileSync(path.join(scratch, 'phase3a-review-queue.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), unresolvedConceptLocaleCells: grouped.length, unresolvedLines: looseLines.length, concepts: grouped, lines: looseLines.slice(0, 200) }, null, 1));

  // stats
  const bySource = {};
  for (const [, e] of registry) bySource[e.source] = (bySource[e.source] || 0) + 1;
  const recipesWithIds = Object.values(taxonomy).filter(t => t.ingredientIds.length > 0).length;
  const emptyRecipes = Object.entries(taxonomy).filter(([, t]) => t.ingredientIds.length === 0).map(([id]) => id);

  console.log('=== Phase 3A taxonomy build ===');
  console.log('concepts total:', registry.size, ' by source:', JSON.stringify(bySource));
  console.log('recipes taxonomized:', Object.keys(taxonomy).length, ' with ≥1 ingredientId:', recipesWithIds);
  if (emptyRecipes.length) console.log('  recipes with 0 ingredientIds (need attention):', emptyRecipes.join(','));
  console.log('review queue: concept-locale cells =', grouped.length, ' loose lines =', looseLines.length);
  console.log('artifacts: scripts/taxonomy/generated/{ingredient-registry,recipe-taxonomy}.json, scratch_phase2/phase3a-review-queue.json');
}
