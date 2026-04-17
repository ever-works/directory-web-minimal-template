# Feature: Plugin — Sitemap

## Description

A configuration-layer plugin that wraps Astro's built-in `@astrojs/sitemap` integration with directory-specific defaults. The plugin itself does **not** generate XML — it resolves user options against sensible defaults (change frequency, priority, exclusions) and logs the resolved configuration during the `onInit` lifecycle hook. Actual sitemap XML generation is delegated entirely to `@astrojs/sitemap`, which is registered as an Astro integration in `astro.config.ts`.

## User Stories

- As a **site owner**, I want an XML sitemap generated automatically so search engines can discover and index all my directory pages.
- As an **AI agent**, I want a single plugin call (`sitemapPlugin()`) that applies sensible directory defaults without requiring manual sitemap configuration.
- As a **developer**, I want to exclude specific paths (e.g., `/404`, `/admin/*`) from the sitemap without editing the Astro integration directly.
- As a **developer**, I want to tune change frequency and priority globally so the sitemap reflects how often my directory content updates.

## Acceptance Criteria

1. Plugin returns a valid `Plugin` object with `id`, `name`, `version`, and `description`
2. Plugin `id` is `'sitemap'`
3. Default `changefreq` is `'weekly'`
4. Default `priority` is `0.7`
5. Default `exclude` is `[]` (empty array)
6. All three options are individually overridable
7. Partial overrides merge with defaults (omitted fields keep their default values)
8. `onInit` hook logs the resolved `changefreq` and `priority`
9. `onInit` hook logs excluded paths only when the exclude list is non-empty
10. Passing `undefined` options behaves identically to passing no options
11. Multiple calls to `sitemapPlugin()` produce independent plugin instances
12. TypeScript strict — no `any` types
13. Sitemap XML files (`sitemap-index.xml`, `sitemap-0.xml`) appear in build output via `@astrojs/sitemap`

## Package Structure

```
packages/plugin-sitemap/
├── src/
│   ├── index.ts                   — Public API (barrel export)
│   ├── types.ts                   — SitemapPluginOptions, ResolvedSitemapConfig, ChangeFrequency
│   ├── plugin.ts                  — Plugin factory: sitemapPlugin(options?) → Plugin
│   └── __tests__/
│       ├── plugin.test.ts         — 14 unit tests for plugin behavior
│       └── barrel-exports.test.ts — Barrel export verification
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── README.md
```

## Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `@ever-works/core` | runtime | Content types (transitive, not directly imported) |
| `@ever-works/plugins` | runtime | `Plugin` interface |
| `@astrojs/sitemap` | peer (Astro integration) | Actual XML sitemap generation, configured in `astro.config.ts` |

## Exported API

### Runtime Exports (from `index.ts`)

```typescript
export { sitemapPlugin } from './plugin';
export type { SitemapPluginOptions, ResolvedSitemapConfig, ChangeFrequency } from './types';
```

Only one runtime value is exported: the `sitemapPlugin` factory function. The remaining exports are TypeScript types.

### `sitemapPlugin(options?: SitemapPluginOptions): Plugin`

Factory function that creates a configured sitemap plugin instance.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | `SitemapPluginOptions` | No | Configuration overrides; all fields optional |

**Returns:** A `Plugin` object conforming to the `@ever-works/plugins` interface.

**Plugin metadata:**

| Field | Value |
|-------|-------|
| `id` | `'sitemap'` |
| `name` | `'Sitemap Plugin'` |
| `version` | `'0.1.0'` |
| `description` | `'Wraps Astro sitemap integration with directory-specific defaults'` |
| `dependencies` | none |

## Configuration Options

### `SitemapPluginOptions`

All fields are optional. Omitted fields fall back to defaults.

```typescript
interface SitemapPluginOptions {
    changefreq?: ChangeFrequency;
    priority?: number;
    exclude?: string[];
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `changefreq` | `ChangeFrequency` | `'weekly'` | Suggested crawl frequency for search engines |
| `priority` | `number` | `0.7` | Relative priority of URLs (0.0 to 1.0) |
| `exclude` | `string[]` | `[]` | URL path patterns to exclude from the sitemap |

### `ChangeFrequency`

Union type of valid sitemap change frequency values per the [Sitemaps protocol](https://www.sitemaps.org/protocol.html):

```typescript
type ChangeFrequency =
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
```

### `ResolvedSitemapConfig`

Internal type where all fields are required (after merging with defaults):

```typescript
interface ResolvedSitemapConfig {
    changefreq: ChangeFrequency;
    priority: number;
    exclude: string[];
}
```

## Hook Implementations

The plugin implements a single lifecycle hook:

### `onInit(context: PluginContext): Promise<void>`

Called once during build initialization after all plugins are registered.

**Behavior:**

1. Logs a summary line: `Sitemap: changefreq={value}, priority={value}`
2. If `exclude` is non-empty, logs a second line: `Sitemap: excluding {path1}, {path2}, ...`
3. If `exclude` is empty, no exclusion log line is emitted (only the summary line)

**Hooks NOT implemented:**

| Hook | Reason |
|------|--------|
| `onDataLoaded` | Plugin does not transform content data |
| `onBeforeBuild` | No pre-build work needed |
| `onAfterBuild` | XML generation is handled by `@astrojs/sitemap` Astro integration |

## Sitemap XML Generation (via `@astrojs/sitemap`)

The plugin itself does not produce XML. Sitemap generation is handled by the `@astrojs/sitemap` Astro integration, which is configured separately in each app's `astro.config.ts`:

```typescript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: process.env.SITE_URL || 'https://example.com',
    integrations: [
        sitemap(),
    ],
});
```

### Output Files

`@astrojs/sitemap` generates:

| File | Description |
|------|-------------|
| `/sitemap-index.xml` | Sitemap index pointing to individual sitemap files |
| `/sitemap-0.xml` | First (and typically only) sitemap containing all page URLs |

### XML Format

The generated sitemap follows the [Sitemaps XML protocol](https://www.sitemaps.org/protocol.html):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://example.com/</loc>
    </url>
    <url>
        <loc>https://example.com/item/some-tool/</loc>
    </url>
    <!-- ... all statically rendered pages ... -->
</urlset>
```

### URL Generation Logic

`@astrojs/sitemap` automatically discovers all statically rendered pages in the Astro build output. For a typical directory site, this includes:

- `/` — Home page
- `/item/{slug}/` — Individual item pages
- `/category/{slug}/` — Category pages
- `/categories/` — Category index
- `/tag/{slug}/` — Tag pages
- `/tags/` — Tag index
- `/collection/{slug}/` — Collection pages
- `/collections/` — Collection index
- `/comparisons/` — Comparisons index
- `/compare/{slugA}-vs-{slugB}/` — Comparison pages
- `/page/{slug}/` — Static pages
- Any other routes defined in the Astro app

The `site` property in `astro.config.ts` provides the base URL prefix for all `<loc>` entries. This is sourced from the `SITE_URL` environment variable (falling back to `https://example.com`).

### Priority and Frequency Settings

The `changefreq` and `priority` values configured via this plugin represent directory-level defaults. The `@astrojs/sitemap` integration itself supports per-URL overrides through its own `serialize` option, but this plugin applies a uniform configuration approach:

- **Default `changefreq: 'weekly'`** — appropriate for directories that update regularly but not constantly
- **Default `priority: 0.7`** — above the protocol default of 0.5, reflecting that directory items are primary content

These values are resolved and logged by the plugin but must be passed to `@astrojs/sitemap`'s configuration to take effect in the XML output.

## Integration

### Registering the Plugin

```typescript
import { definePlugins } from '@ever-works/plugins';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';

export const plugins = definePlugins([
    sitemapPlugin(),
    // or with overrides:
    sitemapPlugin({
        changefreq: 'daily',
        priority: 0.8,
        exclude: ['/404'],
    }),
]);
```

### Relationship to Astro Integration

The architecture has a deliberate separation of concerns:

1. **`@ever-works/plugin-sitemap`** — Plugin system participant; resolves and logs configuration
2. **`@astrojs/sitemap`** — Astro integration; generates the actual XML files at build time

Both are configured independently: the plugin in `plugins.config.ts`, the integration in `astro.config.ts`. The plugin does not programmatically configure or invoke the Astro integration.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No options passed | All defaults applied: `changefreq='weekly'`, `priority=0.7`, `exclude=[]` |
| `undefined` passed explicitly | Identical to no options |
| Empty `exclude` array (`[]`) | No exclusion log line emitted; single summary log only |
| Partial options (e.g., only `changefreq`) | Provided field overrides default; omitted fields keep defaults |
| Multiple plugin instances | Each `sitemapPlugin()` call returns an independent object; they share the same `id` |
| `priority` set to `0` | Valid — will be used as-is (protocol allows 0.0) |
| `priority` set to `1.0` | Valid — logged as `priority=1` |
| Missing `site` in Astro config | `@astrojs/sitemap` may warn or skip generation; this plugin is unaffected |
| No `@astrojs/sitemap` in Astro config | Plugin initializes and logs normally but no XML is generated |

## Testing

14 unit tests across two test files:

### `plugin.test.ts` (12 tests)

- Plugin metadata validation (`id`, `name`, `version`, `description`)
- `onInit` hook existence
- Default `changefreq`, `priority`, and `exclude` behavior
- User overrides for each option individually
- All overrides applied together
- Partial overrides (only `changefreq`, only `priority`)
- Empty `exclude` array edge case
- `undefined` options equivalence
- Independent plugin instances

### `barrel-exports.test.ts` (2 tests)

- `sitemapPlugin` factory is exported
- No unexpected runtime values exported

## Technical Notes

- The plugin is a **configuration-only wrapper** — it has no side effects beyond logging
- Unlike plugins such as `plugin-rss` or `plugin-breadcrumbs`, this plugin does not implement `onDataLoaded` or `onAfterBuild` because it delegates XML generation to an external Astro integration
- The `exclude` option uses glob patterns (e.g., `/admin/*`) matching the convention of `@astrojs/sitemap`
- The `ResolvedSitemapConfig` type ensures all fields are required after merging, preventing undefined-access bugs in the hook implementation
- Configuration merging uses nullish coalescing (`??`) so `false`-y values like `0` for priority are preserved correctly
