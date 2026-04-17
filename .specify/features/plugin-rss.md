# Feature: RSS/Atom Feed Plugin

## Summary

Add `@ever-works/plugin-rss` — a plugin that generates RSS 2.0 and optionally Atom feeds for directory items. This enables feed readers, aggregators, and syndication services to subscribe to directory updates.

## Goals

- Generate valid RSS 2.0 XML feed from directory items
- Generate valid Atom 1.0 XML feed (optional, enabled by default)
- Pure build-time generation — no runtime dependencies
- Support configurable item limits, title templates, and custom fields
- Follow same plugin conventions as existing plugins

## Non-Goals

- Real-time feed updates (this is a static site)
- JSON Feed format (can be added later as a separate plugin)
- Per-category/per-tag feeds (can be added later)

## Data Contract

### Input

The feed generator receives:
- `ContentData` — full loaded content with items, config, etc.
- `RssPluginOptions` — user configuration

### Output

- `/rss.xml` — RSS 2.0 feed (always generated)
- `/atom.xml` — Atom 1.0 feed (generated when `atom: true`, default)

## Plugin Options

```typescript
interface RssPluginOptions {
    /** Site title for the feed. Falls back to config.company_name */
    title?: string;
    /** Site description for the feed */
    description?: string;
    /** Base URL of the site (required for absolute URLs) */
    siteUrl?: string;
    /** Maximum number of items in the feed (default: 50) */
    limit?: number;
    /** Whether to generate Atom feed alongside RSS (default: true) */
    atom?: boolean;
    /** Custom feed filename (default: 'rss.xml') */
    rssFilename?: string;
    /** Custom Atom feed filename (default: 'atom.xml') */
    atomFilename?: string;
    /** Sort order for items (default: 'date-desc') */
    sortBy?: 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
}
```

## Feed Content

Each feed entry maps from `ItemData`:
- `title` → `item.name`
- `link` → `{siteUrl}/item/{item.slug}/`
- `description` → `item.description`
- `pubDate` / `updated` → `item.updated_at`
- `guid` → `{siteUrl}/item/{item.slug}/`
- `category` → first category name

## Implementation

### Package Structure

```
packages/plugin-rss/
├── src/
│   ├── index.ts          — barrel exports
│   ├── plugin.ts         — plugin factory
│   ├── types.ts          — type definitions
│   ├── rss-generator.ts  — RSS 2.0 XML generation
│   ├── atom-generator.ts — Atom 1.0 XML generation
│   └── __tests__/
│       ├── rss-generator.test.ts
│       └── atom-generator.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── README.md
```

### Integration

1. Add plugin to `definePlugins()` in sample apps
2. Generate feed XML files as static Astro pages (`/rss.xml`, `/atom.xml`)
3. Add `<link rel="alternate">` tags in page head for feed autodiscovery

## Testing

- Unit tests for RSS XML generation (valid structure, escaping, limits)
- Unit tests for Atom XML generation
- Verify XML is well-formed
- Test with empty items array
- Test sorting options
- Test limit truncation

## Acceptance Criteria

- [x] `pnpm typecheck` passes with 0 errors
- [x] `pnpm test` passes for plugin-rss (54 tests)
- [x] Generated RSS validates against RSS 2.0 spec
- [x] Generated Atom validates against Atom 1.0 spec
- [x] Feed autodiscovery links in page head
- [x] All sample apps include feed generation
