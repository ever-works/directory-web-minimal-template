# @ever-works/plugin-filters

Item filtering plugin for the Ever Works minimal directory template. Provides pure utility functions for filtering directory items by category, tag, and search query, plus URL synchronization helpers for persisting filter state in query parameters.

## What This Package Does

1. **`filterItems()`** — Pure function that filters an `ItemData[]` array by categories, tags, and/or search query
2. **URL sync utilities** — `parseFiltersFromUrl()` and `serializeFiltersToUrl()` for reading/writing filter state to URL query parameters
3. **Plugin registration** — Minimal plugin shell for the build pipeline (filter logic runs at render time, not build time)

## How Filtering Works

Filters use **OR logic within groups** and **AND logic between groups**:

- **Categories**: Item matches if it belongs to **any** of the selected categories (OR)
- **Tags**: Item matches if it has **any** of the selected tags (OR)
- **Search**: Item matches if its `name` or `description` contains the query (case-insensitive)
- **Combined**: All active filter groups must match (AND between categories, tags, and search)

```typescript
// Item has category "tools" AND tags ["react", "typescript"]
// Filter: categories=["tools","libs"], tags=["react"], search="component"
// Result: matches (tools ∈ [tools,libs]) AND (react ∈ [react]) AND ("component" in name/desc)
```

## Usage

### Filtering items

```typescript
import { filterItems } from '@ever-works/plugin-filters';

const filtered = filterItems(items, {
    categories: ['tools', 'libraries'],
    tags: ['react'],
    search: 'component',
});
```

### URL synchronization

```typescript
import { parseFiltersFromUrl, serializeFiltersToUrl } from '@ever-works/plugin-filters';

// Read filters from current URL
const filters = parseFiltersFromUrl(window.location.href);
// { categories: ['tools'], tags: ['react'], search: 'test' }

// Write filters back to URL params
const params = serializeFiltersToUrl({
    categories: ['tools'],
    tags: ['react'],
    search: 'test',
});
// URLSearchParams: category=tools&tag=react&q=test
```

### As a plugin

```typescript
import { filtersPlugin } from '@ever-works/plugin-filters';

export default definePlugins([
    filtersPlugin({
        enabledFilters: ['category', 'tag', 'search'],
        urlSync: true,
    }),
]);
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabledFilters` | `FilterType[]` | `['category', 'tag', 'search']` | Which filter types to enable |
| `urlSync` | `boolean` | `true` | Whether to sync filter state with URL params |
| `paramNames` | `ParamNames` | `{ category: 'category', tag: 'tag', search: 'q' }` | URL parameter names |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | `ItemData`, `CategoryData`, `TagData` types |
| `@ever-works/plugins` | `Plugin` interface |

## Testing

27 unit tests covering category filtering, tag filtering, search, combined filters, and edge cases.

```bash
pnpm --filter @ever-works/plugin-filters test
```
