# @ever-works/plugins

Plugin system for the Ever Works minimal directory template. Provides the infrastructure for defining, registering, ordering, and executing plugins through a build lifecycle pipeline. This is the backbone of the template's extensibility — almost every feature is implemented as a plugin.

## What This Package Does

1. **Defines the `Plugin` interface** — Metadata (id, name, version) plus optional lifecycle hooks
2. **`definePlugins()`** — Validates uniqueness, resolves dependency order via topological sort
3. **`PluginRunner`** — Executes lifecycle hooks across all plugins in order, with error isolation
4. **`createPluginLogger()`** — Creates scoped loggers prefixed with `[plugin:<id>]`

## Package Structure

```
src/
├── index.ts          — Public API barrel export
├── types.ts          — Plugin, PluginHooks, PluginContext, PluginLogger interfaces
├── define-plugins.ts — Registration + dependency resolution (topological sort)
├── runner.ts         — PluginRunner class (executes hooks in order)
└── logger.ts         — Scoped plugin logger factory
```

## Plugin Lifecycle

Plugins participate in a four-phase build lifecycle:

```
1. onInit          — Plugin initialization (validate config, set up state)
         ↓
2. onDataLoaded    — Transform content data (filter, sort, enrich)
         ↓
3. onBeforeBuild   — Pre-build actions (inject routes, modify config)
         ↓
4. onAfterBuild    — Post-build actions (search indexing, sitemap, etc.)
```

Each hook receives a `PluginContext` with site config, paths, a plugin registry, and a scoped logger.

The `onDataLoaded` hook is special — it forms a **transform pipeline** where each plugin's output feeds into the next. If a plugin throws, its output is skipped and the previous data passes through unchanged.

## Usage

### Defining plugins (in `plugins.config.ts`)

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { searchPlugin } from '@ever-works/plugin-search';
import { filtersPlugin } from '@ever-works/plugin-filters';

export default definePlugins([
    seoPlugin({ titleTemplate: '%s | My Site' }),
    filtersPlugin(),
    searchPlugin(),
]);
```

### Running the pipeline

```typescript
import { PluginRunner } from '@ever-works/plugins';
import plugins from './plugins.config';

const runner = new PluginRunner(plugins);

// Phase 1: Initialize all plugins
await runner.runInit({ config, contentPath, outDir });

// Phase 2: Transform loaded data
const transformed = await runner.runDataLoaded(rawContent, { config, contentPath, outDir });

// Phase 3: Pre-build
await runner.runBeforeBuild({ config, contentPath, outDir });

// Phase 4: Post-build
await runner.runAfterBuild({ config, contentPath, outDir });
```

### Creating a plugin

```typescript
import type { Plugin } from '@ever-works/plugins';

export function myPlugin(options?: { greeting?: string }): Plugin {
    const greeting = options?.greeting ?? 'Hello';

    return {
        id: 'my-plugin',
        name: 'My Plugin',
        version: '0.1.0',
        description: 'Does something useful',
        hooks: {
            onInit: async (ctx) => {
                ctx.log.info(`${greeting} from my plugin!`);
            },
            onDataLoaded: async (data, ctx) => {
                // Transform and return data
                return { ...data, items: data.items.filter(i => i.featured) };
            },
        },
    };
}
```

## Error Isolation

The runner catches errors from individual plugins so that one broken plugin doesn't crash the entire build:

- **`onInit` / `onBeforeBuild` / `onAfterBuild`** — Error is logged, execution continues to the next plugin
- **`onDataLoaded`** — Error is logged, the previous data passes through unchanged to the next plugin
- **`null` / `undefined` return from `onDataLoaded`** — Treated as an error, previous data preserved

## Dependency Resolution

Plugins can declare dependencies on other plugins:

```typescript
{
    id: 'my-plugin',
    dependencies: ['filters', 'sort'],
    // ...
}
```

`definePlugins()` performs a topological sort so dependencies always initialize and execute before their dependents. Circular dependencies throw an error at registration time.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | `ContentData` and `SiteConfig` types used in hook signatures |

## Testing

39 unit tests (19 runner + 20 integration) covering lifecycle execution, dependency ordering, error isolation, transform pipelines, and context propagation.

```bash
pnpm --filter @ever-works/plugins test
```
