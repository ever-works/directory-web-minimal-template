# @ever-works/plugin-sitemap

Sitemap configuration plugin for the Ever Works minimal directory template. Wraps Astro's built-in `@astrojs/sitemap` integration with directory-specific defaults for change frequency, priority, and URL exclusions.

## What This Package Does

1. **Configures sitemap generation** with sensible defaults for directory websites
2. **Provides URL exclusion** for pages that shouldn't appear in the sitemap
3. **Integrates with the plugin system** so sitemap settings can be defined alongside other plugins

## How It Works

Actual sitemap XML generation is handled by Astro's `@astrojs/sitemap` integration (configured in `astro.config.ts`). This plugin provides the configuration layer — it resolves options with defaults and makes them available to the Astro integration.

The generated `sitemap-index.xml` and `sitemap-0.xml` files appear in the build output at `/sitemap-index.xml`.

## Usage

### As a plugin

```typescript
import { sitemapPlugin } from '@ever-works/plugin-sitemap';

export default definePlugins([
    sitemapPlugin({
        changefreq: 'daily',
        priority: 0.8,
        exclude: ['/404'],
    }),
]);
```

### Default configuration

Without any options, the plugin uses:

```typescript
{
    changefreq: 'weekly',
    priority: 0.7,
    exclude: [],
}
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `changefreq` | `ChangeFrequency` | `'weekly'` | How often pages change (`'always'`, `'hourly'`, `'daily'`, `'weekly'`, `'monthly'`, `'yearly'`, `'never'`) |
| `priority` | `number` | `0.7` | URL priority for search engines (0.0 to 1.0) |
| `exclude` | `string[]` | `[]` | URL paths to exclude from the sitemap (e.g., `['/404', '/admin']`) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | Types |
| `@ever-works/plugins` | `Plugin` interface |
| `@astrojs/sitemap` | Actual sitemap XML generation (peer, configured in `astro.config.ts`) |

## Testing

14 unit tests covering plugin metadata, default config, user overrides, partial merging, and edge cases.

```bash
pnpm --filter @ever-works/plugin-sitemap test
```
