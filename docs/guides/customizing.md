---
title: "Customizing Your Directory"
sidebar_label: "Customization"
description: "Customize the look, feel, and behavior of your directory website."
---

# Customizing Your Directory

This guide covers every layer of customization in the Ever Works Minimal Directory Template, from theming colors and fonts to creating entirely new components and data fields. The template is designed as a headless, unstyled canvas -- you control the final look through Tailwind CSS, component composition, and plugin configuration.

## Prerequisites

- A working project (see [Quickstart](/guides/quickstart/))
- Familiarity with [Astro components](https://docs.astro.build/en/basics/astro-components/) and [Tailwind CSS](https://tailwindcss.com/docs)

---

## 1. Theming with Tailwind CSS

### Where the styles live

The template uses **Tailwind CSS v4** with the Vite plugin. There is no `tailwind.config.js` file -- configuration is done entirely in CSS using the `@theme` directive. The main style entry point is:

```
apps/web/src/styles/global.css
```

This file is imported by `BaseLayout.astro` and applies to every page.

### How theming works

The template follows the **shadcn/ui convention**: CSS custom properties define your color palette, and the `@theme inline` block maps those properties to Tailwind color tokens.

```css
/* apps/web/src/styles/global.css */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### Changing colors

Edit the `:root` and `.dark` blocks in `global.css`. Colors use the `oklch` color space by default:

```css
/* Light theme */
:root {
  --background: oklch(1 0 0);          /* white */
  --foreground: oklch(0.145 0 0);      /* near-black */
  --primary: oklch(0.55 0.2 260);      /* custom blue */
  --primary-foreground: oklch(1 0 0);  /* white text on primary */
  --accent: oklch(0.85 0.1 140);       /* soft green accent */
  --accent-foreground: oklch(0.2 0.05 140);
  --radius: 0.5rem;                    /* border radius base */
}

/* Dark theme */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.7 0.18 260);
  --primary-foreground: oklch(0.1 0 0);
  --accent: oklch(0.4 0.1 140);
  --accent-foreground: oklch(0.95 0 0);
}
```

After editing, use Tailwind classes like `bg-primary`, `text-accent-foreground`, or `border-border` throughout your templates. Tailwind resolves these through the `@theme` mapping automatically.

### Adding custom colors

To add a brand-specific color that is not part of the shadcn palette, extend the `@theme inline` block:

```css
@theme inline {
  /* ... existing mappings ... */
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
}

:root {
  /* ... existing vars ... */
  --brand: oklch(0.6 0.22 270);
  --brand-foreground: oklch(1 0 0);
}
```

Now you can use `bg-brand`, `text-brand-foreground`, etc. in your components.

### Changing fonts

Add a custom font via `@theme inline`:

```css
@theme inline {
  /* ... existing mappings ... */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Load the font in `BaseLayout.astro` via the `<slot name="head">` mechanism or by adding a `<link>` directly:

```astro
<!-- In BaseLayout.astro <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### Changing spacing

The template sets a spacing base via `--spacing` in `:root`:

```css
:root {
  --spacing: 0.25rem; /* 4px base, so p-4 = 16px */
}
```

Tailwind v4 uses this as the foundation for all spacing utilities. Adjusting this value scales the entire spacing system proportionally.

---

## 2. Customizing Layouts

### Understanding BaseLayout

Every page wraps its content in `BaseLayout.astro`, which lives at:

```
apps/web/src/layouts/BaseLayout.astro
```

It provides the HTML document shell, SEO meta tags (via `plugin-seo`), the `SiteHeader`, and the `SiteFooter`. Here is its structure:

```astro
---
import SiteHeader from '@ever-works/ui/astro/SiteHeader.astro';
import SiteFooter from '@ever-works/ui/astro/SiteFooter.astro';
import '../styles/global.css';

interface Props {
    title: string;
    description?: string;
    config: SiteConfig;
    canonicalUrl?: string;
    ogImage?: string;
    pageType?: 'website' | 'article' | 'product';
}

const { title, description, config } = Astro.props;
const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Tags', href: '/tags' },
    { label: 'Collections', href: '/collections' },
    { label: 'Comparisons', href: '/comparisons' },
];
---

<html lang="en" data-component="root">
    <head>
        <!-- meta tags, SEO, favicon -->
        <slot name="head" />
    </head>
    <body data-component="body">
        <SiteHeader config={config} nav={navItems} />
        <main data-component="main">
            <slot />
        </main>
        <SiteFooter config={config} />
    </body>
</html>
```

### Modifying the navigation

Edit the `navItems` array in `BaseLayout.astro` to add, remove, or reorder navigation links:

```astro
const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/pages/about' },
    { label: 'Contact', href: '/pages/contact' },
];
```

### Customizing the header and footer

The `SiteHeader` and `SiteFooter` components from `@ever-works/ui` are headless -- they render semantic HTML with `data-component` and `data-part` attributes. Style them with Tailwind by passing a `class` prop:

```astro
<SiteHeader
    config={config}
    nav={navItems}
    class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
/>

<SiteFooter
    config={config}
    class="mt-auto border-t border-border bg-muted py-8"
/>
```

### Creating a new layout

If some pages need a different structure (e.g., a sidebar layout), create a new layout file:

```astro
---
// apps/web/src/layouts/SidebarLayout.astro
import BaseLayout from './BaseLayout.astro';
import type { SiteConfig } from '@ever-works/core';

interface Props {
    title: string;
    config: SiteConfig;
}

const { title, config } = Astro.props;
---

<BaseLayout title={title} config={config}>
    <div class="mx-auto max-w-7xl px-4 py-8 lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside class="hidden lg:block">
            <nav class="sticky top-20 space-y-2">
                <slot name="sidebar" />
            </nav>
        </aside>
        <div>
            <slot />
        </div>
    </div>
</BaseLayout>
```

Use it in a page:

```astro
---
import SidebarLayout from '../layouts/SidebarLayout.astro';
import { getContent } from '../lib/content';
const { config, categories } = await getContent();
---

<SidebarLayout title="Browse" config={config}>
    <Fragment slot="sidebar">
        {categories.map((cat) => (
            <a href={`/category/${cat.id}`} class="block rounded-md px-3 py-2 text-sm hover:bg-accent">
                {cat.name}
            </a>
        ))}
    </Fragment>

    <!-- Main content goes here -->
    <h1 class="text-3xl font-bold">Browse Items</h1>
</SidebarLayout>
```

---

## 3. Customizing Pages

### Available pages

The template ships with these routes in `apps/web/src/pages/`:

| Route | File | Purpose |
|---|---|---|
| `/` | `index.astro` | Home page |
| `/page/[page]` | `page/[page].astro` | Paginated listing |
| `/item/[slug]` | `item/[slug].astro` | Item detail |
| `/categories` | `categories.astro` | Category index |
| `/category/[slug]` | `category/[slug].astro` | Items by category |
| `/tags` | `tags.astro` | Tag index |
| `/tag/[slug]` | `tag/[slug].astro` | Items by tag |
| `/collections` | `collections.astro` | Collection index |
| `/collection/[slug]` | `collection/[slug].astro` | Collection detail |
| `/comparisons` | `comparisons.astro` | Comparison index |
| `/comparison/[slug]` | `comparison/[slug].astro` | Comparison detail |
| `/pages/[slug]` | `pages/[slug].astro` | Static content pages |
| `/404` | `404.astro` | Not found |

### Modifying an existing page

Pages import headless components from `@ever-works/ui` and data from `getContent()`. Here is the pattern:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';
import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
import Hero from '@ever-works/ui/astro/Hero.astro';

const { items, categories, config } = await getContent();
---

<BaseLayout title="Home" config={config}>
    <Hero
        title={config.company_name}
        subtitle={`Browse ${items.length} ${config.items_name}`}
        class="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl px-8 py-16 text-center mb-12"
    />

    <ItemGrid
        items={items}
        columns={3}
        class="gap-6"
    />
</BaseLayout>
```

Components accept a `class` prop for Tailwind styling and `data-*` attributes for CSS hooks.

### Creating a new page

Add an `.astro` file under `apps/web/src/pages/`. Astro uses file-based routing:

```astro
---
// apps/web/src/pages/about.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';

const { config } = await getContent();
---

<BaseLayout title="About" config={config}>
    <section class="mx-auto max-w-3xl px-4 py-12 prose dark:prose-invert">
        <h1>About {config.company_name}</h1>
        <p>
            We curate the best {config.items_name.toLowerCase()} to help you
            find exactly what you need.
        </p>
    </section>
</BaseLayout>
```

This creates the route `/about`.

### Using component slots

Many UI components support named slots for composition:

```astro
---
import ItemCard from '@ever-works/ui/astro/ItemCard.astro';
import CategoryBadge from '@ever-works/ui/astro/CategoryBadge.astro';
import TagBadge from '@ever-works/ui/astro/TagBadge.astro';
---

<ItemCard item={item} class="rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
    <CategoryBadge slot="category" category={category} class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full" />
    <Fragment slot="tags">
        {item.tags.map((tag) => (
            <TagBadge tag={{ id: tag, name: tag }} class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded" />
        ))}
    </Fragment>
    <a slot="actions" href={item.source_url} class="text-sm font-medium text-primary hover:underline">
        Visit Website &rarr;
    </a>
</ItemCard>
```

---

## 4. Adding Custom Components

### Astro components (static)

For content that does not need interactivity, create an Astro component:

```astro
---
// apps/web/src/components/StatsBar.astro
interface Props {
    itemCount: number;
    categoryCount: number;
    class?: string;
}

const { itemCount, categoryCount, class: className } = Astro.props;
---

<div
    class:list={['grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-6', className]}
    data-component="stats-bar"
>
    <div class="text-center">
        <p class="text-3xl font-bold text-primary">{itemCount}</p>
        <p class="text-sm text-muted-foreground">Items</p>
    </div>
    <div class="text-center">
        <p class="text-3xl font-bold text-primary">{categoryCount}</p>
        <p class="text-sm text-muted-foreground">Categories</p>
    </div>
</div>
```

Use it in a page:

```astro
---
import StatsBar from '../components/StatsBar.astro';
---
<StatsBar itemCount={items.length} categoryCount={categories.length} class="mb-8" />
```

Zero JavaScript is shipped to the browser for Astro components.

### Preact islands (interactive)

For components that need client-side interactivity, create a Preact component and hydrate it as an Astro island:

```tsx
// apps/web/src/components/NewsletterSignup.tsx
import { useState } from 'preact/hooks';

interface Props {
    class?: string;
}

export default function NewsletterSignup({ class: className }: Props) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        // Handle form submission
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div class={`rounded-xl border border-border bg-card p-6 text-center ${className ?? ''}`}>
                <p class="text-lg font-medium text-foreground">Thanks for subscribing!</p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            class={`flex gap-2 rounded-xl border border-border bg-card p-4 ${className ?? ''}`}
        >
            <input
                type="email"
                value={email}
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                placeholder="you@example.com"
                class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
            />
            <button
                type="submit"
                class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                Subscribe
            </button>
        </form>
    );
}
```

Use it in an Astro page with a hydration directive:

```astro
---
import NewsletterSignup from '../components/NewsletterSignup';
---

<!-- Hydrates when the element becomes visible -->
<NewsletterSignup client:visible class="mt-8" />
```

### Hydration directives

| Directive | Behavior |
|---|---|
| `client:load` | Hydrate immediately on page load (use for above-the-fold interactive elements like search) |
| `client:visible` | Hydrate when the element enters the viewport (use for below-the-fold content) |
| `client:idle` | Hydrate when the browser is idle (use for low-priority features like back-to-top) |
| `client:only="preact"` | Render only on the client, skip SSR entirely |

### Using cn() for class merging

The `cn()` utility from `@ever-works/ui` merges Tailwind classes with conflict resolution:

```tsx
import { cn } from '@ever-works/ui/lib/utils';

interface Props {
    variant?: 'default' | 'outline';
    class?: string;
}

export default function MyButton({ variant = 'default', class: className }: Props) {
    return (
        <button
            class={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
                variant === 'outline' && 'border border-input bg-background hover:bg-accent',
                className
            )}
        >
            Click me
        </button>
    );
}
```

---

## 5. Configuring Plugins

### The plugins.config.ts file

All plugins are registered in a single file:

```
apps/web/src/lib/plugins.config.ts
```

The template uses `definePlugins()` to declare which plugins are active:

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

### Disabling a plugin

Comment out or remove the line. The build works without any plugins:

```typescript
export const plugins = definePlugins([
    seoPlugin(),
    paginationPlugin({ itemsPerPage: 12 }),
    // filtersPlugin(),    <-- disabled
    // searchPlugin(),     <-- disabled
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
]);
```

### Changing plugin options

Pass different values to each plugin's factory function:

```typescript
// Show 24 items per page instead of 12
paginationPlugin({ itemsPerPage: 24 }),

// Sort by date descending by default
sortPlugin({ defaultSort: 'updated_at', defaultDirection: 'desc' }),
```

### Available built-in plugins

| Plugin | Package | Options |
|---|---|---|
| SEO | `@ever-works/plugin-seo` | Meta tags, Open Graph, JSON-LD |
| Pagination | `@ever-works/plugin-pagination` | `itemsPerPage` |
| Filters | `@ever-works/plugin-filters` | Client-side category/tag filtering |
| Search | `@ever-works/plugin-search` | Static search via Pagefind |
| Sort | `@ever-works/plugin-sort` | `defaultSort`, `defaultDirection` |
| Sitemap | `@ever-works/plugin-sitemap` | XML sitemap generation |
| RSS | `@ever-works/plugin-rss` | RSS 2.0 and Atom 1.0 feeds |
| Breadcrumbs | `@ever-works/plugin-breadcrumbs` | Auto-generated breadcrumb trails |

See [Creating a Plugin](/guides/creating-a-plugin/) for building your own.

---

## 6. Custom CSS

### Global styles

The file `apps/web/src/styles/global.css` is the entry point for all CSS. It imports Tailwind and defines theme variables. Add custom global rules at the bottom of this file:

```css
/* apps/web/src/styles/global.css */
@import "tailwindcss";

/* ... @theme and :root blocks ... */

/* ── Custom global styles ─────────────────────────────── */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
  }
  a {
    @apply text-primary underline-offset-4 hover:underline;
  }
}
```

### Using @apply

Tailwind's `@apply` directive lets you extract repeated utility patterns into CSS classes. Use it in `@layer components` to avoid specificity issues:

```css
@layer components {
  .card-grid {
    @apply grid gap-6 sm:grid-cols-2 lg:grid-cols-3;
  }
  .section-heading {
    @apply text-2xl font-bold text-foreground mb-6;
  }
  .btn-primary {
    @apply rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
           hover:bg-primary/90 transition-colors;
  }
}
```

Then use in templates:

```astro
<h2 class="section-heading">All Items</h2>
<div class="card-grid">
    {items.map((item) => <ItemCard item={item} />)}
</div>
```

### Component-scoped styles

For styles that apply only to a single Astro component, use a `<style>` block:

```astro
---
// MyComponent.astro
---
<div class="my-widget">
    <p>Scoped styles example</p>
</div>

<style>
    .my-widget {
        container-type: inline-size;
    }
    @container (min-width: 400px) {
        .my-widget p {
            font-size: 1.25rem;
        }
    }
</style>
```

Astro scopes these styles automatically so they will not leak to other components.

### Styling headless components via data attributes

Every UI component from `@ever-works/ui` renders `data-component` and `data-part` attributes. You can target these in your global CSS for site-wide overrides:

```css
@layer components {
  [data-component="item-card"] {
    @apply rounded-xl border border-border bg-card p-6
           transition-shadow hover:shadow-lg;
  }
  [data-component="item-card"] [data-part="title"] {
    @apply text-lg font-semibold text-foreground;
  }
  [data-component="item-card"] [data-part="description"] {
    @apply mt-1 text-sm text-muted-foreground line-clamp-2;
  }
  [data-component="item-card"][data-featured="true"] {
    @apply border-primary/30 bg-primary/5;
  }
}
```

This approach styles all instances of a component from a single place, without modifying individual page files.

---

## 7. Custom Data Fields

### How the YAML schema works

Item data files (`.content/data/<slug>/<slug>.yml`) support arbitrary additional fields through a pass-through mechanism. The `ItemData` interface includes an index signature:

```typescript
interface ItemData {
    id: string;
    name: string;
    slug: string;
    description: string;
    source_url: string;
    category: string | string[];
    tags: string[];
    featured?: boolean;
    icon_url?: string;
    // ... standard fields ...
    [key: string]: unknown; // <-- any additional YAML fields pass through
}
```

### Adding custom fields to items

Add any field to your YAML files. For example, a "pricing" and "github_stars" field:

```yaml
# .content/data/my-tool/my-tool.yml
name: "My Tool"
slug: "my-tool"
description: "A great tool for developers."
source_url: "https://example.com"
category: "utilities"
tags: ["open-source", "typescript"]
status: "approved"
updated_at: "2026-01-15 00:00"

# Custom fields
pricing: "free"
github_stars: 12500
documentation_url: "https://example.com/docs"
license: "MIT"
```

### Accessing custom fields in templates

Custom fields are available as properties on the `item` object. Since they use the `unknown` type, cast or check them before use:

```astro
---
import type { ItemData } from '@ever-works/core';

interface Props {
    item: ItemData;
}

const { item } = Astro.props;

// Access custom fields with type narrowing
const pricing = typeof item.pricing === 'string' ? item.pricing : null;
const githubStars = typeof item.github_stars === 'number' ? item.github_stars : null;
const license = typeof item.license === 'string' ? item.license : null;
---

<div class="flex flex-wrap gap-3 mt-4">
    {pricing && (
        <span class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            {pricing === 'free' ? 'Free' : pricing}
        </span>
    )}
    {githubStars && (
        <span class="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {githubStars.toLocaleString()}
        </span>
    )}
    {license && (
        <span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {license}
        </span>
    )}
</div>
```

### Custom fields on other data types

The same pass-through pattern works for pages (`.content/pages/<slug>.md`) via frontmatter:

```markdown
---
title: "About Us"
description: "Learn about our team."
team_size: 5
founded_year: 2024
---

Content goes here...
```

Access it in `pages/[slug].astro`:

```astro
---
const page = await getPage(slug);
const teamSize = typeof page.team_size === 'number' ? page.team_size : null;
---

{teamSize && <p>Team of {teamSize} people</p>}
```

### Using custom fields for filtering

If you add a custom field like `pricing` to all items, you can use it in a Preact island to build custom filter UI:

```tsx
// apps/web/src/components/PricingFilter.tsx
import { useState } from 'preact/hooks';

interface Props {
    items: Array<{ slug: string; name: string; pricing?: string }>;
}

export default function PricingFilter({ items }: Props) {
    const [filter, setFilter] = useState<string>('all');

    const filtered = filter === 'all'
        ? items
        : items.filter((item) => item.pricing === filter);

    const options = ['all', ...new Set(items.map((i) => i.pricing).filter(Boolean))];

    return (
        <div>
            <div class="flex gap-2 mb-4">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setFilter(opt as string)}
                        class={`rounded-full px-3 py-1 text-sm ${
                            filter === opt
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-accent'
                        }`}
                    >
                        {opt === 'all' ? 'All' : String(opt)}
                    </button>
                ))}
            </div>
            <ul>
                {filtered.map((item) => (
                    <li key={item.slug}>
                        <a href={`/item/${item.slug}`} class="text-primary hover:underline">
                            {item.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

---

## Quick Reference

| What to customize | Where to edit |
|---|---|
| Colors (light/dark) | `apps/web/src/styles/global.css` -- `:root` and `.dark` blocks |
| Fonts | `apps/web/src/styles/global.css` -- `@theme inline` block + font `<link>` in layout |
| Spacing | `apps/web/src/styles/global.css` -- `--spacing` variable |
| Border radius | `apps/web/src/styles/global.css` -- `--radius` variable |
| Navigation links | `apps/web/src/layouts/BaseLayout.astro` -- `navItems` array |
| Header/footer style | Pass `class` prop to `SiteHeader` / `SiteFooter` in `BaseLayout.astro` |
| Plugin config | `apps/web/src/lib/plugins.config.ts` |
| Page routes | `apps/web/src/pages/` -- file-based routing |
| Global CSS rules | `apps/web/src/styles/global.css` -- `@layer base` or `@layer components` |
| Component-scoped CSS | `<style>` block inside any `.astro` component |
| Custom data fields | `.content/data/<slug>/<slug>.yml` -- add any YAML key |

## Next Steps

- [Building from Template](/guides/building-from-template/) -- Full AI-assisted build workflow
- [Creating a Plugin](/guides/creating-a-plugin/) -- Extend with custom plugins
- [Interactive Components](/guides/interactive-components/) -- Search, filters, dark mode
- [Component System](/architecture/component-system/) -- Deep dive into headless components
