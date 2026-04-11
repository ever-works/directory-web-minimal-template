---
title: Data Layer
description: Git-first data layer architecture for reading structured content from YAML repositories.
---

The data layer reads structured content from Git-backed repositories and exposes it as typed TypeScript objects.

## Content Repository Structure

```
.content/
├── config.yml           — Site-wide configuration
├── categories.yml       — Category definitions
├── tags.yml             — Tag definitions
├── collections.yml      — Collection definitions
├── data/                — Item data
│   └── <slug>/
│       └── <slug>.yml   — Item YAML data
└── comparisons/         — Comparison data
    └── <slug>/
        ├── <slug>.yml   — Comparison metadata
        └── <slug>.md    — Comparison content
```

## Data Types

The core package exports these TypeScript interfaces:

- `ItemData` — Directory items with name, description, category, tags, etc.
- `CategoryData` / `CategoryWithCount` — Categories with optional item counts
- `TagData` / `TagWithCount` — Tags with optional item counts
- `CollectionData` — Curated item collections
- `ComparisonData` — Side-by-side item comparisons
- `SiteConfig` — Site-wide configuration

## Adapters

Two built-in adapters:

- **GitAdapter** — Clones a Git repository at build time (`git clone --depth 1`)
- **FilesystemAdapter** — Reads from a local directory (for development)

Selection is automatic based on environment variables:
- `CONTENT_PATH` → FilesystemAdapter
- `DATA_REPOSITORY` → GitAdapter
- Neither → FilesystemAdapter with `.content/` default
