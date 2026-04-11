# @ever-works/plugin-pagination

Pagination plugin for the Ever Works minimal directory template. Provides pure utility functions for slicing item arrays into pages and generating Astro `getStaticPaths()` entries for paginated routes.

## What This Package Does

1. **`paginate()`** — Slices an array into a single page with full metadata (hasPrev, hasNext, totalPages, etc.)
2. **`generatePagePaths()`** — Generates static path entries for Astro's `getStaticPaths()` to pre-render all paginated pages
3. **Plugin registration** — Resolves `itemsPerPage` from plugin options or site config

## Usage

### Paginating items

```typescript
import { paginate } from '@ever-works/plugin-pagination';

const result = paginate(items, { page: 2, perPage: 12 });

result.data       // ItemData[] — items for page 2
result.page       // 2
result.totalPages // 5
result.total      // 60
result.hasPrev    // true
result.hasNext    // true
result.prevPage   // 1
result.nextPage   // 3
```

### Generating static paths for Astro

```typescript
// src/pages/page/[page].astro
import { generatePagePaths } from '@ever-works/plugin-pagination';

export function getStaticPaths() {
    const paths = generatePagePaths(items.length, 12);
    // [{ params: { page: '1' } }, { params: { page: '2' } }, ...]
    return paths;
}
```

### As a plugin

```typescript
import { paginationPlugin } from '@ever-works/plugin-pagination';

export default definePlugins([
    paginationPlugin({ itemsPerPage: 24 }),
]);
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `itemsPerPage` | `number` | `12` | Number of items per page. Falls back to site config's `pagination.itemsPerPage` if not set. |
| `maxPages` | `number` | `undefined` | Maximum number of pages to generate (optional cap) |

## API

### `paginate<T>(items: T[], options: PaginateOptions): PaginationResult<T>`

| Field | Type | Description |
|-------|------|-------------|
| `data` | `T[]` | Items for the requested page |
| `page` | `number` | Current page (1-indexed) |
| `perPage` | `number` | Items per page |
| `total` | `number` | Total item count |
| `totalPages` | `number` | Total number of pages |
| `hasPrev` | `boolean` | Whether a previous page exists |
| `hasNext` | `boolean` | Whether a next page exists |
| `prevPage` | `number \| null` | Previous page number or null |
| `nextPage` | `number \| null` | Next page number or null |

Page numbers are clamped — requesting page 99 of a 5-page set returns page 5.

### `generatePagePaths(total, perPage, maxPages?): PagePathEntry[]`

Returns `{ params: { page: string } }[]` compatible with Astro's `getStaticPaths()`.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | `SiteConfig` for reading `pagination.itemsPerPage` |
| `@ever-works/plugins` | `Plugin` interface |

## Testing

16 unit tests covering page slicing, clamping, metadata, static path generation, and edge cases.

```bash
pnpm --filter @ever-works/plugin-pagination test
```
