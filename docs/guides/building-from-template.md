---
title: "Building from Template"
sidebar_label: "Building from Template"
---

# Guide: Building a Directory Website from the Template

> How an AI agent (or developer) builds a complete directory website using this template.

## Overview

The minimal template provides:
- A working Astro app with all routes
- Headless (unstyled) components
- Data loading from a Git repo
- Plugin system for features

Your job: **apply styling, customize layouts, and configure plugins** to create a unique directory website.

## Step-by-Step Process

### Step 1: Understand the Data

Read the content repository to understand what you're working with:

1. Check `.content/config.yml` for site name, item naming, etc.
2. Check `.content/categories.yml` for available categories
3. Check `.content/tags.yml` for available tags
4. Browse `.content/data/` to understand item structure
5. Note: the data format is documented in `docs/specs/data-schema.md`

### Step 2: Plan the Design

Based on the data:
1. Choose a visual style (clean/minimal, bold/modern, playful, corporate)
2. Plan the home page layout (hero, featured items, category grid)
3. Plan the item card design (what info to show)
4. Plan the item detail page layout
5. Plan the color scheme

### Step 3: Configure Plugins

Edit `apps/web/src/lib/plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { searchPlugin } from '@ever-works/plugin-search';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { seoPlugin } from '@ever-works/plugin-seo';

export default definePlugins([
    searchPlugin(),
    filtersPlugin({ enableCategoryFilter: true, enableTagFilter: true }),
    paginationPlugin({ itemsPerPage: 20 }),
    seoPlugin({ generateJsonLd: true }),
]);
```

### Step 4: Apply Global Styling

Create or edit `apps/web/src/styles/global.css`:

```css
@import 'tailwindcss';

/* Custom theme colors */
:root {
    --color-primary: #3b82f6;
    --color-secondary: #8b5cf6;
    --color-accent: #f59e0b;
}

/* Dark mode */
.dark {
    --color-primary: #60a5fa;
    --color-secondary: #a78bfa;
    --color-accent: #fbbf24;
}
```

### Step 5: Customize Components

Override component styling using `class` props and Tailwind:

```astro
---
import ItemCard from '@ever-works/ui/astro/ItemCard.astro';
import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
import Hero from '@ever-works/ui/astro/Hero.astro';
---
<Hero
    title="Discover Amazing Tools"
    subtitle="The best directory of developer tools"
    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"
/>

<ItemGrid
    items={items}
    columns={3}
    class="gap-6 px-4 max-w-7xl mx-auto"
/>
```

### Step 6: Customize Pages

Edit Astro pages in `apps/web/src/pages/`:

- `index.astro` — Home page layout
- `items/index.astro` — Listing page style
- `items/[slug].astro` — Detail page layout

### Step 7: Build and Deploy

```bash
# Build locally
pnpm build

# Deploy to Vercel
# (Automatically via GitHub Actions or manual)
```

### Step 8: Verify

1. Check all pages render correctly
2. Verify search works
3. Verify filters work
4. Check responsive design (mobile, tablet, desktop)
5. Run Lighthouse audit
6. Verify all links work

## Tips for AI Agents

1. **Read before writing** — Always check existing code before making changes
2. **Use data attributes** — Style via `[data-component="item-card"]` selectors
3. **Test incrementally** — Build and check after each major change
4. **Keep it simple** — The template is minimal for a reason
5. **Follow conventions** — Check `AGENTS.md` rules before every change
