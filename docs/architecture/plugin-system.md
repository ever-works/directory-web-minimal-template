---
title: "Plugin System"
sidebar_label: "Plugin System"
---

# Plugin System Architecture

## Overview

The plugin system is the primary extension mechanism for the template. Almost every feature beyond core data loading is implemented as a plugin.

## Design Principles

1. **Explicit registration** — Plugins are listed in `plugins.config.ts`
2. **Typed interfaces** — Every plugin implements a well-defined TypeScript interface
3. **Independent** — Plugins can be enabled/disabled without breaking the system
4. **Composable** — Plugins can depend on other plugins
5. **AI-discoverable** — Plugin capabilities are documented inline

## Plugin Interface

```typescript
/** Base interface all plugins must implement */
interface Plugin {
    /** Unique plugin identifier */
    readonly id: string;

    /** Human-readable name */
    readonly name: string;

    /** Plugin version */
    readonly version: string;

    /** Description for AI agents and docs */
    readonly description: string;

    /** IDs of plugins this one depends on */
    readonly dependencies?: string[];

    /** Plugin lifecycle hooks */
    hooks?: PluginHooks;
}

/** Lifecycle hooks a plugin can implement */
interface PluginHooks {
    /**
     * Called during build initialization.
     * Use to set up plugin state, register components, etc.
     */
    onInit?: (context: PluginContext) => Promise<void>;

    /**
     * Called after all data is loaded from content repo.
     * Use to transform, enrich, or filter data.
     */
    onDataLoaded?: (data: ContentData, context: PluginContext) => Promise<ContentData>;

    /**
     * Called before page generation.
     * Use to inject additional pages or modify existing ones.
     */
    onBeforeBuild?: (context: PluginContext) => Promise<void>;

    /**
     * Called after static build completes.
     * Use for post-processing (e.g., search indexing).
     */
    onAfterBuild?: (context: PluginContext) => Promise<void>;
}

/** Context passed to plugin hooks */
interface PluginContext {
    /** Site configuration */
    config: SiteConfig;

    /** Content root path */
    contentPath: string;

    /** Output directory path */
    outDir: string;

    /** Access to other registered plugins (read-only) */
    plugins: ReadonlyMap<string, Plugin>;

    /** Logger */
    log: PluginLogger;
}
```

## Plugin Categories

All plugins implement the single `Plugin` interface. There are no separate sub-interfaces.
A plugin's category is determined by **which hooks it implements**:

### Data Plugins
Transform or enrich loaded data via `onDataLoaded`.

```typescript
// No separate interface — just a Plugin that implements onDataLoaded
export function sortPlugin(options?: SortOptions): Plugin {
    return {
        id: 'sort',
        name: 'Sort Plugin',
        version: '0.1.0',
        description: 'Sorts items by name, date, or featured status.',
        hooks: {
            onDataLoaded: async (data, context) => {
                // Sort items and return modified data
                return { ...data, items: sortItems(data.items, options) };
            },
        },
    };
}
```

Examples: `plugin-sort`, `plugin-related-items`, `plugin-filters`

### UI Plugins
Provide Preact interactive components (islands) or Astro components.
These export both a plugin factory function AND standalone UI components.

```typescript
// Plugin factory for build-time hooks
export function searchPlugin(options?: SearchOptions): Plugin { ... }

// Standalone UI component (imported directly by pages)
// packages/plugin-search/src/SearchInput.tsx
export function SearchInput(props: SearchInputProps) { ... }
```

Examples: `plugin-search`, `plugin-filters`, `plugin-pagination`

### Build Plugins
Run during `onBeforeBuild` or `onAfterBuild` to generate artifacts.

```typescript
export function sitemapPlugin(options?: SitemapOptions): Plugin {
    return {
        id: 'sitemap',
        name: 'Sitemap Plugin',
        version: '0.1.0',
        description: 'Generates XML sitemap after build.',
        hooks: {
            onAfterBuild: async (context) => {
                // Generate sitemap.xml in outDir
            },
        },
    };
}
```

Examples: `plugin-seo`, `plugin-sitemap`, `plugin-rss`, `plugin-analytics`

### Mixed Plugins
Many plugins span multiple categories. For example, `plugin-filters` implements
`onDataLoaded` (data transformation) AND exports UI components (FilterBar).
The built-in plugins table below shows each plugin's actual categories.

## Plugin Configuration

Plugins are registered in `apps/web/src/lib/plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';
import { rssPlugin } from '@ever-works/plugin-rss';

export const plugins = definePlugins([
    seoPlugin(),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
    rssPlugin(),
]);
```

## Built-in Plugins

### Implemented

| Plugin | Type | Description |
|--------|------|-------------|
| `plugin-search` | UI + Build | Pagefind-based static search |
| `plugin-filters` | UI + Data | Category/tag filtering with URL params |
| `plugin-pagination` | UI | Standard and infinite scroll pagination |
| `plugin-seo` | Build | Meta tags, JSON-LD, Open Graph |
| `plugin-sitemap` | Build | XML sitemap generation |
| `plugin-sort` | UI + Data | Sort controls (name, date, featured) |

| `plugin-breadcrumbs` | UI + Data | Breadcrumb navigation with structured data |
| `plugin-rss` | Build | RSS 2.0 and Atom 1.0 feed generation |
| `plugin-analytics` | Build | Privacy-friendly analytics (Plausible, Umami, Fathom, GA4, custom) |
| `plugin-related-items` | Data | Compute related items based on shared tags/categories |

## Plugin Development Guide

See `docs/guides/creating-a-plugin.md` for the step-by-step guide.

### Minimal Plugin Example

```typescript
// packages/plugin-example/src/index.ts
import type { Plugin } from '@ever-works/plugins';

export function examplePlugin(options?: { greeting?: string }): Plugin {
    return {
        id: 'example',
        name: 'Example Plugin',
        version: '0.1.0',
        description: 'A minimal example plugin that logs during build.',
        hooks: {
            onInit: async (context) => {
                context.log.info(options?.greeting ?? 'Hello from example plugin!');
            },
        },
    };
}
```
