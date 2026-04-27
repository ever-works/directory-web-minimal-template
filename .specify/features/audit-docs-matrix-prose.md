# Feature: `audit-docs.ts` matrix-prose count parity audit class — `**N-package matrix**` total claim ↔ canonical 3-cohort breakdown parity

> **Status: ✅ RESOLVED (iteration 161, 2026-04-28).** Specified
> and executed in the same cron tick. The new audit class
> (numbered `8/8` in the runner output) reads
> `.specify/project.md`, locates the canonical
> `**N-package matrix**` total claim and the three canonical
> cohort labels — `(high-churn cohort, X packages)`,
> `(iter-N lifted, Y packages)`, `(deferred cohort, Z packages)`
> — and asserts `X + Y + Z == N`. If the sum diverges from the
> claim, the audit class FAILs with the actual cohort counts
> and the claimed total surfaced in the output.
>
> This closes iter-156 deferral #9 codify-trigger, which fired
> at iter-160 after the second instance of the matrix-prose
> count drift class surfaced. Iter-156 had documented the
> codify-then-execute meta-pattern: codify a drift class as an
> audit class only after it has surfaced **twice**, so the
> codification is grounded in real recurrence rather than
> speculative coverage. The first instance was iter-133's
> "expanded by 3" while listing 4 package names (latency 22
> iterations until iter-156 fixed it); the second instance was
> iter-158's `14 + 11 = 25` while the canonical sum is
> `14 + 1 + 12 = 27` (latency 1 iteration until iter-160 caught
> the drift at the propagation site). Iter-160's dramatic
> latency drop (22 → 1) is itself a positive signal that
> iter-156's framing made future readers more attuned to
> matrix-prose math, but the audit class codification eliminates
> the residual latency entirely — drift surfaces on the same
> cron tick as the offending edit.

## Why

Across iters 145 → 151 the doc-quality audit pattern matured
through seven progressive maturation steps:

| # | Iter | Step | Net effect |
|---|------|------|-----------|
| 1 | 145 | Codify the playbook as in-tree text in `AGENTS.md` | Audit becomes grep-and-fix instead of reason-from-scratch |
| 2 | 146 | Surface miss-target (`>`-blockquote prefix) | First retry-and-tighten cycle |
| 3 | 147 | Tighten checklist regex to handle blockquote+bold | Codified miss-target permanently |
| 4 | 148 | Add 6th drift class (cross-file rule-count parity) | Surface a new structural drift class |
| 5 | 149 | Codify checklist into runnable script `pnpm audit:docs` | Audit becomes one-command instead of grep-by-grep |
| 6 | 150 | Wire `pnpm audit:docs` into CI as PR-blocking step | Audit drift becomes PR-blocking instead of cron-tick-dependent |
| 7 | 151 | Self-parity audit (script verifies AGENTS.md heading set) | Forgotten add/remove drift caught on every run |

The eighth maturation step is the **second-instance codify-then-execute
trigger**: iter-156 deferral #9 said *"codify-then-execute meta-pattern
says wait for a second matrix-prose drift instance before adding the
audit class."* Iter-160 fired that trigger after iter-158's drift
landed and propagated unchanged through iter-159. Iter-161 codifies the
audit class.

The audit class is intentionally narrow:

- It scans only `.specify/project.md` (the canonical matrix-prose
  location, used since iter-133's matrix expansion).
- It looks for the canonical `(high-churn cohort, N packages)` /
  `(iter-N lifted, N packages)` / `(deferred cohort, N packages)`
  breakdown form (codified iter-160).
- Other framings (tables in log.md, non-canonical phrasings) are
  tolerated to keep the false-positive rate at zero.
- If a future iteration re-frames the breakdown, the audit silently
  passes; a later iteration broadens the regex set on the next
  drift instance per the same codify-then-execute meta-pattern.

This narrowness is deliberate: false-positive PR-blocking from CI is
worse than false-negative drift latency, especially given the iter-160
existence proof that real drift surfaces and gets caught within 1
iteration of propagation even without the audit class.

## Acceptance Criteria

1. ✅ New `auditMatrixProseCountParity()` function added to
   `scripts/audit-docs.ts` between class `7/8` and the `[ * ]`
   cross-file class.
2. ✅ Function reads `.specify/project.md` via `readFileSync`,
   extracts `**N-package matrix**` total claim and the three canonical
   cohort labels, and asserts the cohort sum equals the claimed total.
3. ✅ If the total claim is missing OR not all three cohort labels are
   present, the audit silently passes with an explanatory note (no
   false positive on partial / transitional matrix-prose).
4. ✅ New `EXPECTED_MAPPING` entry for heading
   `Matrix-prose count parity (added iter 161)` with `runnerClassId: '8/8'`
   and `establishedIter: 161`.
5. ✅ All existing `EXPECTED_MAPPING` entries flipped from `N/7` →
   `N/8` denominators.
6. ✅ All existing `classes[]` ids flipped from `N/7` → `N/8`
   denominators; new entry added for `8/8` matrix-prose class.
7. ✅ New `### Matrix-prose count parity (added iter 161)` sub-section
   added to `AGENTS.md § Doc-Quality Audit Checklist`, immediately
   above `### Rerun cadence`.
8. ✅ `### Runner (added iter 149)` sub-section reference bumped from
   "7 grep blocks" to "8 grep blocks".
9. ✅ Canonical heading-to-class mapping table inside
   `### Checklist ↔ runner parity (added iter 151)` updated to include
   the new `Matrix-prose count parity (added iter 161)` heading and
   to flip `N/7` → `N/8` for the existing 6 numbered classes.
10. ✅ `### Checklist ↔ runner parity` total bumped from "7 `### `
    headings" + "5 drift-class headings" to "8 `### ` headings" + "6
    drift-class headings".
11. ✅ `CLAUDE.md` Common Commands `pnpm audit:docs` row updated 7 → 8
    drift classes; new "Matrix-prose count parity" item added to the
    enumerated list.
12. ✅ `README.md` Commands table `pnpm audit:docs` row similarly
    updated 7 → 8 drift classes.
13. ✅ `.specify/project.md` Current State header bumped 160 → 161;
    spec count flipped 33 → 34 (this spec file added, caught by audit
    class 3 count-parity check).
14. ✅ `pnpm audit:docs` first run after fixes reports `9/9 PASS`
    across 8 numbered classes + 1 cross-file parity class.
15. ✅ Iter-160's deferral #9 status flipped to `~~CODIFIED iter-161~~`.

## Out of Scope

- **Tables in log.md narratives**. Iter-160's `| **High-churn (every-tick)** | 14 |`
  table is correctly counted as 14 + 1 + 12 = 27 by inspection but
  uses non-canonical formatting; the audit class doesn't parse table
  rows. If a future iteration introduces matrix-table drift, that's
  the second-instance trigger to broaden the regex set (codify-then-execute).
- **Cross-file matrix-prose**. If a future iteration starts asserting
  `27-package matrix` in CLAUDE.md or README.md (currently only
  `.specify/project.md` carries this claim), broaden the file scan
  set on the next drift instance.
- **Per-cohort enumeration counting**. The audit checks the
  cohort-count *labels* (`(deferred cohort, 12 packages)`), not the
  actual list of package names following the label. If a label says
  "12 packages" but lists 13 names, this audit doesn't catch it.
  Iter-133's drift was exactly this shape (label "expanded by 3" + 4
  names), but iter-156 fixed it inline; future drift would re-trigger
  per codify-then-execute.
- **Regex-equivalence checking** for the manual grep blocks documented
  in the checklist's `### Matrix-prose count parity` sub-section vs
  the regex literals in `auditMatrixProseCountParity()`. Same
  out-of-scope flag as iter-151's spec: deferred until a real regex
  divergence drift surfaces.

## Notes on naming

The audit class is named `auditMatrixProseCountParity` (not
`auditMatrixCountParity`) to disambiguate from the broader concept of
counting any matrix in the codebase. The "prose" qualifier reflects
that the audit operates on natural-language matrix-cohort breakdowns,
not structured data. If a future iteration introduces a structured
matrix manifest (YAML, JSON), a separate audit class would be added
for that surface.

## Pattern progression confirmation

After iter-161, the doc-quality audit pattern has gone through 8
maturation steps. The sequence demonstrates a stable codify-then-execute
meta-pattern: surface a drift class organically (via real iteration
work), wait for the second instance to confirm recurrence, then
codify into the audit script. This iter-161 codification follows the
same cadence as iter-148 (cross-file consistency, codified after 1
instance because the rule-count divergence was structurally obvious),
iter-149 (audit-script codification, codified after 4 single-class
drift fixes confirmed the codification was needed), and iter-151
(self-parity audit, codified after 2 full audit-script iterations
demonstrated convention-only parity wouldn't scale).

The full sequence:

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

Future iterations should expect ~1 maturation step per ~10 iterations,
each one closing a previously-deferred or previously-untriggered
codify-then-execute opportunity. The 7-iteration gap between iter-151
and iter-161 reflects: iter-152 / 153 / 155 / 157 / 158 / 159 (6
verification-only ticks) + iter-154 (dep-delta-apply) + iter-156 (1st
instance fix) + iter-160 (2nd instance fix → trigger fired). The
trigger fired at the natural cadence; iter-161 is the codification
landing.
