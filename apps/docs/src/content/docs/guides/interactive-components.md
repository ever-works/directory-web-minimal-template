---
title: Using Interactive Components
description: How to integrate Preact interactive islands (search, filters, sort, theme toggle, back-to-top) into your directory site.
---

The UI package includes 5 Preact interactive components that run as [Astro Islands](https://docs.astro.build/en/concepts/islands/) — they hydrate client-side while the rest of the page stays static HTML.

## Available Components

| Component | Purpose | Hydration |
|-----------|---------|-----------|
| `SearchInput` | Debounced text search input | `client:load` |
| `FilterBar` | Category + tag toggle filters | `client:load` |
| `SortSelect` | Sort dropdown (name, date, featured) | `client:load` |
| `ThemeToggle` | Dark/light mode toggle | `client:load` |
| `BackToTop` | Scroll-to-top button | `client:load` |

## Importing

```astro
---
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
import SortSelect from '@ever-works/ui/preact/SortSelect';
import ThemeToggle from '@ever-works/ui/preact/ThemeToggle';
import BackToTop from '@ever-works/ui/preact/BackToTop';
---
```

## Standalone Components

**ThemeToggle** and **BackToTop** are standalone — they don't need data props.

```astro
<!-- In your layout -->
<ThemeToggle client:load />
<BackToTop client:load showAfterPx={400} />
```

### Dark Mode Setup

ThemeToggle sets `data-theme="dark"` on `<html>`. Configure Tailwind CSS v4 to use it:

```css
/* global.css */
@import "tailwindcss";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Add a flash-prevention script in your `<head>`:

```html
<script is:inline>
    (function() {
        var stored = localStorage.getItem('theme-preference');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    })();
</script>
```

## Data-Driven Components

**SearchInput**, **FilterBar**, and **SortSelect** need callbacks and data props. Since they're headless, you compose them into your own Preact island.

### Composing an ItemBrowser

Create a combined component that wires search, filter, and sort together:

```tsx
// src/components/ItemBrowser.tsx
import { useState, useMemo, useCallback } from 'preact/hooks';
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
import SortSelect from '@ever-works/ui/preact/SortSelect';
import type { SortOption } from '@ever-works/ui';

interface Props {
    items: Array<{ slug: string; name: string; description: string; category: string | string[]; tags: string[] }>;
    categories: Array<{ id: string; name: string }>;
    tags: Array<{ id: string; name: string }>;
}

export default function ItemBrowser({ items, categories, tags }: Props) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [sort, setSort] = useState<SortOption>('featured');

    const filtered = useMemo(() => {
        let result = items;
        if (query) result = result.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
        if (category) result = result.filter(i => {
            const cats = Array.isArray(i.category) ? i.category : [i.category];
            return cats.includes(category);
        });
        if (activeTags.length) result = result.filter(i => activeTags.some(t => i.tags.includes(t)));
        return result;
    }, [items, query, category, activeTags, sort]);

    return (
        <div>
            <SearchInput onSearch={setQuery} placeholder="Search..." />
            <FilterBar categories={categories} tags={tags} onCategoryChange={setCategory} onTagsChange={setActiveTags} />
            <SortSelect selected={sort} onChange={setSort} />
            {/* Render filtered items */}
        </div>
    );
}
```

Use it in an Astro page:

```astro
---
import ItemBrowser from '../components/ItemBrowser';
const { items, categories, tags } = await getContent();
---
<ItemBrowser client:load items={items} categories={categories} tags={tags} />
```

## Styling Headless Components

All components emit `data-component` and `data-part` attributes for CSS targeting:

```css
/* Style the search input */
[data-component="search-input"] [data-part="input"] {
    @apply rounded-lg border px-4 py-2 text-sm;
}

/* Style active filter buttons */
[data-component="filter-bar"] [data-part="category-option"][data-selected] {
    @apply border-blue-500 bg-blue-50 text-blue-700;
}
```

See `apps/sample-basic/src/styles/global.css` for a complete styling reference.

## Reference Implementation

The `apps/sample-basic` app demonstrates all 5 interactive components fully integrated and styled. Use it as a reference for your own implementations.
