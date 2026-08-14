/* recipe-search.js — the ONE search algorithm for the Recipe Explorer.
 *
 * Standalone ESM, zero dependencies, runs in the browser (lazy-loaded on the
 * Explorer page only) AND in Node (build-time tests). It is a faithful
 * extraction of the planner's proven search in public/js/app.js
 * (`pwNorm` + `pwSearchRecipes`, §3): 3 tiers — name-startsWith > name-contains
 * > ingredient/attribute-contains — each sorted by cooking time ascending.
 *
 * Phase 3 TODO: refactor app.js to import `pwNorm` from here so there is
 * literally one implementation. For now the byte-for-byte identical `pwNorm`
 * regex below is the same one app.js uses, so behavior cannot diverge silently.
 *
 * Operates on a pre-built per-locale index entry (see build-search-index.mjs):
 *   { id, name, hayName, phrases[], cuisine, meal, time, tags }
 *   hayName  : pwNorm(recipe name)      → tiers 0/1 (startsWith / substring)
 *   phrases  : pwNorm'd alias PHRASES    → tier 2 (phrase-PREFIX match)
 *              one per ingredient-concept alias + origin + meal label.
 *
 * Tier 2 uses phrase-PREFIX (phrase.startsWith(query)), NOT flat substring, so
 * ingredient search is concept-precise: "milk" matches the `milk` phrase but
 * not the `coconut milk` phrase, and "rice" matches `rice` but not a `vinegar`
 * concept (rice vinegar is tagged `vinegar`, whose alias is just "vinegar").
 * This is the precision the canonical taxonomy exists to provide; names stay
 * substring so "carbonara" still matches "spaghetti carbonara".
 */

// Diacritic-insensitive normalization (app.js §3): NFD + strip combining marks
// covers ș/ț/ă/ö/ç/é/ñ…; non-Latin scripts (ru/ar/zh/ja/hi/ko) pass through
// unchanged, so the plain includes() path still matches them.
export function pwNorm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Structured filters applied BEFORE free-text ranking. A missing filter is
// ignored. `maxTime` keeps entries with a known time <= maxTime (unknown time
// is excluded from a time filter, matching selectByTimeMax in discovery-config).
function passesFilters(entry, { cuisine, meal, maxTime } = {}) {
  if (cuisine && entry.cuisine !== cuisine) return false;
  if (meal && entry.meal !== meal) return false;
  if (maxTime != null) {
    if (typeof entry.time !== 'number' || entry.time > maxTime) return false;
  }
  return true;
}

const byTime = (a, b) => (a.time ?? 9999) - (b.time ?? 9999);

/**
 * Search + filter a per-locale index.
 * @param {{recipes: Array}} index  parsed recipe-search-index.<lc>.json
 * @param {string} query            raw user text (may be empty → filter-only)
 * @param {{cuisine?:string, meal?:string, maxTime?:number, limit?:number}} opts
 * @returns {Array} matching entries, ranked
 */
export function searchRecipes(index, query, opts = {}) {
  const entries = Array.isArray(index?.recipes) ? index.recipes : [];
  const filtered = entries.filter(e => passesFilters(e, opts));
  const nq = pwNorm(query);
  const limit = opts.limit ?? 50;

  // Empty query → pure filter result, time ascending (matches planner "pool").
  if (!nq) return filtered.slice().sort(byTime).slice(0, limit);

  const tiers = [[], [], []];
  for (const e of filtered) {
    if (e.hayName && e.hayName.startsWith(nq)) { tiers[0].push(e); continue; }
    if (e.hayName && e.hayName.includes(nq))   { tiers[1].push(e); continue; }
    if (Array.isArray(e.phrases) && e.phrases.some(p => p.startsWith(nq))) { tiers[2].push(e); }
  }
  tiers.forEach(t => t.sort(byTime));
  return tiers[0].concat(tiers[1], tiers[2]).slice(0, limit);
}
