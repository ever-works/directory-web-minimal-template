---
title: ".works/works.yml Site Config Path"
status: "✅ RESOLVED — implemented 2026-05-09"
---

# .works/works.yml Site Config Path

## Summary

The canonical site configuration file is `.works/works.yml` inside the content root.

For local app content, that means:

```text
apps/<app>/.content/.works/works.yml
```

For remote Git content repositories, that means:

```text
.works/works.yml
```

## Requirements

1. `packages/core` MUST read `.works/works.yml`.
2. Diagnostics and current documentation MUST name `.works/works.yml` as the config contract.
3. Committed sample content MUST use `.content/.works/works.yml`.
4. The `SiteConfig` TypeScript interface remains unchanged.

## Non-Goals

1. No new environment variable for overriding the config filename.
2. No change to the rest of the Git-first content layout.

## Cross-Check

- R1: TypeScript-only source changes.
- R2/R7: This remains a core data contract, not a plugin feature.
- R3: Git-first YAML data remains unchanged.
- R8/R13: The canonical path is documented for future agents.
- R11: Existing sample config content is moved into the new path.
