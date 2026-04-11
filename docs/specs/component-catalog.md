---
title: "Component Catalog"
sidebar_label: "Component Catalog"
---

# Component Catalog Specification

> Complete catalog of all headless UI components in `@ever-works/ui`.

## Static Components (Astro)

### ItemCard

**File**: `packages/ui/src/astro/ItemCard.astro`
**Purpose**: Displays a single directory item as a card.
**Slots**: `category`, `tags`, `actions`

```typescript
interface ItemCardProps {
    item: ItemData;
    showCategory?: boolean;   // default: true
    showTags?: boolean;        // default: true
    showDescription?: boolean; // default: true
    class?: string;
}
```

**HTML structure**:
```html
<article data-component="item-card" data-featured="true|undefined">
  <div data-part="icon"><img /></div>
  <div data-part="content">
    <h3 data-part="title"><a href="/item/{slug}">{name}</a></h3>
    <p data-part="description">{description}</p>
  </div>
  <div data-part="category"><slot name="category" /></div>
  <div data-part="tags"><slot name="tags" /></div>
  <div data-part="actions"><slot name="actions" /></div>
</article>
```

---

### ItemGrid

**File**: `packages/ui/src/astro/ItemGrid.astro`
**Purpose**: Responsive grid layout for multiple item cards.

```typescript
interface ItemGridProps {
    items: ItemData[];
    columns?: 2 | 3 | 4;  // default: 3
    class?: string;
}
```

**HTML structure**:
```html
<div data-component="item-grid" data-columns="3">
  <!-- Renders ItemCard for each item -->
</div>
```

---

### ItemList

**File**: `packages/ui/src/astro/ItemList.astro`
**Purpose**: Vertical list layout for items.

```typescript
interface ItemListProps {
    items: ItemData[];
    class?: string;
}
```

---

### ItemDetail

**File**: `packages/ui/src/astro/ItemDetail.astro`
**Purpose**: Full detail view for a single item.
**Slots**: `header`, `sidebar`, `content`, `footer`

```typescript
interface ItemDetailProps {
    item: ItemData;
    relatedItems?: ItemData[];
    class?: string;
}
```

**HTML structure**:
```html
<article data-component="item-detail">
  <header data-part="header">
    <slot name="header">
      <img data-part="icon" />
      <h1 data-part="title">{name}</h1>
      <p data-part="description">{description}</p>
    </slot>
  </header>
  <div data-part="meta">
    <span data-part="category">{category}</span>
    <div data-part="tags">...</div>
    <a data-part="source-link" href="{source_url}">Visit</a>
  </div>
  <div data-part="content">
    <slot name="content">{markdown rendered}</slot>
  </div>
  <aside data-part="sidebar"><slot name="sidebar" /></aside>
  <footer data-part="footer"><slot name="footer" /></footer>
</article>
```

---

### CategoryList

**File**: `packages/ui/src/astro/CategoryList.astro`

```typescript
interface CategoryListProps {
    categories: CategoryWithCount[];
    showCounts?: boolean;  // default: true
    class?: string;
}
```

---

### CategoryBadge

**File**: `packages/ui/src/astro/CategoryBadge.astro`

```typescript
interface CategoryBadgeProps {
    category: CategoryData;
    count?: number;
    href?: string;  // default: /categories/{id}
    class?: string;
}
```

---

### TagList

**File**: `packages/ui/src/astro/TagList.astro`

```typescript
interface TagListProps {
    tags: TagWithCount[];
    showCounts?: boolean;  // default: false
    class?: string;
}
```

---

### TagBadge

**File**: `packages/ui/src/astro/TagBadge.astro`

```typescript
interface TagBadgeProps {
    tag: TagData;
    count?: number;
    href?: string;  // default: /tags/{id}
    class?: string;
}
```

---

### CollectionCard

**File**: `packages/ui/src/astro/CollectionCard.astro`

```typescript
interface CollectionCardProps {
    collection: CollectionData;
    itemCount?: number;
    class?: string;
}
```

---

### Breadcrumbs

**File**: `packages/ui/src/astro/Breadcrumbs.astro`

```typescript
interface BreadcrumbItem {
    label: string;
    href?: string;  // last item has no href (current page)
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: string;  // default: '/'
    class?: string;
}
```

---

### Pagination

**File**: `packages/ui/src/astro/Pagination.astro`

```typescript
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;        // e.g., '/items'
    maxVisible?: number;    // default: 5
    class?: string;
}
```

---

### SiteHeader

**File**: `packages/ui/src/astro/SiteHeader.astro`
**Slots**: `logo`, `nav`, `actions`

```typescript
interface NavItem {
    label: string;
    href: string;
    isActive?: boolean;
}

interface SiteHeaderProps {
    config: SiteConfig;
    nav?: NavItem[];
    class?: string;
}
```

---

### SiteFooter

**File**: `packages/ui/src/astro/SiteFooter.astro`
**Slots**: `content`

```typescript
interface SiteFooterProps {
    config: SiteConfig;
    class?: string;
}
```

---

### Hero

**File**: `packages/ui/src/astro/Hero.astro`
**Slots**: `default` (overrides entire hero content)

```typescript
interface HeroProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
    class?: string;
}
```

---

### EmptyState

**File**: `packages/ui/src/astro/EmptyState.astro`

```typescript
interface EmptyStateProps {
    message: string;
    suggestion?: string;
    class?: string;
}
```

---

### ComparisonTable

**File**: `packages/ui/src/astro/ComparisonTable.astro`

```typescript
interface ComparisonTableProps {
    comparison: ComparisonData;
    showScores?: boolean;  // default: true
    class?: string;
}
```

### SEO

**File**: `packages/ui/src/astro/SEO.astro`
**Purpose**: Renders essential meta tags, Open Graph, Twitter Card, and JSON-LD structured data. Should be placed inside the `<head>` element.

```typescript
interface SEOProps {
    title: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';  // default: 'website'
    siteName?: string;
    noindex?: boolean;               // default: false
    jsonLd?: Record<string, unknown>;
}
```

**HTML structure**:
```html
<title>{title}</title>
<meta name="description" content="{description}" />
<link rel="canonical" href="{canonicalUrl}" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:type" content="{ogType}" />
<meta property="og:url" content="{canonicalUrl}" />
<meta property="og:image" content="{ogImage}" />
<meta property="og:site_name" content="{siteName}" />
<meta name="twitter:card" content="summary_large_image|summary" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{ogImage}" />
<script type="application/ld+json">{jsonLd}</script>
```

---

## Interactive Components (Preact)

### SearchInput

**File**: `packages/ui/src/preact/SearchInput.tsx`
**Hydration**: `client:load`

```typescript
interface SearchInputProps {
    placeholder?: string;
    debounceMs?: number;  // default: 300
    onSearch?: (query: string) => void;
    class?: string;
}
```

---

### FilterBar

**File**: `packages/ui/src/preact/FilterBar.tsx`
**Hydration**: `client:visible`

```typescript
interface FilterBarProps {
    categories?: CategoryData[];
    tags?: TagData[];
    selectedCategory?: string;
    selectedTags?: string[];
    onCategoryChange?: (category: string | null) => void;
    onTagsChange?: (tags: string[]) => void;
    class?: string;
}
```

---

### SortSelect

**File**: `packages/ui/src/preact/SortSelect.tsx`
**Hydration**: `client:visible`

```typescript
type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'featured';

interface SortSelectProps {
    options?: SortOption[];
    selected?: SortOption;
    onChange?: (sort: SortOption) => void;
    class?: string;
}
```

---

### BackToTop

**File**: `packages/ui/src/preact/BackToTop.tsx`
**Hydration**: `client:idle`

```typescript
interface BackToTopProps {
    showAfterPx?: number;  // default: 300
    class?: string;
}
```

---

### ThemeToggle

**File**: `packages/ui/src/preact/ThemeToggle.tsx`
**Hydration**: `client:load`

```typescript
interface ThemeToggleProps {
    class?: string;
}
```

---

### LayoutSwitcher

**File**: `packages/ui/src/preact/LayoutSwitcher.tsx`
**Hydration**: `client:load`
**Purpose**: Allows users to switch between grid, list, and compact view modes. Persists selection in localStorage.

```typescript
type LayoutMode = 'grid' | 'list' | 'compact';

interface LayoutSwitcherProps {
    modes?: LayoutMode[];        // default: ['grid', 'list']
    selected?: LayoutMode;       // default: 'grid'
    onChange?: (mode: LayoutMode) => void;
    persistKey?: string;         // localStorage key, default: 'ew-layout-mode'
    class?: string;
}
```

**HTML structure**:
```html
<div data-component="layout-switcher" role="radiogroup" aria-label="Layout view">
  <button data-part="mode-button" data-mode="grid" role="radio" aria-checked="true">
    <svg><!-- grid icon --></svg>
  </button>
  <button data-part="mode-button" data-mode="list" role="radio" aria-checked="false">
    <svg><!-- list icon --></svg>
  </button>
</div>
```

---

## Featured Components (Astro)

### FeaturedBadge

**File**: `packages/ui/src/astro/FeaturedBadge.astro`
**Purpose**: Visual badge indicating an item is featured.

```typescript
interface FeaturedBadgeProps {
    label?: string;  // default: 'Featured'
    class?: string;
}
```

**HTML structure**:
```html
<span data-component="featured-badge">
  <span data-part="icon" aria-hidden="true">★</span>
  <span data-part="label">Featured</span>
</span>
```

---

### FeaturedSection

**File**: `packages/ui/src/astro/FeaturedSection.astro`
**Purpose**: Section displaying featured items in a grid.

```typescript
interface FeaturedSectionProps {
    items: ItemData[];      // pre-filtered to featured=true
    heading?: string;       // default: 'Featured'
    limit?: number;         // default: 6
    class?: string;
}
```

**HTML structure**:
```html
<section data-component="featured-section">
  <h2 data-part="heading">Featured</h2>
  <div data-part="grid">
    <!-- Renders ItemCard for each featured item -->
  </div>
</section>
```

---

## Item Detail Sub-components (Astro)

### ItemContent

**File**: `packages/ui/src/astro/ItemContent.astro`
**Purpose**: Renders pre-processed HTML content (from markdown) for an item.

```typescript
interface ItemContentProps {
    content: string;  // pre-processed HTML
    class?: string;
}
```

**HTML structure**:
```html
<div data-component="item-content" class="prose dark:prose-invert max-w-none">
  <!-- HTML content rendered via set:html -->
</div>
```

---

### ItemMetadata

**File**: `packages/ui/src/astro/ItemMetadata.astro`
**Purpose**: Displays item categories, tags, and timestamps.

```typescript
interface ItemMetadataProps {
    item: ItemData;
    class?: string;
}
```

**HTML structure**:
```html
<div data-component="item-metadata">
  <a data-part="category" href="/category/{cat}">...</a>
  <a data-part="tag" href="/tag/{tag}">...</a>
  <time data-part="updated-at">...</time>
</div>
```

---

### ItemCTA

**File**: `packages/ui/src/astro/ItemCTA.astro`
**Purpose**: Call-to-action button linking to an item's source URL.

```typescript
interface ItemCTAProps {
    href: string;
    label?: string;  // default: 'Visit Website'
    class?: string;
}
```

---

### ShareButton

**File**: `packages/ui/src/astro/ShareButton.astro`
**Purpose**: Share button for items (Twitter/X share link).

```typescript
interface ShareButtonProps {
    url: string;
    title: string;
    class?: string;
}
```

---

### SimilarItems

**File**: `packages/ui/src/astro/SimilarItems.astro`
**Purpose**: Section displaying related/similar items.

```typescript
interface SimilarItemsProps {
    items: ItemData[];
    heading?: string;  // default: 'Similar Items'
    class?: string;
}
```

**HTML structure**:
```html
<section data-component="similar-items">
  <h2 data-part="heading">Similar Items</h2>
  <div data-part="grid">
    <!-- Renders ItemCard for each similar item -->
  </div>
</section>
```
