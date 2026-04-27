---
title: "audit-docs.ts self-parity audit class — checklist ↔ runner parity self-validation"
sidebar_label: "audit-docs self-parity"
---

# audit-docs.ts self-parity audit class — checklist ↔ runner parity self-validation

> **Spec:** [.specify/features/audit-docs-self-parity.md](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/audit-docs-self-parity.md)
> **Status:** ✅ RESOLVED (iteration 151, 2026-04-27). Spec + plan
> + implementation landed in the same cron tick.
> **Iterations referenced:** 145 (codify the audit checklist in
> `AGENTS.md`), 149 (codify checklist into runnable script),
> 150 (wire script into CI). Iter-149's "Next Steps #1"
> explicitly called for this iteration's work.

## Why

The doc-quality audit pattern from iters 132 → 150 has matured
through six progressive maturation steps (see spec for the
full table). The seventh step — **self-validation** — is the
natural next maturation point: have the runner verify parity
against the canonical reference text it codifies, on every
invocation.

Currently, if a future iteration adds a new drift class to
`AGENTS.md § Doc-Quality Audit Checklist` but forgets to add
the corresponding `auditClassN()` function in
`scripts/audit-docs.ts`, no signal surfaces — the runner
silently keeps reporting `7/7 PASS` even though the canonical
reference now lists 8 classes. Conversely, if a runner class
is added without a checklist heading, the canonical reference
becomes incomplete.

A self-parity audit class catches both directions of this
drift on every `pnpm audit:docs` invocation, including the
PR-blocking CI gate from iter-150. The cost is one
`readFileSync` of `AGENTS.md` plus regex parsing — bounded
sub-millisecond.

## Steps

### Step 0 — Re-confirm baseline

`pnpm audit:docs` on iter-150 commit returns `7/7 PASS / 0
hits`. The new class lands in the same commit as both:

1. The `EXPECTED_MAPPING` table (hand-maintained with iter-
   citation comments).
2. The new `### Checklist ↔ runner parity (added iter 151)`
   sub-section in `AGENTS.md § Doc-Quality Audit Checklist`.

Because both sides land aligned, the new class returns `pass:
true` on first run. Total output count flips `7/7 PASS` →
`8/8 PASS`.

### Step 1 — Author `auditChecklistRunnerParity()`

Add a new function to `scripts/audit-docs.ts`:

```ts
function auditChecklistRunnerParity(): AuditResult {
    // Read canonical reference text.
    const agents = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');

    // Locate the `## Doc-Quality Audit Checklist` section bounds.
    const checklistStart = agents.indexOf('## Doc-Quality Audit Checklist');
    const nextH2 = agents.indexOf('\n## ', checklistStart + 1);
    const checklistText = agents.slice(
        checklistStart,
        nextH2 === -1 ? agents.length : nextH2
    );

    // Extract all `### ` sub-section headings within the checklist.
    const headings: string[] = [];
    for (const line of checklistText.split(/\r?\n/)) {
        const m = line.match(/^### (.+)$/);
        if (m) headings.push(m[1].trim());
    }

    // Canonical mapping: AGENTS.md heading → audit class id (or 'meta').
    // Each entry carries the iter that established it.
    interface MappingEntry {
        heading: string;          // exact AGENTS.md heading text
        runnerClassId: string;    // matching `classes[].id` or 'meta' / 'cross-file'
        establishedIter: number;  // iter that added this heading
    }
    const EXPECTED_MAPPING: MappingEntry[] = [
        // 'Runner' is meta — describes the script itself, not a drift class.
        { heading: 'Runner (added iter 149)', runnerClassId: 'meta', establishedIter: 149 },
        // 'Value drift' fans out into class 3 (count parity) + class 4 (toolchain).
        { heading: 'Value drift (stale numbers / counts / versions)', runnerClassId: '3/7+4/7', establishedIter: 145 },
        // 'Status / state drift' fans out into class 1 (line-anchored) + class 2 (blockquote).
        { heading: 'Status / state drift (claims that have moved on)', runnerClassId: '1/7+2/7+5/7', establishedIter: 145 },
        // 'Structural / link drift' → class 6.
        { heading: 'Structural / link drift', runnerClassId: '6/7', establishedIter: 145 },
        // 'Cross-file consistency' → cross-file parity class (the [ * ] entry).
        { heading: 'Cross-file consistency (added iter 148)', runnerClassId: 'cross-file', establishedIter: 148 },
        // iter-151: this audit class itself.
        { heading: 'Checklist ↔ runner parity (added iter 151)', runnerClassId: '7/7', establishedIter: 151 },
        // 'Rerun cadence' is meta — informational reference table.
        { heading: 'Rerun cadence', runnerClassId: 'meta', establishedIter: 145 }
    ];

    // Compute heading-set diffs.
    const expectedHeadings = new Set(EXPECTED_MAPPING.map((e) => e.heading));
    const actualHeadings = new Set(headings);

    const hits: Hit[] = [];
    const notes: string[] = [
        `AGENTS.md checklist headings discovered: ${headings.length}`,
        `EXPECTED_MAPPING entries: ${EXPECTED_MAPPING.length}`
    ];

    for (const h of actualHeadings) {
        if (!expectedHeadings.has(h)) {
            hits.push({
                file: 'AGENTS.md',
                line: 0,
                text: `+ "${h}" — heading in AGENTS.md but no EXPECTED_MAPPING entry (add to scripts/audit-docs.ts EXPECTED_MAPPING)`
            });
        }
    }
    for (const h of expectedHeadings) {
        if (!actualHeadings.has(h)) {
            hits.push({
                file: 'scripts/audit-docs.ts',
                line: 0,
                text: `- "${h}" — EXPECTED_MAPPING entry but no AGENTS.md heading (add ### heading or remove EXPECTED_MAPPING entry)`
            });
        }
    }

    // Class-count parity: classes[] should have 7 numbered entries
    // ('1/7' through '7/7') plus the cross-file ' * ' entry. EXPECTED_RUNNER_COUNT
    // is recomputed from EXPECTED_MAPPING (any entry with id starting with `N/`)
    // so it stays in sync with the mapping table without a duplicate constant.
    const numberedRunnerIds = new Set<string>();
    for (const entry of EXPECTED_MAPPING) {
        for (const part of entry.runnerClassId.split('+')) {
            if (/^\d+\/\d+$/.test(part)) numberedRunnerIds.add(part);
        }
    }
    const expectedNumberedCount = numberedRunnerIds.size;
    const actualNumberedCount = classes.filter((c) => /^\d+\/\d+$/.test(c.id)).length;
    if (actualNumberedCount !== expectedNumberedCount) {
        hits.push({
            file: 'scripts/audit-docs.ts',
            line: 0,
            text: `numbered-class count drift: classes[] has ${actualNumberedCount} numbered classes, EXPECTED_MAPPING covers ${expectedNumberedCount}`
        });
    }
    notes.push(
        `numbered runner classes: ${actualNumberedCount} (expected ${expectedNumberedCount})`
    );

    return { pass: hits.length === 0, hits, notes };
}
```

### Step 2 — Register the new audit class

Update the `classes: AuditClass[]` array. The existing 6
numbered classes get re-labeled `1/7` through `6/7`, the new
class is added as `7/7`, and the cross-file consistency check
keeps its `[ * ]` slot at the end:

```ts
const classes: AuditClass[] = [
    { id: '1/7', name: 'Status drift (line-anchored, iter-145)',           ... },
    { id: '2/7', name: 'Status drift (blockquote-tolerant, iter-147)',     ... },
    { id: '3/7', name: 'Value drift (count parity)',                       ... },
    { id: '4/7', name: 'Toolchain version drift',                          ... },
    { id: '5/7', name: 'ISR wording drift',                                ... },
    { id: '6/7', name: 'Structural / link drift',                          ... },
    { id: '7/7', name: 'Checklist ↔ runner parity (iter-151)',             run: auditChecklistRunnerParity },
    { id: ' * ', name: 'Cross-file consistency (...)',                     ... }
];
```

The total-class count printed by `main()` flips `7` → `8`
(7 numbered + 1 cross-file). The summary line becomes
`8/8 PASS — no documentation drift detected.`

### Step 3 — Update AGENTS.md

Add a new `### Checklist ↔ runner parity (added iter 151)`
sub-section under `## Doc-Quality Audit Checklist`,
immediately above the existing `### Rerun cadence`. The new
sub-section:

1. Explains that the runner self-validates against the
   canonical reference text in this section on every
   invocation.
2. Lists the canonical heading-to-class mapping in a code
   fence (matching the `EXPECTED_MAPPING` table in the
   runner).
3. Notes that adding a new drift class requires adding
   *both* the AGENTS.md heading + the EXPECTED_MAPPING entry
   in the same commit.

Also update the existing `### Runner (added iter 149)`
sub-section to mention the new self-parity class as one of
the 7 numbered classes (was 6).

### Step 4 — First run

```bash
pnpm audit:docs
```

Expected output:

```
[1/7] Status drift (line-anchored, iter-145)                     PASS — 0 hits
[2/7] Status drift (blockquote-tolerant, iter-147)               PASS — 0 hits
[3/7] Value drift (count parity)                                 PASS — 0 hits
         spec count: All N .specify/ feature specs: 33 ✓
         package count: **N packages**: 18 ✓
         app count: **N apps**: 8 ✓
[4/7] Toolchain version drift                                    PASS — 0 hits
[5/7] ISR wording drift                                          PASS — 0 hits
[6/7] Structural / link drift                                    PASS — 0 hits
[7/7] Checklist ↔ runner parity (iter-151)                       PASS — 0 hits
         AGENTS.md checklist headings discovered: 7
         EXPECTED_MAPPING entries: 7
         numbered runner classes: 7 (expected 7)
[ * ] Cross-file consistency (AGENTS R-rules vs CLAUDE Critical Rules) PASS — 0 hits
         AGENTS.md R-rules: 15 (expected 15)
         CLAUDE.md numbered Critical Rules: 17 (expected 17)

8/8 PASS — no documentation drift detected.
```

### Step 5 — Documentation propagation

Update in the same commit:

1. **AGENTS.md** — new `### Checklist ↔ runner parity (added
   iter 151)` sub-section + Runner sub-section reference
   bumped from 6 → 7.
2. **CLAUDE.md** — `pnpm audit:docs` row in Common Commands
   updated to mention 7 drift classes (was 6).
3. **README.md** — `pnpm audit:docs` row in Commands table
   updated similarly.
4. **`.specify/project.md`** — Current State header bumped
   150 → 151 with the new audit class line.
5. **`docs/index.md`** — iteration descriptor 150 → 151.
6. **`docs/log.md`** — full iter-151 entry.
7. **NEW `.specify/features/audit-docs-self-parity.md`** —
   the spec.
8. **NEW `docs/plans/audit-docs-self-parity.md`** — this plan.
9. **`scripts/audit-docs.ts`** — the runner edit.

### Step 6 — Verification

```bash
pnpm typecheck    # Expected: 23/23 FULL TURBO (no source-tree changes; script is at root)
pnpm lint         # Expected: 18/18 FULL TURBO + 0 warnings + 0 errors
pnpm audit:docs   # Expected: 8/8 PASS / 0 hits (matches iter-150 baseline + new class PASS)
```

If any of the 7 existing classes regress (i.e. a previously-
clean check FAILs because the new class's edits accidentally
shifted line numbers or broke a regex), revert and reproduce
the issue locally before re-applying.

### Step 7 — Commit

Single commit titled e.g.:

```
docs: iter 151 add self-parity audit class — script self-validates
against AGENTS.md § Doc-Quality Audit Checklist on every run
```

Files in the commit:

- NEW `.specify/features/audit-docs-self-parity.md`
- NEW `docs/plans/audit-docs-self-parity.md`
- MOD `scripts/audit-docs.ts` (new function + classes[] update)
- MOD `AGENTS.md` (new sub-section + Runner reference bump)
- MOD `CLAUDE.md` (Commands row update)
- MOD `README.md` (Commands row update)
- MOD `.specify/project.md` (Current State header bump + new line)
- MOD `docs/index.md` (iteration descriptor bump)
- MOD `docs/log.md` (full iter-151 entry)

## Acceptance Criteria

(Mirrors `.specify/features/audit-docs-self-parity.md` AC #1-#15.
Critical ones for plan execution:)

- [ ] AC #1 — New `auditChecklistRunnerParity()` function added.
- [ ] AC #2 — TypeScript only (R1).
- [ ] AC #3 — Reads `AGENTS.md` directly.
- [ ] AC #4 — Heading parity (1:1 mapping).
- [ ] AC #5 — Class-count parity.
- [ ] AC #6 — Self-exclusion safety (new heading lands in same commit).
- [ ] AC #7 — PASS on iter-151 commit.
- [ ] AC #8 — Iter-citation comments on every mapping entry.
- [ ] AC #9 — Output format matches existing classes.
- [ ] AC #10 — AGENTS.md gets new sub-section.
- [ ] AC #11 — Heading count assertion (7 drift classes + 2 meta = 9 `### ` headings)... actually, after iter-151 the count becomes 7 drift classes (was 6) + 2 meta = 9, no, wait: meta is `Runner` + `Rerun cadence` = 2; drift class headings under the checklist are `Value drift`, `Status / state drift`, `Structural / link drift`, `Cross-file consistency`, `Checklist ↔ runner parity` = 5 (some fan out into multiple runner classes). Total `### ` = 5 + 2 = 7 headings — that matches the EXPECTED_MAPPING table size.
- [ ] AC #12 — Documentation propagation across 8 files.
- [ ] AC #13 — Baseline preserved.
- [ ] AC #14 — `pnpm typecheck` clean.
- [ ] AC #15 — `pnpm lint` clean.

## Outcome

(To be filled at iter-151 commit time.)

## Risk Analysis

### Risk: heading text drift

If the AGENTS.md sub-section heading text changes (e.g.
`Runner (added iter 149)` → `Runner (iter 149)`), the
`EXPECTED_MAPPING` entry's exact-string match fails and the
audit FAILs.

**Mitigation**: the test FAILs fast and surfaces the exact
heading-set diff in the output. The fix is a one-line
EXPECTED_MAPPING update in the same commit as the AGENTS.md
heading rename. This is the *correct* behavior — the audit
exists to catch exactly this kind of drift.

### Risk: regex-equivalence drift

The new audit verifies *heading parity*, not regex
behavioral parity. If iter-152+ tightens a regex in
AGENTS.md but forgets the runner (or vice versa), the audit
class still PASSes — only the test/coverage pipeline catches
it.

**Mitigation**: documented in the spec's "Out of Scope"
section as a deferred future iteration (`iter-152: regex-
equivalence checking` if a real divergence drift surfaces).

### Risk: self-trigger on first run

If the AGENTS.md heading update doesn't land in the same
commit as the runner update, the new audit class FAILs
immediately because `Checklist ↔ runner parity (added iter 151)`
is in EXPECTED_MAPPING but not in AGENTS.md.

**Mitigation**: AC #6 explicitly mandates same-commit
landing. The single-commit discipline is enforced by the
plan's Step 7.

## Pattern progression confirmation

Iter-151 is the 7th maturation step in the doc-quality audit
pattern. The compounding effect remains: each maturation step
costs one iteration but eliminates a class of future drift
permanently.

| # | Iter | Step | Eliminates |
|---|------|------|------------|
| 1 | 145  | Codify playbook as in-tree text | "reason-from-scratch" cost on every audit |
| 2 | 149  | Codify as runnable script | "grep-by-grep" cost on every audit |
| 3 | 150  | Wire into CI as PR-blocking gate | "must-remember-to-run" cost on every PR |
| 4 | 151  | Self-validate runner ↔ canonical reference | "checklist + runner add/remove drift" cost forever |

The natural follow-up — should iter-152+ surface a new drift
class — is **regex-equivalence checking** (a behaviorally-
equivalent regex check between AGENTS.md fenced code blocks
and runner regex literals). That iteration is deferred until
a real regex-divergence drift surfaces.
