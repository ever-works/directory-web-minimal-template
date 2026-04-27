---
title: "audit-docs.ts matrix-prose count parity audit class — N-package matrix total ↔ canonical 3-cohort breakdown sum parity"
sidebar_label: "audit-docs matrix-prose"
---

# audit-docs.ts matrix-prose count parity audit class — `**N-package matrix**` total ↔ canonical 3-cohort breakdown sum parity

> **Spec:** [.specify/features/audit-docs-matrix-prose.md](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/audit-docs-matrix-prose.md)
> **Status:** ✅ RESOLVED (iteration 161, 2026-04-28). Spec + plan
> + implementation landed in the same cron tick.
> **Iterations referenced:** 156 (deferral #9 created — "wait for second
> drift instance before codifying"), 158 (drift introduced: `14 + 11 = 25`
> claim), 159 (drift propagated unchanged), 160 (drift caught + corrected
> + codify-trigger fired), 161 (codification — this iteration).

## Why

Iter-156 deferral #9 said:

> **Matrix-prose audit class** (iter-156 → iter-X deferred): codify-then-execute
> meta-pattern says wait for a *second* matrix-prose drift before codifying.

The trigger fired at iter-160. The audit class lands at iter-161 — same
codify-then-execute cadence as iter-149's `pnpm audit:docs` codification
(after 4 manual single-class drift fixes confirmed value), iter-148's
cross-file drift class (after 1 obvious structural divergence), and
iter-151's self-parity class (after 2 audit-script iterations
demonstrated convention-only parity wouldn't scale).

Drift class shape: claims of the form `**N-package matrix**` whose
stated total doesn't equal the sum of `(high-churn cohort, X packages)` +
`(iter-N lifted, Y packages)` + `(deferred cohort, Z packages)`.

Two instances surfaced before this audit was codified:

- **Iter-133** "expanded by 3" while listing 4 package names — latency
  22 iterations until iter-156 fixed it. Long latency reflects the lack
  of a dedicated audit class for this drift; readers had to inspect the
  cohort enumeration manually to surface the discrepancy.
- **Iter-158** "14 + 11 = 25" while the canonical sum is 14 + 1 + 12 = 27 —
  latency 1 iteration until iter-160 caught the drift at the propagation
  site. Short latency reflects that iter-156's framing (`Re-baseline at
  next matrix expansion.` deferral note) made future readers more attuned
  to matrix-prose math, but the audit class codification eliminates the
  residual latency entirely — drift surfaces on the same cron tick as
  the offending edit.

After iter-161, every `pnpm audit:docs` run will catch matrix-prose
count drift before the iteration commits, including in the iter-150 CI
PR-gate.

## Steps

### 1. Add the new audit function `auditMatrixProseCountParity()` to `scripts/audit-docs.ts`

Insert between class 7/8 (`auditChecklistRunnerParity()`) and the `[ * ]`
class (`auditCrossFileConsistency()`). The function signature and shape
match all 6 prior audit functions: `(): AuditResult` returning
`{ pass, hits, notes }`.

Implementation outline:

```ts
function auditMatrixProseCountParity(): AuditResult {
    const text = readFileSync(join(REPO_ROOT, '.specify', 'project.md'), 'utf8');
    const fileRel = '.specify/project.md';
    const hits: Hit[] = [];
    const notes: string[] = [];

    const totalMatch = text.match(/\*\*(\d+)-package matrix\*\*/);
    if (!totalMatch) {
        notes.push('no `**N-package matrix**` claim found (audit silent)');
        return { pass: true, hits: [], notes };
    }

    const highChurnMatch = text.match(/\(high-churn cohort,\s+(\d+)\s+packages?\b/);
    const liftedMatch = text.match(/\(iter-\d+\s+lifted,\s+(\d+)\s+packages?\b/);
    const deferredMatch = text.match(/\(deferred cohort,\s+(\d+)\s+packages?\b/);

    if (!highChurnMatch || !liftedMatch || !deferredMatch) {
        // Silent pass on partial / transitional matrix-prose.
        notes.push('not all 3 canonical cohort labels present (audit silent)');
        return { pass: true, hits: [], notes };
    }

    const claimedTotal = parseInt(totalMatch[1], 10);
    const hc = parseInt(highChurnMatch[1], 10);
    const lifted = parseInt(liftedMatch[1], 10);
    const deferred = parseInt(deferredMatch[1], 10);
    const sum = hc + lifted + deferred;

    notes.push(`high-churn ${hc} + lifted ${lifted} + deferred ${deferred} = ${sum} (claim: ${claimedTotal}-package matrix)`);

    if (sum !== claimedTotal) {
        hits.push({
            file: fileRel,
            line: 0,
            text: `matrix-prose count drift: claim ${claimedTotal} ≠ cohort sum ${sum} (high-churn ${hc} + lifted ${lifted} + deferred ${deferred})`
        });
    }

    return { pass: hits.length === 0, hits, notes };
}
```

### 2. Update `EXPECTED_MAPPING` table

Add new entry between the iter-151 self-parity entry and the
`'Rerun cadence'` meta entry:

```ts
{
    heading: 'Matrix-prose count parity (added iter 161)',
    runnerClassId: '8/8',
    establishedIter: 161
}
```

Also flip all existing entries' `runnerClassId` denominators from
`N/7` → `N/8`:

- `'3/7+4/7'` → `'3/8+4/8'`
- `'1/7+2/7+5/7'` → `'1/8+2/8+5/8'`
- `'6/7'` → `'6/8'`
- `'7/7'` → `'7/8'`

### 3. Update `classes[]` array

Flip all existing entry ids from `N/7` → `N/8`. Add new entry:

```ts
{
    id: '8/8',
    name: 'Matrix-prose count parity (iter-161)',
    description: '`**N-package matrix**` total claim vs sum of (high-churn cohort, X) + (iter-N lifted, Y) + (deferred cohort, Z) breakdown in .specify/project.md',
    run: auditMatrixProseCountParity
}
```

### 4. Add new sub-section to `AGENTS.md § Doc-Quality Audit Checklist`

Insert `### Matrix-prose count parity (added iter 161)` immediately
above `### Rerun cadence`. Include:

- 1-paragraph drift-class description.
- Both drift instances (iter-133 + iter-158) with latency annotations.
- Manual grep equivalent (4 grep blocks for total + 3 cohorts).
- Spec / Plan cross-references.

Update `### Runner (added iter 149)` reference from "7 grep blocks" to
"8 grep blocks". Update the canonical heading-to-class mapping table
under `### Checklist ↔ runner parity (added iter 151)` to include the
new `Matrix-prose count parity` heading and flip all `N/7` → `N/8`.
Update the heading-count summary line from "7 `### ` headings" + "5
drift-class headings" to "8 `### ` headings" + "6 drift-class headings".

### 5. Update CLAUDE.md + README.md `pnpm audit:docs` row

Both files have a `pnpm audit:docs` line in their command tables. Update
the count "7 drift classes" → "8 drift classes" and append the new
"Matrix-prose count parity" item to the enumerated list.

### 6. Create spec + plan

This file (the plan) and `.specify/features/audit-docs-matrix-prose.md`
(the spec) land in the same iteration as the implementation. Both
flipped to ✅ RESOLVED status in the same commit.

### 7. Update `.specify/project.md`

- Current State header: `(Iteration 160)` → `(Iteration 161)`.
- Spec count: 33 → 34 (audit class 3 will catch this automatically and
  flag it if missed).
- "Zero documentation drift" line: annotate with iter-161 codification.

### 8. Update `docs/index.md`

- Iteration descriptor: 160 → 161 with full narrative.
- Add `plans/audit-docs-matrix-prose.md` entry to the Plans section.
- Add `features/audit-docs-matrix-prose.md` entry to the Spec Kit section.

### 9. Update `docs/log.md`

Prepend new iter-161 entry. Demote iter-160 to history.

### 10. Verify

Run `pnpm audit:docs` and confirm `9/9 PASS` output across 8 numbered
classes + 1 cross-file parity class. The matrix-prose class should
report:

```
[8/8] Matrix-prose count parity (iter-161)                       PASS — 0 hits
         high-churn 12 + lifted 3 + deferred 12 = 27 (claim: 27-package matrix)
```

`pnpm typecheck` and `pnpm lint` not re-run — `scripts/audit-docs.ts`
is at repo root, not under any tsconfig/eslint scope; runtime executes
via `tsx`. AGENTS.md / CLAUDE.md / README.md / spec / plan / index / log /
project edits are doc-only.

## Acceptance Criteria

See [`.specify/features/audit-docs-matrix-prose.md`](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/audit-docs-matrix-prose.md)
for the canonical AC list (15 criteria). All ACs satisfied in this
iteration.

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| False-positive on transitional matrix-prose (e.g., during a future cohort re-baseline) | Low | Medium | Silent-pass on partial matches: if any of the 3 cohort labels are missing, the audit reports a note and returns `pass: true`. |
| False-negative on table-form matrix breakdowns (iter-160's narrative table) | Medium | Low | Out-of-scope per spec. If a table-form drift instance surfaces, broaden regex set on next iteration per codify-then-execute. |
| Regex-equivalence drift between AGENTS.md grep blocks and runner regex | Low | Low | Out-of-scope per spec (same out-of-scope flag as iter-151). Deferred until a real divergence drift surfaces. |
| Self-parity audit (class 7/8) misses the heading→runner edit (i.e. iter-161 itself fails class 7/8) | Low | High (PR-blocking) | The new sub-section heading and the new `EXPECTED_MAPPING` entry land in the same commit; the new `classes[]` entry and the renumbered ids land in the same commit. Class 7/8 is run during the verification step (Step 10) — if it FAILs, iter-161 doesn't ship. |
| `auditChecklistRunnerParity` numbered-class count mismatch | Low | Medium | Class 7/8 auto-counts numbered runner classes from the regex pattern `^\d+\/\d+$` against numbered ids in `EXPECTED_MAPPING` — both are updated atomically in the same commit. |

## Pattern progression confirmation

After iter-161, the doc-quality audit pattern has gone through 8
maturation steps. Future iterations should expect ~1 maturation step per
~10 iterations, each one closing a previously-deferred or
previously-untriggered codify-then-execute opportunity.

| # | Iter | Maturation step |
|---|------|-----------------|
| 1 | 145 | Codify checklist text |
| 2 | 146 | First miss-target → retry-and-tighten |
| 3 | 147 | Tighten regex |
| 4 | 148 | Add 6th drift class (cross-file) |
| 5 | 149 | Codify as runnable script |
| 6 | 150 | Wire into CI |
| 7 | 151 | Self-parity audit |
| **8** | **161** | **Second-instance codify (matrix-prose count)** |

The 7-iteration gap between iter-151 and iter-161 reflects 6
verification-only ticks (152/153/155/157/158/159) + 1 dep-delta-apply
(iter-154) + 2 doc-drift-fix ticks (iter-156 fixed the 1st instance,
iter-160 fixed the 2nd instance and fired the trigger). The trigger
fired at the natural codify-then-execute cadence; iter-161 is the
codification landing.
