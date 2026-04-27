# Feature: Q28 — ESLint 9 → 10 major-version upgrade

> **Status: ✅ RESOLVED (iteration 130, 2026-04-27).** Specified
> iteration 129; executed iteration 130. Final lockfile state:
> `eslint@10.2.1` + transitive bumps (`@eslint/core@1.2.1`,
> `@eslint/config-array@0.23.5`, `@eslint/config-helpers@0.5.5`,
> `@eslint/object-schema@3.0.5`, `@eslint/plugin-kit@0.7.1`,
> `eslint-scope@9.1.2`, `espree@11.2.0`,
> `eslint-visitor-keys@5.0.1`); legacy `@eslint/eslintrc@3.3.5` and
> standalone top-level `@eslint/js@9.39.4` /
> `eslint-visitor-keys@4.2.1` dropped (consolidation). Net lockfile
> churn: +14 / -19 packages, -38 lines. `pnpm lint` 18/18 clean
> (zero new violations; 2 pre-existing `no-console` warnings carry
> forward unchanged). `pnpm typecheck` 23/23. `pnpm test` 16/16
> packages, 1122/1122 Vitest tests. Optional `engines.node` bump
> skipped to keep churn minimal (`>=22.12.0` already covers ESLint
> 10's `>=22.13.0` floor via semver). All 10 acceptance criteria
> satisfied — see Outcome subsection in
> `docs/plans/q28-eslint-10-upgrade.md` for AC-by-AC verification.

## Description

Iterations 123/125/126/127/128's routine-maintenance dep audits all
flagged ESLint 9 → 10 as the single out-of-scope drift item: pin
`eslint: ^9.0.0` in `packages/eslint-config/package.json`
peerDependencies vs. npm `latest` `10.2.1`. Each audit deferred with
the same rationale: "major version bumps require manual review of the
changelog (config-format breaks, plugin compat, etc.) and are not a
fit for the cron cadence."

The deferral was conservative-correct *before* the changelog was
read. After iteration 129's pre-investigation, the upgrade surface is
remarkably small:

| Concern | Status |
|---------|--------|
| Flat config required (eslintrc removed) | ✅ already in flat config since project inception |
| Node.js v20.19.0+ / v22.13.0+ / v24+ | ✅ Node v24.14.0 local; CI on Node 24 |
| `@typescript-eslint` peer-range covers ESLint 10 | ✅ `^8.59.0` declares `eslint: ^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` |
| Removed deprecated `context.getCwd()` etc. | ✅ no usages in source (no custom plugins) |
| `eslint-env` comments now error | ✅ no usages in source |
| `no-shadow-restricted-names` reports `globalThis` | ✅ no `globalThis` shadowing in source |
| `eslint:recommended` opt-in changes | N/A — config does not extend `recommended` |
| Other rule schema tightening (`radix`, `func-names`, etc.) | N/A — those rules not in our 6-rule config |

The upgrade is therefore a **single one-line peer-range bump** in
`packages/eslint-config/package.json` plus a `pnpm install` + `pnpm
lint` verification round.

## User Stories

- As a **maintainer**, I want the dep matrix free of major-version
  drift so that every routine audit reports "zero out-of-scope items"
  and the autonomous cron cadence can stay autonomous.
- As an **AI agent**, I want the doc surfaces (`docs/log.md`,
  `docs/index.md` descriptors) free of carried "ESLint 10 deferral"
  notes that go nowhere.
- As a **reviewer**, I want ESLint's latest rule additions to be
  picked up by future autonomous iterations without each iteration
  having to re-evaluate "should we upgrade?"

## Acceptance Criteria

1. **AC #1 — Pin bump.** `packages/eslint-config/package.json`
   `peerDependencies.eslint` field changes from `"^9.0.0"` to
   `"^10.0.0"`. (Optionally also `^9.0.0 || ^10.0.0` if Option B is
   selected — but the default is Option A: narrow to `^10.0.0` only.)
2. **AC #2 — Lockfile refresh.** `pnpm-lock.yaml` resolves `eslint`
   to a `10.x.x` version (current `latest` is 10.2.1). `pnpm install`
   reports no peer-range warnings beyond what was present before the
   bump.
3. **AC #3 — Lint smoke.** `pnpm lint` reports 18/18 successful
   across the workspace matrix. Zero new violations introduced by
   ESLint 10's expanded recommended set or stricter rule schemas
   — verified by reading the lint output, not just exit code (a
   clean exit can hide a `--quiet`'d warning channel).
4. **AC #4 — Typecheck stays clean.** `pnpm typecheck` reports 23/23
   successful. The bump should not affect typecheck (ESLint and
   `tsc --noEmit` are independent), but verified to confirm no
   indirect breakage (e.g. a shared transitive dep that updates
   simultaneously).
5. **AC #5 — Tests stay green.** `pnpm test` reports the full
   1170-test suite passing (or whatever the count is at execution
   time — must be ≥ pre-bump). Defensive: ESLint changes do not
   touch runtime, but a transitive-dep bounce could.
6. **AC #6 — Optional `engines.node` bump.** If chosen,
   `package.json` `engines.node` changes from `">=22.12.0"` to
   `">=22.13.0"` to match ESLint 10's floor verbatim. Skip if the
   maintainer prefers to avoid churn.
7. **AC #7 — Q28 status flips.** `docs/questions.md` Q28 status
   changes from `OPEN — Option A chosen [DEFAULT]` to
   `✅ RESOLVED in iteration N` with the verification numbers and
   any rule-violation findings inline.
8. **AC #8 — Iteration log entry.** `docs/log.md` gets a new
   "## 2026-04-27 — Iteration N: Q28 — ESLint 10 upgrade landed"
   section near the top documenting:
   - The pin diff.
   - Lockfile entry-pair changes (count of `eslint@10.x` entries vs.
     `eslint@9.x` entries, mirroring iter-128's `isomorphic-git`
     entry).
   - `pnpm install` output (peer-range warnings, transitive-dep
     adds/drops).
   - `pnpm lint` / `pnpm typecheck` / `pnpm test` outputs.
   - Whether any new ESLint 10 rule fired and how it was resolved
     (fix inline / disable with cite to a follow-up Q / etc.).
9. **AC #9 — Status flip in routine-maintenance carry.** Future
   `docs/log.md` iteration entries no longer include "ESLint 9 → 10
   major-version gap" in the routine-maintenance audit table or the
   "Next Steps" section. The deferral marker disappears.
10. **AC #10 — `docs/architecture/testing-runners.md` and other doc
    surfaces stay consistent.** The architecture / spec docs do not
    cite ESLint version numbers explicitly (verified by
    `grep -rn "eslint.*\^9\|eslint.*\^8\|eslint 9\|eslint 8" .specify
    docs README.md` — only the package.json should carry the pin).
    No doc churn beyond the log entry + Q28 status flip + iteration
    descriptor in `docs/index.md` + `.specify/project.md` Current
    State header.

## The fix

```diff
  // packages/eslint-config/package.json
  {
      "name": "@ever-works/eslint-config",
      "version": "0.1.0",
      "private": true,
      "type": "module",
      "exports": {
          ".": "./index.mjs"
      },
      "peerDependencies": {
-         "eslint": "^9.0.0"
+         "eslint": "^10.0.0"
      },
      "dependencies": {
          "@typescript-eslint/eslint-plugin": "^8.59.0",
          "@typescript-eslint/parser": "^8.59.0"
      }
  }
```

Optionally:

```diff
  // package.json (root)
  {
      ...
      "engines": {
-         "node": ">=22.12.0"
+         "node": ">=22.13.0"
      },
      ...
  }
```

That is the entire source-side surface.

## Workspace consumers (no changes required)

The 17 `eslint.config.js` shims under `packages/*/eslint.config.js`
and `apps/*/eslint.config.js` are all 3-line files of the shape:

```js
import config from '@ever-works/eslint-config';
export default config;
```

These do not pin ESLint directly — they consume the config via the
workspace dep, which inherits the peer-range from
`@ever-works/eslint-config`'s `peerDependencies.eslint`. No churn at
the consumer layer.

## ESLint 10.0.0 changelog cross-check (per pre-investigation)

| Change | Affects us? | Why |
|--------|-------------|-----|
| Node v20.19.0+ / v22.13.0+ / v24+ floor | No | Local + CI both Node 24 |
| Flat config required (eslintrc removed) | No | Already on flat config |
| `eslint-env` now errors | No | Zero usages in source |
| `context.getCwd()` etc. removed | No | No custom plugins |
| `SourceCode` legacy methods removed | No | No custom plugins |
| Fixer methods string-only | No | No custom plugins |
| `Program` AST range expanded | No | No custom plugins |
| `nodeType` removed from LintMessage | No | No reporter consumers |
| `func-names` schema strict | No | Rule not in config |
| `no-invalid-regexp` `allowConstructorFlags` strict | No | Rule not in config |
| `RuleTester` valid-case schema strict | No | No custom rules |
| `no-shadow-restricted-names` reports `globalThis` | No | No `globalThis` shadowing |
| `eslint:recommended` adds 3 rules | No | Config doesn't extend `recommended` |
| `radix` no-string-options | No | Rule not in config |
| POSIX glob class support | No | Our `ignores` patterns are simple |
| `stylish` formatter `styleText` | No | We use `--format` default |
| Jiti < v2.2.0 unsupported | No | We don't use TypeScript ESLint configs |

All 17 changelog items resolve to "no impact". The upgrade is
empirically a peer-range pin bump.

## Out of scope

- **Custom rule authorship** in `@ever-works/eslint-config`. The rule
  set is intentionally minimal (6 rules + ignores); custom rules
  would need their own Q.
- **Migrating to Biome** (`biome lint`). Different toolchain
  entirely; out of scope.
- **Adding `eslint:recommended`** to the rule set. Could be a follow-up
  Q after Q28 lands and proves the toolchain healthy.
- **`@stylistic/eslint-plugin`** adoption. Stylistic rules were
  removed from ESLint core in v8/v9; we do not currently use
  formatting rules (Prettier handles formatting). Adding stylistic
  rules would need its own Q.
- **CI workflow changes.** `.github/workflows/ci.yml` runs
  `actions/setup-node@v4` with Node 24 — already above the ESLint 10
  floor. No CI-side changes required.
- **Bumping `@typescript-eslint/*` to `v9` or `v10`** if/when those
  ship. The current v8 line covers ESLint 10 in its peer-range; a
  future `v9` bump would be its own Q.

## Risks

- **R1 (Low) — A new ESLint 10.x rule flags real source.** Even though
  our config doesn't extend `eslint:recommended`, individual rule
  behavior may have tightened in 10.x. Mitigation: `pnpm lint` runs
  end-to-end pre-commit; any violation surfaces immediately. If a
  violation is load-bearing (e.g. a hidden code-smell that's actually
  intentional), open a follow-up Q before silencing the rule.
- **R2 (Low) — Transitive dep peer-range mismatch.** ESLint 10's
  internal deps (`@eslint/js`, `@eslint/eslintrc`, `eslint-scope`,
  `espree`) may bump in lock-step. Mitigation: `pnpm install`
  surfaces peer warnings; a hard break would fail.
- **R3 (Medium) — Glob-pattern reinterpretation.** ESLint 10's new
  minimatch supports POSIX character classes
  (`[:alpha:]`, `[:digit:]`, etc.). Our `ignores` patterns
  (`**/dist/**`, `**/node_modules/**`, `**/.astro/**`,
  `**/.turbo/**`) don't use character classes, so this should be a
  non-event. Mitigation: `pnpm lint` smoke catches any
  reinterpretation by surfacing files that newly fail / pass the
  `ignores` filter.
- **R4 (Low) — Future @typescript-eslint v9.** When typescript-eslint
  ships its v9 line, its peer-range may narrow to `^9.0.0 || ^10.0.0`
  (dropping ESLint 8). At that point our v8.59.0 pin would still
  work for ESLint 10. Bumping to v9 is a separate Q (Q29 or later).
- **R5 (Very Low) — `engines.node` mismatch.** The optional
  `engines.node >=22.12.0 → >=22.13.0` bump is a 1-patch difference;
  no user is reasonably running v22.12.0 specifically. Skip if
  uncomfortable; not load-bearing.

## Dependencies

- No new npm dependencies (ESLint is already a dev/peer dep
  transitively).
- No CI workflow changes.
- No environment variable changes.
- One peer-range pin bump in `packages/eslint-config/package.json`.
- Optional one-patch bump in root `package.json` `engines.node`.

## References

- ESLint 10.0.0 migration guide:
  https://eslint.org/docs/latest/use/migrate-to-10.0.0
- typescript-eslint dependency-versions matrix:
  https://typescript-eslint.io/users/dependency-versions
- Iteration 123 log entry — first appearance of the ESLint 9→10 gap
  in a routine-maintenance audit.
- Iteration 128 log entry — most recent appearance with the
  "manual-review item, not autonomous" framing.
- `packages/eslint-config/index.mjs` — the (already flat-config)
  shared config consumed by every workspace package.
- 17 `eslint.config.js` shims under `packages/*` and `apps/*`.

## AGENTS.md cross-check (R1–R15)

- **R1 (TypeScript only):** edits are `.json` (package.json) +
  optional `.json` (engines field). No JS / Python additions.
- **R2/R3/R4:** N/A (no DB, auth, payments).
- **R5 (ISR by default):** N/A.
- **R6 (Plugin everything):** N/A — ESLint config is a workspace
  package, already pluggable via rule additions.
- **R7 (Git-first data):** N/A.
- **R8 (Extreme performance):** ESLint 10 is generally faster than
  ESLint 9 (per the official changelog notes on glob handling and
  `stylish` formatter). Net positive.
- **R9 (Modular & replaceable):** the rule set in `index.mjs` is
  unchanged; the upgrade is a peer-range bump only.
- **R10 (AI-optimized):** retiring the carried "ESLint 10 deferral"
  marker simplifies future iteration logs and removes a stale
  "TODO" surface that AI agents would otherwise have to re-evaluate.
- **R11 (Convention over configuration):** zero new env vars or
  build flags.
- **R12 (Monorepo structure):** edits live in
  `packages/eslint-config/package.json` + optional `package.json`.
- **R13 (Exhaustive documentation):** spec + plan + log entry +
  Q28 status flip + iteration descriptor in `docs/index.md` + Current
  State line in `.specify/project.md` are all scheduled for the
  implementation iteration.
- **R14 (Convention):** the pin bump mirrors iteration 119's
  `monocart-coverage-reports` floor bump (`^2.12.0` → `^2.12.9`)
  and iteration 128's `isomorphic-git` bump (`^1.37.5` → `^1.37.6`).
  Same shape, same playbook.
- **R15 (Replace, don't remove):** the `^9.0.0` peer-range is
  REPLACED with `^10.0.0`; the field is not removed. (Option B's
  `^9.0.0 || ^10.0.0` would also satisfy R15, but is rejected as
  over-engineering — see Q28 in `docs/questions.md`.)
