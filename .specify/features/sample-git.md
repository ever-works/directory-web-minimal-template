# Feature: Sample Git Reference Implementation

## Description

A complete, working reference implementation that demonstrates how the minimal template operates at scale using the **Git data adapter** to load real-world content from a remote GitHub repository. The sample implements a "Time Tracking" directory — a curated listing of time tracking tools sourced from the [awesome-time-tracking-data](https://github.com/ever-works/awesome-time-tracking-data) repository maintained by Ever Works.

This sample serves three purposes:
1. **Git adapter proof of concept** — Shows the template loading content from a remote Git repository at build time
2. **Scale validation** — Demonstrates the template handling 1000+ items with acceptable build performance
3. **Reference for AI agents** — Provides a second, data-rich reference alongside `sample-basic` to show how the same architecture adapts to different data sources and volumes

## User Stories

- As an **AI agent**, I want a reference implementation using the Git data adapter so I can follow the same patterns when building directory sites backed by remote data repos.
- As a **developer**, I want to see the template handling a large dataset (1000+ items) to validate build performance and pagination at scale.
- As a **developer**, I want to understand how `clone-content.ts` fetches data from a remote Git repository before build.
- As a **visitor**, I want to browse time tracking tools by category, tag, collection, or search.
- As a **visitor**, I want to view detailed information about each time tracking tool, including rendered Markdown descriptions.
- As a **visitor**, I want to compare tools side by side on comparison pages.
- As a **visitor**, I want a fast, responsive dark-themed experience on any device.

## Feature Overview

| Aspect | Detail |
|--------|--------|
| Directory name | Time Tracking |
| Item type | Tool / App |
| Items count | 1000+ (sourced from remote data repo) |
| Categories | Defined in remote data repo |
| Tags | Defined in remote data repo |
| Collections | Supported (pages rendered when data exists) |
| Comparisons | Supported (pages rendered when data exists) |
| Plugins | All 10 built-in plugins enabled |
| Data source | Git adapter — clones `awesome-time-tracking-data` repo |
| Styling | Tailwind CSS v4, shadcn/ui-inspired dark theme |
| Theme | Dark mode default, light/dark toggle with system preference detection |
| Output | Fully static (Astro `output: 'static'`) |
| Build output | ~5030 pages |

## Data Source

### Git Data Adapter

Unlike `sample-basic` which stores content directly in the app's `.content/` directory, `sample-git` fetches content from a remote GitHub repository at build time using the Git data adapter.

**Remote repository:** `https://github.com/ever-works/awesome-time-tracking-data`
**Branch:** `master`

### Prebuild Clone Script (`scripts/clone-content.ts`)

The `clone-content.ts` script runs as a `predev` and `prebuild` step:

1. Checks if `CONTENT_PATH` is set (local filesystem adapter) — skips clone if so
2. Checks if `.content/` already exists — skips clone if so (idempotent)
3. Clones the data repository with `--depth 1 --single-branch` for minimal fetch
4. Supports `GH_TOKEN` for private repository authentication

**Environment variables (`.env`):**

```
DATA_REPOSITORY=https://github.com/ever-works/awesome-time-tracking-data
GITHUB_BRANCH=master
```

### Content Loading (`src/lib/content.ts`)

Content loading uses the adapter pattern from `@ever-works/adapters`:

1. Resolves adapter configuration via `resolveAdapterConfig()` (reads env vars)
2. Creates and initializes the appropriate adapter (`createAdapter`)
3. Calls `loadContent(adapter)` from `@ever-works/core` to parse YAML data
4. Runs plugin lifecycle hooks (`runInit`, `runDataLoaded`) on the loaded data
5. Caches the result in-memory for subsequent page generation calls

## Pages Implemented

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.astro` | Home page with hero banner and interactive ItemBrowser Preact island |
| `/item/[slug]` | `item/[slug].astro` | Item detail page with rendered Markdown content |
| `/category/[slug]` | `category/[slug].astro` | Category listing — all items in a category |
| `/categories` | `categories.astro` | Categories index — all categories |
| `/tag/[slug]` | `tag/[slug].astro` | Tag listing — all items with a given tag |
| `/tags` | `tags.astro` | Tags index — all tags |
| `/collection/[slug]` | `collection/[slug].astro` | Collection page (rendered when collections exist) |
| `/collections` | `collections.astro` | Collections index |
| `/comparison/[slug]` | `comparison/[slug].astro` | Side-by-side tool comparison page |
| `/comparisons` | `comparisons.astro` | Comparisons index |
| `/page/[page]` | `page/[page].astro` | Paginated listing |
| `/pages/[slug]` | `pages/[slug].astro` | Static pages from Markdown content |
| `/404` | `404.astro` | Not found page |
| `/data/items.json` | `data/items.json.ts` | JSON API endpoint for all items (used by ItemBrowser) |

## Plugin Configuration

All 10 built-in plugins enabled in `plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';
import { breadcrumbsPlugin } from '@ever-works/plugin-breadcrumbs';
import { rssPlugin } from '@ever-works/plugin-rss';
import { analyticsPlugin } from '@ever-works/plugin-analytics';
import { relatedItemsPlugin } from '@ever-works/plugin-related-items';

export const plugins = definePlugins([
    seoPlugin(),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
    breadcrumbsPlugin(),
    rssPlugin(),
    relatedItemsPlugin({ maxItems: 4 }),
    analyticsPlugin({
        providers: [{ provider: 'custom', html: '<!-- analytics: demo -->' }],
    }),
]);
```

**Differences from sample-basic plugin config:**
- `seoPlugin()` uses default options (no custom `titleTemplate` or `defaultImage`)
- All samples share all 10 built-in plugins including `breadcrumbsPlugin()`, `rssPlugin()`, `analyticsPlugin()`, and `relatedItemsPlugin()`

## Astro Integration

The `astro.config.ts` uses the `@ever-works/astro-integration` package to wire plugin build lifecycle hooks (`onBeforeBuild`, `onAfterBuild`) into the Astro build pipeline:

```typescript
everWorksIntegration({
    getRunner: () => getPluginRunner(),
    getContent: () => getContent(),
}),
```

Both `sample-basic` and `sample-git` use this pattern to demonstrate the full plugin lifecycle integration.

## Build Performance

| Metric | Value |
|--------|-------|
| Total pages generated | ~5030 |
| Build time (observed) | ~24 seconds |
| Pages per second | ~62 |
| Clone strategy | `--depth 1 --single-branch` (shallow clone) |
| Content caching | In-memory singleton (loaded once, reused across pages) |

The build demonstrates that the template architecture scales to large datasets without architectural changes — the same page templates, plugin system, and content loading pipeline work for 10 items or 1000+ items.

## Styling Approach

### Tailwind CSS v4 + shadcn/ui-Inspired Theme

- Uses `@tailwindcss/vite` plugin (Tailwind v4 API)
- Uses custom `.prose` CSS styles in `global.css` for Markdown rendering
- CSS custom properties mapped to Tailwind color tokens via `@theme inline`
- shadcn/ui naming conventions: `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Colors use oklch color space for perceptual uniformity

### Dark Mode

- **Dark mode is the default** (`.dark` class applied by default)
- Light theme defined on `:root`, dark theme overrides via `.dark` selector
- Custom variant: `@custom-variant dark (&:is(.dark *))` for Tailwind dark utilities
- `ThemeToggle` Preact island from `@ever-works/ui` for runtime switching
- Persists preference to `localStorage`

### Prose / Markdown Rendering

- Custom `.prose` styles for rendered Markdown content on item detail pages
- Uses `marked` library for Markdown-to-HTML conversion
- Dark mode overrides for links and inline code blocks

## Components

| Component | Type | Description |
|-----------|------|-------------|
| `ItemBrowser.tsx` | Preact island (`client:load`) | Interactive browser with search, sort, category/tag filters, and pagination |
| `BreadcrumbNav.astro` | Astro component | Breadcrumb navigation using `@ever-works/plugin-breadcrumbs` data |
| `BaseLayout.astro` | Astro layout | Root layout with header, footer, theme toggle, back-to-top, SEO meta tags |
| `ThemeToggle` | Preact island (from `@ever-works/ui`) | Dark/light mode toggle |
| `BackToTop` | Preact island (from `@ever-works/ui`) | Scroll-to-top button |
| `SearchInput` | Preact component (from `@ever-works/ui`) | Debounced search input |

## How It Differs from sample-basic

| Aspect | sample-basic | sample-git |
|--------|-------------|------------|
| **Data source** | Hardcoded `.content/` checked into repo | Remote Git repository cloned at build time |
| **Data adapter** | Filesystem (implicit) | Git adapter via `@ever-works/adapters` |
| **Data volume** | ~10 curated items | 1000+ real-world items |
| **Environment variables** | Not required | `DATA_REPOSITORY`, `GITHUB_BRANCH` (optional `GH_TOKEN`) |
| **Prebuild step** | `clone-content.ts` is a no-op | `clone-content.ts` performs a shallow git clone |
| **Content type** | React UI Component Libraries | Time Tracking Tools |
| **Collections** | Supported (rendered when data exists) | Supported (rendered when data exists) |
| **Comparisons** | Supported (rendered when data exists) | Supported (rendered when data exists) |
| **Static pages** | Supported via `/pages/[slug]` route | Supported via `/pages/[slug]` route |
| **Breadcrumbs plugin** | Enabled with `BreadcrumbNav` component | Enabled with `BreadcrumbNav` component |
| **Astro integration** | Uses `@ever-works/astro-integration` for plugin build hooks | Uses `@ever-works/astro-integration` for plugin build hooks |
| **Styling theme** | Slate-based with indigo accent | shadcn/ui-inspired zinc dark theme (oklch) |
| **Dark mode** | System preference default | Dark mode default |
| **Markdown rendering** | Not needed (minimal descriptions) | Full prose styles with `marked` library |
| **Typography plugin** | Not used | Custom `.prose` CSS styles in `global.css` |
| **Primary purpose** | Demonstrate basic template usage | Validate Git adapter and scale performance |

## File Structure

```
apps/sample-git/
├── .env                          — Data repository configuration
├── scripts/
│   └── clone-content.ts          — Prebuild: shallow-clone data repo into .content/
├── src/
│   ├── components/
│   │   ├── BreadcrumbNav.astro   — Breadcrumb navigation (plugin-breadcrumbs)
│   │   └── ItemBrowser.tsx       — Preact island: search, filter, sort, paginate
│   ├── layouts/
│   │   └── BaseLayout.astro      — Root layout (header, footer, theme, SEO)
│   ├── lib/
│   │   ├── content.ts            — Content loading via Git adapter + plugin runner
│   │   └── plugins.config.ts     — Plugin configuration (10 plugins)
│   ├── pages/
│   │   ├── index.astro           — Home (hero + ItemBrowser island)
│   │   ├── categories.astro      — Categories index
│   │   ├── tags.astro            — Tags index
│   │   ├── collections.astro     — Collections index
│   │   ├── comparisons.astro     — Comparisons index
│   │   ├── 404.astro             — Not found
│   │   ├── rss.xml.ts            — RSS feed
│   │   ├── atom.xml.ts           — Atom feed
│   │   ├── robots.txt.ts         — robots.txt generation
│   │   ├── data/
│   │   │   └── items.json.ts     — JSON API endpoint for all items
│   │   ├── item/
│   │   │   └── [slug].astro      — Item detail with Markdown content
│   │   ├── category/
│   │   │   └── [slug].astro      — Category listing
│   │   ├── tag/
│   │   │   └── [slug].astro      — Tag listing
│   │   ├── collection/
│   │   │   └── [slug].astro      — Collection page
│   │   ├── comparison/
│   │   │   └── [slug].astro      — Comparison page
│   │   ├── page/
│   │   │   └── [page].astro      — Paginated listing
│   │   └── pages/
│   │       └── [slug].astro      — Static pages (Markdown)
│   ├── styles/
│   │   └── global.css            — Tailwind v4 + shadcn/ui theme tokens
│   └── env.d.ts                  — Astro environment type declarations
├── astro.config.ts               — Astro config with Ever Works integration
├── package.json
└── tsconfig.json
```

## Dependencies

### Runtime
- `astro` ^6.1.8
- `@astrojs/preact` ^5.1.1
- `@astrojs/sitemap` ^3.7.2
- `@astrojs/vercel` ^10.0.4
- `@tailwindcss/vite` ^4.2.2
- `tailwindcss` ^4.2.2
- `preact` ^10.29.1
- `marked` ^18.0.2
- `yaml` ^2.8.3
- `@ever-works/core` workspace:*
- `@ever-works/plugins` workspace:*
- `@ever-works/adapters` workspace:*
- `@ever-works/ui` workspace:*
- `@ever-works/astro-integration` workspace:*
- `@ever-works/sync` workspace:*
- `@ever-works/plugin-seo` workspace:*
- `@ever-works/plugin-pagination` workspace:*
- `@ever-works/plugin-filters` workspace:*
- `@ever-works/plugin-search` workspace:*
- `@ever-works/plugin-sort` workspace:*
- `@ever-works/plugin-sitemap` workspace:*
- `@ever-works/plugin-breadcrumbs` workspace:*
- `@ever-works/plugin-rss` workspace:*
- `@ever-works/plugin-analytics` workspace:*
- `@ever-works/plugin-related-items` workspace:*

### Dev
- `@ever-works/tsconfig` workspace:*
- `@astrojs/check` ^0.9.8
- `pagefind` ^1.5.2
- `typescript` ^6.0.3

## Build Verification Steps

1. `pnpm install` — All dependencies resolve
2. Create `.env` with `DATA_REPOSITORY` and `GITHUB_BRANCH` values
3. `pnpm --filter @ever-works/sample-git build` — Prebuild clones data, Astro build succeeds
4. Verify ~5030 generated pages exist in `dist/`
5. Spot-check key pages:
   - `dist/index.html` — Home page with ItemBrowser
   - `dist/item/*/index.html` — Item detail pages
   - `dist/category/*/index.html` — Category listing pages
   - `dist/tag/*/index.html` — Tag listing pages
   - `dist/categories/index.html` — Categories index
   - `dist/tags/index.html` — Tags index
   - `dist/404.html` — Not found page
6. All pages contain valid HTML with proper SEO meta tags
7. Dark mode toggle functions (Preact island hydrates)
8. Breadcrumb navigation renders correctly on detail pages
9. ItemBrowser search, filter, sort, and pagination work client-side
10. No console errors in development server

## Technical Notes

- The sample uses `resolveAdapterConfig()` from `@ever-works/adapters` which reads `DATA_REPOSITORY`, `GH_TOKEN`, and `GITHUB_BRANCH` from environment variables to configure the Git adapter automatically
- Content is loaded once and cached in a module-level singleton (`_cached`), ensuring the data repository is parsed only once even though many pages call `getContent()`
- The `@ever-works/astro-integration` hooks into `astro:build:start` and `astro:build:done` to run plugin lifecycle methods (e.g., sitemap generation)
- The `.content/` directory is git-ignored and created at build time — it does not exist in the source tree
- Vite SSR config includes `noExternal: [/^@ever-works\//]` to bundle workspace packages through Vite rather than Node's ESM resolver, avoiding resolution issues in the monorepo
- `pagefind` is included as a dev dependency for potential client-side search indexing
- The `marked` library handles Markdown-to-HTML rendering for item descriptions and static pages
