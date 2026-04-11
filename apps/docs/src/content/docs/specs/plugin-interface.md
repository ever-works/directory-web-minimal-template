---
title: Plugin Interface
description: Plugin interface contract and lifecycle specification.
---

All plugins must implement the `Plugin` interface from `@ever-works/plugins`.

## Plugin Interface

```typescript
interface Plugin {
    readonly id: string;           // lowercase, kebab-case
    readonly name: string;         // human-readable
    readonly version: string;      // semver
    readonly description: string;  // one-line, for AI agents
    readonly dependencies?: string[];
    hooks?: PluginHooks;
}
```

## Plugin Hooks

```typescript
interface PluginHooks {
    onInit?: (context: PluginContext) => Promise<void>;
    onDataLoaded?: (data: ContentData, context: PluginContext) => Promise<ContentData>;
    onBeforeBuild?: (context: PluginContext) => Promise<void>;
    onAfterBuild?: (context: PluginContext) => Promise<void>;
}
```

## Plugin Context

```typescript
interface PluginContext {
    config: SiteConfig;
    contentPath: string;
    outDir: string;
    plugins: ReadonlyMap<string, Plugin>;
    log: PluginLogger;  // info, warn, error, debug
}
```

## Lifecycle Order

1. **Registration** — `definePlugins()` validates IDs, resolves dependencies
2. **Initialization** — `onInit` called in dependency order
3. **Data Loading** — Raw content parsed from YAML
4. **Data Pipeline** — `onDataLoaded` transforms data (each plugin in order)
5. **Pre-Build** — `onBeforeBuild`
6. **Astro Build** — Static page generation
7. **Post-Build** — `onAfterBuild` (search indexing, etc.)

## Factory Pattern

All plugins are exported as factory functions:

```typescript
export function myPlugin(options?: MyPluginOptions): Plugin {
    return { id: 'my-plugin', /* ... */ };
}
```
