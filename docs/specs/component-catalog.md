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
    <h3 data-part="title"><a href="/items/{slug}">{name}</a></h3>
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
