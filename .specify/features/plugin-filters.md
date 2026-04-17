# Feature: Plugin — Filters

## Description

A plugin that provides client-side filtering of directory items by category, tag, and free-text search query. Filter state can optionally be synchronized with URL search parameters for shareable/bookmarkable filtered views. All filtering logic is implemented as pure functions, usable both through the plugin system and as standalone utilities.

## User Stories

- As a **visitor**, I want to filter directory items by category or tag so I can quickly find relevant entries.
- As a **visitor**, I want to search items by name or description so I can locate a specific entry.
- As a **visitor**, I want my active filters reflected in the URL so I can bookmark or share a filtered view.
- As an **AI agent**, I want pure filter functions I can call directly without the plugin system so I can compose filtering into custom page logic.
- As a **developer**, I want configurable URL parameter names so the plugin integrates cleanly with my routing conventions.

## Acceptance Criteria

1. Plugin filters items by category using OR logic within the category group
2. Plugin filters items by tag using OR logic within the tag group
3. Plugin filters items by search query against `name` and `description` (case-insensitive, substring match)
4. All three filter groups combine with AND logic between them
5. Items with array-valued `category` fields are supported (match if any element is in the selected set)
6. URL sync parses filter state from `URLSearchParams` (categories/tags as comma-separated values)
7. URL sync serializes filter state back to `URLSearchParams` (empty groups omitted)
8. Round-trip serialization is lossless: `parse(serialize(filters))` equals original filters
9. URL parameter names are configurable via `ParamNames`
10. Individual filter types can be selectively enabled (`enabledFilters` option)
11. URL sync can be disabled entirely (`urlSync: false`)
12. Export pure functions for use without the plugin system
13. TypeScript strict -- no `any` types

## Package Structure

```
packages/plugin-filters/
├── src/
│   ├── index.ts              — Public API (barrel export)
│   ├── types.ts              — FiltersPluginOptions, FilterType, ParamNames, ActiveFilters
│   ├── plugin.ts             — Plugin factory: filtersPlugin(options) -> Plugin
│   ├── filter-items.ts       — Pure function: filterItems(items, filters) -> ItemData[]
│   ├── url-sync.ts           — URL utilities: parseFiltersFromUrl, serializeFiltersToUrl
│   └── __tests__/
│       ├── filter-items.test.ts   — Unit tests for filterItems
│       ├── plugin.test.ts         — Unit tests for plugin factory and hooks
│       ├── url-sync.test.ts       — Unit tests for URL sync utilities
│       └── barrel-exports.test.ts — Barrel export validation
├── package.json
└── tsconfig.json
```

## Dependencies

- `@ever-works/core` (for `ItemData` type)
- `@ever-works/plugins` (for `Plugin` interface)

No external runtime dependencies.

## Plugin Configuration

### `FiltersPluginOptions`

| Option           | Type             | Default                         | Description                                      |
| ---------------- | ---------------- | ------------------------------- | ------------------------------------------------ |
| `enabledFilters` | `FilterType[]`   | `['category', 'tag', 'search']` | Which filter types to enable                     |
| `urlSync`        | `boolean`        | `true`                          | Whether to sync filter state with URL params     |
| `paramNames`     | `ParamNames`     | *(see below)*                   | Custom URL parameter name mapping                |

### `FilterType`

Union type: `'category' | 'tag' | 'search'`

### `ParamNames`

| Field      | Type     | Default      | Description                         |
| ---------- | -------- | ------------ | ----------------------------------- |
| `category` | `string` | `'category'` | URL param name for category filters |
| `tag`      | `string` | `'tag'`      | URL param name for tag filters      |
| `search`   | `string` | `'q'`        | URL param name for search query     |

All fields are optional; unspecified fields fall back to `DEFAULT_PARAM_NAMES`.

### `ActiveFilters`

Represents the current filter state at runtime:

| Field        | Type       | Description                                    |
| ------------ | ---------- | ---------------------------------------------- |
| `categories` | `string[]` | Selected category IDs (OR logic within group)  |
| `tags`       | `string[]` | Selected tag IDs (OR logic within group)       |
| `search`     | `string`   | Free-text search query string                  |

## Exported API

### Runtime values

| Export                  | Module          | Signature                                                                                 | Description                                                |
| ----------------------- | --------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `filtersPlugin`         | `plugin.ts`     | `(options?: FiltersPluginOptions) => Plugin`                                               | Plugin factory function                                    |
| `filterItems`           | `filter-items.ts` | `(items: readonly ItemData[], filters: ActiveFilters) => ItemData[]`                      | Pure function that filters items by active filters         |
| `parseFiltersFromUrl`   | `url-sync.ts`   | `(url: URL, paramNames?: ParamNames) => ActiveFilters`                                    | Parse URL search params into an ActiveFilters object       |
| `serializeFiltersToUrl` | `url-sync.ts`   | `(filters: ActiveFilters, paramNames?: ParamNames) => URLSearchParams`                    | Serialize ActiveFilters into URLSearchParams                |
| `DEFAULT_PARAM_NAMES`   | `types.ts`      | `Required<ParamNames>` (constant: `{ category: 'category', tag: 'tag', search: 'q' }`)   | Default URL parameter name mapping                         |

### Type exports

| Export                  | Module     | Kind        |
| ----------------------- | ---------- | ----------- |
| `FiltersPluginOptions`  | `types.ts` | `interface` |
| `FilterType`            | `types.ts` | `type`      |
| `ParamNames`            | `types.ts` | `interface` |
| `ActiveFilters`         | `types.ts` | `interface` |

## Hook Implementations

### `onInit`

- **Hook**: `PluginHooks.onInit`
- **Behavior**: Logs the list of enabled filter types and the URL sync setting via `context.log.info`.
- **Side effects**: None beyond logging.

### Hooks NOT implemented

The plugin does **not** implement `onDataLoaded`, `onBeforeBuild`, or `onAfterBuild`. All filtering is client-side -- the plugin does not transform `ContentData` at build time. It provides pure utility functions that consuming code calls directly at render time or in client-side scripts.

## Plugin Metadata

| Field         | Value                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| `id`          | `'filters'`                                                                 |
| `name`        | `'Filters Plugin'`                                                          |
| `version`     | `'0.1.0'`                                                                   |
| `description` | `'Client-side filtering by category, tag, and search query with optional URL sync.'` |
| `dependencies`| *(none)*                                                                    |

## Data Flow

### Filtering pipeline (`filterItems`)

```
Input: ItemData[] + ActiveFilters
  │
  ├─ 1. Copy input array (never mutates original)
  │
  ├─ 2. Category filter (if categories.length > 0)
  │     - Build a Set from selected category IDs
  │     - Normalize each item's `category` field to string[] (handles string | string[])
  │     - Keep item if ANY of its categories is in the selected Set (OR logic)
  │
  ├─ 3. Tag filter (if tags.length > 0)
  │     - Build a Set from selected tag IDs
  │     - Keep item if ANY of its tags is in the selected Set (OR logic)
  │
  ├─ 4. Search filter (if search.trim() !== '')
  │     - Trim and lowercase the query
  │     - Keep item if query is a substring of item.name OR item.description (case-insensitive)
  │
  └─ Output: filtered ItemData[]
```

- Filters are applied sequentially: category first, then tag, then search.
- Each step narrows the result set (AND between groups, OR within groups).
- Empty filter groups are skipped entirely (no filtering for that dimension).

### URL sync pipeline

```
URL string
  │
  ├─ parseFiltersFromUrl(url, paramNames?)
  │     - Resolve param names (merge custom with defaults)
  │     - Read category param -> split on ',' -> trim -> filter empty -> string[]
  │     - Read tag param -> split on ',' -> trim -> filter empty -> string[]
  │     - Read search param -> trim -> string ('' if absent)
  │     - Return ActiveFilters
  │
  └─ serializeFiltersToUrl(filters, paramNames?)
        - Resolve param names (merge custom with defaults)
        - Create empty URLSearchParams
        - If categories non-empty: set param to comma-joined string
        - If tags non-empty: set param to comma-joined string
        - If search non-empty (after trim): set param to trimmed string
        - Return URLSearchParams (empty groups omitted)
```

### End-to-end usage

```
1. Page loads -> parseFiltersFromUrl(window.location) -> ActiveFilters
2. User interacts with filter UI -> update ActiveFilters state
3. filterItems(allItems, activeFilters) -> visible items
4. serializeFiltersToUrl(activeFilters) -> update browser URL (history.replaceState)
5. Repeat from step 2
```

## Integration

Pages call the filter functions directly:

```typescript
import { filterItems, parseFiltersFromUrl } from '@ever-works/plugin-filters';
import type { ActiveFilters } from '@ever-works/plugin-filters';

// Parse initial state from URL
const filters = parseFiltersFromUrl(new URL(window.location.href));

// Filter items
const visible = filterItems(allItems, filters);
```

Plugin registration (build pipeline):

```typescript
import { filtersPlugin } from '@ever-works/plugin-filters';

const plugins = [
    filtersPlugin({
        enabledFilters: ['category', 'search'],
        urlSync: true,
        paramNames: { search: 'search' },
    }),
];
```

## Edge Cases and Constraints

### Category normalization
- `ItemData.category` can be either `string` or `string[]`. The `filterItems` function normalizes both to `string[]` before matching, using the internal `normalizeCategories` helper.

### Search behavior
- Search matches against `item.name` and `item.description` only -- not tags, categories, or other fields.
- Matching is case-insensitive substring (`String.includes`), not fuzzy or tokenized.
- Whitespace-only search strings are treated as "no search filter" (skipped entirely).
- Leading/trailing whitespace is trimmed from the search query before matching.

### URL sync edge cases
- Empty param values (`?category=`) are treated as empty filters (no categories selected).
- Consecutive commas (`?category=tools,,apps,`) are handled gracefully -- empty segments are filtered out.
- Whitespace around comma-separated values is trimmed (`?category=tools%20,%20apps` parses as `['tools', 'apps']`).
- When a URL param is entirely absent, the corresponding filter group defaults to empty.

### Immutability
- `filterItems` accepts `readonly ItemData[]` and always returns a new array -- it never mutates the input.

### No build-time data transformation
- Unlike some plugins (e.g., breadcrumbs), this plugin does not implement `onDataLoaded`. It does not modify `ContentData`. All filtering happens at render time or in client-side code via the exported pure functions.

### Empty inputs
- `filterItems([], anyFilters)` returns `[]`.
- `filterItems(items, noFilters)` returns a shallow copy of all items.

### No dependencies on other plugins
- The plugin has no `dependencies` array -- it can be used standalone.

## Technical Notes

- The `filterItems` function is pure -- no side effects, no I/O, no global state.
- The `parseFiltersFromUrl` and `serializeFiltersToUrl` functions are also pure.
- URL sync utilities use the standard `URL` and `URLSearchParams` Web APIs.
- The plugin factory (`filtersPlugin`) captures its options via closure; the returned `Plugin` object is immutable.
- The `enabledFilters` option is informational at the plugin level (logged in `onInit`). The `filterItems` function itself always supports all three filter types regardless of this setting -- consumers are expected to pass only enabled filter values into `ActiveFilters`.
