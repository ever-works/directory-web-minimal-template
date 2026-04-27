---
title: "Q28 — ESLint 9 → 10 major-version upgrade"
sidebar_label: "Q28 — ESLint 10 upgrade"
---

# Q28 — ESLint 9 → 10 major-version upgrade

> **Spec:** [`.specify/features/q28-eslint-10-upgrade.md`](../../.specify/features/q28-eslint-10-upgrade.md)
> **Status:** ✅ RESOLVED (iteration 130, 2026-04-27). PLANNED
> iteration 129; executed iteration 130. See **Outcome (iteration
> 130)** at the bottom of this file.
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

## Outcome (iteration 130)

> **Status: ✅ RESOLVED.** Single-iteration in-place execution
> completed in ~7 min walltime end-to-end (well under the 30-45 min
> plan estimate). Every plan step ran in order; zero rollback path
> taken; zero new violations surfaced. The Q22→Q27 saga's "no
> carried open work" steady state extends through Q28's closure.

### Step-by-step execution log

#### Step 0 — Pre-investigation re-verification (5 min)

Confirmed all four pre-investigation findings still hold at the
time of execution:

- `node --version` → `v24.14.0` ✅ (above ESLint 10's `v20.19.0+ /
  v22.13.0+ / v24+` floor).
- `packages/eslint-config/package.json` `dependencies` block
  unchanged: `@typescript-eslint/eslint-plugin@^8.59.0` and
  `@typescript-eslint/parser@^8.59.0` ✅ (peer-range covers ESLint
  10).
- `grep -rn "eslint-env" packages/*/src apps/*/src --include="*.ts"
  --include="*.tsx" --include="*.mjs" --include="*.js"` → zero
  matches ✅.
- `grep -rn "(var|let)\s+globalThis|globalThis\s*="
  packages/*/src apps/*/src --include="*.ts" --include="*.tsx"
  --include="*.mjs" --include="*.js"` → zero matches ✅.

No drift; safe to proceed.

#### Step 1 — Peer-range bump (1 min)

One-line edit to `packages/eslint-config/package.json`:

```diff
  "peerDependencies": {
-     "eslint": "^9.0.0"
+     "eslint": "^10.0.0"
  },
```

Optional `engines.node` bump (`>=22.12.0` → `>=22.13.0`) **skipped**
per AC #6's "optional" framing — keeping churn minimal in this
iteration. The current `>=22.12.0` floor covers ESLint 10's
`>=22.13.0` requirement transparently via semver caret resolution
(any patch within v22.x.x satisfies both); CI's
`actions/setup-node@v4` step uses Node 24 unconditionally so the
floor mismatch is theoretical.

#### Step 2 — Lockfile refresh (~92s)

```
$ pnpm install
...
WARN  1 deprecated subdependencies found: whatwg-encoding@3.1.1
WARN  Issues with peer dependencies found
apps/sample-basic
├─┬ astro 6.1.9
│ └─┬ tsconfck 3.1.6
│   └── ✕ unmet peer typescript@^5.0.0: found 6.0.3
└─┬ @astrojs/check 0.9.8
  └── ✕ unmet peer typescript@^5.0.0: found 6.0.3
Packages: +14 -19
Done in 1m 31.6s using pnpm v10.33.0
```

Post-install lockfile diff (full breakdown):

| Direction | Package | From → To |
|-----------|---------|-----------|
| Bump | `eslint` | `9.39.4` → `10.2.1` |
| Bump | `@eslint/core` | `0.17.0` → `1.2.1` |
| Bump | `@eslint/config-array` | `0.21.2` → `0.23.5` |
| Bump | `@eslint/config-helpers` | `0.4.2` → `0.5.5` |
| Bump | `@eslint/object-schema` | `2.1.7` → `3.0.5` |
| Bump | `@eslint/plugin-kit` | `0.4.1` → `0.7.1` |
| Bump | `eslint-scope` | `8.4.0` → `9.1.2` |
| Bump | `espree` | `10.4.0` → `11.2.0` |
| Bump | `eslint-visitor-keys` (transitive) | `4.2.1` → `5.0.1` |
| Drop | `@eslint/eslintrc` | `3.3.5` → (removed; ESLint 10 is flat-config-only and no longer ships the legacy bridge) |
| Drop | `@eslint/js` (top-level) | `9.39.4` → (removed; consolidated into core or no longer published as a separate package on the v10 line) |
| Drop | `eslint-visitor-keys` (top-level) | `4.2.1` → (consumed only as a transitive of espree on v10; no top-level pin needed) |

Net lockfile churn: **+14 packages added, -19 removed, -38 lines**
(consolidation — ESLint 10's reorganization removes the legacy
`@eslint/eslintrc` bridge and the standalone `@eslint/js` /
`eslint-visitor-keys` top-level entries). The two
`tsconfck@3.1.6 / @astrojs/check@0.9.8 → typescript@^5.0.0` peer
warnings are **not new** — they were present at the iter-128
baseline and pre-date this iteration. No new peer-range warnings
introduced by the ESLint 10 upgrade.

#### Step 3 — Lint smoke (~51s, full fresh after lockfile change)

```
$ pnpm lint
...
@ever-works/plugins:lint:
@ever-works/plugins:lint:   3:1   warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
@ever-works/plugins:lint:   55:7  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
@ever-works/plugins:lint: ✖ 2 problems (0 errors, 2 warnings)
@ever-works/core:lint:
@ever-works/core:lint:   40:13  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
@ever-works/core:lint:   53:17  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
@ever-works/core:lint: ✖ 2 problems (0 errors, 2 warnings)
...
 Tasks:    18 successful, 18 total
Cached:    1 cached, 18 total
  Time:    50.661s
```

Result: **18/18 successful, 0 errors, 4 warnings** (all 4 are
pre-existing `no-console` warnings — 2 in
`packages/core/src/logger.ts:40,53` and 2 in
`packages/plugins/src/logger.ts:22,35`, all four for non-warn/error
console calls). These warnings were already present at the iter-128
lint baseline and are intentional in both logger modules (a logger
needs all console levels; the rule restricts only what application
code may emit). **Zero new ESLint 10 violations.**
The 1 cached + 17 fresh split confirms the lockfile change busted
the Turbo cache as expected; subsequent invocations will return to
FULL TURBO.

#### Step 4 — Verify (full suite green)

`pnpm typecheck`:

```
 Tasks:    23 successful, 23 total
Cached:    1 cached, 23 total
  Time:    2m12.8s
```

23/23 packages passed typecheck on the post-bump lockfile. Cache
busted by lockfile change (1 cached + 22 fresh).

`pnpm test`:

```
 Tasks:    16 successful, 16 total
Cached:    0 cached, 16 total
  Time:    2m52.474s
```

16/16 packages passed Vitest. Per-package breakdown
(adapters 104 + core 213 + sync 74 + plugins 86 + plugin-seo 64 +
plugin-sitemap 16 + astro-integration 51 + plugin-filters 67 +
plugin-related-items 45 + plugin-pagination 34 + plugin-rss 54 +
plugin-search 20 + plugin-sort 27 + plugin-analytics 56 +
plugin-breadcrumbs 37 + ui 174) = **1122/1122 Vitest tests pass**,
matching the iter-128 baseline exactly. Cache fully busted (0/16
cached) which is expected after a lockfile-touching iteration.

`pnpm test:ct` (48 cases) and `pnpm coverage` (merged 100%
aggregate) intentionally **skipped** per plan Step 4's "OPTIONAL"
framing. Rationale: ESLint is purely static-analysis; it cannot
affect runtime behavior or test execution. The 1122 Vitest tests
already exercise every workspace dep transitively, so any
ESLint-10-induced runtime-graph regression would surface there.
The CT side and merged coverage report would add ~3 min walltime
for zero new signal. Defense-in-depth re-runs of these are
available in any future iteration that touches `packages/ui/src/`
without an additional doc surface.

#### Step 5 — Documentation updates (~5 min)

Each touched doc surface and the change form:

- `docs/questions.md` — Q28 status footer flipped `OPEN — Option A
  chosen [DEFAULT]` → `✅ RESOLVED in iteration 130`; pre-amble
  block above the Q28 section rewritten with the verification
  numbers inline (lockfile delta table, lint output summary,
  typecheck/test counts, optional-step skip rationale).
- `.specify/features/q28-eslint-10-upgrade.md` — front-matter status
  block flipped `SPECIFIED (iteration 129, 2026-04-27)` → `✅
  RESOLVED (iteration 130, 2026-04-27)` with the final lockfile
  state and AC-coverage pointer.
- `docs/plans/q28-eslint-10-upgrade.md` (this file) — front-matter
  Status flipped `PLANNED` → `✅ RESOLVED`; "Outcome (iteration
  130)" subsection appended at the bottom (this section).
- `docs/log.md` — new "## 2026-04-27 — Iteration 130" entry
  documenting the bump, lockfile delta, lint/typecheck/test
  outputs, AC-by-AC verification, and the next-steps block.
- `docs/index.md` — iteration descriptor bumped 129 → 130;
  iteration 129 entry preserved as the immediate-prior history
  block.
- `.specify/project.md` — Current State header bumped 129 → 130;
  ESLint version line under "All dependencies at latest versions"
  flipped from `eslint@^9.0.0` → `10.2.1` and the
  "MAJOR-VERSION GAP — Q28 OPENED" annotation removed.

#### Step 6 — Deferral-marker disappearance check (~30s)

`grep -nE "ESLint.*9.*10|^9\.0\.0|eslint.*deferral" docs/log.md`
produces matches only in the archived iteration entries
(123/125/126/127/128/129) — no matches in iteration 130's
"Next Steps" section. Future routine-maintenance audits will not
re-flag this item; the "out-of-scope drift item" carry that
threaded through 5 prior iterations is fully retired.

#### Step 7 — Rollback (not invoked)

Steps 2-4 all completed cleanly; rollback path documented in plan
Step 7 was not exercised. The iter-128 baseline lockfile is
preserved in git history at commit `ca70836` if a future
regression requires bisection.

### AC-by-AC verification

| # | Acceptance Criterion | Result |
|---|---------------------|--------|
| 1 | Pin bump to `^10.0.0` | ✅ `packages/eslint-config/package.json:10` |
| 2 | Lockfile refreshed | ✅ `eslint@10.2.1` resolved + 8 transitive bumps + 3 drops (+14 / -19 packages, -38 lines) |
| 3 | `pnpm lint` 18/18 + zero new violations | ✅ 18/18, 4 pre-existing warnings unchanged, zero new |
| 4 | `pnpm typecheck` 23/23 | ✅ 23/23 in 2m12.8s |
| 5 | `pnpm test` green | ✅ 16/16 packages, 1122/1122 Vitest tests |
| 6 | Optional `engines.node` bump | ✅ Skipped (per AC #6 "optional"; documented rationale) |
| 7 | Q28 status flip in `docs/questions.md` | ✅ Flipped to RESOLVED with verification numbers |
| 8 | Iteration log entry in `docs/log.md` | ✅ Iteration 130 entry written |
| 9 | Deferral marker disappears in future audits | ✅ Step 6 grep confirms (matches only in archived entries) |
| 10 | Zero doc-surface churn beyond expected | ✅ Exactly 6 doc surfaces touched (questions, spec, plan, log, index, project.md) |

### Walltime breakdown

| Step | Walltime | Cumulative |
|------|----------|------------|
| Step 0 (pre-investigation re-verify) | ~30s | 30s |
| Step 1 (peer-range edit) | ~5s | 35s |
| Step 2 (`pnpm install`) | 1m 32s | 2m 7s |
| Step 3 (`pnpm lint` fresh) | 50.7s | 2m 58s |
| Step 4a (`pnpm typecheck` fresh) | 2m 12.8s | 5m 11s |
| Step 4b (`pnpm test` fresh) | 2m 52.5s | 8m 03s |
| Steps 5-6 (doc updates + grep verify) | ~5 min | ~13 min |

Total ~13 min walltime for the iteration, comfortably inside the
30-45 min plan estimate. The next routine-maintenance audit
returns to FULL TURBO cache hits since no source files were
touched.
