# @ever-works/plugin-rss

RSS 2.0 and Atom 1.0 feed generation plugin for the Ever Works minimal directory template.

## Usage

```typescript
import { definePlugins } from '@ever-works/plugins';
import { rssPlugin } from '@ever-works/plugin-rss';

export default definePlugins([
    rssPlugin({
        siteUrl: 'https://example.com',
        limit: 25,
    }),
]);
```

### Generating Feed Pages

In your Astro app, create `src/pages/rss.xml.ts`:

```typescript
import type { APIRoute } from 'astro';
import { buildFeedEntries, generateRss, resolveRssConfig } from '@ever-works/plugin-rss';

export const GET: APIRoute = async () => {
    const config = resolveRssConfig({ siteUrl: 'https://example.com' }, 'My Directory');
    const entries = buildFeedEntries(items, config);
    return new Response(generateRss(entries, config), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
};
```

### Generating Atom Feeds

The package also exports `generateAtom` and `toAtomDate` from `atom-generator.ts` for Atom 1.0 feed generation.

Create `src/pages/atom.xml.ts`:

```typescript
import type { APIRoute } from 'astro';
import { buildFeedEntries, generateAtom, toAtomDate, resolveRssConfig } from '@ever-works/plugin-rss';

export const GET: APIRoute = async () => {
    const config = resolveRssConfig({ siteUrl: 'https://example.com' }, 'My Directory');
    const entries = buildFeedEntries(items, config);
    return new Response(generateAtom(entries, config), {
        headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
    });
};
```

`toAtomDate()` converts a `Date` or ISO string into the RFC 3339 format required by Atom feeds.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `config.company_name` | Feed title |
| `description` | `string` | Auto-generated | Feed description |
| `siteUrl` | `string` | `''` | Base URL for absolute links |
| `limit` | `number` | `50` | Max items in feed |
| `atom` | `boolean` | `true` | Generate Atom feed |
| `sortBy` | `string` | `'date-desc'` | Item sort order |
