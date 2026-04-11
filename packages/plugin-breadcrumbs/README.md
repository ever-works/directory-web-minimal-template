# @ever-works/plugin-breadcrumbs

Breadcrumb generation plugin for the Ever Works minimal directory template. Computes breadcrumb trails for every page type in the directory (items, categories, tags, collections, comparisons) and attaches them to the content data for use by the `Breadcrumbs.astro` UI component.

## What This Package Does

1. **Generates breadcrumb trails** for all page types based on the site's URL structure
2. **Attaches a `_breadcrumbs` map** to `ContentData` via the `onDataLoaded` hook so pages can look up their breadcrumbs at render time
3. **Exports a pure utility** `generateBreadcrumbs()` that can be used standalone without the plugin system

## How It Works

During the `onDataLoaded` lifecycle phase, the plugin calls `generateBreadcrumbs()` which produces a `BreadcrumbMap` — a `Map<string, BreadcrumbEntry[]>` keyed by URL path. Each entry is a `{ label, href? }` pair.

Example output for an item page:

```
"/item/react" => [
    { label: "Home", href: "/" },
    { label: "Libraries", href: "/category/libraries" },
    { label: "React" }
]
```

## Supported Page Types

| Page | Breadcrumb Trail |
|------|-----------------|
| Home `/` | `[Home]` |
| Categories `/categories` | `[Home, Categories]` |
| Category `/category/:slug` | `[Home, Categories, <Category Name>]` |
| Tags `/tags` | `[Home, Tags]` |
| Tag `/tag/:slug` | `[Home, Tags, <Tag Name>]` |
| Item `/item/:slug` | `[Home, <Primary Category>, <Item Name>]` |
| Collections `/collections` | `[Home, Collections]` |
| Collection `/collection/:slug` | `[Home, Collections, <Collection Name>]` |
| Comparisons `/comparisons` | `[Home, Comparisons]` |
| Comparison `/comparison/:slug` | `[Home, Comparisons, <Comparison Title>]` |

## Usage

### As a plugin (recommended)

```typescript
// plugins.config.ts
import { breadcrumbsPlugin } from '@ever-works/plugin-breadcrumbs';

export default definePlugins([
    breadcrumbsPlugin({ homeLabel: 'Home' }),
]);
```

### Standalone utility

```typescript
import { generateBreadcrumbs } from '@ever-works/plugin-breadcrumbs';

const breadcrumbMap = generateBreadcrumbs(contentData, {
    homeLabel: 'Home',
    homeHref: '/',
});
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `homeLabel` | `string` | `'Home'` | Label for the home breadcrumb |
| `homeHref` | `string` | `'/'` | URL for the home breadcrumb |
| `labels` | `Record<string, string>` | `{}` | Override labels for specific paths (e.g., `{ '/categories': 'Browse' }`) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | `ContentData` types for reading items, categories, etc. |
| `@ever-works/plugins` | `Plugin` interface and `PluginContext` |

## Testing

22 unit tests covering breadcrumb generation for all page types, custom labels, edge cases.

```bash
pnpm --filter @ever-works/plugin-breadcrumbs test
```
