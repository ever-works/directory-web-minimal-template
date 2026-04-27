---
title: "Q28 — ESLint 9 → 10 major-version upgrade"
sidebar_label: "Q28 — ESLint 10 upgrade"
---

# Q28 — ESLint 9 → 10 major-version upgrade

> **Spec:** [`.specify/features/q28-eslint-10-upgrade.md`](../../.specify/features/q28-eslint-10-upgrade.md)
> **Status:** PLANNED (iteration 129, 2026-04-27).
> **Iterations referenced:** 119 (monocart floor bump pattern),
> 121 (Phase 6c CI gate hard-fail), 123/125/126/127/128 (each
> flagged ESLint 9→10 as out-of-scope drift), 128 (isomorphic-git
> caret-range bump pattern + the `pnpm update` playbook correction).

## Why

Pin `eslint: ^9.0.0` in `packages/eslint-config/package.json`
peerDependencies vs. npm `latest` `10.2.1`. Five consecutive
routine-maintenance audits (iters 123/125/126/127/128) flagged this
as the single out-of-scope drift item with the same deferral
rationale. After iteration 129's pre-investigation, the upgrade
surface reduces to a one-line peer-range bump + lockfile refresh +
lint smoke test. The dread baked into the deferral framing was
correct *before* the changelog was read; after reading, the upgrade
is bounded.

## Steps

### Step 0 — Re-verify pre-investigation (5 min)

Before the bump lands, confirm the iteration-129 findings still
hold:

```bash
# Confirm Node version
node --version
# Expected: v24.x or v22.13.x or v20.19.x+ (any of these passes)

# Confirm @typescript-eslint pin
grep -h "@typescript-eslint" packages/eslint-config/package.json
# Expected: "@typescript-eslint/eslint-plugin": "^8.59.0",
#           "@typescript-eslint/parser": "^8.59.0"

# Confirm zero source usages of removed APIs
grep -rn "eslint-env" packages/*/src apps/*/src --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.js"
# Expected: zero matches
grep -rn "var globalThis\|let globalThis\|globalThis\s*=" packages/*/src apps/*/src --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.js"
# Expected: zero matches
```

If any of the above produces unexpected output (Node downgraded,
`@typescript-eslint` peer-range narrowed, source pattern that the
spec assumed was zero now non-zero), pause and re-evaluate. Update
Q28 in `docs/questions.md` and re-spec before proceeding.

### Step 1 — Bump the peer-range (1 min)

Edit `packages/eslint-config/package.json`:

```diff
  "peerDependencies": {
-     "eslint": "^9.0.0"
+     "eslint": "^10.0.0"
  },
```

(Optional, if comfortable) edit `package.json` (root):

```diff
  "engines": {
-     "node": ">=22.12.0"
+     "node": ">=22.13.0"
  },
```

The `engines.node` bump is OPTIONAL per Q28 AC #6 — skip if you
prefer to keep churn minimal in this iteration.

### Step 2 — Refresh the lockfile (~30s)

```bash
pnpm install
```

Expected output:

- `eslint` resolves to `10.x.x` (current `latest` is 10.2.1).
- `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
  stay at `8.59.x` (their peer-range covers ESLint 10).
- Lockfile updates: ~3-5 entries (the eslint package itself + its
  internal deps `@eslint/js`, `@eslint/eslintrc`, `eslint-scope`,
  `espree` if those bumped in lock-step).
- Zero peer-range warnings beyond what was present pre-bump.
  - If `pnpm install` reports a NEW peer-range warning that wasn't
    present in the iter-128 baseline, capture it in Step 4's log
    entry. Common candidates: `@eslint/js` floor, `eslint-scope`
    floor.

If `pnpm install` exits non-zero with a peer-range error (not a
warning), pause and read the error: it likely means a transitive
dep needs simultaneous bumping. Fall back to Option B (phased
peer-range `^9.0.0 || ^10.0.0` for one iteration to soak) or open
a sub-question.

### Step 3 — Lint smoke (~15s)

```bash
pnpm lint
```

Expected output: 18/18 successful. The first run after the bump
will be FULL FRESH (no Turbo cache hit) since the lockfile changed
— expect ~30-45s walltime. Subsequent runs return to FULL TURBO
cache hits.

If `pnpm lint` reports new violations:

1. **Easy fix**: an ESLint 10 rule flags an obvious code smell
   (e.g. unused `globalThis` reference). Fix inline.
2. **Hard fix**: a new rule flags load-bearing code. Open a
   follow-up Q (Q29) describing the violation and the fix path.
   Disable the rule TEMPORARILY in `index.mjs` with a JSDoc-style
   comment citing Q29.
3. **Schema strictening** (e.g. our `func-names` config no longer
   parses): unlikely since our rule list is small (6 rules) and
   none use complex schemas. If it happens, fix the schema inline
   per the changelog.

### Step 4 — Verify (5 min)

```bash
pnpm typecheck   # 23/23 expected (FULL FRESH first run, ~2m)
pnpm test        # full 1170-test suite green expected (1122 Vitest + 48 CT)
pnpm coverage    # OPTIONAL — 100% aggregate stays unchanged (ESLint doesn't touch source)
```

The `pnpm coverage` step is OPTIONAL because ESLint 10 doesn't
touch source coverage; iter-124's 100% aggregate numbers stay
authoritative. Run it only if you want defense-in-depth.

### Step 5 — Documentation updates (10 min)

- `docs/questions.md` Q28 — status: `OPEN — Option A chosen [DEFAULT]`
  → `✅ RESOLVED in iteration N` with the verification numbers
  inline.
- `docs/log.md` — new "## 2026-04-27 — Iteration N" section
  documenting:
  - Pin diff (1-line in `package.json`, optional 1-line in root
    `package.json`).
  - Lockfile entry-pair count (e.g. "5 lockfile entries updated:
    eslint@10.2.1, @eslint/js@10.2.1, eslint-scope@8.x, espree@10.x,
    @eslint/eslintrc@3.x").
  - `pnpm install` walltime + peer-range warning count vs. baseline.
  - `pnpm lint` walltime + violation count + any rule that newly
    fired (with how it was resolved — fix inline / disable with
    Q29 cite / etc.).
  - `pnpm typecheck` + `pnpm test` outputs.
- `docs/index.md` — iteration descriptor bumped N-1 → N; iteration
  N-1 entry preserved as the next history block.
- `.specify/project.md` — Current State header bumped N-1 → N;
  add a new bullet under V8 coverage section noting "ESLint 10.x
  adopted in iteration N".
- `.specify/features/q28-eslint-10-upgrade.md` — front-matter
  status `SPECIFIED (iteration 129)` →
  `✅ RESOLVED (iteration N)` with the final lockfile state.
- `docs/plans/q28-eslint-10-upgrade.md` (this file) — append an
  "Outcome (iteration N)" subsection mirroring the q22 Phase 6c/6d
  outcome blocks.

### Step 6 — Confirm deferral marker disappearance (1 min)

After Step 5 lands, future routine-maintenance audits should NOT
mention "ESLint 9 → 10" as an out-of-scope drift item. Verify by
grep:

```bash
grep -n "ESLint.*9.*10\|^9\.0\.0\|eslint.*deferral" docs/log.md | head
```

Expected: matches only in archived iteration entries (123/125-128),
not in iteration N's "Next Steps" section. If iteration N's "Next
Steps" still carries the deferral marker, fix the wording.

### Step 7 — Rollback (only if Steps 2-4 fail)

```bash
git checkout -- packages/eslint-config/package.json package.json pnpm-lock.yaml
pnpm install   # restore the iter-128 baseline lockfile
```

Then update `docs/questions.md` Q28 with a new section labelled
"Iteration N attempt did not stabilize" and capture the failure
shape. Q28 reopens with Option B (phased peer-range) or Option A
revisited after the underlying issue is resolved.

## File list (touched)

| File                                                                          | Action  |
|-------------------------------------------------------------------------------|---------|
| `packages/eslint-config/package.json`                                         | EDIT (1-line peer-range bump) |
| `package.json` (root)                                                         | EDIT (optional 1-line `engines.node` bump) |
| `pnpm-lock.yaml`                                                              | EDIT (~3-5 entries refreshed by `pnpm install`) |
| `.specify/features/q28-eslint-10-upgrade.md`                                  | CREATE (this iteration's spec; iteration 129) |
| `docs/plans/q28-eslint-10-upgrade.md`                                         | CREATE (this file) |
| `docs/questions.md`                                                            | EDIT (Q28 added in iteration 129; status flipped on execution iteration) |
| `docs/log.md`                                                                  | EDIT (iteration 129 entry now; execution-iteration entry later) |
| `docs/index.md`                                                                | EDIT (iteration descriptor + new spec/plan rows) |
| `.specify/project.md`                                                          | EDIT (Current State header bumped on each touch) |

## Phase sequencing (likely iterations)

| Phase | Iteration | Effort | Risk |
|-------|-----------|--------|------|
| Spec + plan authorship (this) | 129 | ~30-45 min | Low (doc-only) |
| Step 0 (re-verify pre-investigation) | 130+ | ~5 min | Very low |
| Steps 1-3 (bump + install + lint) | same | ~15 min | Low |
| Step 4 (verify typecheck + test) | same | ~5 min | Low |
| Step 5 (doc updates) | same | ~10 min | Low |
| Step 6 (verify deferral disappears) | same | ~1 min | Trivial |

Total estimated effort to close: **30-45 min, single-iteration**.
The cron cadence supports this comfortably — the upgrade is small
enough to fit in one autonomous iteration without risk.

## Cross-reference

- Spec: `.specify/features/q28-eslint-10-upgrade.md` (this iteration)
- Iteration 119 commit `746ecd6` — `monocart-coverage-reports` floor
  bump pattern (same shape as Q28's eslint peer-range bump).
- Iteration 128 commit `ca70836` — `isomorphic-git` caret-range
  bump pattern + the `pnpm update` playbook correction.
- ESLint 10 migration guide: https://eslint.org/docs/latest/use/migrate-to-10.0.0
- typescript-eslint dependency-versions matrix: https://typescript-eslint.io/users/dependency-versions
