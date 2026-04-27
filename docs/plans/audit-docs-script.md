---
title: "scripts/audit-docs.ts — executable codification of the doc-quality audit checklist"
sidebar_label: "audit-docs script"
---

# scripts/audit-docs.ts — executable codification of the doc-quality audit checklist

> **Spec:** [`.specify/features/audit-docs-script.md`](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/audit-docs-script.md)
> **Status:** ✅ RESOLVED (iteration 149, 2026-04-27). Spec + plan
> + implementation landed in the same cron tick.
> **Iterations referenced:** 145 (codify the audit checklist in
> `AGENTS.md`), 146 (miss-target found in iter-145 regex), 147
> (regex tightened + ran inline as canonical audit), 148
> (cross-file consistency block added — 6th drift class).

## Why

The codify-then-execute meta-pattern from iters 145 → 148 has
matured to the point where the per-iteration cost of running 6
separate grep blocks by hand is the dominant friction. The greps
are mechanically deterministic — the *running* has no human
judgment, only the *interpretation* does. Codifying the runner
as a TypeScript script collapses the audit into one
`pnpm audit:docs` call.

## Steps

### Step 0 — Re-confirm baseline

Iter-148's manual greps returned `6/6 PASS / 0 hits`. The new
script should reproduce this exactly on the iter-149 lockfile
state (same project state + same audit semantics → same result).
If the script's first run flags any class as FAIL, that is a
real regression in the script (a regex was transcribed
incorrectly or a whitelist was forgotten), not a real drift.

### Step 1 — Author `scripts/audit-docs.ts`

Create the file at the repo root (`scripts/` directory is new —
this is the first root-level script). The file:

1. Defines an `AuditClass` interface:
   ```ts
   interface AuditClass {
     name: string;
     description: string;
     run: () => AuditResult;
   }
   interface AuditResult {
     pass: boolean;
     hits: string[];   // each entry: "file:line:context"
     notes?: string[]; // explanatory notes for whitelisted matches
   }
   ```

2. Implements 6 audit classes as functions, each wrapping the
   exact regex from `AGENTS.md § Doc-Quality Audit Checklist`:

   - `auditStatusDriftLineAnchored()` — iter-145 regex
     `^Status:.*PLANNED|^Status:.*SPECIFIED|^Status:.*DRAFT`
   - `auditStatusDriftBlockquoteTolerant()` — iter-147 regex
     `^>?\s*\*?\*?Status:\s+\*?\*?[^✅]` with `[^🗄]` post-filter
   - `auditValueDrift()` — count parity for `15 R-rules` /
     `17 numbered items` / `31 specs` / `48 CT cases` /
     `1122 Vitest tests`
   - `auditToolchainVersionDrift()` —
     `Astro [0-9]\.[0-9]\.[0-9]\|Vitest [0-9]\.[0-9]\.[0-9]\|...`
     vs current pinned versions parsed from
     `apps/web/package.json`
   - `auditISRWordingDrift()` — `fully static\|no SSR\|Fully static`
     with whitelisted paths (the AGENTS.md checklist itself
     contains the literal pattern; sample-basic's `astro.config.ts`
     is permanently pure-static so its docs correctly say "fully
     static"; etc.)
   - `auditStructuralLinkDrift()` — `\](\.\./` relative-link
     regex with whitelist for known iter-N narrative refs in
     `docs/log.md` (the iter-142 fix narrative cites the
     fixed-then-broken links inline)
   - `auditCrossFileConsistency()` — read `AGENTS.md` and
     `CLAUDE.md` directly with `node:fs`, count matches of
     `^### R[0-9]+:` and `^[0-9]+\.\s+\*\*` respectively, and
     assert the pair is `15 vs 17` per iter-148

3. Runs each class in sequence, prints a one-line summary per
   class (`PASS` / `FAIL <N hits>`), and a final aggregate
   summary (`6/6 PASS / 0 hits` or `M/6 PASS / N hits`).

4. Exits `0` on all-pass, `1` on any-fail.

### Step 2 — Wire `pnpm audit:docs`

Add to root `package.json` `scripts` block:

```json
"audit:docs": "tsx scripts/audit-docs.ts"
```

`tsx` is already a workspace devDependency via `apps/web` and
`apps/sample-*`. The root doesn't currently depend on `tsx`
directly, but pnpm's workspace hoisting puts `tsx` in the root
`node_modules/.bin` so the root-level script resolves
correctly.

### Step 3 — First run

Run `pnpm audit:docs` from the repo root. Expected output:

```
[1/6] Status drift (line-anchored, iter-145)             PASS — 0 hits
[2/6] Status drift (blockquote-tolerant, iter-147)       PASS — 0 hits
[3/6] Value drift (count parity)                         PASS — 0 hits
[4/6] Toolchain version drift                            PASS — 0 hits
[5/6] ISR wording drift                                  PASS — 0 hits
[6/6] Structural / link drift                            PASS — 0 hits
[*]  Cross-file consistency (AGENTS R-rules vs CLAUDE)  PASS — 15 vs 17 (expected)

6/6 PASS — no documentation drift detected.
```

(Class numbering: the cross-file class is presented as `[*]`
because it's a parity check rather than a hit-list class — the
expected output is `15 vs 17`, not zero.)

### Step 4 — Documentation propagation

Update the following files in the same commit:

1. **`AGENTS.md § Doc-Quality Audit Checklist`** — add a new
   "## Runner" subsection at the top of the checklist that
   reads:
   > **Runner**: `pnpm audit:docs` runs all 6 classes below in
   > one shot via `scripts/audit-docs.ts`. Use this as the
   > one-liner replacement for the manual grep blocks below;
   > the manual greps remain the canonical *reference* and the
   > script is the canonical *runner*.

2. **`CLAUDE.md § Common Commands`** — add the line:
   > `pnpm audit:docs        # Run the doc-quality audit checklist (6 classes; iter-149 codification of AGENTS.md greps)`

3. **`README.md § Commands`** table — add row:
   > `| pnpm audit:docs | Run the doc-quality audit checklist (6 classes; iter-149 codification of AGENTS.md greps; exits non-zero on drift). |`

4. **`.specify/project.md § Current State`** — bump iteration
   header to 149; add a line under "All dependencies" stating
   that `scripts/audit-docs.ts` is the new tool artefact.

5. **`docs/index.md`** — bump iteration descriptor 148 → 149
   with a 1-paragraph summary of the iter-149 work.

6. **`docs/log.md`** — add a full iter-149 entry following the
   established format (Headline / What was fixed / What was
   NOT touched / Verification / Files touched / Saga status /
   Next Steps).

### Step 5 — Verification

```bash
pnpm typecheck    # Expected: 23/23 FULL TURBO (script is at root, not under any tsconfig include scope)
pnpm lint         # Expected: 18/18 FULL TURBO + 0 warnings + 0 errors
pnpm audit:docs   # Expected: 6/6 PASS / 0 hits (matches iter-148 baseline)
```

### Step 6 — Commit

Single commit with all 8 file changes:

- NEW `scripts/audit-docs.ts`
- NEW `.specify/features/audit-docs-script.md`
- NEW `docs/plans/audit-docs-script.md`
- MOD `package.json` (1 line: scripts.audit:docs)
- MOD `AGENTS.md` (Runner subsection added)
- MOD `CLAUDE.md` (1 line in Common Commands)
- MOD `README.md` (1 row in Commands table)
- MOD `.specify/project.md` (iteration header + 1 line)
- MOD `docs/index.md` (iteration descriptor)
- MOD `docs/log.md` (iter-149 entry)

## Acceptance Criteria

(Mirrors `.specify/features/audit-docs-script.md` AC #1-#12.
Critical ones for plan execution:)

- [x] AC #1 — `pnpm audit:docs` runs and exits 0 on the
  iter-149 baseline.
- [x] AC #2 — Implementation is TypeScript via `tsx`.
- [x] AC #3 — Each audit class wraps the exact AGENTS.md regex.
- [x] AC #4 — All 6 classes implemented.
- [x] AC #5 — Whitelist semantics with iter-citation comments.
- [x] AC #6 — Exit `0` on all-pass, `1` on any-fail.
- [x] AC #7 — Hit reporting via `file:line:context` lines.
- [x] AC #8 — Cross-file rule-count parity asserts `15 vs 17`.
- [x] AC #9 — Wired into root `package.json`.
- [x] AC #10 — Documentation propagation across 6 files.
- [x] AC #11 — Baseline run returns `6/6 PASS`.
- [x] AC #12 — Lockfile delta zero.

## Outcome

(To be filled at iter-149 commit time.)
