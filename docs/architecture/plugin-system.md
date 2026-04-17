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

    /** Access to other registered plugins */
    plugins: Map<string, Plugin>;

    /** Logger */
    log: PluginLogger;
}
```

## Plugin Types

### Data Plugins
Transform or enrich loaded data.

```typescript
interface DataPlugin extends Plugin {
    hooks: {
        onDataLoaded: (data: ContentData, context: PluginContext) => Promise<ContentData>;
    };
}
```

Examples: `plugin-sort`, `plugin-related-items`, `plugin-filters`

### UI Plugins
Provide Astro/Preact components.

```typescript
interface UIPlugin extends Plugin {
    /** Components this plugin provides */
    components: Record<string, ComponentDefinition>;
}

interface ComponentDefinition {
    /** Import path for the component */
    importPath: string;
    /** Component props interface description */
    props: string;
    /** Usage example for AI agents */
    example: string;
}
```

Examples: `plugin-search`, `plugin-filters`, `plugin-pagination`

### Page Plugins
Add new pages/routes to the site.

```typescript
interface PagePlugin extends Plugin {
    /** Page routes this plugin adds */
    pages: PageDefinition[];
}

interface PageDefinition {
    /** URL pattern (e.g., '/comparisons/[slug]') */
    pattern: string;
    /** Description of what this page shows */
    description: string;
}
```

Examples: `plugin-sitemap`, `plugin-rss`

### Build Plugins
Run during build pipeline (pre/post).

```typescript
interface BuildPlugin extends Plugin {
    hooks: {
        onBeforeBuild?: (context: PluginContext) => Promise<void>;
        onAfterBuild?: (context: PluginContext) => Promise<void>;
    };
}
```

Examples: `plugin-seo`, `plugin-sitemap`, `plugin-rss`

## Plugin Configuration

Plugins are registered in `apps/web/src/lib/plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { searchPlugin } from '@ever-works/plugin-search';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { seoPlugin } from '@ever-works/plugin-seo';

export default definePlugins([
    searchPlugin({
        // Search-specific options
        indexFields: ['name', 'description', 'tags'],
    }),
    filtersPlugin({
        // Filter options
        enableCategoryFilter: true,
        enableTagFilter: true,
    }),
    paginationPlugin({
        itemsPerPage: 20,
        style: 'standard',
    }),
    seoPlugin({
        generateJsonLd: true,
        generateSitemap: true,
    }),
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
