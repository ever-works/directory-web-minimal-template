# Feature: Data Layer

## Description

The data layer reads structured content from Git-backed repositories and exposes it as typed TypeScript objects. It consists of two sub-systems:

1. **Adapters** — Abstract file access (git clone, filesystem, future: API)
2. **Core Content Reader** — Parses YAML files into typed data objects

## User Stories

- As an **Astro page**, I want to load all items with their categories and tags so I can render listing pages.
- As an **Astro page**, I want to load a single item by slug so I can render detail pages.
- As a **build script**, I want to clone the data repository before the build starts.
- As a **developer**, I want to use a local content directory during development without git operations.
- As a **plugin**, I want to transform loaded data before pages are generated.

## Acceptance Criteria

1. `loadItems()` returns all approved items with populated category/tag references
2. `loadItem(slug)` returns a single item or null
3. `loadCategories()` returns all categories
4. `loadTags()` returns all tags
5. `loadCollections()` returns all active collections
6. `loadComparisons()` returns all comparisons
7. `loadConfig()` returns the site configuration
8. GitAdapter clones the repo specified by `DATA_REPOSITORY`
9. FilesystemAdapter reads from the path specified by `CONTENT_PATH`
10. All functions return strongly-typed TypeScript objects
11. Invalid YAML files are skipped with a warning, not a crash
12. Path traversal is prevented (no `..` in file paths)

## Technical Design

See:
- `docs/architecture/data-layer.md` — Architecture
- `docs/specs/data-schema.md` — Schema specification
- `docs/specs/adapter-interface.md` — Adapter contract

## Package: `@ever-works/core`

```
packages/core/
├── src/
│   ├── types/
│   │   ├── item.ts
│   │   ├── category.ts
│   │   ├── tag.ts
│   │   ├── collection.ts
│   │   ├── comparison.ts
│   │   ├── config.ts
│   │   ├── content-data.ts
│   │   ├── page.ts
│   │   └── index.ts
│   ├── loaders/
│   │   ├── item-loader.ts
│   │   ├── category-loader.ts
│   │   ├── tag-loader.ts
│   │   ├── collection-loader.ts
│   │   ├── comparison-loader.ts
│   │   ├── config-loader.ts
│   │   └── page-loader.ts       — Load static pages, Markdown rendering
│   ├── content-cache.ts     — In-memory content cache with TTL support
│   ├── content-reader.ts    — Orchestrates all loaders (YAML parsing done inline in loaders)
│   ├── logger.ts            — Internal logger utility
│   └── index.ts             — Public API
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- `yaml` — YAML parsing library
- `marked` — Markdown parsing for page content rendering
- `@ever-works/adapters` — Data source adapters
