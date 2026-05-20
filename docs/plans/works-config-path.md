---
title: ".works/works.yml Site Config Path — implementation plan"
status: "✅ COMPLETE — implemented 2026-05-09"
spec: .specify/features/works-config-path.md
---

# .works/works.yml Site Config Path — implementation plan

## Steps

1. Add a spec for `.works/works.yml` as the only supported site config path.
2. Update `packages/core/src/loaders/config-loader.ts` to read `.works/works.yml`.
3. Update tests to assert the new path and remove previous root-config assumptions.
4. Move committed sample config data to `.content/.works/works.yml`.
5. Update app diagnostics and current docs that describe the site config contract.
6. Run focused tests and the available repo health gates.

## Acceptance Criteria

- `loadConfig()` calls `adapter.readFile('.works/works.yml')`.
- Missing `.works/works.yml` produces defaults, with no secondary config read.
- Current docs and diagnostics name `.works/works.yml`.
- The repository includes committed `.content/.works/works.yml` sample content.
