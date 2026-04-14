# Phase 4: Built-in Plugins — Detailed Specification

> Implements the essential plugins that ship with the minimal template.
> Each plugin is an independent package in `packages/` following the `Plugin` interface.

## Overview

All plugins implement `@ever-works/plugins` `Plugin` interface.
Each is a separate workspace package with its own `package.json` and `tsconfig.json`.
Plugins are registered via `definePlugins()` in a `plugins.config.ts` file in the web app.

**Total: 8 plugin packages** (seo, pagination, filters, search, sort, sitemap, breadcrumbs, rss).
Note: `plugin-breadcrumbs` and `plugin-rss` were added after Phase 4 and have their own spec files:
- `.specify/features/plugin-breadcrumbs.md`
- `.specify/features/plugin-rss.md`

## Plugin Packages

### 1. `@ever-works/plugin-seo` (packages/plugin-seo)

**Purpose**: Generate meta tags, Open Graph, Twitter Cards, and JSON-LD structured data.

**Factory function**: `seoPlugin(options?: SeoPluginOptions): Plugin`

**Options**:
```typescript
interface SeoPluginOptions {
    /** Title template with %s placeholder (e.g., "%s | My Directory") */
    titleTemplate?: string;
    /** Default meta description for pages without one */
    defaultDescription?: string;
    /** Default Open Graph image URL */
    defaultOgImage?: string;
    /** Twitter handle (e.g., "@mysite") */
    twitterHandle?: string;
    /** Whether to generate JSON-LD structured data (default: true) */
    jsonLd?: boolean;
}
```

**Exports**:
- `seoPlugin()` — factory function returning `Plugin`
- `generateMetaTags(page: PageMeta, options: SeoPluginOptions): MetaTag[]` — pure utility
- `generateJsonLd(type: JsonLdType, data: JsonLdInput): string` — pure utility
- Types: `SeoPluginOptions`, `PageMeta`, `MetaTag`, `JsonLdType`, `JsonLdInput`

**Hooks used**: `onInit` (validate config), `onDataLoaded` (inject SEO defaults into items)

**No dependencies** on other plugins.

---

### 2. `@ever-works/plugin-pagination` (packages/plugin-pagination)

**Purpose**: Provide pagination utilities for listing pages.

**Factory function**: `paginationPlugin(options?: PaginationPluginOptions): Plugin`

**Options**:
```typescript
interface PaginationPluginOptions {
    /** Items per page (default: 12) */
    itemsPerPage?: number;
    /** Maximum pages to generate (default: unlimited) */
    maxPages?: number;
}
```

**Exports**:
- `paginationPlugin()` — factory function returning `Plugin`
- `paginate<T>(items: T[], options: PaginateOptions): PaginationResult<T>` — pure utility
- `generatePagePaths(total: number, perPage: number): PagePathEntry[]` — for getStaticPaths
- Types: `PaginationPluginOptions`, `PaginateOptions`, `PaginationResult`, `PagePathEntry`

**Hooks used**: `onInit` (merge config with site pagination settings)

**No dependencies** on other plugins.

---

### 3. `@ever-works/plugin-filters` (packages/plugin-filters)

**Purpose**: Client-side filtering of items by category, tag, and text search with URL sync.

**Factory function**: `filtersPlugin(options?: FiltersPluginOptions): Plugin`

**Options**:
```typescript
interface FiltersPluginOptions {
    /** Which filter types to enable (default: all) */
    enabledFilters?: ('category' | 'tag' | 'search')[];
    /** Whether to sync filter state with URL params (default: true) */
    urlSync?: boolean;
    /** URL parameter names */
    paramNames?: {
        category?: string;   // default: 'category'
        tag?: string;        // default: 'tag'
        search?: string;     // default: 'q'
    };
}
```

**Exports**:
- `filtersPlugin()` — factory function returning `Plugin`
- `filterItems(items: ItemData[], filters: ActiveFilters): ItemData[]` — pure utility
- `parseFiltersFromUrl(url: URL, paramNames: ParamNames): ActiveFilters` — pure utility
- `serializeFiltersToUrl(filters: ActiveFilters, paramNames: ParamNames): URLSearchParams` — pure utility
- Types: `FiltersPluginOptions`, `ActiveFilters`, `ParamNames`

**Hooks used**: `onInit` (validate config)

**No dependencies** on other plugins.

---

### 4. `@ever-works/plugin-search` (packages/plugin-search)

**Purpose**: Static search via Pagefind. Generates search index after build.

**Factory function**: `searchPlugin(options?: SearchPluginOptions): Plugin`

**Options**:
```typescript
interface SearchPluginOptions {
    /** Pagefind bundle path (default: '/pagefind') */
    bundlePath?: string;
    /** Fields to index besides content (default: ['name', 'description']) */
    indexFields?: string[];
    /** Language for stemming (default: 'en') */
    language?: string;
}
```

**Exports**:
- `searchPlugin()` — factory function returning `Plugin`
- Types: `SearchPluginOptions`

**Hooks used**: `onAfterBuild` (run Pagefind CLI on dist/)

**No dependencies** on other plugins.

---

### 5. `@ever-works/plugin-sort` (packages/plugin-sort)

**Purpose**: Sorting utilities for item lists.

**Factory function**: `sortPlugin(options?: SortPluginOptions): Plugin`

**Options**:
```typescript
interface SortPluginOptions {
    /** Default sort field (default: 'name') */
    defaultSort?: SortField;
    /** Default sort direction (default: 'asc') */
    defaultDirection?: 'asc' | 'desc';
    /** Available sort options */
    sortOptions?: SortField[];
}

type SortField = 'name' | 'updated_at' | 'featured';
```

**Exports**:
- `sortPlugin()` — factory function returning `Plugin`
- `sortItems(items: ItemData[], field: SortField, direction: 'asc' | 'desc'): ItemData[]` — pure utility
- Types: `SortPluginOptions`, `SortField`

**Hooks used**: `onInit` (validate config), `onDataLoaded` (apply default sort)

**No dependencies** on other plugins.

---

### 6. `@ever-works/plugin-sitemap` (packages/plugin-sitemap)

**Purpose**: Astro already has `@astrojs/sitemap` integrated. This plugin wraps configuration.

**Note**: Since `@astrojs/sitemap` is already in `astro.config.ts`, this plugin only provides
configuration helpers and priority/changefreq defaults. It does NOT duplicate sitemap generation.

**Factory function**: `sitemapPlugin(options?: SitemapPluginOptions): Plugin`

**Options**:
```typescript
interface SitemapPluginOptions {
    /** Default change frequency for items (default: 'weekly') */
    changefreq?: string;
    /** Default priority for items (default: 0.7) */
    priority?: number;
    /** Pages to exclude from sitemap */
    exclude?: string[];
}
```

**Exports**:
- `sitemapPlugin()` — factory function returning `Plugin`
- Types: `SitemapPluginOptions`

**Hooks used**: `onInit` (log configuration)

**No dependencies** on other plugins.

---

## Plugin Registration Pattern

```typescript
// apps/web/src/lib/plugins.config.ts
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';

export default definePlugins([
    seoPlugin({ titleTemplate: '%s | My Directory' }),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name' }),
]);
```

## File Structure Per Plugin

```
packages/plugin-<name>/
├── src/
│   ├── index.ts          — Public API (factory + utilities)
│   ├── types.ts          — Options and internal types
│   └── plugin.ts         — Plugin implementation
├── package.json
└── tsconfig.json
```

## Success Criteria

1. Each plugin builds with `tsc --noEmit`
2. Each plugin has clear JSDoc on all exports
3. Disabling any plugin does not break the build
4. Pure utility functions are exported for use outside the plugin system
5. All TypeScript strict mode compliant
