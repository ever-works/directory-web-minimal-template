# Feature: `scripts/audit-docs.ts` — executable codification of the doc-quality audit checklist

> **Status: ✅ RESOLVED (iteration 149, 2026-04-27).** Specified
> and executed in the same cron tick. The new
> `scripts/audit-docs.ts` (TypeScript, run via `tsx`) wraps the
> 5 grep-based drift classes documented in
> `AGENTS.md § Doc-Quality Audit Checklist` (Status/state, Value,
> Toolchain version, ISR wording, Structural/link, Cross-file
> consistency) into a single `pnpm audit:docs` command. The
> script reports each class as PASS/FAIL with line-anchored
> output for any hits, and exits non-zero if any class flags real
> drift — so the audit can be CI-gated in a future iteration.
> Baseline run: **6/6 PASS / 0 hits** (matches iter-148 manual
> grep results). The R15 spec-first discipline is preserved
> because the script's behaviour is a 1:1 codification of the
> already-specified greps in the audit checklist; no new audit
> semantics are introduced.

## Why

Iter 145 codified the audit checklist as 5 grep blocks in
`AGENTS.md`. Iter 146 found a miss-target (the line-anchored
Status regex skipped `>`-blockquote-prefixed status lines).
Iter 147 tightened the regex AND ran it inline as the canonical
audit. Iter 148 surfaced a new drift class (cross-file
consistency between `AGENTS.md` and `CLAUDE.md`) and added a
6th block.

After 4 consecutive iterations of the codify-then-execute pattern
(145 → 148), the friction of running 6 separate grep blocks by
hand on every iteration has become the dominant per-iteration
cost. The greps are mechanically deterministic — there is no
human judgment in the *running* of them, only in the
*interpretation* of any non-empty results. Codifying the runner
collapses ~15 separate grep invocations into one `pnpm audit:docs`
call, eliminates copy-paste error from manual re-running, and
produces a stable PASS/FAIL signal that future CI work can build
on.

The script is intentionally a thin wrapper: each drift class is
a discrete function that runs the exact regex from the audit
checklist and reports its hits. The script does not interpret
hits — that judgment stays human (e.g., "this 🗄️ SUPERSEDED
match is correctly resolved, not a real flag"). The script just
makes the grep step trivial to invoke.

## Acceptance Criteria

1. **AC #1 — Single command.** `pnpm audit:docs` runs all 6
   audit classes in one shot.

2. **AC #2 — TypeScript only (R1).** Implementation is
   `scripts/audit-docs.ts`, run via `tsx` (already a root-level
   workspace devDependency via `apps/web` content-clone script).

3. **AC #3 — Codification of the existing checklist.** Each
   audit class wraps the exact regex from
   `AGENTS.md § Doc-Quality Audit Checklist`. No new audit
   semantics. The script is the canonical *runner*, the
   checklist remains the canonical *reference*.

4. **AC #4 — Six audit classes, one per grep block.**
   - Status / state drift (line-anchored, iter-145 regex)
   - Status / state drift (blockquote+bold-tolerant, iter-147
     regex)
   - Value drift (rule-count cross-check `15 vs 17` per
     iter-148)
   - Toolchain version drift (Astro/Vitest/Tailwind/Preact/
     TypeScript/ESLint mention regex)
   - ISR wording drift (`fully static\|no SSR`)
   - Structural / link drift (`](\.\./` relative-link regex)
   - Cross-file consistency (rule-count parity between
     `AGENTS.md` R-rules and `CLAUDE.md` numbered Critical
     Rules)

5. **AC #5 — Whitelist semantics.** Status drift and ISR
   wording drift greps include known-resolved sigil filters
   (`✅`, `🗄️`) and known-narrative-context paths (the
   `AGENTS.md` checklist itself, where the greps appear as
   *literal patterns* — they would otherwise self-match). Each
   whitelisted exclusion has an inline comment citing the iter
   that established it.

6. **AC #6 — PASS/FAIL exit code.** Script exits `0` if all 6
   classes return zero non-whitelisted hits; exits `1`
   otherwise. The exit code is suitable for future CI gating
   without script-level changes.

7. **AC #7 — Hit reporting.** For any class that flags hits,
   the script prints the file:line:context output of the grep
   so a human can immediately judge whether it's real drift or
   a whitelisted false-positive.

8. **AC #8 — Cross-file rule-count parity.** Class 6 reads
   `AGENTS.md` and `CLAUDE.md` directly with `node:fs`, counts
   `^### R[0-9]+:` matches in AGENTS and `^[0-9]+\.\s+\*\*`
   matches in CLAUDE, and asserts the pair is `15 vs 17` per
   iter-148. If the pair drifts in either direction, class 6
   FAILs with the actual counts surfaced in the output.

9. **AC #9 — Wired into root `package.json`.** Add
   `"audit:docs": "tsx scripts/audit-docs.ts"` to the root
   `scripts` block so it's discoverable via `pnpm audit:docs`.

10. **AC #10 — Documentation propagation.** AGENTS.md
    Doc-Quality Audit Checklist gets a "Runner" subsection
    pointing at `pnpm audit:docs`. CLAUDE.md Common Commands
    gets the new line. README.md Commands table gets the new
    row. `.specify/project.md` Current State adds the new tool
    artefact line. `docs/index.md` iteration descriptor flips
    to 149.

11. **AC #11 — Baseline run.** First run of `pnpm audit:docs`
    on the iter-149 lockfile state returns `6/6 PASS / 0 hits`
    matching the iter-148 manual grep results (same project
    state, same audit semantics → same results).

12. **AC #12 — Lockfile / dep-graph stability.** No new runtime
    dependencies introduced. `tsx` is already a workspace
    devDependency. The script uses only `node:fs`,
    `node:child_process` (`execSync` to invoke `git grep` /
    `grep`), and `node:path`. Lockfile delta: zero.

## Out of Scope

- **CI gating.** The script's `process.exit(1)` semantics make
  it CI-ready, but actually wiring it into `.github/workflows/
  ci.yml` as a gate is deferred to a future iteration. Reason:
  baseline must run clean for several iterations before
  gating; gating before the baseline is stable risks blocking
  iterations on transient false-positives.

- **New audit classes.** This iteration only codifies the 6
  classes from iter-148's checklist. New drift classes
  surfaced in iter-149+ would be added as separate
  `auditClassN()` functions following the same pattern.

- **Auto-fix.** The script reports drift; it does not attempt
  to auto-fix any hits. The iter-145 codification policy
  (reporter, not fixer) is preserved.

- **Whitelist file.** The whitelist is hardcoded in the script
  with iter-citation comments. A future iteration could
  externalise it to `.audit-docs-whitelist.json` if the list
  grows beyond ~10 entries.
