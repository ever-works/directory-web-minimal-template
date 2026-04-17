# @ever-works/plugin-seo

SEO plugin for the Ever Works minimal directory template. Generates HTML meta tags (Open Graph, Twitter Cards) and JSON-LD structured data for every page type. Used by the `SEO.astro` component at render time to emit proper `<head>` metadata.

## What This Package Does

1. **`generateMetaTags()`** — Produces an array of meta tag objects (name/property + content) for a given page
2. **`generateJsonLd()`** — Produces JSON-LD structured data strings (`WebSite`, `ItemList`, `Product`)
3. **Plugin registration** — Validates SEO configuration on init (URL format, template placeholders, Twitter handle)

## Meta Tags Generated

For each page, `generateMetaTags()` produces:

| Tag Type | Tags |
|----------|------|
| **Standard HTML** | `description`, `robots` |
| **Open Graph** | `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale` |
| **Twitter Cards** | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site` |

## JSON-LD Types

| Type | Schema.org Type | Used On |
|------|-----------------|---------|
| `WebSite` | `WebSite` | Home page |
| `ItemList` | `ItemList` with `ListItem` entries | Category, tag, collection pages |
| `Product` | `Product` | Individual item pages |

## Usage

### As a plugin

```typescript
import { seoPlugin } from '@ever-works/plugin-seo';

export default definePlugins([
    seoPlugin({
        titleTemplate: '%s | My Directory',
        defaultTitle: 'My Directory',
        defaultDescription: 'Find the best tools and libraries',
        siteUrl: 'https://example.com',
        defaultOgImage: '/og-image.png',
        twitterHandle: '@mysite',
    }),
]);
```

### Generating meta tags

```typescript
import { generateMetaTags } from '@ever-works/plugin-seo';

const tags = generateMetaTags(
    { title: 'React', description: 'A JS library', url: '/item/react' },
    { titleTemplate: '%s | My Site', siteUrl: 'https://example.com' },
);
// [{ key: 'name', value: 'description', content: 'A JS library' }, ...]
```

### Generating JSON-LD

```typescript
import { generateJsonLd } from '@ever-works/plugin-seo';

const jsonLd = generateJsonLd('WebSite', {
    name: 'My Directory',
    url: 'https://example.com',
    description: 'Find the best tools',
});
// '{"@context":"https://schema.org","@type":"WebSite",...}'
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `titleTemplate` | `string` | `'%s'` | Page title template. `%s` is replaced with the page title. |
| `defaultTitle` | `string` | `''` | Fallback title when page has none |
| `defaultDescription` | `string` | `''` | Fallback description |
| `siteUrl` | `string` | `''` | Base URL for canonical/OG URLs |
| `defaultOgImage` | `string` | `undefined` | Default Open Graph image URL |
| `twitterHandle` | `string` | `undefined` | Twitter handle (e.g., `@mysite`) |
| `locale` | `string` | `'en_US'` | Open Graph locale |
| `jsonLd` | `boolean` | `true` | Whether to generate JSON-LD |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | `SiteConfig`, `ItemData` types |
| `@ever-works/plugins` | `Plugin` interface |

## Testing

64 unit tests across 5 test files covering meta tag generation (title templates, fallbacks, OG, Twitter) and JSON-LD generation (WebSite, ItemList, Product).

```bash
pnpm --filter @ever-works/plugin-seo test
```
