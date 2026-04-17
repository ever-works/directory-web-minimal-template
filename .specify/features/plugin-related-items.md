# Feature: plugin-related-items

## Summary

A data plugin that computes related items for each directory item based on shared tags, categories, and configurable scoring. Injects `_relatedItems` into each item's data, consumed by the `SimilarItems` Astro component on detail pages.

## Goals

1. Auto-suggest related items based on shared tags and categories
2. Configurable scoring weights (tags vs categories vs featured boost)
3. Configurable max results per item
4. Zero runtime JS — computation happens at build time in the plugin pipeline
5. Works with all sample apps out of the box

## Non-Goals

1. No ML/AI-based recommendations
2. No user behavior tracking (click-through, views)
3. No collaborative filtering
4. No external API calls

## Plugin Options

```typescript
interface RelatedItemsPluginOptions {
    /** Max number of related items per item (default: 5) */
    maxItems?: number;
    /** Score weight for shared tags (default: 1) */
    tagWeight?: number;
    /** Score weight for shared category (default: 2) */
    categoryWeight?: number;
    /** Bonus score for featured items (default: 0.5) */
    featuredBoost?: number;
    /** Minimum score threshold to include (default: 0) */
    minScore?: number;
    /** Field name to inject into item data (default: '_relatedItems') */
    fieldName?: string;
}
```

## Resolved Config

```typescript
interface ResolvedRelatedConfig {
    maxItems: number;
    tagWeight: number;
    categoryWeight: number;
    featuredBoost: number;
    minScore: number;
    fieldName: string;
}
```

## Scoring Algorithm

For each pair of items (A, B):
1. Count shared tags → `sharedTags * tagWeight`
2. Same category → `categoryWeight` (if true)
3. B is featured → `+ featuredBoost`
4. Total score = sum of above
5. Filter by `minScore`, sort descending, take top `maxItems`

## Data Contract

The plugin injects into `ContentData`:
```typescript
// In each item:
item._relatedItems = RelatedItemRef[];

interface RelatedItemRef {
    slug: string;
    name: string;
    description?: string;
    category?: string;
    icon_url?: string;
    score: number;
}
```

## Package Structure

```
packages/plugin-related-items/
├── src/
│   ├── index.ts            — Barrel exports
│   ├── plugin.ts           — Plugin factory function
│   ├── compute-related.ts  — Scoring algorithm
│   ├── resolve-config.ts   — Config resolution with defaults
│   ├── types.ts            — TypeScript interfaces
│   └── __tests__/
│       ├── compute-related.test.ts
│       ├── resolve-config.test.ts
│       ├── plugin.test.ts
│       └── barrel-exports.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── README.md
```

## Plugin Lifecycle

- **`onDataLoaded`**: Receives all items, computes pairwise scores, injects `_relatedItems` into each item

## UI Integration

The existing `SimilarItems` Astro component in `@ever-works/ui` already renders related items. It reads from `item._relatedItems` (or can be passed directly). No new UI component needed.

## Testing Strategy

- **Unit tests**: compute-related scoring (edge cases: no tags, no category, all same category, single item, empty items)
- **Unit tests**: resolve-config defaults and overrides
- **Unit tests**: plugin lifecycle (onDataLoaded injection)
- **Unit tests**: barrel exports

## Acceptance Criteria

1. `@ever-works/plugin-related-items` package created with all source files
2. Scoring algorithm handles edge cases (0 items, 1 item, items with no tags)
3. Config resolution with sensible defaults
4. Plugin factory follows existing pattern (like `analyticsPlugin()`)
5. All tests pass
6. Integrated into at least one sample app (sample-basic)
7. README with usage examples
8. Docs guide in `docs/guides/`
