# Component System Architecture

## Overview

The component system provides **headless, unstyled building blocks** that AI agents assemble and style into complete directory websites. Components are composable, accessible, and framework-flexible.

## Design Principles

1. **Headless** — No visual styling by default. Components render semantic HTML with data attributes for styling hooks.
2. **Composable** — Small, single-purpose components that compose together.
3. **Accessible** — ARIA attributes, keyboard navigation, screen reader support built in.
4. **Framework-flexible** — Astro components for static, Preact for interactive islands.
5. **Prop-driven** — All behavior controlled via props, no hidden state.

## Component Categories

### Static Components (Astro `.astro`)

These render at build time with zero client-side JavaScript:

| Component | Purpose | Props |
|-----------|---------|-------|
| `ItemCard` | Displays a single item summary | `item: ItemData` |
| `ItemGrid` | Grid layout for item cards | `items: ItemData[], columns?: number` |
| `ItemList` | List layout for item cards | `items: ItemData[]` |
| `ItemDetail` | Full item detail view | `item: ItemData` |
| `CategoryList` | List of categories | `categories: CategoryWithCount[]` |
| `CategoryBadge` | Single category badge | `category: CategoryData` |
| `TagList` | List of tags | `tags: TagWithCount[]` |
| `TagBadge` | Single tag badge | `tag: TagData` |
| `CollectionCard` | Collection summary card | `collection: CollectionData` |
| `Breadcrumbs` | Breadcrumb navigation | `items: BreadcrumbItem[]` |
| `Pagination` | Page navigation controls | `currentPage, totalPages, baseUrl` |
| `SiteHeader` | Site header with nav | `config: SiteConfig, nav?: NavItem[]` |
| `SiteFooter` | Site footer | `config: SiteConfig` |
| `Hero` | Hero section | `title, subtitle?, cta?` |
| `EmptyState` | No results message | `message: string` |
| `ComparisonTable` | Side-by-side comparison | `comparison: ComparisonData` |

### Interactive Components (Preact `.tsx`)

These hydrate as Astro islands for client-side interactivity:

| Component | Purpose | Hydration |
|-----------|---------|-----------|
| `SearchInput` | Text search with debounce | `client:load` |
| `FilterBar` | Category/tag filter controls | `client:visible` |
| `SortSelect` | Sort order dropdown | `client:visible` |
| `ItemCardInteractive` | Card with hover/click effects | `client:visible` |
| `BackToTop` | Scroll-to-top button | `client:idle` |
| `ThemeToggle` | Dark/light mode toggle | `client:load` |

## Component Props Pattern

All components follow a consistent props pattern:

```typescript
/** Base props all components accept */
interface BaseComponentProps {
    /** HTML class attribute for custom styling */
    class?: string;
    /** Data attributes for styling hooks */
    'data-variant'?: string;
    /** Additional HTML attributes */
    [key: `data-${string}`]: string | undefined;
}

/** Example: ItemCard props */
interface ItemCardProps extends BaseComponentProps {
    /** The item to display */
    item: ItemData;
    /** Whether to show category badge */
    showCategory?: boolean;
    /** Whether to show tags */
    showTags?: boolean;
    /** Whether to show the item description */
    showDescription?: boolean;
    /** Custom slot for actions area */
    actionsSlot?: unknown;
}
```

## Rendering Pattern

Components render semantic HTML with data attributes:

```astro
---
// ItemCard.astro
import type { ItemCardProps } from './types';
const { item, showCategory = true, showTags = true, class: className, ...attrs } = Astro.props as ItemCardProps;
---
<article
    class:list={['item-card', className]}
    data-component="item-card"
    data-featured={item.featured ? 'true' : undefined}
    {...attrs}
>
    {item.icon_url && (
        <div data-part="icon">
            <img src={item.icon_url} alt="" width="48" height="48" loading="lazy" />
        </div>
    )}
    <div data-part="content">
        <h3 data-part="title">
            <a href={`/items/${item.slug}`}>{item.name}</a>
        </h3>
        {item.description && (
            <p data-part="description">{item.description}</p>
        )}
    </div>
    {showCategory && item.category && (
        <div data-part="category">
            <slot name="category" />
        </div>
    )}
    {showTags && item.tags?.length > 0 && (
        <div data-part="tags">
            <slot name="tags" />
        </div>
    )}
    <div data-part="actions">
        <slot name="actions" />
    </div>
</article>
```

## Styling Strategy

Components ship with **no CSS**. AI agents apply styling using:

### Option 1: Tailwind CSS (recommended)
```astro
<ItemCard
    item={item}
    class="rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
/>
```

### Option 2: CSS targeting data attributes
```css
[data-component="item-card"] {
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    padding: 1rem;
}
[data-component="item-card"][data-featured="true"] {
    border-color: gold;
}
[data-component="item-card"] [data-part="title"] {
    font-size: 1.25rem;
    font-weight: 600;
}
```

### Option 3: CSS Modules
```css
/* ItemCard.module.css */
.card { ... }
.card[data-featured="true"] { ... }
.title { ... }
```

## Slots and Composition

Astro components use named slots for composition:

```astro
<ItemCard item={item}>
    <CategoryBadge slot="category" category={category} />
    <Fragment slot="tags">
        {item.tags.map(tag => <TagBadge tag={tag} />)}
    </Fragment>
    <a slot="actions" href={item.source_url}>Visit Website</a>
</ItemCard>
```

## Island Architecture

Interactive components use Astro's island architecture:

```astro
---
// Page using islands
import SearchInput from '../components/SearchInput';
import FilterBar from '../components/FilterBar';
import ItemGrid from '../components/ItemGrid.astro';
---
<div>
    <!-- Hydrates immediately for instant search -->
    <SearchInput client:load placeholder="Search items..." />

    <!-- Hydrates when visible in viewport -->
    <FilterBar client:visible categories={categories} tags={tags} />

    <!-- Static, no JavaScript -->
    <ItemGrid items={items} />
</div>
```

## Component Package Structure

```
packages/ui/
├── src/
│   ├── index.ts              — Barrel export
│   ├── types.ts              — All component prop types
│   ├── astro/                — Astro components (.astro)
│   │   ├── ItemCard.astro
│   │   ├── ItemGrid.astro
│   │   ├── ItemList.astro
│   │   ├── ItemDetail.astro
│   │   ├── CategoryList.astro
│   │   ├── CategoryBadge.astro
│   │   ├── TagList.astro
│   │   ├── TagBadge.astro
│   │   ├── CollectionCard.astro
│   │   ├── Breadcrumbs.astro
│   │   ├── Pagination.astro
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── Hero.astro
│   │   ├── EmptyState.astro
│   │   └── ComparisonTable.astro
│   └── preact/               — Preact interactive components (.tsx)
│       ├── SearchInput.tsx
│       ├── FilterBar.tsx
│       ├── SortSelect.tsx
│       ├── BackToTop.tsx
│       └── ThemeToggle.tsx
├── package.json
└── tsconfig.json
```
