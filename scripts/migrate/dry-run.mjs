// Phase 2.5C/D/F — DRY RUN over the 205 non-pilot main recipes.
//   node scripts/migrate/dry-run.mjs
//
// READ-ONLY. Writes a machine-readable report to scratch_phase2/ (git-ignored
// scratch) and prints the summary the phase asks for. Does NOT write taxonomy.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { recipes } from '../../public/js/recipes.js';
import { PILOT_IDS } from '../taxonomy/pilot.mjs';
import { buildKnown, suggestLine, normalizeEn, extractCandidateAliases } from './lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', '..', 'scratch_phase2');
fs.mkdirSync(OUT, { recursive: true });

const known = buildKnown();
const pilot = new Set(PILOT_IDS);
const targets = recipes.filter(r => !pilot.has(r.id));

const headToken = core => { const t = core.split(' ').filter(Boolean); return t[t.length - 1] || ''; };

const lineRecords = [];
const perRecipe = [];
for (const r of targets) {
  const lines = r.ingredients?.en || [];
  const recs = lines.map((line, i) => ({ ...suggestLine(r.id, line, known), index: i }));
  lineRecords.push(...recs);
  const count = st => recs.filter(x => x.status === st).length;
  perRecipe.push({
    id: r.id, name: r.name?.en, lines: recs.length,
    matched: count('matched'), trivial: count('trivial'),
    ambiguous: count('ambiguous'), review: count('review_required'), new_concept: count('new_concept'),
  });
}

// ── aggregate counts ─────────────────────────────────────────────────────────
const byStatus = {};
for (const x of lineRecords) byStatus[x.status] = (byStatus[x.status] || 0) + 1;
const total = lineRecords.length;

const conceptUse = {};   // matched concept id -> count
for (const x of lineRecords) if (x.status === 'matched') for (const id of x.suggestedIds) conceptUse[id] = (conceptUse[id] || 0) + 1;

// probable new concepts: cluster new_concept lines by English head noun
const newHead = {};
for (const x of lineRecords) if (x.status === 'new_concept') {
  const h = headToken(normalizeEn(x.ingredient).core);
  if (!h) continue;
  (newHead[h] ||= { count: 0, samples: [] });
  newHead[h].count++;
  if (newHead[h].samples.length < 3) newHead[h].samples.push(x.ingredient);
}
const newConcepts = Object.entries(newHead).sort((a, b) => b[1].count - a[1].count);

// ── recipe-level classification (Part F) ─────────────────────────────────────
// auto     : every line matched or trivial (0 to review)
// partial  : 1–2 lines need attention AND ≤1 genuinely new concept
// substantial: everything else
let auto = 0, partial = 0, substantial = 0;
for (const p of perRecipe) {
  const needs = p.ambiguous + p.review + p.new_concept;
  if (needs === 0) auto++;
  else if (needs <= 2 && p.new_concept <= 1) partial++;
  else substantial++;
}

// ── Part D: candidate multilingual aliases for the top new concepts ──────────
// Extract from the aligned 14-locale ingredient arrays. NEVER auto-validated.
const aliasSamples = [];
for (const [head, info] of newConcepts.slice(0, 12)) {
  // find one representative line + its recipe/index to extract aligned locales
  const rec = lineRecords.find(x => x.status === 'new_concept' && headToken(normalizeEn(x.ingredient).core) === head);
  if (!rec) continue;
  const recipe = recipes.find(r => r.id === rec.recipeId);
  const cand = extractCandidateAliases(recipe, rec.index);
  aliasSamples.push({ headConcept: head, occurrences: info.count, fromRecipe: rec.recipeId, en: rec.ingredient, candidates: cand });
}

// ── write machine-readable report ────────────────────────────────────────────
const report = {
  generatedAt: new Date().toISOString(),
  scope: { recipes: targets.length, excludedPilot: PILOT_IDS.length, totalIngredientLines: total },
  statusCounts: byStatus,
  recipeClassification: { auto, partial, substantial },
  mostReusedConcepts: Object.entries(conceptUse).sort((a, b) => b[1] - a[1]).slice(0, 20),
  probableNewConcepts: newConcepts.map(([h, i]) => ({ head: h, count: i.count, samples: i.samples })),
  candidateAliasesForNewConcepts: aliasSamples,
  lineRecords,     // full per-line machine-readable records (matched/ambiguous/new_concept/review_required/trivial)
  perRecipe,
};
fs.writeFileSync(path.join(OUT, 'phase25-dry-run.json'), JSON.stringify(report, null, 2));

// ── console summary ──────────────────────────────────────────────────────────
const pct = n => ((n / total) * 100).toFixed(1) + '%';
console.log(`\n=== 2.5C — DRY RUN over ${targets.length} non-pilot recipes ===`);
console.log(`total ingredient lines: ${total}`);
for (const st of ['matched', 'trivial', 'ambiguous', 'review_required', 'new_concept']) {
  console.log(`  ${st.padEnd(16)} ${String(byStatus[st] || 0).padStart(4)}  (${pct(byStatus[st] || 0)})`);
}
const autoResolvable = (byStatus.matched || 0) + (byStatus.trivial || 0);
console.log(`\n  auto-resolvable lines (matched+trivial): ${autoResolvable}  (${pct(autoResolvable)})`);
console.log(`  needs human attention (ambiguous+review+new): ${total - autoResolvable}  (${pct(total - autoResolvable)})`);

console.log(`\n  Source of matches: ` +
  `registry=${lineRecords.filter(x => x.status==='matched' && x.sources.includes('registry')).length}, ` +
  `budget-I=${lineRecords.filter(x => x.status==='matched' && x.sources.every(s=>s==='budget')).length}`);

console.log(`\n=== 2.5F — recipe classification ===`);
console.log(`  auto-resolvable recipes (0 review):        ${auto}`);
console.log(`  partial-review recipes (≤2 issues, ≤1 new): ${partial}`);
console.log(`  substantial-review recipes:                ${substantial}`);

console.log(`\n  most-reused existing concepts (top 12):`);
for (const [id, n] of Object.entries(conceptUse).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`    ${String(n).padStart(3)}  ${id}`);

console.log(`\n  probable NEW concepts by head noun (top 15 of ${newConcepts.length}):`);
for (const [h, i] of newConcepts.slice(0, 15)) console.log(`    ${String(i.count).padStart(3)}  ${h.padEnd(16)} e.g. "${i.samples[0]}"`);
console.log(`\n  distinct probable-new-concept heads: ${newConcepts.length}`);

console.log(`\n  Report written: scratch_phase2/phase25-dry-run.json`);
