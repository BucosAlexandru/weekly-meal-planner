/* recipe-ref.js — cart/favorites entry identity + resolution (Phase 2E).
 *
 * Standalone ESM, zero dependencies (browser + Node). Prototypes the migration
 * from the current English-name join key to a canonical `recipeId`, WITHOUT
 * invalidating any existing localStorage.
 *
 * Stored entry shape (superset — every field optional except one identity):
 *   { recipeId, en, display }
 *     recipeId : canonical primary identity (int for main recipes, e.g. 1;
 *                string 'budget_001' for budget). NEW — may be absent on
 *                entries written before the migration.
 *     en       : legacy English-name key. Kept forever as a fallback so old
 *                carts/favorites keep resolving.
 *     display  : active-locale presentation string (never a key).
 *
 * Back-compat contract:
 *   - Legacy entries { en, display } (no recipeId) still read + resolve.
 *   - New entries resolve by recipeId even if the display name changed.
 *   - Reading tolerates junk/partial entries (returns null, caller skips).
 *
 * These helpers are pure. Wiring them into plan-cart.js (writer) and app.js
 * (reader) is a Phase 3 step — plan-cart.js would emit recipeId once
 * generate-content.mjs adds `data-recipe-id` to the add button.
 */

// Normalize any stored value into a canonical entry or null. Accepts both the
// legacy 2-field and new 3-field shapes; requires at least one usable identity.
export function normalizeRef(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  if (raw.recipeId != null && raw.recipeId !== '') out.recipeId = raw.recipeId;
  if (typeof raw.en === 'string' && raw.en) out.en = raw.en;
  if (typeof raw.display === 'string' && raw.display) out.display = raw.display;
  // Must be identifiable by SOMETHING: a recipeId or a legacy en name.
  if (out.recipeId == null && !out.en) return null;
  return out;
}

// Build a fresh (new-shape) entry from a resolved recipe + active locale.
// `en` is always included so the entry stays readable by pre-migration code
// paths and older app versions.
export function makeRef(recipe, lang) {
  if (!recipe) return null;
  const en = recipe.name?.en || recipe.name?.ro || '';
  const display = recipe.name?.[lang] || en;
  const ref = { en, display };
  if (recipe.id != null) ref.recipeId = recipe.id;
  return ref;
}

// Resolve a stored entry to a recipe.
//   1. recipeId (exact) — the canonical path.
//   2. en-name (case-insensitive against EVERY name locale) — legacy fallback,
//      identical resolution to app.js consumePlanCart / favorites picker, so a
//      hand-edited or localized value still resolves.
// `byId` is a Map(recipeId -> recipe); `all` is the recipe array for the
// name-scan fallback.
export function resolveRef(entry, byId, all) {
  const ref = normalizeRef(entry);
  if (!ref) return null;
  if (ref.recipeId != null && byId && byId.has(ref.recipeId)) {
    return byId.get(ref.recipeId);
  }
  if (ref.en && Array.isArray(all)) {
    const key = ref.en.toLowerCase();
    return all.find(r =>
      Object.values(r.name || {}).some(n => typeof n === 'string' && n.toLowerCase() === key)
    ) || null;
  }
  return null;
}

// Migration primitive: upgrade a stored entry to the new 3-field shape.
//   - resolvable  → { recipeId, en, display } rebuilt from the live recipe
//                   (canonical recipeId attached, display refreshed to `lang`).
//   - unresolvable→ the normalized legacy entry is returned UNCHANGED, so an
//                   old { en, display } that no longer maps to any recipe still
//                   survives in storage (never silently dropped). Returns null
//                   only for structurally unusable input.
// This is what a reader (app.js) would run over an existing cart/favorites list
// on load to migrate it in place without invalidating anything.
export function upgradeRef(entry, byId, all, lang) {
  const ref = normalizeRef(entry);
  if (!ref) return null;
  const rec = resolveRef(ref, byId, all);
  if (!rec) return ref; // keep legacy entry intact
  return makeRef(rec, lang);
}

// Dedupe a list of entries, preferring recipeId identity and falling back to
// lowercased en. Keeps first occurrence. Mirrors the cart's case-insensitive
// dedupe so migrating an existing cart never creates phantom duplicates.
export function dedupeRefs(entries) {
  const seen = new Set();
  const out = [];
  for (const raw of entries || []) {
    const ref = normalizeRef(raw);
    if (!ref) continue;
    const key = ref.recipeId != null ? `id:${ref.recipeId}` : `en:${ref.en.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}
