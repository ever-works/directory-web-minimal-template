---
title: "Getting Started Tutorial"
sidebar_label: "Getting Started"
description: "Build your first directory website with the Ever Works minimal template — a step-by-step tutorial."
---

# Getting Started Tutorial

This tutorial walks you through building a complete directory website from scratch using the Ever Works Minimal Directory Template. By the end, you will have a fully functional, styled, and deployable directory site with search, filtering, and pagination.

We will build a **"Dev Tools Directory"** — a curated list of developer tools organized by category and tag.

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Check command |
|------|---------|---------------|
| **Node.js** | 22+ (24 LTS recommended) | `node --version` |
| **pnpm** | 10+ | `pnpm --version` |
| **Git** | 2.30+ | `git --version` |

If you need to install pnpm:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

You should also have a code editor with TypeScript support (VS Code recommended) and a terminal.

## Step 1: Clone and Install

Clone the template repository and install dependencies:

```bash
git clone https://github.com/ever-works/directory-web-minimal-template dev-tools-directory
cd dev-tools-directory
pnpm install
```

This is a monorepo managed by pnpm workspaces and Turborepo. The install command pulls dependencies for all packages at once.

### Verify the install

Run a quick type check to confirm everything is wired up:

```bash
pnpm typecheck
```

If this passes with no errors, you are ready to go.

## Step 2: Understand the Project Structure

Before writing any code, take a moment to understand what you are working with:

```
dev-tools-directory/
├── apps/
│   ├── web/                  # Your main Astro site (this is what you edit)
│   ├── sample-basic/         # Reference implementation — look here for examples
│   └── web-e2e/              # Playwright end-to-end tests
├── packages/
│   ├── core/                 # Data loading, types, schemas
│   ├── ui/                   # Headless UI components (unstyled building blocks)
│   ├── plugins/              # Plugin system runner and types
│   ├── plugin-seo/           # Meta tags, Open Graph, JSON-LD
│   ├── plugin-pagination/    # Paginate item arrays
│   ├── plugin-filters/       # Client-side category/tag filtering
│   ├── plugin-search/        # Static search via Pagefind
│   ├── plugin-sort/          # Sort items by name, date, featured
│   ├── plugin-sitemap/       # XML sitemap generation
│   ├── plugin-breadcrumbs/   # Auto-generate breadcrumb trails
│   ├── adapters/             # Data source adapters (git, filesystem)
│   ├── sync/                 # Content sync orchestration
│   └── astro-integration/    # Astro integration for plugin lifecycle hooks
├── docs/                     # Documentation (you are reading it)
├── .env.example              # Environment variable template
├── turbo.json                # Turborepo task config
└── pnpm-workspace.yaml       # Workspace definitions
```

### Key directories in `apps/web/`

```
apps/web/
├── src/
│   ├── pages/            # Astro pages (file-based routing)
│   ├── layouts/          # Base page layout (HTML shell, header, footer)
│   ├── components/       # App-specific components (Astro + Preact islands)
│   ├── styles/           # Global CSS (Tailwind setup, theme variables)
│   └── lib/
│       ├── content.ts    # Data loading utility (you rarely edit this)
│       └── plugins.config.ts  # Plugin registration (you configure this)
├── .content/             # Your YAML content (created in Step 3)
├── public/               # Static assets (images, favicons)
├── astro.config.ts       # Astro framework configuration
└── package.json
```

### How data flows

1. YAML files in `.content/` define your directory data (items, categories, tags, config)
2. `@ever-works/core` reads and parses the YAML into typed objects
3. Plugins process the data (SEO metadata, pagination slicing, etc.)
4. Astro pages import `getContent()` to access the processed data
5. UI components from `@ever-works/ui` render the data — you style them with Tailwind

### The sample app

The `apps/sample-basic/` directory is a fully working reference implementation. If you ever get stuck, look there for a complete example of how everything fits together.

## Step 3: Create Your Content

Content lives in `apps/web/.content/`. This directory holds all the YAML files that define your directory. Create it now:

```bash
mkdir -p apps/web/.content/data
```

### 3.1: Site Configuration (`.works/works.yml`)

Create `apps/web/.content/.works/works.yml` — this defines your site's identity:

```yaml
company_name: "Dev Tools Directory"
item_name: "Tool"
items_name: "Tools"
copyright_year: 2026
app_url: "https://dev-tools.example.com"

logo:
  favicon: "/favicon.ico"

pagination:
  type: "standard"
  itemsPerPage: 12

settings:
  categories_enabled: true
  tags_enabled: true
```

**Field reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `company_name` | Yes | Displayed in the header and page titles |
| `item_name` | Yes | Singular name for a directory entry (e.g., "Tool") |
| `items_name` | Yes | Plural name for directory entries (e.g., "Tools") |
| `copyright_year` | No | Year shown in footer |
| `app_url` | No | Canonical URL for SEO and sitemap |
| `logo.favicon` | No | Path to favicon (relative to `public/`) |
| `pagination.type` | No | `"standard"` (page numbers) or `"infinite"` (scroll) |
| `pagination.itemsPerPage` | No | Items per listing page (default: 20) |
| `settings.categories_enabled` | No | Show category navigation (default: true) |
| `settings.tags_enabled` | No | Show tag navigation (default: true) |

### 3.2: Categories (`categories.yml`)

Create `apps/web/.content/categories.yml` — these group your items:

```yaml
- id: "frontend"
  name: "Frontend Frameworks"

- id: "testing"
  name: "Testing"

- id: "build-tools"
  name: "Build Tools"

- id: "devops"
  name: "DevOps & CI/CD"

- id: "databases"
  name: "Databases"

- id: "api"
  name: "API & Backend"
```

Each category needs an `id` (used in item YAML to assign categories) and a `name` (displayed in the UI). You can optionally add `icon_url` and `image_url` for richer visuals.

### 3.3: Tags (`tags.yml`)

Create `apps/web/.content/tags.yml` — these are cross-cutting labels:

```yaml
- id: "open-source"
  name: "Open Source"
  isActive: true

- id: "typescript"
  name: "TypeScript"
  isActive: true

- id: "free"
  name: "Free"
  isActive: true

- id: "self-hosted"
  name: "Self-Hosted"
  isActive: true

- id: "cloud"
  name: "Cloud"
  isActive: true

- id: "cli"
  name: "CLI"
  isActive: true
```

Tags with `isActive: false` are hidden from the UI but preserved in the data. This is useful for deprecated or internal tags.

### 3.4: Items (one YAML file per entry)

Each item lives in its own directory under `.content/data/`. The directory name becomes the item's `slug` and `id`.

Create your first item at `apps/web/.content/data/vite/vite.yml`:

```bash
mkdir -p apps/web/.content/data/vite
```

```yaml
name: "Vite"
description: "Next-generation frontend build tool. Blazing fast HMR and optimized production builds powered by Rollup."
source_url: "https://vite.dev"
category: "build-tools"
tags: ["open-source", "typescript", "free"]
updated_at: "2026-03-01 12:00"
status: "approved"
featured: true
icon_url: "https://vite.dev/logo.svg"
```

Now create a few more items to have a meaningful directory. Create these files:

**`apps/web/.content/data/playwright/playwright.yml`:**

```yaml
name: "Playwright"
description: "Reliable end-to-end testing for modern web apps. Cross-browser automation with a single API."
source_url: "https://playwright.dev"
category: "testing"
tags: ["open-source", "typescript", "free", "cli"]
updated_at: "2026-02-15 09:00"
status: "approved"
featured: true
icon_url: "https://playwright.dev/img/playwright-logo.svg"
```

**`apps/web/.content/data/astro/astro.yml`:**

```yaml
name: "Astro"
description: "The web framework for content-driven websites. Ship zero JavaScript by default with islands architecture."
source_url: "https://astro.build"
category: "frontend"
tags: ["open-source", "typescript", "free"]
updated_at: "2026-03-10 14:00"
status: "approved"
featured: false
icon_url: "https://astro.build/assets/press/astro-icon-light-gradient.svg"
```

**`apps/web/.content/data/supabase/supabase.yml`:**

```yaml
name: "Supabase"
description: "Open source Firebase alternative. Postgres database, auth, realtime subscriptions, storage, and edge functions."
source_url: "https://supabase.com"
category: "databases"
tags: ["open-source", "typescript", "free", "self-hosted", "cloud"]
updated_at: "2026-01-20 11:00"
status: "approved"
featured: false
```

**`apps/web/.content/data/hono/hono.yml`:**

```yaml
name: "Hono"
description: "Ultrafast web framework for the edge. Works on Cloudflare Workers, Deno, Bun, and Node.js."
source_url: "https://hono.dev"
category: "api"
tags: ["open-source", "typescript", "free"]
updated_at: "2026-02-28 16:00"
status: "approved"
featured: false
```

**`apps/web/.content/data/github-actions/github-actions.yml`:**

```yaml
name: "GitHub Actions"
description: "Automate your workflow from idea to production. CI/CD built directly into GitHub."
source_url: "https://github.com/features/actions"
category: "devops"
tags: ["cloud", "free", "cli"]
updated_at: "2026-03-05 10:00"
status: "approved"
featured: false
```

### Status values

Only items with `status: "approved"` appear on the public site. Available statuses:

| Status | Visible | Description |
|--------|---------|-------------|
| `approved` | Yes | Published and visible |
| `draft` | No | Work in progress |
| `pending` | No | Awaiting review |
| `rejected` | No | Not accepted |

### Content directory structure check

Your `.content/` directory should now look like this:

```
apps/web/.content/
├── .works/
│   └── works.yml
├── categories.yml
├── tags.yml
└── data/
    ├── vite/
    │   └── vite.yml
    ├── playwright/
    │   └── playwright.yml
    ├── astro/
    │   └── astro.yml
    ├── supabase/
    │   └── supabase.yml
    ├── hono/
    │   └── hono.yml
    └── github-actions/
        └── github-actions.yml
```

## Step 4: Start the Dev Server

With content in place, start the development server:

```bash
pnpm dev:web
```

Open [http://localhost:4321](http://localhost:4321) in your browser. You should see the homepage with your directory items rendered using the default unstyled components.

If you see an error about missing content, double-check that your `.content/` directory is inside `apps/web/` and that your YAML files have valid syntax.

### Using a Git data repository instead

For production, you typically store content in a separate Git repository and reference it via environment variable. Copy the env template and configure it:

```bash
cp .env.example .env
```

Then set `DATA_REPOSITORY` in `.env`:

```bash
DATA_REPOSITORY=https://github.com/your-org/your-content-repo
```

If the repo is private, also set `GH_TOKEN` with a GitHub Personal Access Token. The content is cloned automatically at build time via the `prebuild` script.

For local development, having content directly in `apps/web/.content/` is simpler and faster.

## Step 5: Understand the Homepage

Open `apps/web/src/pages/index.astro` to see how the homepage works:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';
import { paginate } from '@ever-works/plugin-pagination';
import { generateJsonLd } from '@ever-works/plugin-seo';
import Hero from '@ever-works/ui/astro/Hero.astro';
import CategoryList from '@ever-works/ui/astro/CategoryList.astro';
import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
import EmptyState from '@ever-works/ui/astro/EmptyState.astro';
import Pagination from '@ever-works/ui/astro/Pagination.astro';

const { items, categories, config } = await getContent();

const perPage = config.pagination?.itemsPerPage ?? 12;
const pagination = paginate(items, { page: 1, perPage });
const totalPages = Math.ceil(items.length / perPage);

const jsonLd = generateJsonLd('WebSite', {
    type: 'WebSite',
    name: config.company_name,
    url: config.app_url ?? '',
});
---

<BaseLayout title="Home" config={config}>
    <Fragment slot="head">
        <script is:inline type="application/ld+json" set:html={jsonLd} />
    </Fragment>

    <Hero
        title={config.company_name}
        subtitle={`Browse ${items.length} ${items.length === 1 ? config.item_name : config.items_name}`}
    />

    {categories.length > 0 && (
        <section data-component="category-nav">
            <h2 data-part="heading">Categories</h2>
            <CategoryList categories={categories} showCounts />
        </section>
    )}

    <section data-component="item-listing">
        <h2 data-part="heading">All {config.items_name}</h2>
        {pagination.items.length === 0 ? (
            <EmptyState message={`No ${config.items_name.toLowerCase()} found.`} />
        ) : (
            <ItemGrid items={pagination.items} columns={3} />
        )}

        {totalPages > 1 && (
            <Pagination currentPage={1} totalPages={totalPages} baseUrl="/" />
        )}
    </section>
</BaseLayout>
```

Key things to notice:

1. **`getContent()`** loads all data from your `.content/` directory and returns typed objects
2. **UI components are headless** — `Hero`, `CategoryList`, `ItemGrid`, `Pagination` emit semantic HTML with `data-component` and `data-part` attributes, but have minimal default styling
3. **Plugins provide utilities** — `paginate()` slices the items array, `generateJsonLd()` creates SEO structured data
4. **`BaseLayout`** wraps every page with the HTML shell, meta tags, header, and footer

## Step 6: Customize the Homepage Layout

Let's modify the homepage to add a featured section and customize the layout. Edit `apps/web/src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';
import { paginate } from '@ever-works/plugin-pagination';
import { generateJsonLd } from '@ever-works/plugin-seo';
import Hero from '@ever-works/ui/astro/Hero.astro';
import CategoryList from '@ever-works/ui/astro/CategoryList.astro';
import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
import ItemCard from '@ever-works/ui/astro/ItemCard.astro';
import EmptyState from '@ever-works/ui/astro/EmptyState.astro';
import Pagination from '@ever-works/ui/astro/Pagination.astro';

const { items, categories, config } = await getContent();

// Split featured items from the rest
const featuredItems = items.filter((item) => item.featured);
const regularItems = items.filter((item) => !item.featured);

// Paginate non-featured items
const perPage = config.pagination?.itemsPerPage ?? 12;
const pagination = paginate(regularItems, { page: 1, perPage });
const totalPages = Math.ceil(regularItems.length / perPage);

const jsonLd = generateJsonLd('WebSite', {
    type: 'WebSite',
    name: config.company_name,
    url: config.app_url ?? '',
});
---

<BaseLayout title="Home" config={config}>
    <Fragment slot="head">
        <script is:inline type="application/ld+json" set:html={jsonLd} />
    </Fragment>

    <Hero
        title={config.company_name}
        subtitle={`Discover ${items.length} curated ${config.items_name.toLowerCase()} for developers`}
    />

    {/* Featured tools section */}
    {featuredItems.length > 0 && (
        <section data-component="featured-section">
            <h2 data-part="heading">Featured {config.items_name}</h2>
            <div data-part="featured-grid">
                {featuredItems.map((item) => (
                    <ItemCard item={item} />
                ))}
            </div>
        </section>
    )}

    {/* Category navigation */}
    {categories.length > 0 && (
        <section data-component="category-nav">
            <h2 data-part="heading">Browse by Category</h2>
            <CategoryList categories={categories} showCounts />
        </section>
    )}

    {/* All tools listing */}
    <section data-component="item-listing">
        <h2 data-part="heading">All {config.items_name}</h2>
        {pagination.items.length === 0 ? (
            <EmptyState message={`No ${config.items_name.toLowerCase()} found.`} />
        ) : (
            <ItemGrid items={pagination.items} columns={3} />
        )}

        {totalPages > 1 && (
            <Pagination currentPage={1} totalPages={totalPages} baseUrl="/" />
        )}
    </section>
</BaseLayout>
```

Check the browser — you should now see featured items displayed separately at the top.

## Step 7: Style with Tailwind CSS

The template uses Tailwind CSS v4 with CSS custom properties for theming. All UI components emit `data-component` and `data-part` attributes that you target with CSS selectors.

### 7.1: Understand the theming system

Open `apps/web/src/styles/global.css`. This file sets up the shadcn/ui-compatible theme using CSS custom properties in oklch color space. The `@theme inline` block maps CSS variables to Tailwind color tokens so you can use classes like `bg-primary`, `text-muted-foreground`, etc.

### 7.2: Customize your theme colors

Edit `apps/web/src/styles/global.css` and update the `:root` block to use a blue-tinted palette for your dev tools directory. Replace the color values:

```css
/* ── Light theme (default) ──────────────────────────────── */
:root {
  --spacing: 0.25rem;
  --background: oklch(0.985 0.002 240);
  --foreground: oklch(0.145 0.015 240);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0.015 240);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0.015 240);
  --primary: oklch(0.55 0.2 260);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.96 0.01 240);
  --secondary-foreground: oklch(0.25 0.015 240);
  --muted: oklch(0.96 0.005 240);
  --muted-foreground: oklch(0.5 0.02 240);
  --accent: oklch(0.96 0.01 240);
  --accent-foreground: oklch(0.25 0.015 240);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.91 0.01 240);
  --input: oklch(0.91 0.01 240);
  --ring: oklch(0.55 0.2 260);
  --radius: 0.625rem;
}
```

### 7.3: Style components with data-attribute selectors

Add styling rules to `global.css` (after the existing content) that target the headless component attributes:

```css
/* ── Component styles ─────────────────────────────────── */

/* Hero */
[data-component="hero"] {
  @apply text-center py-16 px-4;
}

[data-component="hero"] [data-part="title"] {
  @apply text-4xl font-bold tracking-tight text-foreground sm:text-5xl;
}

[data-component="hero"] [data-part="subtitle"] {
  @apply mt-4 text-lg text-muted-foreground max-w-2xl mx-auto;
}

/* Category navigation */
[data-component="category-nav"] {
  @apply max-w-6xl mx-auto px-4 py-12;
}

[data-component="category-nav"] [data-part="heading"] {
  @apply text-2xl font-semibold text-foreground mb-6;
}

[data-component="category-list"] {
  @apply flex flex-wrap gap-3;
}

[data-component="category-list"] [data-part="category-link"] {
  @apply inline-flex items-center gap-2 rounded-lg border border-border
         bg-card px-4 py-2.5 text-sm font-medium text-card-foreground
         transition-colors hover:bg-accent hover:text-accent-foreground;
}

/* Featured section */
[data-component="featured-section"] {
  @apply max-w-6xl mx-auto px-4 py-12;
}

[data-component="featured-section"] [data-part="heading"] {
  @apply text-2xl font-semibold text-foreground mb-6;
}

[data-component="featured-section"] [data-part="featured-grid"] {
  @apply grid gap-6 sm:grid-cols-2;
}

/* Item listing */
[data-component="item-listing"] {
  @apply max-w-6xl mx-auto px-4 py-12;
}

[data-component="item-listing"] [data-part="heading"] {
  @apply text-2xl font-semibold text-foreground mb-6;
}

/* Item grid */
[data-component="item-grid"] {
  @apply grid gap-6 sm:grid-cols-2 lg:grid-cols-3;
}

/* Item card */
[data-component="item-card"] {
  @apply flex items-start gap-4 rounded-xl border border-border
         bg-card p-5 shadow-sm transition-all
         hover:border-primary/30 hover:shadow-md;
}

[data-component="item-card"] [data-part="icon"] {
  @apply h-10 w-10 shrink-0 rounded-lg object-contain;
}

[data-component="item-card"] [data-part="name"] {
  @apply font-semibold text-card-foreground;
}

[data-component="item-card"] [data-part="description"] {
  @apply mt-1 text-sm text-muted-foreground line-clamp-2;
}

/* Pagination */
[data-component="pagination"] {
  @apply mt-8 flex justify-center gap-2;
}

[data-component="pagination"] [data-part="page-link"] {
  @apply inline-flex h-10 w-10 items-center justify-center rounded-lg
         border border-border text-sm font-medium transition-colors
         hover:bg-accent;
}

[data-component="pagination"] [data-part="page-link"][data-current] {
  @apply bg-primary text-primary-foreground border-primary;
}

/* Empty state */
[data-component="empty-state"] {
  @apply rounded-xl border-2 border-dashed border-border p-12 text-center;
}
```

Refresh the browser — your directory should now have a clean, styled appearance with consistent spacing, typography, and color.

### 7.4: Using Tailwind directly on components

Besides data-attribute selectors, you can also pass `class` props directly to UI components:

```astro
<Hero
    title="Dev Tools Directory"
    subtitle="The best tools for developers"
    class="bg-gradient-to-b from-primary/5 to-transparent"
/>

<ItemGrid
    items={pagination.items}
    columns={3}
    class="max-w-7xl mx-auto"
/>
```

Both approaches work. Data-attribute selectors keep styles centralized in `global.css`, while `class` props are good for one-off adjustments.

## Step 8: Add Collections (Optional)

Collections let you create curated groups of items that cut across categories. Create `apps/web/.content/collections.yml`:

```yaml
- id: "starter-kit"
  slug: "starter-kit"
  name: "Starter Kit"
  description: "Essential tools every new project needs."
  items: ["vite", "playwright", "astro"]
  isActive: true

- id: "full-stack"
  slug: "full-stack"
  name: "Full-Stack Favorites"
  description: "The best tools for full-stack TypeScript development."
  items: ["astro", "hono", "supabase", "vite"]
  isActive: true
```

The `items` array references item slugs (directory names from `.content/data/`). Collections appear at `/collections` and each collection has its own page at `/collection/<slug>`.

## Step 9: Add Interactive Components

So far, everything renders as static HTML. To add client-side search, filtering, and sorting, you create a Preact island component.

### 9.1: Create the ItemBrowser component

Create the file `apps/web/src/components/ItemBrowser.tsx`:

```tsx
import { useState, useMemo, useCallback } from 'preact/hooks';
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
import SortSelect from '@ever-works/ui/preact/SortSelect';
import type { SortOption } from '@ever-works/ui';

interface BrowserItem {
  slug: string;
  name: string;
  description: string;
  category: string | string[];
  tags: string[];
  featured?: boolean;
  icon_url?: string;
  updated_at: string;
}

interface BrowserCategory {
  id: string;
  name: string;
}

interface BrowserTag {
  id: string;
  name: string;
}

interface ItemBrowserProps {
  items: BrowserItem[];
  categories: BrowserCategory[];
  tags: BrowserTag[];
  itemsName?: string;
}

function sortItems(items: BrowserItem[], sort: SortOption): BrowserItem[] {
  const sorted = [...items];
  switch (sort) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'date-desc':
      return sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
  }
}

export default function ItemBrowser({
  items,
  categories,
  tags,
  itemsName = 'Tools',
}: ItemBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((cat: string | null) => {
    setActiveCategory(cat);
  }, []);

  const handleTagsChange = useCallback((t: string[]) => {
    setActiveTags(t);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    if (activeCategory) {
      result = result.filter((item) => {
        const cats = Array.isArray(item.category)
          ? item.category
          : [item.category];
        return cats.includes(activeCategory);
      });
    }

    if (activeTags.length > 0) {
      result = result.filter((item) =>
        activeTags.some((t) => item.tags.includes(t)),
      );
    }

    return sortItems(result, sortBy);
  }, [items, searchQuery, activeCategory, activeTags, sortBy]);

  return (
    <div data-component="item-browser">
      <div class="mb-6 space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder={`Search ${itemsName.toLowerCase()}...`}
            debounceMs={200}
            onSearch={handleSearch}
          />
          <SortSelect selected={sortBy} onChange={handleSortChange} />
        </div>

        <FilterBar
          categories={categories}
          tags={tags}
          selectedCategory={activeCategory ?? undefined}
          selectedTags={activeTags}
          onCategoryChange={handleCategoryChange}
          onTagsChange={handleTagsChange}
        />
      </div>

      <p class="mb-4 text-sm text-muted-foreground">
        {filteredItems.length} of {items.length} {itemsName.toLowerCase()}
      </p>

      {filteredItems.length === 0 ? (
        <div class="rounded-xl border-2 border-dashed border-border p-12 text-center">
          <p class="text-muted-foreground">No {itemsName.toLowerCase()} match your filters.</p>
        </div>
      ) : (
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <a
              key={item.slug}
              href={`/item/${item.slug}`}
              class="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              {item.icon_url && (
                <img
                  src={item.icon_url}
                  alt=""
                  class="h-10 w-10 shrink-0 rounded-lg object-contain"
                  loading="lazy"
                />
              )}
              <div class="min-w-0">
                <h3 class="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p class="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div class="mt-2 flex flex-wrap gap-1">
                  {item.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      class="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 9.2: Use the island in an Astro page

To use `ItemBrowser` on a page, import it and hydrate it with Astro's `client:load` directive. For example, you could create a dedicated browse page or replace the item listing section on the homepage.

Create `apps/web/src/pages/browse.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';
import ItemBrowser from '../components/ItemBrowser';

const { items, categories, tags, config } = await getContent();

// Serialize only the fields the Preact island needs
const browserItems = items.map((item) => ({
    slug: item.slug,
    name: item.name,
    description: item.description,
    category: item.category,
    tags: item.tags,
    featured: item.featured ?? false,
    icon_url: item.icon_url,
    updated_at: item.updated_at,
}));

const browserCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
}));

const browserTags = tags.map((t) => ({
    id: t.id,
    name: t.name,
}));
---

<BaseLayout title="Browse" config={config}>
    <section class="max-w-6xl mx-auto px-4 py-12">
        <h1 class="text-3xl font-bold text-foreground mb-8">
            Browse {config.items_name}
        </h1>
        <ItemBrowser
            client:load
            items={browserItems}
            categories={browserCategories}
            tags={browserTags}
            itemsName={config.items_name}
        />
    </section>
</BaseLayout>
```

Key points about Preact islands:

- **`client:load`** hydrates the component immediately when the page loads. Use `client:visible` instead if the component is below the fold and you want to defer hydration until it scrolls into view.
- **Serialize only what you need** — keep props small. Do not pass the entire `ItemData` object with all its fields; map to a minimal shape.
- **All filtering happens client-side** — no server calls. The full item list is embedded in the HTML.

### 9.3: Add standalone interactive components

Add a dark mode toggle and back-to-top button to your layout. Edit `apps/web/src/layouts/BaseLayout.astro` and add the imports and components:

In the frontmatter (between the `---` fences), add:

```typescript
import ThemeToggle from '@ever-works/ui/preact/ThemeToggle';
import BackToTop from '@ever-works/ui/preact/BackToTop';
```

Then in the `<body>`, add the components near the closing tag:

```astro
<body data-component="body">
    <SiteHeader config={config} nav={navItems} />

    <main data-component="main">
        <slot />
    </main>

    <SiteFooter config={config} />
    <ThemeToggle client:load />
    <BackToTop client:load showAfterPx={400} />
</body>
```

Add dark mode flash prevention in the `<head>`:

```html
<script is:inline>
    (function() {
        var stored = localStorage.getItem('theme-preference');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    })();
</script>
```

### 9.4: Style the interactive components

Add to `global.css`:

```css
/* Search input */
[data-component="search-input"] [data-part="input"] {
  @apply w-full rounded-lg border border-input bg-background px-4 py-2.5
         text-sm text-foreground placeholder:text-muted-foreground
         focus:outline-none focus:ring-2 focus:ring-ring;
}

/* Sort select */
[data-component="sort-select"] [data-part="select"] {
  @apply rounded-lg border border-input bg-background px-3 py-2.5
         text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring;
}

/* Filter bar */
[data-component="filter-bar"] {
  @apply flex flex-wrap gap-2;
}

[data-component="filter-bar"] [data-part="category-option"],
[data-component="filter-bar"] [data-part="tag-option"] {
  @apply rounded-full border border-border bg-background px-3 py-1.5
         text-xs font-medium text-foreground transition-colors
         hover:bg-accent cursor-pointer;
}

[data-component="filter-bar"] [data-part="category-option"][data-selected],
[data-component="filter-bar"] [data-part="tag-option"][data-selected] {
  @apply bg-primary text-primary-foreground border-primary;
}

/* Theme toggle */
[data-component="theme-toggle"] {
  @apply fixed top-4 right-4 z-50 rounded-full border border-border
         bg-card p-2.5 shadow-md transition-colors hover:bg-accent;
}

/* Back to top */
[data-component="back-to-top"] {
  @apply fixed bottom-6 right-6 z-50 rounded-full bg-primary p-3
         text-primary-foreground shadow-lg transition-opacity
         hover:bg-primary/90;
}
```

## Step 10: Configure Plugins

Plugins are configured in `apps/web/src/lib/plugins.config.ts`. The default configuration enables all built-in plugins:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';

export const plugins = definePlugins([
    seoPlugin(),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
]);
```

### Plugin options

**`paginationPlugin`** — controls how many items appear per page:

```typescript
paginationPlugin({ itemsPerPage: 20 })
```

**`sortPlugin`** — sets the default sort order:

```typescript
sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' })
// Options for defaultSort: 'name' | 'date' | 'featured'
// Options for defaultDirection: 'asc' | 'desc'
```

### Disabling a plugin

To disable a plugin, comment out or remove its line. The site works without any plugins — they are all optional:

```typescript
export const plugins = definePlugins([
    seoPlugin(),
    paginationPlugin({ itemsPerPage: 12 }),
    // filtersPlugin(),   // disabled
    // searchPlugin(),    // disabled
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
]);
```

## Step 11: Build and Deploy

### Build locally

```bash
pnpm build
```

This runs the Turborepo build pipeline across all packages and apps. The output goes to `apps/web/dist/`.

Preview the production build locally:

```bash
pnpm --filter @ever-works/web-minimal preview
```

### Deploy to Vercel

There are two ways to deploy.

**Option A: Push to GitHub (recommended)**

The template includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. Push your repository to GitHub and connect it to Vercel:

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Set the **Root Directory** to `apps/web`
4. Set the **Build Command** to `cd ../.. && pnpm build --filter @ever-works/web-minimal`
5. Set the **Output Directory** to `dist`
6. Add environment variables: `DATA_REPOSITORY`, `SITE_URL`, and optionally `GH_TOKEN`
7. Deploy

Every push to `main` triggers an automatic deployment.

**Option B: Manual deploy with Vercel CLI**

```bash
npx vercel deploy
```

### Environment variables for Vercel

At minimum, set these in your Vercel project settings:

| Variable | Value | Required |
|----------|-------|----------|
| `DATA_REPOSITORY` | URL of your content Git repo | Yes (if not using local `.content/`) |
| `SITE_URL` | Your production URL (e.g., `https://dev-tools.example.com`) | Recommended |
| `GH_TOKEN` | GitHub PAT for private content repos | Only for private repos |

### ISR vs Static output

By default, the template uses ISR (Incremental Static Regeneration) via the Vercel adapter. Pages are pre-rendered at build time and regenerated on demand when content changes.

To use pure static output instead, set `ENABLE_ISR=false` in your environment. In static mode, content changes require a full rebuild. You can set up a Vercel Deploy Hook to trigger rebuilds automatically — see the [Content Sync guide](/guides/content-sync/) for details.

## Step 12: Available Pages

Your deployed site includes these routes out of the box:

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, and item grid |
| `/page/[page]` | Paginated item listing (page 2, 3, ...) |
| `/item/[slug]` | Individual item detail page |
| `/categories` | All categories index |
| `/category/[slug]` | Items filtered by category |
| `/tags` | All tags index |
| `/tag/[slug]` | Items filtered by tag |
| `/collections` | All collections index |
| `/collection/[slug]` | Items in a specific collection |
| `/comparisons` | All comparisons index |
| `/comparison/[slug]` | Side-by-side item comparison |
| `/browse` | Interactive browse page (if you created it in Step 9) |

All of these are pre-generated at build time as static HTML. No JavaScript is sent to the browser except for Preact islands that you explicitly hydrate with `client:load` or `client:visible`.

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:web` | Start the web app only |
| `pnpm dev:docs` | Start the Docusaurus docs site |
| `pnpm build` | Build all apps and packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:coverage` | Run unit tests with V8 coverage reports |
| `pnpm test:ct` | Run `@ever-works/ui` Playwright Component Tests (real Chromium; first run requires `pnpm test:ct:install`) |
| `pnpm coverage` | Merge Vitest + Playwright CT V8 coverage into `packages/ui/coverage/merged/` (single per-package number) |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Remove all build artifacts |

The defensive `pnpm test:ui:safe` per-file Vitest fallback is kept for diagnostic use only; see `CLAUDE.md` "Common Commands" for the canonical and exhaustive list.

## Troubleshooting

**"Content not found" error on dev server start**

Make sure `.content/` exists inside `apps/web/` (not at the repository root). If using `DATA_REPOSITORY`, verify the URL is correct and accessible.

**YAML parse errors**

Check your YAML syntax. Common issues:
- Missing quotes around strings with special characters (colons, brackets)
- Incorrect indentation (YAML uses spaces, not tabs)
- Missing required fields (`name`, `description`, `source_url`, `category`, `tags`, `updated_at`, `status`)

**Styles not applying**

- Verify that `global.css` imports `tailwindcss` at the top: `@import "tailwindcss";`
- Check that the `data-component` and `data-part` attribute names in your CSS match what the UI components actually emit
- Run `pnpm dev:web` and inspect elements in the browser DevTools to verify attribute values

**Preact island not interactive**

- Confirm you added `client:load` (or `client:visible`) to the component tag
- Check the browser console for errors
- Make sure `@astrojs/preact` is in `astro.config.ts` integrations

## Next Steps

Now that you have a working directory site, explore these guides to go further:

- [Building from Template](/guides/building-from-template/) — Full AI-assisted build workflow for more complex sites
- [Interactive Components](/guides/interactive-components/) — Deep dive into Preact islands, dark mode, and advanced interactions
- [Creating a Plugin](/guides/creating-a-plugin/) — Build custom plugins to extend the template
- [Content Sync](/guides/content-sync/) — Set up webhooks, polling, and ISR for live content updates
- [Deployment](/guides/deployment/) — Advanced deployment configurations and CI/CD
- [Troubleshooting](/guides/troubleshooting/) — Solutions for common issues
- [Architecture Overview](/architecture/overview/) — Understand the full system design
- [Data Schema](/specs/data-schema/) — Complete reference for all YAML data types
