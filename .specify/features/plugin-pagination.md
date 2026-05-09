# Feature: Plugin — Pagination

## Description

A plugin that provides pagination utilities for directory listings. Includes a plugin factory for the build pipeline and pure, framework-agnostic utility functions for slicing item lists and generating Astro `getStaticPaths` entries. The plugin itself is lightweight — it resolves configuration at init time and logs it, while the exported pure functions handle all page calculation and path generation.

## User Stories

- As a **visitor**, I want directory listings split into pages so I can browse large datasets without overwhelming page loads.
- As an **AI agent**, I want a simple `paginate()` call that returns a page slice with full metadata (hasPrev, hasNext, totalPages) so I can render pagination controls without manual math.
- As a **developer**, I want a `generatePagePaths()` function I can drop into Astro's `getStaticPaths` to statically generate all paginated routes.
- As a **developer**, I want pagination configuration to cascade from plugin options to site config to sensible defaults so I don't need to duplicate values.

## Acceptance Criteria

1. Plugin registers with id `pagination`, name `Pagination Plugin`, version `0.1.0`
2. Plugin implements only the `onInit` hook (no `onDataLoaded`, `onBeforeBuild`, or `onAfterBuild`)
3. `itemsPerPage` resolves in precedence order: plugin options > `config.pagination.itemsPerPage` > default (12)
4. `maxPages` is optional and only sourced from plugin options
5. `onInit` logs the resolved items-per-page and, when set, the max pages cap
6. `onInit` logs the configuration source (`plugin options`, `site config`, or `default`) at debug level
7. `paginate()` is a pure, generic function — no side effects, no I/O
8. `paginate()` clamps out-of-range page numbers to valid bounds (min 1, max totalPages)
9. `paginate()` returns `totalPages = 1` for an empty input array (never zero pages)
10. `paginate()` throws `RangeError` when `perPage < 1`
11. `generatePagePaths()` produces `PagePathEntry[]` compatible with Astro's `getStaticPaths`
12. `generatePagePaths()` respects an optional `maxPages` cap
13. `generatePagePaths()` returns 1 entry for 0 total items (never an empty array)
14. `generatePagePaths()` throws `RangeError` when `perPage < 1`
15. Barrel export re-exports exactly: `paginationPlugin`, `paginate`, `generatePagePaths` (runtime values) and `PaginationPluginOptions`, `PaginateOptions`, `PaginationResult`, `PagePathEntry` (types)
16. TypeScript strict — no `any` types

## Package Structure

```
packages/plugin-pagination/
├── src/
│   ├── index.ts                       — Public API (barrel export)
│   ├── types.ts                       — PaginationPluginOptions, PaginateOptions, PaginationResult<T>, PagePathEntry
│   ├── paginate.ts                    — Pure functions: paginate(), generatePagePaths()
│   ├── plugin.ts                      — Plugin factory: paginationPlugin(options?) → Plugin
│   └── __tests__/
│       ├── paginate.test.ts           — Unit tests for paginate() and generatePagePaths()
│       ├── plugin.test.ts             — Unit tests for plugin creation and onInit hook
│       └── barrel-exports.test.ts     — Ensures barrel exports are correct and complete
├── package.json
└── tsconfig.json
```

## Dependencies

- `@ever-works/core` (for `ContentData`, `SiteConfig` types)
- `@ever-works/plugins` (for `Plugin` interface)

## Configuration Options

### `PaginationPluginOptions`

| Option         | Type     | Default     | Description                                          |
| -------------- | -------- | ----------- | ---------------------------------------------------- |
| `itemsPerPage` | `number` | `12`        | Number of items displayed per page                   |
| `maxPages`     | `number` | `undefined` | Optional cap on the maximum number of generated pages |

### Configuration Precedence

The resolved `itemsPerPage` is determined by a three-tier cascade:

1. **Plugin options** — `paginationPlugin({ itemsPerPage: 24 })` — highest priority
2. **Site config** — `config.pagination.itemsPerPage` from `.works/works.yml` — used when plugin options omit the value
3. **Built-in default** — `12` — used when neither of the above is set

`maxPages` is only sourced from plugin options; there is no site config or default fallback.

## Exported Functions and Signatures

### `paginationPlugin(options?: PaginationPluginOptions): Plugin`

Factory function that creates a configured `Plugin` instance.

```typescript
import { definePlugins } from '@ever-works/plugins';
import { paginationPlugin } from '@ever-works/plugin-pagination';

export default definePlugins([
    paginationPlugin({ itemsPerPage: 24 }),
]);
```

### `paginate<T>(items: readonly T[], options: PaginateOptions): PaginationResult<T>`

Pure, generic function that slices an array for a given page.

```typescript
import { paginate } from '@ever-works/plugin-pagination';

const result = paginate(allItems, { page: 2, perPage: 10 });
// result.items       — items 11..20
// result.currentPage — 2
// result.totalPages  — Math.ceil(allItems.length / 10)
// result.totalItems  — allItems.length
// result.hasPrev     — true
// result.hasNext     — depends on total
// result.prevPage    — 1
// result.nextPage    — 3 or null
```

### `generatePagePaths(total: number, perPage: number, maxPages?: number): PagePathEntry[]`

Generates an array of entries for Astro's `getStaticPaths`.

```typescript
// In an Astro [...page].astro file:
export function getStaticPaths() {
    return generatePagePaths(items.length, 12);
}
```

## Type Definitions

### `PaginateOptions`

```typescript
interface PaginateOptions {
    /** Current page number (1-indexed) */
    page: number;
    /** Items per page */
    perPage: number;
}
```

### `PaginationResult<T>`

```typescript
interface PaginationResult<T> {
    /** Items on the current page */
    items: T[];
    /** Current page number (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of items */
    totalItems: number;
    /** Whether there is a previous page */
    hasPrev: boolean;
    /** Whether there is a next page */
    hasNext: boolean;
    /** Previous page number (null if first page) */
    prevPage: number | null;
    /** Next page number (null if last page) */
    nextPage: number | null;
}
```

### `PagePathEntry`

```typescript
interface PagePathEntry {
    params: { page: string };
    props: { currentPage: number; totalPages: number };
}
```

## Hook Implementations

The plugin implements a single lifecycle hook:

### `onInit(context: PluginContext): Promise<void>`

- Reads `context.config.pagination?.itemsPerPage` from the site configuration
- Resolves the effective `itemsPerPage` using the three-tier cascade (plugin options > site config > default 12)
- Resolves `maxPages` from plugin options (no cascade)
- Logs an info message: `Initialized — {N} items/page` (and `, max {M} pages` if maxPages is set)
- Logs a debug message with the configuration source: `Source: plugin options`, `Source: site config`, or `Source: default`

The plugin does **not** implement `onDataLoaded`, `onBeforeBuild`, or `onAfterBuild`. Pagination logic is invoked directly by page templates via the exported pure functions rather than transforming data in the build pipeline.

## Page Calculation Logic

### `paginate()` — Slice Computation

1. **Validate** — throw `RangeError` if `perPage < 1`
2. **Total pages** — `Math.max(1, Math.ceil(totalItems / perPage))` (guarantees at least 1 page, even for empty input)
3. **Clamp page** — `Math.max(1, Math.min(page, totalPages))` (out-of-range page numbers are silently clamped, never rejected)
4. **Slice** — `start = (currentPage - 1) * perPage`, `end = Math.min(start + perPage, totalItems)`, items = `items.slice(start, end)`
5. **Navigation flags**:
   - `hasPrev = currentPage > 1`
   - `hasNext = currentPage < totalPages`
   - `prevPage = hasPrev ? currentPage - 1 : null`
   - `nextPage = hasNext ? currentPage + 1 : null`

### `generatePagePaths()` — Static Path Generation

1. **Validate** — throw `RangeError` if `perPage < 1`
2. **Raw total pages** — `Math.max(1, Math.ceil(total / perPage))`
3. **Apply cap** — if `maxPages` is provided, `totalPages = Math.min(rawTotalPages, maxPages)`
4. **Generate entries** — for `i` from 1 to `totalPages`:
   - `params.page = String(i)` (page numbers as strings, 1-indexed)
   - `props = { currentPage: i, totalPages }`

## URL Patterns for Paginated Routes

Page params use **1-indexed string values**: `"1"`, `"2"`, `"3"`, etc.

In Astro, a typical paginated route file is `[...page].astro` or `[page].astro`. The generated path entries produce URLs like:

| Page | `params.page` | Typical URL           |
| ---- | ------------- | --------------------- |
| 1    | `"1"`         | `/items/1`            |
| 2    | `"2"`         | `/items/2`            |
| N    | `"N"`         | `/items/N`            |

The plugin does not enforce any specific URL structure — that is determined by the Astro page file location. The plugin only supplies the `params` and `props` for `getStaticPaths`.

## Edge Cases

| Scenario                        | `paginate()` Behavior                                              | `generatePagePaths()` Behavior                                |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| **Empty data** (0 items)        | Returns `totalPages: 1`, `items: []`, `totalItems: 0`             | Returns 1 entry with `page: "1"`, `totalPages: 1`            |
| **Single page** (items <= perPage) | Returns `totalPages: 1`, `hasPrev: false`, `hasNext: false`    | Returns 1 entry                                               |
| **Items exactly fill pages**    | Last page is full; no partial page                                 | Exact number of entries                                       |
| **Partial last page**           | Last page contains fewer items; `hasNext: false` on last page      | Same total pages as `Math.ceil(total / perPage)`              |
| **Page too high** (e.g., 999)   | Clamped to last page; returns last page items                      | N/A (generates all pages)                                     |
| **Page too low** (e.g., -5)     | Clamped to page 1; returns first page items                        | N/A (generates all pages)                                     |
| **perPage < 1** (0 or negative) | Throws `RangeError('perPage must be at least 1')`                  | Throws `RangeError('perPage must be at least 1')`             |
| **maxPages cap**                | N/A (paginate does not accept maxPages)                            | Output limited to `maxPages` entries; `totalPages` reflects cap |
| **maxPages > actual pages**     | N/A                                                                | No effect; returns the natural number of pages                |

## Technical Notes

- Both `paginate()` and `generatePagePaths()` are pure functions — no side effects, no I/O, no framework coupling
- `paginate()` is generic (`<T>`) and accepts `readonly T[]` — it works with any item type and does not mutate the input
- The plugin factory (`paginationPlugin`) returns a new `Plugin` object on each call — no shared mutable state between instances
- The plugin has no dependencies on other plugins (`dependencies` array is not set)
- Page numbers are 1-indexed everywhere (params, props, PaginateOptions, PaginationResult)
- `totalPages` is never zero — the minimum is always 1, even for empty datasets
