---
title: "Plugin Interface"
sidebar_label: "Plugin Interface"
---

# Plugin Interface Specification

> Defines the contract that all plugins must implement.

## Base Plugin Interface

```typescript
/**
 * Base interface that all plugins must implement.
 * Plugins are the primary extension mechanism for the template.
 */
interface Plugin {
    /** Unique identifier (lowercase, kebab-case) */
    readonly id: string;

    /** Human-readable name */
    readonly name: string;

    /** Semantic version */
    readonly version: string;

    /** One-line description (shown in docs and AI agent context) */
    readonly description: string;

    /** IDs of plugins this one requires */
    readonly dependencies?: string[];

    /** Lifecycle hooks */
    hooks?: PluginHooks;
}
```

## Plugin Hooks

```typescript
interface PluginHooks {
    /**
     * Called once during build initialization, after all plugins are registered.
     * Use for: setting up state, validating config, registering components.
     */
    onInit?: (context: PluginContext) => Promise<void>;

    /**
     * Called after content is loaded from the data source.
     * Use for: transforming data, computing derived fields, filtering.
     * Must return the (possibly modified) data.
     */
    onDataLoaded?: (data: ContentData, context: PluginContext) => Promise<ContentData>;

    /**
     * Called before Astro page generation begins.
     * Use for: injecting additional routes, modifying build config.
     */
    onBeforeBuild?: (context: PluginContext) => Promise<void>;

    /**
     * Called after Astro build completes and static files are generated.
     * Use for: post-processing (search indexing, sitemap generation, etc.)
     */
    onAfterBuild?: (context: PluginContext) => Promise<void>;
}
```

## Plugin Context

```typescript
interface PluginContext {
    /** Loaded site configuration */
    config: SiteConfig;

    /** Absolute path to content directory */
    contentPath: string;

    /** Absolute path to build output directory */
    outDir: string;

    /** Map of all registered plugins (id → plugin) */
    plugins: ReadonlyMap<string, Plugin>;

    /** Structured logger */
    log: PluginLogger;
}

interface PluginLogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
}
```

## Content Data

```typescript
/** The complete loaded content, passed through plugin pipeline */
interface ContentData {
    items: ItemData[];
    categories: CategoryWithCount[];
    tags: TagWithCount[];
    collections: CollectionData[];
    comparisons: ComparisonData[];
    config: SiteConfig;
}
```

## Plugin Registration

Plugins are registered in `plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';

export default definePlugins([
    // Each entry is a plugin factory function call
    pluginA({ option: 'value' }),
    pluginB(),
]);
```

The `definePlugins` function:
1. Validates all plugin IDs are unique
2. Resolves dependency order (topological sort)
3. Returns an ordered array of initialized plugins

## Plugin Lifecycle

```
1. Registration (definePlugins)
   └── Validate IDs, resolve dependencies

2. Initialization (onInit)
   └── Called in dependency order

3. Data Loading (@ever-works/core loads content)
   └── Raw content parsed from YAML

4. Data Pipeline (onDataLoaded)
   └── Each plugin transforms data in dependency order
   └── Output of one plugin is input to the next

5. Pre-Build (onBeforeBuild)
   └── Last chance to modify before page generation

6. Astro Build
   └── Static pages generated

7. Post-Build (onAfterBuild)
   └── Post-processing on generated static files
```

## Plugin Factory Pattern

All plugins are exported as factory functions that accept options:

```typescript
// packages/plugin-search/src/index.ts
import type { Plugin } from '@ever-works/plugins';

interface SearchPluginOptions {
    /** Fields to include in search index */
    indexFields?: string[];
    /** Pagefind language */
    language?: string;
}

export function searchPlugin(options: SearchPluginOptions = {}): Plugin {
    const { indexFields = ['name', 'description'], language = 'en' } = options;

    return {
        id: 'search',
        name: 'Search Plugin',
        version: '0.1.0',
        description: 'Pagefind-based static search for directory items.',
        hooks: {
            onAfterBuild: async (context) => {
                // Run Pagefind on the output directory
                context.log.info('Building search index...');
                // ...
            },
        },
    };
}
```

## Rules for Plugin Authors

1. **Single responsibility** — One plugin, one feature
2. **No side effects at import** — All setup happens in `onInit`
3. **Return modified data** — `onDataLoaded` must return the data object
4. **Declare dependencies** — If you need another plugin, list it
5. **Graceful degradation** — If a dependency is missing, warn but don't crash
6. **TypeScript strict** — No `any`, full type safety
7. **JSDoc everything** — All public APIs documented
