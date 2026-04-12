# SKILLS.md -- AI Agent Guide for Building Directory Websites

> Step-by-step skills for AI agents (Claude Code, Cursor, etc.) to build
> directory websites from this minimal Astro template.
> Read **CLAUDE.md** and **AGENTS.md** first for project rules and architecture.

---

## Table of Contents

1. [Build a Directory Website from Scratch](#skill-1-build-a-directory-website-from-scratch)
2. [Add a New Page Type](#skill-2-add-a-new-page-type)
3. [Customize Item Card Design](#skill-3-customize-item-card-design)
4. [Configure Search and Filters](#skill-4-configure-search-and-filters)
5. [Deploy to Vercel](#skill-5-deploy-to-vercel)
6. [Create a Custom Plugin](#skill-6-create-a-custom-plugin)
7. [Style the Template with Tailwind CSS](#skill-7-style-the-template-with-tailwind-css)
8. [Reference: Data Contracts](#reference-data-contracts)
9. [Reference: Content Directory Structure](#reference-content-directory-structure)
10. [Reference: Component Attribute Map](#reference-component-attribute-map)
11. [Quick Reference: Common Tasks](#quick-reference-common-tasks)

---

## Skill 1: Build a Directory Website from Scratch

End-to-end process from blank template to deployed directory site.

### Step 1 -- Read the project docs

Read these files in order to understand constraints:

```
CLAUDE.md     -- Architecture overview, critical rules, monorepo structure
AGENTS.md     -- Mandatory rules R1-R15, working process, data contracts
```

Key constraints to internalize:
- TypeScript only (no JS/Python source files)
- Static output with ISR (`output: 'static'` + Vercel adapter for ISR by default; set `ENABLE_ISR=false` for pure static)
- Plugin architecture -- almost every feature is a plugin
- Git-first data -- YAML files in `.content/` directories, no database

### Step 2 -- Clone or fork the template

```bash
git clone <template-repo-url> my-directory
cd my-directory
pnpm install
```

Verify the monorepo structure:

```
apps/web/              -- The Astro site you will customize
apps/sample-basic/     -- Reference implementation (React UI Components directory)
apps/sample-jobs/      -- Reference implementation (Remote Tech Jobs directory)
apps/sample-events/    -- Reference implementation (Tech Events directory, teal, port 4325)
apps/sample-real-estate/ -- Reference implementation (Property Listings directory, amber, port 4326)
apps/sample-git/       -- Reference implementation using Git data adapter (1495 pages)
packages/core/         -- Data types and loaders (do not modify)
packages/ui/           -- Headless components (import, do not modify)
packages/plugins/      -- Plugin system (do not modify)
packages/adapters/     -- Git/filesystem adapters (do not modify)
packages/plugin-*      -- Built-in plugins (configure, do not modify)
```

### Step 3 -- Connect to a data repository

The template reads content from a separate Git repository (or a local `.content/` directory).

**Option A: Remote Git repo (production)**

Create a `.env` file in `apps/web/`:

```env
DATA_REPOSITORY=https://github.com/your-org/your-content-repo.git
GH_TOKEN=ghp_your_github_personal_access_token
GITHUB_BRANCH=main
```

**Option B: Local filesystem (development)**

```env
CONTENT_PATH=../../apps/sample-basic/.content
# Or use a vertical-specific sample:
# CONTENT_PATH=../../apps/sample-events/.content
# CONTENT_PATH=../../apps/sample-real-estate/.content
```

**Option C: Default fallback**

If no env vars are set, the adapter looks for `apps/web/.content/` on disk.

Resolution order (from `packages/adapters/src/create-adapter.ts`):

1. Explicit `localPath` in config -- uses `FilesystemAdapter`
2. Explicit `repository` in config -- uses `GitAdapter`
3. `CONTENT_PATH` env var -- uses `FilesystemAdapter`
4. `DATA_REPOSITORY` env var -- uses `GitAdapter` (reads `GH_TOKEN`, `GITHUB_BRANCH`)
5. Fallback: `FilesystemAdapter` with `.content/`

### Step 4 -- Explore the data

Start the dev server to see the raw headless output:

```bash
pnpm dev:web
```

Then inspect the content programmatically. In any `.astro` page frontmatter:

```typescript
import { getContent } from '../lib/content';
const { items, categories, tags, collections, comparisons, config, total } = await getContent();

// Explore what's available
console.log(`Site: ${config.company_name}`);
console.log(`Total items: ${total}`);
console.log(`Categories: ${categories.map(c => c.name).join(', ')}`);
console.log(`Tags: ${tags.map(t => t.name).join(', ')}`);
```

Study any sample app's `.content/` directory for the YAML format. Each sample demonstrates a different vertical:

- `apps/sample-basic/.content/` -- React UI Components (general-purpose reference)
- `apps/sample-events/.content/` -- Tech Events/Conferences (event-specific meta fields)
- `apps/sample-real-estate/.content/` -- Property Listings (real-estate-specific meta fields)

Basic structure (from `apps/sample-basic/.content/`):

```
.content/
  config.yml          -- company_name, item_name, items_name, pagination, etc.
  categories.yml      -- [{id, name, icon_url?}]
  tags.yml            -- [{id, name, isActive?}]
  collections.yml     -- [{id, slug, name, description, items?}]
  data/
    shadcn-ui/
      shadcn-ui.yml   -- {name, description, source_url, category, tags, ...}
    radix-ui/
      radix-ui.yml
```

### Step 5 -- Choose a design direction

Decide on the visual identity before writing CSS:

- **Color palette** -- Primary, secondary, accent, background, text colors
- **Typography** -- Font families, sizes, weights
- **Layout** -- Grid columns (2, 3, or 4), card style, spacing
- **Dark mode** -- Whether to support `dark:` variants

### Step 6 -- Apply Tailwind CSS styling

All pages in `apps/web/src/pages/` render headless HTML with `data-component` and `data-part` attributes. Styling is applied in `apps/web/src/styles/global.css`.

The global.css file starts with just:

```css
@import "tailwindcss";
```

Add your custom styles using Tailwind's `@apply` or raw CSS targeting `data-*` attributes. See [Skill 7](#skill-7-style-the-template-with-tailwind-css) for the full styling guide.

### Step 7 -- Customize layouts

Edit `apps/web/src/layouts/BaseLayout.astro` to modify the site shell:

- **Header**: `data-component="site-header"` -- logo, navigation links
- **Main**: `data-component="main"` -- page content slot
- **Footer**: `data-component="site-footer"` -- copyright

The layout accepts these props:

```typescript
interface Props {
    title: string;
    description?: string;
    config: SiteConfig;
    canonicalUrl?: string;
    ogImage?: string;
    pageType?: 'website' | 'article' | 'product';
}
```

### Step 8 -- Configure plugins

Edit `apps/web/src/lib/plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';

export const plugins = definePlugins([
    seoPlugin({
        titleTemplate: '%s | My Directory',
        siteUrl: 'https://my-directory.com',
        defaultOgImage: 'https://my-directory.com/og.png',
    }),

    paginationPlugin({ itemsPerPage: 12 }),

    filtersPlugin(),

    searchPlugin(),

    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),

    sitemapPlugin(),
]);
```

To disable a plugin, remove or comment out its line. The build works with zero plugins.

### Step 9 -- Build and verify

```bash
cd apps/web
pnpm build          # Produces static HTML in dist/
pnpm preview        # Serve dist/ locally to verify
```

Or from the monorepo root:

```bash
pnpm build          # Builds all apps via Turborepo
```

### Step 10 -- Deploy to Vercel

See [Skill 5](#skill-5-deploy-to-vercel) for full deployment instructions.

---

## Skill 2: Add a New Page Type

How to create new page routes in the Astro site.

### Static page (no dynamic data)

Create a file in `apps/web/src/pages/`. The filename becomes the URL path.

```
apps/web/src/pages/about.astro     -->  /about
apps/web/src/pages/faq.astro       -->  /faq
```

Example `apps/web/src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';

const { config } = await getContent();
---

<BaseLayout title="About" config={config}>
    <section data-component="about-page">
        <h1 data-part="heading">About {config.company_name}</h1>
        <p data-part="body">
            A curated directory of {config.items_name.toLowerCase()}.
        </p>
    </section>
</BaseLayout>
```

### Dynamic page with getStaticPaths

For pages generated per item/category/tag, use `[slug].astro` with `getStaticPaths()`.

Example `apps/web/src/pages/collection/[slug].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getContent } from '../../lib/content';
import type { CollectionData } from '@ever-works/core';

export async function getStaticPaths() {
    const { collections } = await getContent();
    return collections
        .filter((col) => col.isActive !== false)
        .map((col) => ({
            params: { slug: col.slug },
            props: { collection: col },
        }));
}

interface Props {
    collection: CollectionData;
}

const { collection } = Astro.props;
const { items, config } = await getContent();

// Filter items belonging to this collection
const collectionItems = items.filter((item) =>
    collection.items?.includes(item.slug)
);
---

<BaseLayout title={collection.name} config={config}>
    <section data-component="collection-page">
        <h1 data-part="heading">{collection.name}</h1>
        <p data-part="description">{collection.description}</p>

        <div data-part="grid">
            {collectionItems.map((item) => (
                <article data-component="item-card">
                    {item.icon_url && (
                        <img src={item.icon_url} alt={item.name} data-part="icon" loading="lazy" />
                    )}
                    <h3 data-part="name">
                        <a href={`/item/${item.slug}`}>{item.name}</a>
                    </h3>
                    {item.description && (
                        <p data-part="description">{item.description}</p>
                    )}
                </article>
            ))}
        </div>
    </section>
</BaseLayout>
```

### Key pattern: always use getContent()

Every page imports `getContent()` from `apps/web/src/lib/content.ts`. This function:

1. Initializes the data adapter (Git or filesystem)
2. Loads all YAML content via `@ever-works/core`
3. Runs the plugin pipeline (`onInit`, `onDataLoaded` hooks)
4. Caches the result in memory for the duration of the build

```typescript
import { getContent } from '../lib/content';
const { items, categories, tags, collections, comparisons, config, total } = await getContent();
```

The return type is `ContentData`:

```typescript
interface ContentData {
    items: ItemData[];
    categories: CategoryWithCount[];
    tags: TagWithCount[];
    collections: CollectionData[];
    comparisons: ComparisonData[];
    pages: PageData[];
    config: SiteConfig;
    total: number;
}
```

### Existing pages in the template

| File | URL | Purpose |
|------|-----|---------|
| `pages/index.astro` | `/` | Home page with hero, category nav, paginated grid |
| `pages/page/[page].astro` | `/page/2`, `/page/3` | Paginated listing pages |
| `pages/item/[slug].astro` | `/item/shadcn-ui` | Item detail page |
| `pages/category/[slug].astro` | `/category/full-suite` | Items filtered by category |
| `pages/categories.astro` | `/categories` | All categories list |
| `pages/tag/[slug].astro` | `/tag/typescript` | Items filtered by tag |
| `pages/tags.astro` | `/tags` | All tags list |
| `pages/comparison/[slug].astro` | `/comparison/a-vs-b` | Side-by-side comparison |
| `pages/404.astro` | (any 404) | Not found page |

---

## Skill 3: Customize Item Card Design

The item card is the most important visual component. It appears on the home page, category pages, tag pages, and related items sections.

### Step 1 -- Understand the item card HTML structure

Every item card in the template renders with this structure:

```html
<article data-component="item-card" data-featured>
    <img src="..." alt="..." data-part="icon" loading="lazy" />
    <h3 data-part="name">
        <a href="/item/slug">Item Name</a>
    </h3>
    <p data-part="description">Short description...</p>
    <span data-part="category">category-id</span>
</article>
```

Available `data-part` values:
- `icon` -- Item logo/icon image
- `name` -- Item name with link to detail page
- `description` -- Short text description
- `category` -- Category label (only on listing pages, not on category-filtered pages)

The `data-featured` attribute is present (with no value) when `item.featured === true`.

### Step 2 -- Style with Tailwind in global.css

Add styles to `apps/web/src/styles/global.css`:

```css
@import "tailwindcss";

/* Item Card */
[data-component="item-card"] {
    @apply bg-white rounded-xl border border-gray-200 p-5 
           transition-all duration-200 hover:shadow-lg hover:border-blue-300
           flex flex-col gap-3;
}

[data-component="item-card"][data-featured] {
    @apply ring-2 ring-blue-500 border-blue-200;
}

[data-component="item-card"] [data-part="icon"] {
    @apply w-12 h-12 rounded-lg object-contain;
}

[data-component="item-card"] [data-part="name"] {
    @apply text-lg font-semibold;
}

[data-component="item-card"] [data-part="name"] a {
    @apply text-gray-900 hover:text-blue-600 no-underline;
}

[data-component="item-card"] [data-part="description"] {
    @apply text-sm text-gray-600 line-clamp-2;
}

[data-component="item-card"] [data-part="category"] {
    @apply text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 
           rounded-full w-fit mt-auto;
}
```

### Step 3 -- Style the item grid container

The grid container wraps multiple item cards:

```css
[data-part="grid"] {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

### Step 4 -- Dark mode support

```css
.dark [data-component="item-card"],
[data-component="root"].dark [data-component="item-card"] {
    @apply bg-gray-800 border-gray-700 hover:border-blue-500;
}

.dark [data-component="item-card"] [data-part="name"] a {
    @apply text-white hover:text-blue-400;
}

.dark [data-component="item-card"] [data-part="description"] {
    @apply text-gray-400;
}
```

### Step 5 -- Add hover animations

```css
[data-component="item-card"] {
    @apply transform hover:-translate-y-1;
}

[data-component="item-card"] [data-part="icon"] {
    @apply transition-transform duration-200;
}

[data-component="item-card"]:hover [data-part="icon"] {
    @apply scale-110;
}
```

### Available ItemData fields

When customizing the card, you can access any field from the `ItemData` interface:

```typescript
interface ItemData {
    id: string;
    name: string;
    slug: string;
    description: string;
    source_url: string;
    category: string | string[];
    tags: string[];
    collections?: string[];
    featured?: boolean;
    icon_url?: string;
    updated_at: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    markdown?: string;
    brand?: string;
    brand_logo_url?: string;
    images?: string[];
    publisher?: string;
    [key: string]: unknown; // Additional YAML fields are preserved
}
```

To display additional fields (e.g., tags) on the card, edit the inline card markup in the page file (e.g., `pages/index.astro`) and add more `data-part` elements.

---

## Skill 4: Configure Search and Filters

The template includes Preact-based interactive components for client-side search and filtering. These use Astro's islands architecture -- they hydrate only when needed.

### Step 1 -- Import the interactive components

In any `.astro` page, import Preact components from `@ever-works/ui`:

```astro
---
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
import SortSelect from '@ever-works/ui/preact/SortSelect';
import { getContent } from '../lib/content';

const { items, categories, tags, config } = await getContent();
---
```

### Step 2 -- Add search input with hydration directive

```astro
<SearchInput
    client:visible
    placeholder={`Search ${config.items_name.toLowerCase()}...`}
    debounceMs={300}
/>
```

Hydration directives:
- `client:load` -- Hydrate immediately on page load (use for above-the-fold)
- `client:visible` -- Hydrate when scrolled into viewport (recommended for most cases)
- `client:idle` -- Hydrate when browser is idle (use for low-priority components)

### Step 3 -- Add filter bar

```astro
<FilterBar
    client:visible
    categories={categories}
    tags={tags}
/>
```

The `FilterBar` component renders:
- Category filter buttons (`data-part="category-options"`)
- Tag filter buttons (`data-part="tag-options"`)
- Clear all button (`data-part="clear-all"`)

Selected state is indicated by the `data-selected` attribute on buttons.

### Step 4 -- Add sort selector

```astro
<SortSelect
    client:visible
    options={['name-asc', 'name-desc', 'date-asc', 'date-desc', 'featured']}
    selected="name-asc"
/>
```

### Step 5 -- Style the interactive components

```css
/* Search Input */
[data-component="search-input"] {
    @apply relative;
}

[data-component="search-input"] [data-part="input"] {
    @apply w-full px-4 py-3 rounded-lg border border-gray-300 
           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
           focus:border-transparent;
}

[data-component="search-input"] [data-part="clear"] {
    @apply absolute right-3 top-1/2 -translate-y-1/2 text-sm 
           text-gray-400 hover:text-gray-600 cursor-pointer;
}

/* Filter Bar */
[data-component="filter-bar"] {
    @apply flex flex-wrap gap-4;
}

[data-component="filter-bar"] [data-part="category-option"],
[data-component="filter-bar"] [data-part="tag-option"] {
    @apply px-3 py-1.5 rounded-full text-sm border border-gray-300
           cursor-pointer transition-colors;
}

[data-component="filter-bar"] [data-part="category-option"][data-selected],
[data-component="filter-bar"] [data-part="tag-option"][data-selected] {
    @apply bg-blue-600 text-white border-blue-600;
}

[data-component="filter-bar"] [data-part="clear-all"] {
    @apply text-sm text-gray-500 hover:text-red-500 cursor-pointer;
}
```

### Step 6 -- Wire up client-side filtering (advanced)

For a fully interactive filtering experience, create a Preact island that manages state across search, filter, and sort components. This requires creating a custom Preact component in `apps/web/src/components/`:

```tsx
// apps/web/src/components/DirectoryExplorer.tsx
import { useState, useMemo } from 'preact/hooks';
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
import type { ItemData, CategoryData, TagData } from '@ever-works/core';

interface Props {
    items: ItemData[];
    categories: CategoryData[];
    tags: TagData[];
}

export default function DirectoryExplorer({ items, categories, tags }: Props) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeTags, setActiveTags] = useState<string[]>([]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Search filter
            if (query) {
                const q = query.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(q);
                const matchesDesc = item.description?.toLowerCase().includes(q);
                if (!matchesName && !matchesDesc) return false;
            }

            // Category filter
            if (activeCategory) {
                const cats = Array.isArray(item.category) ? item.category : [item.category];
                if (!cats.includes(activeCategory)) return false;
            }

            // Tag filter
            if (activeTags.length > 0) {
                if (!activeTags.some((t) => item.tags?.includes(t))) return false;
            }

            return true;
        });
    }, [items, query, activeCategory, activeTags]);

    return (
        <div data-component="directory-explorer">
            <SearchInput onSearch={setQuery} placeholder="Search..." />
            <FilterBar
                categories={categories}
                tags={tags}
                onCategoryChange={setActiveCategory}
                onTagsChange={setActiveTags}
            />
            <div data-part="results-count">
                {filteredItems.length} results
            </div>
            <div data-part="grid">
                {filteredItems.map((item) => (
                    <article key={item.slug} data-component="item-card">
                        {item.icon_url && (
                            <img src={item.icon_url} alt={item.name} data-part="icon" />
                        )}
                        <h3 data-part="name">
                            <a href={`/item/${item.slug}`}>{item.name}</a>
                        </h3>
                        <p data-part="description">{item.description}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
```

Then use it in an Astro page:

```astro
---
import DirectoryExplorer from '../components/DirectoryExplorer';
import { getContent } from '../lib/content';

const { items, categories, tags, config } = await getContent();
---

<BaseLayout title="Home" config={config}>
    <DirectoryExplorer
        client:load
        items={items}
        categories={categories}
        tags={tags}
    />
</BaseLayout>
```

### Plugin configuration

Ensure these plugins are enabled in `apps/web/src/lib/plugins.config.ts`:

```typescript
filtersPlugin(),       // Client-side filtering by category and tag
searchPlugin(),        // Static search via Pagefind (post-build index)
sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
```

---

## Skill 5: Deploy to Vercel

### Step 1 -- Push to GitHub

```bash
git init
git add .
git commit -m "Initial directory site"
git remote add origin https://github.com/your-org/your-directory.git
git push -u origin main
```

### Step 2 -- Connect to Vercel

Import the repository in the Vercel dashboard, or use the Vercel CLI:

```bash
npx vercel
```

### Step 3 -- Configure build settings

In the Vercel project settings or `vercel.json`:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Astro |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && pnpm install && pnpm build --filter=@ever-works/web-minimal` |
| **Output Directory** | `dist` |
| **Install Command** | `pnpm install` |

Alternatively, create a `vercel.json` at the monorepo root:

```json
{
    "buildCommand": "pnpm build --filter=@ever-works/web-minimal",
    "outputDirectory": "apps/web/dist",
    "installCommand": "pnpm install",
    "framework": "astro"
}
```

### Step 4 -- Set environment variables

In the Vercel dashboard (Settings > Environment Variables):

| Variable | Value | Required |
|----------|-------|----------|
| `DATA_REPOSITORY` | `https://github.com/your-org/your-content.git` | Yes |
| `GH_TOKEN` | `ghp_...` | Only for private repos |
| `GITHUB_BRANCH` | `main` | No (defaults to `main`) |
| `SITE_URL` | `https://your-domain.com` | Recommended (for sitemap) |

### Step 5 -- Deploy

Push to the `main` branch. Vercel auto-deploys on push.

For manual deploys:

```bash
npx vercel --prod
```

### Step 6 -- Verify

- Check all pages load correctly
- Verify sitemap at `/sitemap-index.xml`
- Test pagination links
- Test category and tag pages
- Check Open Graph tags (use https://ogimage.click or similar)

---

## Skill 6: Create a Custom Plugin

Plugins extend the build pipeline. They can transform data, inject routes, or post-process output.

### Step 1 -- Create the package directory

```
packages/plugin-<name>/
  src/
    index.ts       -- Public barrel export
    plugin.ts      -- Plugin factory function
    types.ts       -- Options and types
  package.json
  tsconfig.json
```

### Step 2 -- Define the package.json

```json
{
    "name": "@ever-works/plugin-<name>",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "exports": {
        ".": "./src/index.ts"
    },
    "scripts": {
        "typecheck": "tsc --noEmit",
        "clean": "rm -rf dist"
    },
    "dependencies": {
        "@ever-works/core": "workspace:*",
        "@ever-works/plugins": "workspace:*"
    },
    "devDependencies": {
        "@ever-works/tsconfig": "workspace:*",
        "typescript": "^5.7.0"
    }
}
```

### Step 3 -- Define the types

```typescript
// packages/plugin-<name>/src/types.ts

/** Configuration options for the plugin. */
export interface MyPluginOptions {
    /** Example option with a default. */
    someOption?: string;

    /** Whether to enable a feature. Defaults to true. */
    enabled?: boolean;
}
```

### Step 4 -- Implement the plugin factory

```typescript
// packages/plugin-<name>/src/plugin.ts

import type { Plugin, PluginContext } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';
import type { MyPluginOptions } from './types.js';

const PLUGIN_ID = '<name>';

/**
 * Create a <name> plugin instance.
 * @param options - Optional configuration.
 */
export function myPlugin(options: MyPluginOptions = {}): Plugin {
    return {
        id: PLUGIN_ID,
        name: '<Name> Plugin',
        version: '0.1.0',
        description: 'One-line description of what this plugin does.',

        // Optional: declare dependencies on other plugins
        // dependencies: ['seo'],

        hooks: {
            async onInit(context: PluginContext): Promise<void> {
                context.log.info('<Name> plugin initialized');
            },

            async onDataLoaded(data: ContentData, context: PluginContext): Promise<ContentData> {
                // Transform the data as needed.
                // MUST return the data object (modified or not).

                // Example: add a computed field to each item
                const transformedItems = data.items.map((item) => ({
                    ...item,
                    myCustomField: `computed-${item.slug}`,
                }));

                return {
                    ...data,
                    items: transformedItems,
                };
            },

            async onAfterBuild(context: PluginContext): Promise<void> {
                // Post-processing after static HTML is generated.
                // Example: generate a search index, process images, etc.
                context.log.info('<Name> plugin post-build complete');
            },
        },
    };
}
```

### Step 5 -- Create the barrel export

```typescript
// packages/plugin-<name>/src/index.ts

export { myPlugin } from './plugin.js';
export type { MyPluginOptions } from './types.js';
```

### Step 6 -- Register the plugin

Add the dependency to `apps/web/package.json`:

```json
{
    "dependencies": {
        "@ever-works/plugin-<name>": "workspace:*"
    }
}
```

Then register in `apps/web/src/lib/plugins.config.ts`:

```typescript
import { myPlugin } from '@ever-works/plugin-<name>';

export const plugins = definePlugins([
    // ... existing plugins
    myPlugin({ someOption: 'value' }),
]);
```

Run `pnpm install` from the monorepo root to link the workspace dependency.

### Plugin lifecycle hooks reference

```typescript
interface PluginHooks {
    /** Called once after all plugins are registered. Use for setup/validation. */
    onInit?: (context: PluginContext) => Promise<void>;

    /** Called after content is loaded. Transform/filter data here. MUST return data. */
    onDataLoaded?: (data: ContentData, context: PluginContext) => Promise<ContentData>;

    /** Called before Astro page generation. Inject routes or modify build config. */
    onBeforeBuild?: (context: PluginContext) => Promise<void>;

    /** Called after build completes. Post-process static files. */
    onAfterBuild?: (context: PluginContext) => Promise<void>;
}
```

### PluginContext fields

```typescript
interface PluginContext {
    config: SiteConfig;                        // Site configuration from config.yml
    contentPath: string;                       // Absolute path to .content/ directory
    outDir: string;                            // Absolute path to dist/ directory
    plugins: ReadonlyMap<string, Plugin>;       // All registered plugins
    log: PluginLogger;                         // Scoped logger (info, warn, error, debug)
}
```

---

## Skill 7: Style the Template with Tailwind CSS

The template uses **Tailwind CSS v4** via the `@tailwindcss/vite` plugin. All components are headless -- they render semantic HTML with `data-component` and `data-part` attributes but zero visual styling.

### Step 1 -- Understand the attribute system

Every element in the template uses two types of data attributes:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-component` | Identifies the component type | `data-component="item-card"` |
| `data-part` | Identifies a named part within a component | `data-part="name"` |

Additional state attributes:
- `data-featured` -- Present on featured items (no value)
- `data-selected` -- Present on selected filter options (no value)
- `data-winner` -- On comparison rows, value is `item_a`, `item_b`, or `tie`

### Step 2 -- Write styles in global.css

All custom CSS goes in `apps/web/src/styles/global.css`:

```css
@import "tailwindcss";

/* ─── Site Layout ───────────────────────────────────────── */

[data-component="body"] {
    @apply min-h-screen flex flex-col bg-white text-gray-900;
}

[data-component="main"] {
    @apply flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8;
}

/* ─── Site Header ───────────────────────────────────────── */

[data-component="site-header"] {
    @apply sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200;
    @apply flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full;
}

[data-component="site-header"] [data-part="logo"] {
    @apply flex items-center gap-3 no-underline;
}

[data-component="site-header"] [data-part="logo-image"] {
    @apply h-8 w-auto;
}

[data-component="site-header"] [data-part="site-name"] {
    @apply text-xl font-bold text-gray-900;
}

[data-component="site-header"] [data-part="nav"] {
    @apply flex items-center gap-6;
}

[data-component="site-header"] [data-part="nav"] a {
    @apply text-sm font-medium text-gray-600 hover:text-gray-900 
           no-underline transition-colors;
}

/* ─── Hero ──────────────────────────────────────────────── */

[data-component="hero"] {
    @apply text-center py-16;
}

[data-component="hero"] [data-part="title"] {
    @apply text-4xl sm:text-5xl font-bold text-gray-900 mb-4;
}

[data-component="hero"] [data-part="subtitle"] {
    @apply text-lg text-gray-600;
}

/* ─── Category Nav ──────────────────────────────────────── */

[data-component="category-nav"] {
    @apply mb-12;
}

[data-component="category-nav"] [data-part="list"] {
    @apply flex flex-wrap gap-3 list-none p-0;
}

[data-component="category-nav"] [data-part="item"] a {
    @apply px-4 py-2 rounded-full bg-gray-100 text-sm font-medium 
           text-gray-700 hover:bg-blue-50 hover:text-blue-700 
           no-underline transition-colors;
}

/* ─── Item Card ─────────────────────────────────────────── */

[data-component="item-card"] {
    @apply bg-white rounded-xl border border-gray-200 p-5 
           flex flex-col gap-3 transition-all duration-200 
           hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5;
}

[data-component="item-card"][data-featured] {
    @apply ring-2 ring-blue-500 border-blue-200;
}

[data-component="item-card"] [data-part="icon"] {
    @apply w-12 h-12 rounded-lg object-contain;
}

[data-component="item-card"] [data-part="name"] {
    @apply text-lg font-semibold;
}

[data-component="item-card"] [data-part="name"] a {
    @apply text-gray-900 hover:text-blue-600 no-underline;
}

[data-component="item-card"] [data-part="description"] {
    @apply text-sm text-gray-600 line-clamp-2;
}

[data-component="item-card"] [data-part="category"] {
    @apply text-xs font-medium text-blue-600 bg-blue-50 
           px-2 py-1 rounded-full w-fit mt-auto;
}

/* ─── Item Grid ─────────────────────────────────────────── */

[data-part="grid"] {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
}

/* ─── Pagination ────────────────────────────────────────── */

[data-component="pagination"] {
    @apply flex items-center justify-center gap-4 mt-12 py-4;
}

[data-component="pagination"] [data-part="prev"],
[data-component="pagination"] [data-part="next"] {
    @apply px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium 
           text-gray-700 hover:bg-blue-600 hover:text-white 
           no-underline transition-colors;
}

[data-component="pagination"] [data-part="info"] {
    @apply text-sm text-gray-500;
}

/* ─── Breadcrumbs ───────────────────────────────────────── */

[data-component="breadcrumbs"] {
    @apply flex items-center gap-2 text-sm text-gray-500 mb-8;
}

[data-component="breadcrumbs"] a {
    @apply text-gray-500 hover:text-blue-600 no-underline;
}

[data-component="breadcrumbs"] [data-part="separator"] {
    @apply text-gray-300;
}

[data-component="breadcrumbs"] [data-part="current"] {
    @apply text-gray-900 font-medium;
}

/* ─── Site Footer ───────────────────────────────────────── */

[data-component="site-footer"] {
    @apply border-t border-gray-200 py-8 text-center;
}

[data-component="site-footer"] [data-part="copyright"] {
    @apply text-sm text-gray-500;
}

/* ─── Empty State ───────────────────────────────────────── */

[data-component="empty-state"] {
    @apply text-center py-16 text-gray-500;
}
```

### Step 3 -- Dark mode

Tailwind v4 supports dark mode. Add the `dark` class to the `<html>` element (manually or via the `ThemeToggle` Preact component).

```css
/* Prepend selectors with .dark or use @media (prefers-color-scheme: dark) */

@media (prefers-color-scheme: dark) {
    [data-component="body"] {
        @apply bg-gray-950 text-gray-100;
    }

    [data-component="site-header"] {
        @apply bg-gray-950/80 border-gray-800;
    }

    [data-component="item-card"] {
        @apply bg-gray-900 border-gray-800 hover:border-blue-500;
    }

    [data-component="item-card"] [data-part="name"] a {
        @apply text-gray-100 hover:text-blue-400;
    }

    [data-component="item-card"] [data-part="description"] {
        @apply text-gray-400;
    }
}
```

### Step 4 -- Responsive breakpoints

Tailwind v4 default breakpoints:

| Prefix | Min width | Usage |
|--------|-----------|-------|
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1536px | Extra large screens |

Example responsive grid:

```css
[data-part="grid"] {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}
```

### Step 5 -- Custom fonts

Add Google Fonts in `BaseLayout.astro` head slot, then reference in CSS:

In `BaseLayout.astro`, add a `<link>` inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Then in `global.css`:

```css
[data-component="body"] {
    font-family: 'Inter', system-ui, sans-serif;
}
```

---

## Reference: Data Contracts

These TypeScript interfaces define the shape of all data in the system. They are exported from `@ever-works/core`.

### ItemData

Source: `packages/core/src/types/item.ts`
Parsed from: `.content/data/<slug>/<slug>.yml`

```typescript
interface ItemData {
    /** Unique identifier, derived from directory name */
    id: string;
    /** Display name of the item */
    name: string;
    /** URL-safe slug, same as directory name */
    slug: string;
    /** Short description of the item */
    description: string;
    /** External URL for the item (e.g., project homepage) */
    source_url: string;
    /** Category ID(s) this item belongs to. Single string or array. */
    category: string | string[];
    /** Tag IDs associated with this item */
    tags: string[];
    /** Collection IDs this item belongs to */
    collections?: string[];
    /** Whether this item is featured/promoted */
    featured?: boolean;
    /** URL to the item's icon or logo image */
    icon_url?: string;
    /** Last update timestamp in 'yyyy-MM-dd HH:mm' format */
    updated_at: string;
    /** Approval status. Only 'approved' items are shown publicly. */
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    /** Optional markdown content body */
    markdown?: string;
    /** Pass-through for any additional fields in the YAML */
    [key: string]: unknown;
}
```

### CategoryData / CategoryWithCount

Source: `packages/core/src/types/category.ts`
Parsed from: `.content/categories.yml`

```typescript
interface CategoryData {
    /** Unique identifier (lowercase, kebab-case) */
    id: string;
    /** Human-readable display name */
    name: string;
    /** Optional URL to category icon */
    icon_url?: string;
    /** Optional URL to category image */
    image_url?: string;
}

/** Category with computed item count (returned by getContent()) */
interface CategoryWithCount extends CategoryData {
    /** Number of approved items in this category */
    count: number;
}
```

### TagData / TagWithCount

Source: `packages/core/src/types/tag.ts`
Parsed from: `.content/tags.yml`

```typescript
interface TagData {
    /** Unique identifier */
    id: string;
    /** Human-readable display name */
    name: string;
    /** Whether this tag is currently active. Inactive tags are hidden. */
    isActive?: boolean;
}

/** Tag with computed item count (returned by getContent()) */
interface TagWithCount extends TagData {
    /** Number of approved items with this tag */
    count: number;
}
```

### CollectionData

Source: `packages/core/src/types/collection.ts`
Parsed from: `.content/collections.yml`

```typescript
interface CollectionData {
    /** Unique identifier */
    id: string;
    /** URL-safe slug */
    slug: string;
    /** Human-readable display name */
    name: string;
    /** Description of what this collection contains */
    description: string;
    /** Optional URL to collection icon */
    icon_url?: string;
    /** Item slugs that belong to this collection */
    items?: string[];
    /** Whether this collection is active and visible */
    isActive?: boolean;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
}
```

### ComparisonData

Source: `packages/core/src/types/comparison.ts`
Parsed from: `.content/comparisons/<slug>/<slug>.yml`

```typescript
interface ComparisonData {
    id: string;
    slug: string;
    title: string;
    item_a_slug: string;
    item_b_slug: string;
    item_a_name: string;
    item_b_name: string;
    category?: string;
    summary?: string;
    verdict?: string;
    verdict_winner?: 'item_a' | 'item_b' | 'tie';
    dimensions?: ComparisonDimension[];
    generated_at?: string;
    sources?: string[];
    content?: string;
}

interface ComparisonDimension {
    name: string;
    item_a_summary?: string;
    item_b_summary?: string;
    item_a_score?: number;    // 0-10
    item_b_score?: number;    // 0-10
    winner?: 'item_a' | 'item_b' | 'tie';
}
```

### SiteConfig

Source: `packages/core/src/types/config.ts`
Parsed from: `.content/config.yml`

```typescript
interface SiteConfig {
    /** Company or site name */
    company_name: string;
    /** Singular name for items (e.g., "Tool", "Component") */
    item_name: string;
    /** Plural name for items (e.g., "Tools", "Components") */
    items_name: string;
    /** Copyright year for footer */
    copyright_year: number;
    /** Base URL of the deployed site */
    app_url?: string;
    /** Logo configuration */
    logo?: LogoConfig;
    /** Pagination settings */
    pagination?: PaginationConfig;
    /** Feature toggles */
    settings?: SettingsConfig;
    /** Pass-through for additional config fields */
    [key: string]: unknown;
}

interface LogoConfig {
    logo_image?: string;
    logo_image_dark?: string;
    favicon?: string;
}

interface PaginationConfig {
    type: 'standard' | 'infinite';
    itemsPerPage: number;
}

interface SettingsConfig {
    categories_enabled?: boolean;
    tags_enabled?: boolean;
    [key: string]: unknown;
}
```

### ContentData (returned by getContent())

Source: `packages/core/src/types/content-data.ts`

```typescript
interface ContentData {
    items: ItemData[];
    categories: CategoryWithCount[];
    tags: TagWithCount[];
    collections: CollectionData[];
    comparisons: ComparisonData[];
    pages: PageData[];
    config: SiteConfig;
    total: number;
}
```

---

## Reference: Content Directory Structure

The `.content/` directory is the data source. It can be a local directory or a separate Git repository.

```
.content/
  config.yml                          -- Site configuration (SiteConfig)
  categories.yml                      -- Category definitions (CategoryData[])
  tags.yml                            -- Tag definitions (TagData[])
  collections.yml                     -- Collection definitions (CollectionData[])
  data/
    <item-slug>/
      <item-slug>.yml                 -- Item data (ItemData)
      <item-slug>.md                  -- Optional markdown content
  comparisons/
    <comparison-slug>/
      <comparison-slug>.yml           -- Comparison data (ComparisonData)
      <comparison-slug>.md            -- Optional comparison content
  pages/                              -- Static pages (Markdown)
```

### Example config.yml

```yaml
company_name: "React UI Components"
item_name: "Component Library"
items_name: "Component Libraries"
copyright_year: 2026
app_url: "https://react-components.example.com"

pagination:
  type: "standard"
  itemsPerPage: 12

settings:
  categories_enabled: true
  tags_enabled: true
```

### Example categories.yml

```yaml
- id: "form-components"
  name: "Form Components"

- id: "data-display"
  name: "Data Display"

- id: "full-suite"
  name: "Full Suite"
```

### Example tags.yml

```yaml
- id: "typescript"
  name: "TypeScript"
  isActive: true

- id: "accessible"
  name: "Accessible"
  isActive: true

- id: "tailwind"
  name: "Tailwind CSS"
  isActive: true
```

### Example item YAML (`.content/data/shadcn-ui/shadcn-ui.yml`)

```yaml
name: "shadcn/ui"
description: "Beautifully designed components built with Radix UI and Tailwind CSS."
source_url: "https://ui.shadcn.com"
category: "full-suite"
tags: ["typescript", "accessible", "tailwind", "open-source", "react-19"]
updated_at: "2026-04-01 11:00"
status: "approved"
featured: true
icon_url: "https://ui.shadcn.com/favicon.ico"
```

### Vertical-specific meta fields

The `ItemData` interface allows arbitrary extra fields via `[key: string]: unknown`. The convention for vertical-specific data is to use a `meta` object. This keeps custom fields namespaced and makes them easy to access in templates via `item.meta`.

**Events directory** (`apps/sample-events`):

```yaml
meta:
  date_start: "2026-06-12"
  date_end: "2026-06-13"
  location: "Amsterdam, Netherlands"
  format: "Hybrid"           # In-Person | Virtual | Hybrid
  price: "$599"
  speakers: "Kent C. Dodds, Sara Vieira, Mark Erikson"
  attendees: "2000+"
```

**Real estate directory** (`apps/sample-real-estate`):

```yaml
meta:
  price: "$485,000"
  bedrooms: "1"
  bathrooms: "1"
  sqft: "1,200"
  location: "Portland, OR"
  year_built: "1920 (renovated 2024)"
  lot_size: "N/A"
  mls_number: "DP-2026-001"
```

Access meta fields in Astro templates:

```astro
{item.meta?.date_start && (
    <span data-part="date">{item.meta.date_start}</span>
)}
{item.meta?.price && (
    <span data-part="price">{item.meta.price}</span>
)}
```

When building a new vertical, define your own `meta` fields following this pattern. The core data layer passes them through unchanged.

---

## Reference: Component Attribute Map

Complete map of all `data-component` and `data-part` attributes used across the template. Use these selectors for CSS styling.

### Layout Components

| Component | Parts | Used In |
|-----------|-------|---------|
| `data-component="root"` | (on `<html>`) | BaseLayout |
| `data-component="body"` | (on `<body>`) | BaseLayout |
| `data-component="site-header"` | `logo`, `logo-image`, `site-name`, `nav` | BaseLayout |
| `data-component="main"` | (none) | BaseLayout |
| `data-component="site-footer"` | `copyright` | BaseLayout |

### Content Components

| Component | Parts | State Attrs | Used In |
|-----------|-------|-------------|---------|
| `data-component="hero"` | `title`, `subtitle` | -- | index |
| `data-component="category-nav"` | `heading`, `list`, `item`, `count` | -- | index |
| `data-component="item-listing"` | `heading`, `grid` | -- | index, page/[page] |
| `data-component="item-card"` | `icon`, `name`, `description`, `category` | `data-featured` | index, category, tag, page, related |
| `data-component="item-detail"` | `header`, `icon`, `name`, `description`, `meta`, `source-link`, `category`, `tags`, `tag`, `updated-at`, `content` | -- | item/[slug] |
| `data-component="related-items"` | `heading`, `grid` | -- | item/[slug] |
| `data-component="breadcrumbs"` | `separator`, `current` | -- | Multiple pages |
| `data-component="pagination"` | `prev`, `next`, `info` | -- | index, page/[page] |
| `data-component="empty-state"` | (none) | -- | Multiple pages |

### Category and Tag Pages

| Component | Parts | Used In |
|-----------|-------|---------|
| `data-component="categories-page"` | `heading`, `list`, `item` | categories |
| `data-component="category-card"` | `icon`, `name`, `count` | categories |
| `data-component="category-page"` | `heading`, `count`, `grid` | category/[slug] |
| `data-component="tags-page"` | `heading`, `list`, `item` | tags |
| `data-component="tag-badge"` | `name`, `count` | tags |
| `data-component="tag-page"` | `heading`, `count`, `grid` | tag/[slug] |

### Comparison Page

| Component | Parts | State Attrs | Used In |
|-----------|-------|-------------|---------|
| `data-component="comparison-detail"` | `title`, `summary`, `contestants`, `item-a`, `item-b`, `vs`, `name`, `dimensions`, `dimension-header`, `item-a-header`, `item-b-header`, `dimension-row`, `dimension-name`, `item-a-cell`, `item-b-cell`, `summary`, `score`, `verdict`, `verdict-heading`, `verdict-text`, `content` | `data-winner` | comparison/[slug] |

### Interactive Components (Preact)

| Component | Parts | State Attrs | Hydration |
|-----------|-------|-------------|-----------|
| `data-component="search-input"` | `input`, `clear` | -- | `client:load` or `client:visible` |
| `data-component="filter-bar"` | `categories`, `tags`, `legend`, `category-options`, `category-option`, `tag-options`, `tag-option`, `clear-all` | `data-selected` | `client:load` or `client:visible` |

### Headless Astro Components (from @ever-works/ui)

These are importable from `@ever-works/ui/astro/*` and can be used instead of inline markup:

| Import Path | Component |
|-------------|-----------|
| `@ever-works/ui/astro/ItemCard.astro` | Item card |
| `@ever-works/ui/astro/ItemGrid.astro` | Grid of item cards |
| `@ever-works/ui/astro/ItemList.astro` | List of items |
| `@ever-works/ui/astro/ItemDetail.astro` | Full item detail |
| `@ever-works/ui/astro/CategoryList.astro` | List of categories |
| `@ever-works/ui/astro/CategoryBadge.astro` | Single category badge |
| `@ever-works/ui/astro/TagList.astro` | List of tags |
| `@ever-works/ui/astro/TagBadge.astro` | Single tag badge |
| `@ever-works/ui/astro/CollectionCard.astro` | Collection card |
| `@ever-works/ui/astro/ComparisonTable.astro` | Comparison table |
| `@ever-works/ui/astro/Breadcrumbs.astro` | Breadcrumb navigation |
| `@ever-works/ui/astro/Pagination.astro` | Pagination controls |
| `@ever-works/ui/astro/Hero.astro` | Hero section |
| `@ever-works/ui/astro/EmptyState.astro` | Empty state message |
| `@ever-works/ui/astro/SiteHeader.astro` | Site header |
| `@ever-works/ui/astro/SiteFooter.astro` | Site footer |
| `@ever-works/ui/astro/SEO.astro` | SEO meta tags |

### Preact Components (for interactive islands)

| Import Path | Props Interface |
|-------------|----------------|
| `@ever-works/ui/preact/SearchInput` | `SearchInputProps` |
| `@ever-works/ui/preact/FilterBar` | `FilterBarProps` |
| `@ever-works/ui/preact/SortSelect` | `SortSelectProps` |
| `@ever-works/ui/preact/BackToTop` | `BackToTopProps` |
| `@ever-works/ui/preact/ThemeToggle` | `ThemeToggleProps` |

---

## Quick Reference: Common Tasks

| Task | File(s) to Edit |
|------|----------------|
| Change site colors/fonts | `apps/web/src/styles/global.css` |
| Modify page layout | `apps/web/src/layouts/BaseLayout.astro` |
| Add a new page | Create file in `apps/web/src/pages/` |
| Change items per page | `apps/web/src/lib/plugins.config.ts` (paginationPlugin) |
| Add SEO settings | `apps/web/src/lib/plugins.config.ts` (seoPlugin) |
| Enable/disable plugins | `apps/web/src/lib/plugins.config.ts` |
| Modify item card layout | Edit inline markup in page files |
| Add interactive search | Import from `@ever-works/ui/preact/SearchInput` |
| Change data source | Set `DATA_REPOSITORY` or `CONTENT_PATH` env var |
| Create a new plugin | Add package to `packages/plugin-<name>/` |
| Study a sample vertical | `apps/sample-basic/`, `sample-events/`, `sample-real-estate/` |
| Run sample-events dev server | `cd apps/sample-events && pnpm dev` (port 4325) |
| Run sample-real-estate dev server | `cd apps/sample-real-estate && pnpm dev` (port 4326) |
| Build for production | `pnpm build` from monorepo root |
| Preview production build | `cd apps/web && pnpm preview` |
