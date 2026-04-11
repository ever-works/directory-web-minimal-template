# @ever-works/plugin-sort

Item sorting plugin for the Ever Works minimal directory template. Provides a pure utility function for sorting directory items by name, date, or featured status, plus a plugin that applies default sorting to all items during the build pipeline.

## What This Package Does

1. **`sortItems()`** — Pure function that sorts an `ItemData[]` array by a given field and direction
2. **Plugin registration** — Applies default sorting to all items during `onDataLoaded` (so pages receive pre-sorted data)

## Sort Fields

| Field | Behavior |
|-------|----------|
| `'name'` | Locale-aware alphabetical sort (`String.localeCompare`) |
| `'updated_at'` | Date sort (parses `updated_at` timestamps) |
| `'featured'` | Featured items first (or last), with alphabetical name as tiebreaker |

All fields support `'asc'` and `'desc'` directions.

## Usage

### Sorting items

```typescript
import { sortItems } from '@ever-works/plugin-sort';

const byName = sortItems(items, 'name', 'asc');
const byDate = sortItems(items, 'updated_at', 'desc');
const featuredFirst = sortItems(items, 'featured', 'desc');
```

### As a plugin

```typescript
import { sortPlugin } from '@ever-works/plugin-sort';

export default definePlugins([
    sortPlugin({
        defaultSort: 'featured',
        defaultDirection: 'desc',
    }),
]);
```

When used as a plugin, sorting is applied during `onDataLoaded` — all downstream plugins and pages receive pre-sorted items.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultSort` | `SortField` | `'name'` | Default sort field |
| `defaultDirection` | `SortDirection` | `'asc'` | Default sort direction |
| `sortOptions` | `SortField[]` | `['name', 'updated_at', 'featured']` | Available sort fields (for UI dropdowns) |

## Key Design Decisions

- **Immutable** — `sortItems()` returns a new array; the original is never mutated
- **Locale-aware** — Name sorting uses `localeCompare` for proper internationalization
- **Exhaustive switch** — TypeScript enforces that all `SortField` values are handled
- **Tiebreaking** — Featured sort uses alphabetical name as a stable secondary sort

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | `ItemData` type |
| `@ever-works/plugins` | `Plugin` interface |

## Testing

9 unit tests covering all sort fields, both directions, immutability, and edge cases.

```bash
pnpm --filter @ever-works/plugin-sort test
```
