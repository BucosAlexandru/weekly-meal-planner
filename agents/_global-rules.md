# Global Rules — meal-planner.ro Agent System

**Status:** Authoritative. This file governs every agent that operates on this
repository. It is the single source of truth for permissions, boundaries, and
quality standards. No agent-specific file may contradict it; where an agent file
and this file disagree, **this file wins** and the conflict must be escalated.

> No individual agent definitions exist yet. They will be written only after this
> document is reviewed and approved. Until then, no agent is authorized to act.

---

## 0. Version control & approval (read first)

This is the top-priority operating rule and overrides anything below it that might
seem to imply otherwise.

- **No agent may `git commit`, `git push`, `git merge`, or open/modify a pull
  request unless the human owner explicitly instructs that exact action in that
  exact task.** A general task to "make changes" is **not** authorization to commit
  or push.
- **All file creation and modification is performed as working-tree changes only**,
  left uncommitted, until the human owner reviews and approves them.
- A standing or prior approval does **not** carry over to a later task. Each
  commit/push/merge/PR requires its own explicit, current instruction.
- Never force-push, and never push to any branch other than the one named for the
  task — and only then when explicitly told to push.

---

## 1. Project context (shared baseline)

- **Product:** `meal-planner.ro` — a static weekly meal-planning site plus a small
  serverless API.
- **Content scale:** recipe content lives in `public/js/recipes.js` (plus
  `public/js/recipes-budget.js`); `scripts/generate-content.mjs` emits the full static
  site and `public/sitemap.xml`. **Exact recipe / page / URL counts are not fixed in
  this document** — they are measured from the current repository state (see §2.2 and
  §9).
- **Locales (14, canonical order):** `ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko`.
- **Content pipeline:** `scripts/generate-content.mjs` reads `public/js/recipes.js`,
  `public/js/recipes-budget.js`, and `public/js/i18n.js`, then writes the static HTML
  and `public/sitemap.xml`.
- **Build commands:** `npm run build` (JS + CSS + content), `npm run content`
  (HTML + sitemap), `npm run build:js`, `npm run build:css`, `npm run sitemap`.
- **Hosting:** Vercel (production `meal-planner.ro`) + GitHub Pages (demo).
  `api/*.js` are Vercel serverless routes; `api/_lib/*` are shared modules, not routes.
- **Monetization:** Stripe Checkout/Portal + Supabase `tokens` table; premium gating
  via `api/_lib/requirePremium.js` and `api/check-access.js`.

---

## 2. Repository-wide rules (hard invariants)

These are non-negotiable. Violating any one is an automatic **FAIL** and a hard stop.

1. **No curly quotes in `public/js/recipes.js`.** U+2018 `‘` / U+2019 `’` break JS
   parsing. Gate:
   `python3 -c "s=open('public/js/recipes.js',encoding='utf-8').read(); print(s.count('‘')+s.count('’'))"`
   must print `0`.
2. **Any edit to `public/js/recipes.js` requires `npm run content`**, and the
   regenerated **HTML page count and sitemap `<url>` count must not unexpectedly
   decrease** versus the pre-change repository state. The expected count is **derived
   from the current repo**, never hard-coded; agents must measure the before/after
   counts and report both (see §9).
3. **Every multilingual field must contain all 14 locale codes.** Older recipes often
   miss `hi` — it must be added.
4. **Recipes with 9+ ingredients require an explicit `servings: 4`** override at the
   recipe-object level.
5. **No secrets in source.** Never commit `.env` / `.env.local`. No `sk_live_` Stripe
   keys anywhere. `SUPABASE_SERVICE_ROLE_KEY` may only appear as
   `process.env.SUPABASE_SERVICE_ROLE_KEY` inside `api/`.
6. **Never `.single()` on the Supabase `tokens` table** — users may hold multiple rows.
   Order by `expires_at` descending and reduce.
7. **New `api/*.js` route ⇒ register it** in the `node --check` list in
   `.github/workflows/build-check.yml` step 5.
8. **Generated artifacts are never hand-edited as source, and source is never
   committed as if generated.** `public/js/recipe-images.js` is auto-generated — do not
   edit by hand.
9. **CI is the test suite.** `.github/workflows/build-check.yml` defines correctness.
   No agent may weaken, skip, or delete a check to obtain a green result.
10. **No automatic version-control actions** (see §0): no commit/push/merge/PR without
    explicit, current human instruction.

---

## 3. Authority hierarchy

Authority flows top-down. A lower tier may not override a higher tier's decision; it
escalates instead.

1. **The human owner** — final authority on scope, approvals, commits, merges, and
   production deploys. Approves this document and every agent definition.
2. **`_global-rules.md` (this document)** — the binding contract all agents obey.
3. **Build & Deploy authority** — the gate that certifies a change is releasable.
   It enforces, but cannot relax, the rules in this document, and it still may not
   commit/push/deploy without explicit human instruction (§0).
4. **QA authority** (editorial, translation, browser) — **read-only**; can block a
   change by issuing a FAIL and may propose fixes, but may not modify source files or
   approve a merge/deploy.
5. **Producer agents** (recipe, translation, SEO) — propose and implement changes
   within their zone as working-tree edits; cannot self-certify, commit, or deploy.

When two agents of equal tier conflict, the matter escalates to the human owner.

---

## 4. Agent boundaries (zone ownership)

Each agent owns exactly one zone and must stay inside it. Cross-zone work is performed
by **hand-off**, never by reaching into another agent's files.

| Zone | Owning agent (to be defined) |
|------|------------------------------|
| Recipe content in `recipes.js` / `recipes-budget.js` / `recipes-meta.js` | recipe-generator |
| Editorial quality of recipe content (**review only**) | editorial-qa-agent |
| Locale strings in recipe fields + `i18n.js` | translation-agent |
| Translation completeness & correctness verification (**review only**) | translation-qa-agent |
| SEO: titles, meta, schema.org, hreflang, sitemap, SEO logic in `generate-content.mjs` | seo-agent |
| Build, content regen, CI/CD, `vercel.json`, deploy | build-deploy-agent |
| Rendered-page / UX verification in a browser (**review only**) | browser-qa-agent |

Shared zones (`generate-content.mjs`, `i18n.js`) are co-owned: edit only the slice your
role owns and announce the change in the hand-off so co-owners can re-verify.

---

## 5. File modification permissions

| Path / area | Who may modify | Notes |
|-------------|----------------|-------|
| `public/js/recipes.js`, `recipes-budget.js` | recipe-generator (content), translation-agent (locale keys) | Triggers `npm run content`; curly-quote gate applies. QA agents may **not** edit. |
| `public/js/recipes-meta.js` | recipe-generator | metadata only |
| `public/js/i18n.js` | translation-agent (strings), seo-agent (SEO templates) | co-owned |
| `scripts/generate-content.mjs`, `scripts/generate-sitemap.cjs` | seo-agent (SEO logic), build-deploy-agent (pipeline) | co-owned |
| `public/sitemap.xml` | generated only | never hand-edit |
| `public/js/recipe-images.js` | **nobody** | auto-generated |
| `api/**`, `vercel.json`, `.github/workflows/**` | build-deploy-agent | new routes must be registered in CI |
| `public/js/app.js`, `checkout.js`, `portal.js`, `public/css/**` | out of scope for this agent set | hand to human / frontend owner |
| `.env`, `.env.local` | **nobody** | secrets, gitignored |
| `agents/**` (this governance directory) | **human owner only** | see §5.1 |

**QA agents (editorial-qa, translation-qa, browser-qa) have no write permission to any
source, content, or config file.** They read, verify, and report; proposed fixes are
returned to the owning producer agent for implementation.

Any modification outside an agent's permitted set is a **FAIL** and a stop condition.

### 5.1 Governance files (`agents/**`)

- `agents/**` may be created or modified **only when the human owner explicitly asks**
  for that change in that task.
- **No agent may self-update its own rules** — or any other agent's rules, or this
  global file — during an operational task. An agent cannot grant itself permissions,
  relax a gate, or alter its boundaries.
- Changes to governance files are reviewed by the human owner before they take effect.

---

## 6. Escalation rules

Escalate — do not improvise — when:

- A task requires editing outside your permitted files (Section 5).
- A hard invariant (Section 2) would have to be bent to finish the task.
- A QA gate issues a FAIL you cannot resolve within your own zone.
- Two agents disagree, or a dependency (translation, SEO string, slug) is missing.
- A recipe's English `name` would change (URL-breaking across all 14 locales).
- Anything touches secrets, payments, or the Supabase `tokens` schema.
- A task seems to require a commit/push/merge/PR but no explicit human instruction
  authorizes it (§0).

**How to escalate:** stop work, leave the repo in a clean state, and emit a hand-off
note (Section 8 format) naming the receiving authority and the exact blocker.
Escalations go **up** the hierarchy (Section 3), never sideways into another zone.

---

## 7. Merge / deploy permissions

- **No commit, push, merge, or PR happens without an explicit, current human
  instruction for that exact action** (§0). This is the controlling rule.
- **Only build-deploy-agent may certify a change as releasable**, and only after every
  applicable quality gate (Section 9) has PASSED — but certification is a
  recommendation, not authorization to release.
- **Only the human owner authorizes a merge to the production branch and a production
  deploy.** No agent self-merges or self-deploys.
- **Push only to the branch named for the task**, and only when explicitly told to.
  Never force-push shared branches.
- A green local build is **necessary but not sufficient** — the human owner's approval
  is the final gate before any commit/merge/deploy.

---

## 8. Output formatting standards

Every agent's deliverable must be structured and reviewable:

- **Hand-off / report header:** `agent`, `task`, `verdict` (PASS / FAIL / BLOCKED),
  `zone touched`.
- **Findings** (for QA): a list, each item `severity` (`blocker` / `major` / `minor`),
  exact location (recipe ID + field path, or `file:line`), and a concrete **proposed**
  fix (QA does not apply fixes).
- **Change summary** (for producers/build): files changed (as uncommitted working-tree
  edits), commands run, and the measured **before/after** recipe count, HTML page
  count, and sitemap `<url>` count when content was regenerated.
- **Next owner:** who the work is handed to, or "ready for human approval".
- Reference code locations as `path:line`. Keep prose tight; prefer lists and tables.
- State results plainly: if a gate failed, say so with the output; never report
  "done" on unverified work.

---

## 9. PASS / FAIL standards

A change is **PASS** only when **all** of the following hold for the scope touched:

- Curly-quote count in `public/js/recipes.js` is `0`.
- All 14 locales present and non-empty in every touched multilingual field (`hi`
  included).
- `servings: 4` present on every recipe with ≥ 9 ingredients.
- `node --check` passes on all `api/*.js` files in the CI list.
- After `npm run content`, the **measured** HTML page count and sitemap `<url>` count
  **did not unexpectedly decrease** versus the counts measured from the repo **before**
  the change. The agent must report current recipe count, page count, and sitemap URL
  count, derived from the live repo — never compared against a hard-coded number.
- No `sk_live_` keys; no hard-coded `SUPABASE_SERVICE_ROLE_KEY=` assignments.
- The change stayed inside the agent's permitted files (Section 5) and remains an
  uncommitted working-tree change (no unauthorized commit/push).
- Source JS still parses (no broken object syntax).

**FAIL** is any single violation above, any unresolved blocker finding, or any work
performed outside the authorized zone. **BLOCKED** is used when an external dependency
or missing instruction prevents completion. FAIL blocks merge/deploy until resolved or
escalated. There is no partial pass.

---

## 10. Audit requirements

- **Before a change:** measure and record the baseline from the current repo — recipe
  count, HTML page count, sitemap `<url>` count — and run the available read-only audit
  scripts relevant to the scope, including `audit_quality.py`, `audit_recipes.py`, and
  `audit_uniqueness.py` if they exist. If an expected audit script is missing, report it
  as **BLOCKED** only if the task depends on that audit; otherwise report it as
  unavailable, not failed.
- **After the change:** re-measure the same counts and re-run the same audits. Counts
  must not unexpectedly decrease, and the change must introduce **no new regressions**
  versus baseline.
- **Audit-script discovery:** agents must list which expected audit scripts were found
  and which were unavailable. **No agent may create new audit scripts during an
  operational task unless explicitly asked.**
- **Every deliverable is traceable:** the report must list files changed, commands run,
  gate outcomes, and the before/after counts, so a reviewer can reproduce the verdict.
- **CI parity:** before recommending release, reproduce the `build-check.yml` assertions
  locally (curly-quote, `node --check`, build, page count, sitemap count, secret-leak
  checks).
- **Secret hygiene:** confirm no secret is present in the working tree before handing
  off.
- Audit evidence is retained in the hand-off report, not discarded.

---

## 11. Stop conditions (apply to all agents)

Stop immediately, leave the tree clean, and escalate when:

- A hard invariant (Section 2) would be violated.
- The task needs files outside the agent's permission set (Section 5), including any
  `agents/**` change not explicitly requested by the human owner.
- A required input is missing or ambiguous (e.g. canonical English name, target set,
  scope of locales).
- A quality gate FAILs and the fix lies outside the agent's zone.
- The measured HTML page count or sitemap `<url>` count would unexpectedly decrease.
- Any secret, payment, or `tokens`-schema concern arises.
- A commit/push/merge/PR would be required but is not explicitly authorized for this
  task (§0).
- An action would be hard to reverse (production deploy, force-push, mass file rewrite)
  without explicit human approval.

A stop is not a failure of the agent — continuing past one is.
