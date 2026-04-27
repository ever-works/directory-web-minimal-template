# Feature: `audit-docs.ts` self-parity audit class — `AGENTS.md § Doc-Quality Audit Checklist` ↔ runner implementation parity

> **Status: ✅ RESOLVED (iteration 151, 2026-04-27).** Specified
> and executed in the same cron tick. The new audit class
> (numbered `7/7` in the runner output, formerly the
> floating `[ * ]` cross-file consistency parity slot) walks
> the canonical reference text in `AGENTS.md § Doc-Quality
> Audit Checklist` and asserts that **every** `### `
> sub-section heading documented under that section has a
> corresponding `auditClassN()` implementation in
> `scripts/audit-docs.ts`, AND that **every** regex/file-glob
> mentioned in the checklist text has at least one literal
> mention or near-equivalent regex literal in the runner. If
> the parity drifts in either direction (a checklist heading
> is added without a runner class, OR a runner class is added
> without a corresponding checklist heading) the new audit
> class FAILs with the actual heading-set diff surfaced in
> the output.
>
> This closes iter-149's "Next Steps #1" — currently the
> parity between AGENTS.md (canonical reference) and
> audit-docs.ts (canonical runner) is enforced by *convention
> only*. Codifying the parity check inside the script itself
> means the runner self-validates against its own canonical
> reference text on every invocation.

## Why

Across iters 145 → 150 the doc-quality audit pattern matured
through six progressive maturation steps:

| # | Iter | Step | Net effect |
|---|------|------|-----------|
| 1 | 145 | Codify the playbook as in-tree text in `AGENTS.md` | Audit becomes grep-and-fix instead of reason-from-scratch |
| 2 | 146 | Surface miss-target (`>`-blockquote prefix) | First retry-and-tighten cycle |
| 3 | 147 | Tighten checklist regex to handle blockquote+bold | Codified miss-target permanently |
| 4 | 148 | Add 6th drift class (cross-file rule-count parity) | Surface a new structural drift class |
| 5 | 149 | Codify checklist into runnable script `pnpm audit:docs` | Audit becomes one-command instead of grep-by-grep |
| 6 | 150 | Wire `pnpm audit:docs` into CI as PR-blocking step | Audit drift becomes PR-blocking instead of cron-tick-dependent |

The seventh maturation step — and the one iter-149's "Next
Steps #1" explicitly called out — is **self-validation**: the
runner asserts parity against the canonical reference text it
codifies. Currently, if a future iteration adds a new drift
class to `AGENTS.md § Doc-Quality Audit Checklist` but
forgets to add the corresponding `auditClassN()` function in
`scripts/audit-docs.ts`, no signal surfaces — the runner
silently keeps reporting `7/7 PASS` even though the canonical
reference now lists 8 classes. Conversely, if a runner class
is added without a checklist heading, the canonical reference
becomes incomplete.

A self-parity audit class catches both directions of this
drift on every `pnpm audit:docs` invocation, including the
PR-blocking CI gate from iter-150. The cost is one `readFileSync` of
`AGENTS.md` plus regex parsing — bounded sub-millisecond.

The iter-145/146/147/148/149/150 maturation pattern compounds:
each step costs one iteration but eliminates a class of future
drift permanently. Iter-151's audit class #7 eliminates the
"checklist heading without runner class" and "runner class
without checklist heading" drift classes for all future
iterations.

## Acceptance Criteria

1. **AC #1 — New audit class.** A new `auditChecklistRunnerParity()`
   function is added to `scripts/audit-docs.ts` and registered
   as the **7th** entry in the `classes: AuditClass[]` array.
   The cross-file consistency parity check (formerly id `[ * ]`)
   keeps its semantics; ordering becomes:

   ```
   [1/7] Status drift (line-anchored, iter-145)
   [2/7] Status drift (blockquote-tolerant, iter-147)
   [3/7] Value drift (count parity)
   [4/7] Toolchain version drift
   [5/7] ISR wording drift
   [6/7] Structural / link drift
   [7/7] Checklist ↔ runner parity (iter-151)
   [ * ] Cross-file consistency (AGENTS R-rules vs CLAUDE Critical Rules)
   ```

   Total final count printed by the runner becomes `8/8 PASS`
   (7 numbered classes + the `[ * ]` parity check).

2. **AC #2 — TypeScript only (R1).** Implementation is in
   `scripts/audit-docs.ts` only — no new file, no new
   dependency.

3. **AC #3 — Reads `AGENTS.md` directly.** The new class uses
   `readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8')` to
   load the canonical reference. It then parses the
   `## Doc-Quality Audit Checklist` section to extract:
   - All `### ` sub-section headings under the checklist.
   - All fenced code blocks (regex one-liners) under each
     sub-section.

4. **AC #4 — Heading parity.** Every sub-section heading in
   the AGENTS.md checklist must map 1:1 to an entry in the
   `classes: AuditClass[]` array (matched by a normalized
   substring). The 6 grep-based drift classes plus the
   cross-file consistency block produce the following expected
   heading set (from current AGENTS.md content):

   - `Runner` — meta heading; **whitelisted** (the runner
     itself is described, not implemented as an audit class).
   - `Value drift (stale numbers / counts / versions)` →
     class 3 + class 4 (value drift fans out into spec/package/
     app counts in class 3 and toolchain version mentions in
     class 4 — the heading is **partitioned** between two
     audit classes).
   - `Status / state drift (claims that have moved on)` →
     class 1 + class 2 + class 5 (status drift fans into
     line-anchored / blockquote-tolerant in classes 1+2; ISR
     wording drift partitions out as class 5).
   - `Structural / link drift` → class 6.
   - `Cross-file consistency (added iter 148)` → cross-file
     parity class (`[ * ]`).
   - `Rerun cadence` — meta heading; **whitelisted** (it's a
     reference table, not a drift class).

   The heading-to-class mapping is encoded as an explicit
   `EXPECTED_MAPPING` table in the new audit class, with
   inline comments citing the iter that established each entry.

5. **AC #5 — Class-count parity.** The new class additionally
   asserts that `classes.length === EXPECTED_RUNNER_COUNT`
   (currently `7` — i.e. the 6 numbered classes + the new
   self-parity class itself; the `[ * ]` cross-file class is
   counted as the 8th entry). If a future iteration adds a
   runner class but forgets to update either the
   `EXPECTED_MAPPING` or `EXPECTED_RUNNER_COUNT`, the new
   audit FAILs with the actual count diff.

6. **AC #6 — Self-exclusion safety.** The new class must not
   self-trigger (i.e. when scanning AGENTS.md it must skip the
   new `### Checklist ↔ runner parity` heading the same way
   the existing `Runner` heading is whitelisted). This avoids
   a circular-dependency where adding the audit class
   immediately FAILs because the AGENTS.md text doesn't yet
   describe the new class. **The AGENTS.md text update must
   land in the same commit**, in which case the heading
   becomes a tracked entry in `EXPECTED_MAPPING`, not a
   whitelisted exclusion. (Decided this iteration:
   `Checklist ↔ runner parity (added iter 151)` joins the
   tracked entries.)

7. **AC #7 — PASS on iter-151 commit.** The new class returns
   `pass: true` on the iter-151 commit state — i.e. the
   AGENTS.md update + the audit-docs.ts update are aligned
   from the moment they land. First run produces `8/8 PASS`.

8. **AC #8 — Iter-citation comments.** Every entry in
   `EXPECTED_MAPPING` carries an inline comment citing the
   iteration that established the heading (matches the
   iter-145 codification convention from the rest of the
   script).

9. **AC #9 — Output format.** The new class follows the same
   output format as the existing classes:
   - One-line `PASS — 0 hits` / `FAIL — N hits` summary.
   - On FAIL, per-hit lines giving the heading-set diff
     (e.g. `+ Foo drift (heading in AGENTS.md, no runner
     class)` and `- Bar drift (runner class, no AGENTS.md
     heading)`).
   - `notes[]` lists the actual heading set discovered and
     the runner class set discovered, for human readability.

10. **AC #10 — AGENTS.md update.** AGENTS.md gets a new
    `### Checklist ↔ runner parity (added iter 151)`
    sub-section under `## Doc-Quality Audit Checklist`,
    explaining that the script self-validates against this
    section's text on every run, with a 1-paragraph summary
    + a code-fence listing the canonical mapping. The
    `### Runner` sub-section is updated to mention the new
    self-parity class as one of the 7 classes the script
    runs.

11. **AC #11 — `### ` heading count assertion.** Update the
    AGENTS.md § Doc-Quality Audit Checklist to maintain a
    canonical claim like "7 drift classes + 2 meta sub-
    sections (Runner / Rerun cadence) = 9 `### ` headings".
    The new audit class verifies this claim is still true on
    every run.

12. **AC #12 — Documentation propagation.** All affected docs
    bumped:
    - `docs/log.md` — full iter-151 entry following the
      established format (Headline / What landed / Why /
      Verification / Files touched / Pattern progression /
      Saga status / Next Steps).
    - `docs/index.md` — iteration descriptor 150 → 151.
    - `.specify/project.md` Current State header bumped 150
      → 151 with the new audit class line.
    - `CLAUDE.md` Common Commands `pnpm audit:docs` row
      updated to mention 7 drift classes (was 6).
    - `README.md` Commands table row similarly updated.

13. **AC #13 — Baseline preserved.** All previous PASS counts
    (status drift, value drift, toolchain version drift, ISR
    wording drift, structural/link drift, cross-file
    consistency) remain at zero hits on iter-151. No
    regression in any existing class.

14. **AC #14 — `pnpm typecheck` clean.** The audit-docs.ts
    edit must satisfy TypeScript strict mode with no `any`
    types and no `@ts-expect-error` comments.

15. **AC #15 — `pnpm lint` clean.** The audit-docs.ts edit
    must satisfy ESLint with zero warnings and zero errors.

## Out of Scope

- **Regex equivalence checking.** Verifying that the regex
  literal in the AGENTS.md fenced code block is *behaviorally
  equivalent* to the regex object compiled in the runner is
  out of scope (would require a regex-AST library or a
  fuzzing harness). The current parity check verifies that
  every checklist heading has a corresponding runner class —
  not that the regex semantics are identical. If a future
  iteration tightens the regex in one location but forgets
  the other, that drift surfaces as test failures or unit
  test churn, not as an audit-class FAIL.

- **Auto-generation of EXPECTED_MAPPING from AGENTS.md
  parsing.** The mapping table is hand-maintained with
  iter-citation comments. Auto-generation would require
  parsing AGENTS.md as Markdown AST and inferring class
  ownership — over-engineered for a 7-entry table.

- **CI-blocking gate.** The audit class is already CI-gated
  by virtue of being part of `pnpm audit:docs`, which is
  wired into `.github/workflows/ci.yml` as of iter-150. No
  additional CI work needed.

- **External whitelist file.** The whitelist of meta-only
  sub-section headings (`Runner`, `Rerun cadence`) is
  hardcoded in the script with iter-citation comments —
  same convention as the existing audit classes.

## Notes on naming

The audit class name `auditChecklistRunnerParity` was chosen
over alternatives:

- ❌ `auditSelfParity` — ambiguous (parity of what against
  what?).
- ❌ `auditAgentsMdParity` — too narrow (the canonical
  reference might move to a different file in a future
  iteration).
- ✅ `auditChecklistRunnerParity` — explicit: parity between
  the checklist (canonical reference, currently in AGENTS.md)
  and the runner (canonical implementation, currently in
  scripts/audit-docs.ts). Both names map directly to the two
  artefacts under audit.

## Pattern progression confirmation

Iter-151 is the 7th maturation step in the doc-quality audit
pattern that began at iter-132. Prior maturation steps:

- **iter 132 → 144**: single-file value/status/structural
  drift fixes.
- **iter 145**: institutionalize the playbook as in-tree text
  (AGENTS.md).
- **iter 149**: institutionalize as runnable script
  (`pnpm audit:docs`).
- **iter 150**: institutionalize as CI-blocking gate.
- **iter 151**: institutionalize as self-validating runner
  (this iteration).

The natural follow-up — should iter-152+ surface a new drift
class — is **iter-152: regex-equivalence checking** (a
behaviorally-equivalent regex check between AGENTS.md fenced
code blocks and runner regex literals). That iteration is
deferred until a real regex-divergence drift surfaces.
