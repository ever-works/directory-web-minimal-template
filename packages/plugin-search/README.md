# @ever-works/plugin-search

Search indexing plugin for the Ever Works minimal directory template. Runs [Pagefind](https://pagefind.app/) after the Astro build to generate a static search index from the rendered HTML pages. The index is loaded client-side on demand — zero JavaScript until the user interacts with search.

## What This Package Does

1. **Runs Pagefind** via `npx pagefind --site <outDir>` in the `onAfterBuild` lifecycle hook
2. **Generates a static search index** from the built HTML pages (stored in `dist/pagefind/`)
3. **Configures search behavior** — bundle path, language, and which fields to index

## How It Works

Pagefind is a build-time search tool designed for static sites. After Astro generates all HTML pages in `dist/`, this plugin runs Pagefind which:

1. Crawls all `.html` files in the output directory
2. Builds an inverted search index (compressed, chunked for lazy loading)
3. Outputs the index + UI assets to `dist/pagefind/`

At runtime, when a user types in the search input, Pagefind loads only the relevant index chunks — resulting in fast, bandwidth-efficient search with no server.

## Usage

### As a plugin

```typescript
import { searchPlugin } from '@ever-works/plugin-search';

export default definePlugins([
    searchPlugin({
        language: 'en',
        bundlePath: '/pagefind',
        indexFields: ['name', 'description'],
    }),
]);
```

### Client-side integration

The search index works with the `SearchInput` Preact component from `@ever-works/ui`, or you can use Pagefind's JavaScript API directly:

```html
<link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
<script src="/pagefind/pagefind-ui.js"></script>
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bundlePath` | `string` | `'/pagefind'` | URL path where the search bundle is served |
| `language` | `string` | `'en'` | Language for stemming and stop words |
| `indexFields` | `string[]` | `['name', 'description']` | Which data fields are indexed for search |

## Error Handling

If Pagefind is not installed or fails to run, the plugin logs a warning and continues — the build succeeds without a search index rather than failing entirely. This is intentional: search is an enhancement, not a requirement.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/core` | Types |
| `@ever-works/plugins` | `Plugin` interface |
| [pagefind](https://pagefind.app/) | Search indexing (invoked via `npx`, not a direct dependency) |

## Why Pagefind?

- **Built for static sites** — generates search at build time, no server needed
- **Tiny client payload** — loads only relevant index chunks on demand (~10KB initial)
- **No external service** — no API keys, no third-party search provider
- **Configurable** — supports language-specific stemming, custom indexing

## Testing

18 unit tests covering plugin metadata, config resolution, Pagefind CLI invocation (mocked), error handling, and barrel exports.

```bash
pnpm --filter @ever-works/plugin-search test
```
