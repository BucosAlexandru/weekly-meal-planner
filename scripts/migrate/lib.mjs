// Phase 2.5B/D — ingredient-suggestion core (READ-ONLY; never writes taxonomy).
//
// Turns an English ingredient LINE ("500 g chicken breast, diced") into a
// concept SUGGESTION against the known canonical registry, favouring PRECISION
// over coverage: it would rather say "review_required" than guess.
//
// Matching model (token-set, not substring — so plurals/word-order/prep don't
// fool it, and a base word inside a DERIVED product name doesn't false-match):
//   1. normalize the line → core tokens (drop quantities, units, prep, parens)
//   2. an alias matches iff ALL its stemmed tokens ⊆ the core's stemmed tokens
//   3. DERIVED-PRODUCT GUARD: if the core carries a derived token
//      (stock/broth/bouillon/vinegar/paste/concentrate) that is NOT part of the
//      matched alias itself, that match is suppressed — "chicken stock" must
//      never resolve to `chicken`, "rice vinegar" never to `rice`,
//      "tomato paste" never to `tomato`. ("miso paste" DOES resolve to `miso`
//      because 'paste' is in the miso alias.)
//
// Known concepts = the 69 canonical registry concepts + supplementary concepts
// from the budget dictionary `I` (recipes-budget.js) that the registry doesn't
// already cover — "reuse budget I wherever applicable". Overlaps are skipped so
// potato/potatoes don't look like two concepts.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INGREDIENTS, ALIAS_LOCALES } from '../taxonomy/ingredients.mjs';
import { NEW_CONCEPTS, ALIAS_GAPS, BUDGET_PROMOTE } from '../taxonomy/concept-rules.mjs';
import { pwNorm } from '../../public/js/recipe-search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── stemming + tokenizing ────────────────────────────────────────────────────
// Crude English stem: lowercase (via pwNorm, also strips diacritics) then drop
// a trailing plural 's' (but keep 'ss'). Good enough to align lemons↔lemon,
// tomatoes↔tomato, eggs↔egg without a real stemmer.
function stem(tok) {
  const t = pwNorm(tok);
  // Strip only a trailing plural 's' (keep 'ss'). NOT '-es' → that mangles
  // words whose singular ends in 'e' (limes→lim, olives→oliv). Irregular
  // '-es' plurals (tomatoes/potatoes) already carry explicit plural aliases in
  // the registry, and stemming is applied identically to alias + core, so
  // matched forms line up regardless.
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}

// Filler words to ignore when comparing token sets (descriptors, prep, sizes).
const FILLER = new Set([
  'of','the','a','an','and','or','for','to','plus','extra','about','approx','approximately',
  'fresh','freshly','ripe','large','small','medium','big','thin','thinly','thick','finely','roughly',
  'chopped','diced','sliced','minced','grated','peeled','deseeded','seeded','crushed','ground','whole',
  'good','quality','best','fine','coarse','sea','table','room','temperature','cold','warm','hot','ice',
  'boneless','skinless','skin','removed','bone','in','on','cut','into','pieces','piece','cubes','cube',
  'taste','serve','serving','garnish','optional','dry','dried','canned','tin','tinned','frozen','raw',
  'good-quality','light','dark','strong','sweet','unsalted','salted','melted','softened','beaten',
  'wedges','wedge','stalk','stalks','sprig','sprigs','clove','cloves','head','heads','handful','stick','sticks',
  'needed','required','desired','preference','choice','leftover','leftovers','store-bought','homemade',
]);

// Quantity/unit prefix tokens stripped up front.
const UNIT_RE = /\b(g|kg|mg|ml|l|litre|litres|liter|liters|oz|lb|lbs|cup|cups|tbsp|tbsp\.|tsp|tsp\.|tablespoon|tablespoons|teaspoon|teaspoons|pinch|pinches|dash|can|cans|packet|packets|slice|slices|bunch|bunches|x|cm)\b/gi;

export function normalizeEn(line) {
  let s = ' ' + String(line || '').toLowerCase() + ' ';
  s = s.replace(/\([^)]*\)/g, ' ');       // drop parentheticals
  s = s.replace(/[½¼¾⅓⅔⅛]/g, ' ');        // vulgar fractions
  s = s.replace(/[0-9]+([.,/][0-9]+)?/g, ' '); // numbers
  s = s.replace(/[–—\-]/g, ' ');          // dashes/ranges
  s = s.replace(UNIT_RE, ' ');
  // Prep usually follows the first comma: keep the head phrase.
  s = s.split(',')[0];
  s = s.replace(/[^a-zÀ-ɏ\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  const rawTokens = s.split(' ').filter(Boolean);
  const coreTokens = rawTokens.filter(t => !FILLER.has(t));
  const stems = new Set(coreTokens.map(stem));
  return { core: coreTokens.join(' '), coreTokens, stems, allStems: new Set(rawTokens.map(stem)) };
}

// ── budget dictionary I loader (best-effort, side-effect-free) ───────────────
export function loadBudgetDict() {
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'js', 'recipes-budget.js'), 'utf8');
    const start = src.indexOf('const I = {');
    if (start < 0) return {};
    // Find the matching closing brace of the object literal.
    let i = src.indexOf('{', start), depth = 0, end = -1;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end < 0) return {};
    const objText = src.slice(src.indexOf('{', start), end + 1);
    // eslint-disable-next-line no-new-func
    const I = Function('"use strict";return (' + objText + ')')();
    return I && typeof I === 'object' ? I : {};
  } catch { return {}; }
}

// ── known-concept index ──────────────────────────────────────────────────────
// Each alias → { tokens(Set of stems), words(count), conceptId, source }.
// concepts: id -> { source: 'registry'|'budget'|'new', all: {lc:[...]} }.
// Final ids are clean (budget camelCase promoted to snake_case).
export function buildKnown() {
  const aliasIndex = [];
  const concepts = new Map();

  const sigs = new Set(); // stem-signatures already claimed (for semantic dedup)
  const sigOf = stems => [...stems].sort().join(' ');
  const stemsOf = phrase => new Set(pwNorm(phrase).split(/\s+/).filter(Boolean).filter(t => !FILLER.has(t)).map(stem));
  const addAlias = (conceptId, phrase) => {
    const stems = stemsOf(phrase);
    if (stems.size === 0) return;
    aliasIndex.push({ tokens: stems, words: stems.size, conceptId, source: concepts.get(conceptId)?.source || 'new' });
    sigs.add(sigOf(stems));
  };

  // 1) canonical registry (source of truth — VALIDATED 14-locale)
  for (const [id, aliases] of Object.entries(INGREDIENTS)) {
    concepts.set(id, { source: 'registry', all: aliases });
    for (const a of aliases.en) addAlias(id, a);
  }

  // 2) budget I supplementary (VALIDATED 14-locale), promoted to clean ids.
  // Skip over-generic/trivial catch-alls and anything already a registry/new id.
  const BUDGET_EXCLUDE = new Set(['oil', 'salt', 'water', 'sugar', 'vinegar']);
  const I = loadBudgetDict();
  for (const [key, val] of Object.entries(I)) {
    if (!val || !val.en || BUDGET_EXCLUDE.has(key)) continue;
    const id = BUDGET_PROMOTE[key] || key;
    if (concepts.has(id)) continue; // registry/new wins (already claimed this id)
    if (sigs.has(sigOf(stemsOf(val.en)))) continue; // semantic dup of a registry concept (tomatoes↔tomato, bellPepper↔bell_pepper)
    const all = {};
    for (const lc of ALIAS_LOCALES) if (val[lc]) all[lc] = [val[lc]];
    concepts.set(id, { source: 'budget', all });
    addAlias(id, val.en);
  }

  // 3) new Phase-3A concepts (EN aliases VALIDATED; other locales filled later
  // by extraction). Skip any id already provided by registry/budget.
  for (const [id, enAliases] of Object.entries(NEW_CONCEPTS)) {
    if (concepts.has(id)) { for (const a of enAliases) addAlias(id, a); continue; }
    concepts.set(id, { source: 'new', all: { en: enAliases.slice() } });
    for (const a of enAliases) addAlias(id, a);
  }

  // 4) existing-concept EN alias gaps (chillies→chili, aubergine→eggplant, …).
  for (const [id, extra] of Object.entries(ALIAS_GAPS)) {
    if (!concepts.has(id)) continue; // id must exist as a concept
    for (const a of extra) addAlias(id, a);
    const all = concepts.get(id).all;
    all.en = [...new Set([...(all.en || []), ...extra])];
  }

  aliasIndex.sort((a, b) => b.words - a.words); // longest (most specific) first
  return { aliasIndex, concepts };
}

// ── derived-product guard + trivial detection ────────────────────────────────
const DERIVED = new Set(['stock', 'broth', 'bouillon', 'vinegar', 'paste', 'concentrate']);
const TRIVIAL_RE = /\b(salt|water|sugar|black pepper|white pepper|pepper|baking powder|baking soda|bicarbonate|yeast|vanilla|ice|vegetable oil|cooking oil|neutral oil|sunflower oil|frying)\b/;

const subset = (small, big) => [...small].every(t => big.has(t));

// ── the suggestion ───────────────────────────────────────────────────────────
export function suggestLine(recipeId, line, known) {
  const norm = normalizeEn(line);
  const base = { recipeId, ingredient: line, normalized: norm.core };
  if (norm.stems.size === 0) {
    return { ...base, suggestedIds: [], sources: [], confidence: 'low', status: 'review_required', note: 'empty after normalization' };
  }

  // collect alias matches whose tokens ⊆ core stems
  let raw = known.aliasIndex.filter(a => subset(a.tokens, norm.stems));

  // subsumption pruning: drop a match whose token-set is a STRICT subset of
  // another (different-concept) match's token-set — the more specific alias
  // wins ("sesame oil" keeps `sesame_oil`, drops a generic `oil`).
  const strictSubset = (s, big) => s.size < big.size && [...s].every(t => big.has(t));
  raw = raw.filter(a => !raw.some(b => b.conceptId !== a.conceptId && strictSubset(a.tokens, b.tokens)));

  // derived-product guard: a derived token in the core that is NOT in the alias
  // suppresses that match.
  const derivedInCore = [...norm.stems].filter(t => DERIVED.has(t));
  const kept = raw.filter(a => derivedInCore.every(d => a.tokens.has(d)));
  const suppressed = raw.filter(a => !kept.includes(a));

  const ids = [...new Set(kept.map(a => a.conceptId))];

  if (ids.length === 1) {
    return { ...base, suggestedIds: ids, sources: [known.concepts.get(ids[0]).source], confidence: 'high', status: 'matched' };
  }
  if (ids.length >= 2) {
    return { ...base, suggestedIds: ids, sources: ids.map(id => known.concepts.get(id).source), confidence: 'low', status: 'ambiguous',
      note: 'multiple concepts matched' };
  }
  // nothing kept
  if (derivedInCore.length && suppressed.length) {
    return { ...base, suggestedIds: [], sources: [], confidence: 'low', status: 'review_required',
      note: `derived product (${derivedInCore.join('/')}) — base concept ${[...new Set(suppressed.map(a => a.conceptId))].join(',')} suppressed` };
  }
  if (TRIVIAL_RE.test(norm.core)) {
    return { ...base, suggestedIds: [], sources: [], confidence: 'high', status: 'trivial', note: 'ubiquitous seasoning/liquid — intentionally not a concept' };
  }
  return { ...base, suggestedIds: [], sources: [], confidence: 'low', status: 'new_concept' };
}

// ── Part D: candidate multilingual alias extraction ──────────────────────────
// For an ingredient line at `index` in `recipe`, pull the aligned line in every
// locale and strip quantities/units → a CANDIDATE alias. NEVER validated:
// caller marks these manual-review. Uses the fact that ingredient arrays are
// index-aligned across all 14 locales (verified: 0 mismatches over 225 recipes).
const LEAD_QTY_RE = /^[\s0-9¼½¾⅓⅔⅛.,/×x–—\-]*/;
export function extractCandidateAliases(recipe, index) {
  const out = {};
  for (const lc of ALIAS_LOCALES) {
    const line = recipe.ingredients?.[lc]?.[index];
    if (typeof line !== 'string' || !line) { out[lc] = { candidate: '', tier: 'manual-review', reason: 'missing line' }; continue; }
    let s = line.replace(/\([^)]*\)/g, ' ');
    s = s.replace(LEAD_QTY_RE, '');                 // strip leading quantity block
    s = s.replace(/\b(g|kg|ml|l|tbsp|tsp|cup|cups|oz|lb|cm)\b/gi, ' ');
    s = s.split(/[,;]/)[0].replace(/\s+/g, ' ').trim();
    // English we can also stem-check; for other locales it is a raw candidate.
    const tier = lc === 'en' ? 'candidate' : (s ? 'candidate' : 'manual-review');
    out[lc] = { candidate: s, tier, reason: s ? '' : 'empty after strip' };
  }
  return out;
}
