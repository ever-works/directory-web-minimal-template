---
title: Building from Template
description: How AI agents build a complete directory website from the minimal template.
---

This guide explains the workflow for building a directory website from this template.

## Step-by-Step Process

### 1. Understand the Data

Read the `.content/` directory to understand what items, categories, and tags exist.

```typescript
import { loadContent } from '@ever-works/core';
const content = await loadContent(adapter);
// content.items, content.categories, content.tags, etc.
```

### 2. Configure Plugins

Edit `src/lib/plugins.config.ts` to enable/disable plugins:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';

export const plugins = definePlugins([
    seoPlugin({ titleSuffix: ' | My Directory' }),
    paginationPlugin({ itemsPerPage: 24 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
]);
```

### 3. Apply Styling

Components are headless. Apply Tailwind CSS classes:

```astro
<ItemCard item={item} class="rounded-lg border p-4 hover:shadow-lg" />
```

Or target data attributes in CSS:

```css
[data-component="item-card"] {
    border-radius: 0.5rem;
    padding: 1rem;
}
```

### 4. Customize Pages

Edit Astro pages in `src/pages/` to customize layout and content.

### 5. Build & Deploy

```bash
pnpm build        # Build static site
pnpm preview      # Preview locally
# Deploy to Vercel via git push
```

## Tips for AI Agents

1. **Read before writing** — understand existing patterns
2. **Use data attributes** for styling hooks
3. **Test incrementally** — verify after each change
4. **Follow conventions** in AGENTS.md
