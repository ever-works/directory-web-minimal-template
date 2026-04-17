# Feature: Plugin — Sort

## Description

A plugin that sorts directory items during the build pipeline. Supports sorting by name, date (`updated_at`), or featured status. The sort is applied in the `onDataLoaded` hook so downstream plugins and page generation receive items in the configured order. Also exports a pure `sortItems` utility that can be used independently of the plugin system.

## User Stories

- As a **visitor**, I want directory items displayed in a meaningful order (alphabetical, newest first, or featured first) so I can find what I need quickly.
- As an **AI agent**, I want items pre-sorted during the build pipeline so I don't need to implement sorting logic in page templates.
- As a **developer**, I want a pure `sortItems` function I can call directly, independent of the plugin system, to sort items on demand.

## Acceptance Criteria

1. Plugin sorts items in the `onDataLoaded` hook before downstream plugins or page generation run
2. Default sort order is `name` ascending when no options are provided
3. Supports three sort fields: `name`, `updated_at`, `featured`
4. Supports two sort directions: `asc` (ascending) and `desc` (descending)
5. `name` sorting is locale-aware (uses `String.prototype.localeCompare`)
6. `updated_at` sorting compares parsed `Date` timestamps
7. `featured` sorting places featured items first (ascending) or last (descending), with alphabetical sub-sort by name within each group
8. The original items array is never mutated — `sortItems` always returns a new array
9. All other `ContentData` fields are preserved when the plugin returns modified data
10. Unknown sort fields trigger an exhaustive-check error at runtime
11. Plugin logs its configuration on init and the number of sorted items after sorting
12. Export pure `sortItems` function for use without the plugin system
13. TypeScript strict — no `any` types

## Package Structure

```
packages/plugin-sort/
├── src/
│   ├── index.ts         — Public API (barrel export)
│   ├── types.ts         — SortField, SortDirection, SortPluginOptions, ResolvedSortConfig
│   ├── plugin.ts        — Plugin factory: sortPlugin(options?) -> Plugin
│   ├── sort-items.ts    — Pure function: sortItems(items, field, direction) -> ItemData[]
│   └── __tests__/
│       ├── plugin.test.ts        — Plugin creation, hooks, and integration tests
│       ├── sort-items.test.ts    — sortItems unit tests for all fields and edge cases
│       └── barrel-exports.test.ts — Verifies barrel exports
├── package.json
└── tsconfig.json
```

## Dependencies

- `@ever-works/core` (for `ItemData`, `ContentData` types)
- `@ever-works/plugins` (for `Plugin`, `PluginContext` interfaces)

## Configuration Options

### `SortPluginOptions`

All options are optional. Defaults are applied via `resolveConfig()`.

| Option             | Type             | Default                              | Description                                      |
|--------------------|------------------|--------------------------------------|--------------------------------------------------|
| `defaultSort`      | `SortField`      | `'name'`                             | Which field to sort by                           |
| `defaultDirection` | `SortDirection`  | `'asc'`                              | Sort direction                                   |
| `sortOptions`      | `SortField[]`    | `['name', 'updated_at', 'featured']` | Available sort options to expose in UI           |

### `ResolvedSortConfig`

The fully resolved configuration after defaults are applied. All fields are required.

| Field              | Type             | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `defaultSort`      | `SortField`      | The active sort field                            |
| `defaultDirection` | `SortDirection`  | The active sort direction                        |
| `sortOptions`      | `SortField[]`    | The list of sort options available to the UI     |

## Type Definitions

### `SortField`

```typescript
type SortField = 'name' | 'updated_at' | 'featured';
```

### `SortDirection`

```typescript
type SortDirection = 'asc' | 'desc';
```

## Sort Field Behavior

### `name` (default)

- Alphabetical sort using `String.prototype.localeCompare`
- `asc`: A-Z
- `desc`: Z-A

### `updated_at`

- Date sort based on parsing `ItemData.updated_at` with `new Date().getTime()`
- `asc`: oldest first
- `desc`: newest first

### `featured`

- Boolean sort on `ItemData.featured` (`true` vs falsy)
- `asc`: featured items first, non-featured items second
- `desc`: non-featured items first, featured items second
- Within each featured/non-featured group, items are sorted alphabetically by name (always ascending, regardless of direction)

## Exported Functions

### `sortPlugin(options?: SortPluginOptions): Plugin`

Factory function that creates a Sort plugin instance.

- Resolves partial options into a full `ResolvedSortConfig` using defaults
- Returns a `Plugin` object with `id: 'sort'`, `name: 'Sort Plugin'`, `version: '0.1.0'`
- Implements `onInit` and `onDataLoaded` hooks (no build hooks)

```typescript
import { definePlugins } from '@ever-works/plugins';
import { sortPlugin } from '@ever-works/plugin-sort';

export default definePlugins([
    sortPlugin({ defaultSort: 'updated_at', defaultDirection: 'desc' }),
]);
```

### `sortItems(items: ItemData[], field: SortField, direction: SortDirection): ItemData[]`

Pure utility function that sorts directory items.

- Returns a new sorted array — the input is never mutated
- Throws `Error('Unknown sort field: ...')` if given an unrecognized field (enforced via exhaustive `never` check)

```typescript
import { sortItems } from '@ever-works/plugin-sort';
const sorted = sortItems(items, 'updated_at', 'desc');
```

## Exported Types

The barrel export re-exports the following types:

- `SortField` — Union of available sort field names
- `SortDirection` — Union of sort directions
- `SortPluginOptions` — Partial configuration input
- `ResolvedSortConfig` — Fully resolved configuration (all fields required)

## Hook Implementations

### `onInit(context: PluginContext): Promise<void>`

- Logs the default sort field and direction at `info` level
- Logs available sort options at `debug` level

### `onDataLoaded(data: ContentData, context: PluginContext): Promise<ContentData>`

- Calls `sortItems(data.items, config.defaultSort, config.defaultDirection)`
- Logs the number of sorted items and the sort parameters at `info` level
- Returns a shallow copy of `ContentData` with the `items` array replaced by the sorted result (`{ ...data, items: sorted }`)

### Hooks not implemented

- `onBeforeBuild` — not used
- `onAfterBuild` — not used

## Plugin Metadata

| Field         | Value                                                |
|---------------|------------------------------------------------------|
| `id`          | `'sort'`                                             |
| `name`        | `'Sort Plugin'`                                      |
| `version`     | `'0.1.0'`                                            |
| `description` | `'Sorts directory items by name, date, or featured status.'` |
| `dependencies`| none                                                 |

## Integration

Use the plugin in a plugin configuration:
```typescript
import { sortPlugin } from '@ever-works/plugin-sort';
sortPlugin(); // defaults: sort by name, ascending
sortPlugin({ defaultSort: 'featured', defaultDirection: 'asc' }); // featured first
```

Use the standalone utility directly:
```typescript
import { sortItems } from '@ever-works/plugin-sort';
import type { SortField, SortDirection } from '@ever-works/plugin-sort';

const field: SortField = 'updated_at';
const direction: SortDirection = 'desc';
const sorted = sortItems(items, field, direction);
```

## Technical Notes

- The `sortItems` function is pure — no side effects, no I/O
- The plugin's `onDataLoaded` hook performs a shallow spread of `ContentData`, replacing only the `items` field; all other fields (categories, tags, collections, comparisons, pages, config, total) are preserved
- The direction multiplier pattern (`direction === 'asc' ? 1 : -1`) is used to invert comparator results for descending order
- For `featured` sorting, the alphabetical sub-sort within groups always uses ascending order regardless of the direction parameter — direction only controls whether featured or non-featured items come first
- The `default` branch in the `sortItems` switch uses a `never` type assertion for compile-time exhaustive checking of `SortField` values
- The `sortOptions` configuration field is stored but not consumed by the plugin itself — it is intended for UI components that need to know which sort options are available
