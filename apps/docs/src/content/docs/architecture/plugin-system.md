---
title: Plugin System
description: Extensible plugin architecture for the minimal directory template.
---

The plugin system is the primary extension mechanism. Almost every feature beyond core data loading is implemented as a plugin.

## Plugin Interface

```typescript
interface Plugin {
    readonly id: string;        // lowercase, kebab-case
    readonly name: string;      // human-readable
    readonly version: string;   // semver
    readonly description: string;
    readonly dependencies?: string[];
    hooks?: PluginHooks;
}
```

## Lifecycle Hooks

| Hook | When | Purpose |
|------|------|---------|
| `onInit` | After registration | Setup, validation |
| `onDataLoaded` | After content load | Transform/enrich data |
| `onBeforeBuild` | Before page generation | Inject routes |
| `onAfterBuild` | After static build | Post-processing (search index) |

## Built-in Plugins

| Plugin | Purpose |
|--------|---------|
| `plugin-seo` | Meta tags, Open Graph, JSON-LD |
| `plugin-pagination` | Paginate item arrays |
| `plugin-filters` | Client-side filtering |
| `plugin-search` | Static search (Pagefind) |
| `plugin-sort` | Sort items |
| `plugin-sitemap` | XML sitemap |

## Registration

Plugins are registered in `plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';

export const plugins = definePlugins([
    seoPlugin(),
    // ...more plugins
]);
```
