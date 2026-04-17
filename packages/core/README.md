# @ever-works/core

Core data layer for the Ever Works minimal directory template. Loads, parses, and validates content from Git-backed YAML data repositories. Provides typed content loading and all shared TypeScript type definitions used across the monorepo.

## What This Package Does

1. **Defines all data types** — `ItemData`, `CategoryData`, `TagData`, `CollectionData`, `ComparisonData`, `SiteConfig`, and the aggregate `ContentData`
2. **Loads content from YAML** — Individual loaders for each content type that parse YAML files via a `DataAdapter` interface
3. **Orchestrates loading** — `loadContent()` runs all loaders in parallel and computes derived data (category/tag counts)
4. **Validates data** — Type-safe parsing with graceful fallbacks for missing or malformed fields

## Package Structure

```
src/
├── index.ts                    — Public API barrel export
├── content-reader.ts           — Orchestrates all loaders, computes counts
├── types/
│   ├── index.ts                — Type barrel export
│   ├── item.ts                 — ItemData (directory entries)
│   ├── category.ts             — CategoryData, CategoryWithCount
│   ├── tag.ts                  — TagData, TagWithCount
│   ├── collection.ts           — CollectionData (curated groups)
│   ├── comparison.ts           — ComparisonData, ComparisonDimension
│   ├── config.ts               — SiteConfig, LogoConfig, PaginationConfig, SettingsConfig
│   └── content-data.ts         — ContentData (aggregate of everything)
└── loaders/
    ├── index.ts                — Loader barrel export
    ├── config-loader.ts        — Loads config.yml with defaults
    ├── category-loader.ts      — Loads categories.yml (tries 2 paths)
    ├── tag-loader.ts           — Loads tags.yml, filters inactive
    ├── item-loader.ts          — Loads data/<slug>/<slug>.yml, filters to approved only
    ├── collection-loader.ts    — Loads collections.yml, filters inactive
    └── comparison-loader.ts    — Loads comparisons/<slug>/<slug>.yml + optional .md
```

## Usage

```typescript
import { loadContent } from '@ever-works/core';
import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';

const config = resolveAdapterConfig();
const adapter = createAdapter(config);
await adapter.init(config);

const content = await loadContent(adapter);
// content.items, content.categories, content.tags, etc.
```

### Loading individual content types

```typescript
import { loadConfig, loadItems, loadCategories } from '@ever-works/core';

const config = await loadConfig(adapter);
const items = await loadItems(adapter);         // Only approved items
const categories = await loadCategories(adapter);
```

### Using types only

```typescript
import type { ItemData, CategoryData, SiteConfig, ContentData } from '@ever-works/core';
```

## Content Repository Structure

This package reads from a `.content/` directory with this layout:

```
.content/
├── config.yml                    — Site configuration
├── categories.yml                — Category definitions
├── tags.yml                      — Tag definitions
├── collections.yml               — Collection definitions
├── data/
│   └── <item-slug>/
│       └── <item-slug>.yml       — Item data
└── comparisons/
    └── <comparison-slug>/
        ├── <comparison-slug>.yml — Comparison metadata
        └── <comparison-slug>.md  — Optional long-form content
```

This structure matches the full Next.js `directory-web-template` for compatibility.

### Content caching

```typescript
import { ContentCache } from '@ever-works/core';
import type { ContentCacheConfig } from '@ever-works/core';

const cache = new ContentCache({
    adapter,
    ttlMs: 300_000,      // 5-minute TTL (default)
    onRefresh: (content) => { /* rebuild pages */ },
});

const content = await cache.get();   // returns cached or freshly loaded content
const status = cache.status();       // { state: 'fresh' | 'stale' | 'empty', lastRefresh, headRef }
```

`ContentCache` wraps `loadContent()` with TTL-based caching and adapter-level change detection (`getHeadRef()`). Used by the ISR integration to avoid redundant content loading.

## Key Design Decisions

- **Adapter-based I/O** — All file reads go through `DataAdapter`, never direct `fs` calls. This makes the core testable and backend-agnostic.
- **Graceful degradation** — Every loader returns sensible defaults (empty arrays, default config) when files are missing or malformed. The build never crashes due to missing content.
- **Approval filtering** — `loadItems()` only returns items with `status: 'approved'`. Draft, pending, and rejected items are excluded.
- **Count computation** — `loadContent()` automatically computes `CategoryWithCount` and `TagWithCount` by cross-referencing items with categories/tags.
- **Pass-through fields** — `ItemData` and `SiteConfig` include `[key: string]: unknown` index signatures to preserve extra YAML fields from the full template without breaking.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/adapters` | `DataAdapter` interface for file I/O |
| `yaml` | YAML parsing (the [yaml](https://github.com/eemeli/yaml) package) |

## Testing

213 unit tests across 11 test files covering all loaders and the content reader orchestration.

```bash
pnpm --filter @ever-works/core test
```
