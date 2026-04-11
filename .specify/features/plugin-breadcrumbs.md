# Feature: Plugin — Breadcrumbs

## Description

A plugin that auto-generates breadcrumb navigation trails for all known page types. Works with the existing `Breadcrumbs.astro` UI component from `@ever-works/ui`.

## User Stories

- As a **visitor**, I want to see my navigation path (e.g., Home > Categories > Form Components) so I can orient myself and navigate back.
- As an **AI agent**, I want breadcrumb data generated automatically so I don't need to manually build breadcrumb arrays for each page type.
- As a **developer**, I want a pure function I can call to get breadcrumbs for any path, independent of the plugin system.

## Acceptance Criteria

1. Plugin generates breadcrumb trails for all 12 page routes
2. Home page trail: `[Home]`
3. Category page trail: `[Home, Categories, {category.name}]`
4. Item page trail: `[Home, {primary_category.name}, {item.name}]`
5. Tag page trail: `[Home, Tags, {tag.name}]`
6. Collection page trail: `[Home, Collections, {collection.name}]`
7. Index pages (categories, tags, collections, comparisons) include Home + section name
8. All trails have correct `href` values (except the last/current page)
9. Home label and href are configurable
10. Custom label overrides supported for specific paths
11. Export pure function for use without plugin system
12. TypeScript strict — no `any` types

## Package Structure

```
packages/plugin-breadcrumbs/
├── src/
│   ├── index.ts         — Public API (barrel export)
│   ├── types.ts         — BreadcrumbEntry, BreadcrumbMap, BreadcrumbsPluginOptions
│   ├── generator.ts     — Pure function: generateBreadcrumbs(data, options) → BreadcrumbMap
│   └── plugin.ts        — Plugin factory: breadcrumbsPlugin(options) → Plugin
├── package.json
└── tsconfig.json
```

## Dependencies

- `@ever-works/core` (for ContentData, category/tag/item types)
- `@ever-works/plugins` (for Plugin interface)

## Integration

Pages use the generated breadcrumb map:
```typescript
import { generateBreadcrumbs } from '@ever-works/plugin-breadcrumbs';
const breadcrumbs = generateBreadcrumbs(contentData);
const crumbs = breadcrumbs.get('/category/form-components');
```

Then pass to the UI component:
```astro
<Breadcrumbs items={crumbs} />
```

## Technical Notes

- The `generateBreadcrumbs` function is pure — no side effects, no I/O
- The plugin's `onDataLoaded` hook attaches the breadcrumb map to content data
- Items use their primary category (first in the array) for the breadcrumb trail
- If an item has no category, the trail is `[Home, {item.name}]`
