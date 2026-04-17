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
**Slots**: `default` (actions area — place MobileMenu, ThemeToggle, etc.)

Renders a skip-to-content link (`<a href="#main-content">`) before the header for keyboard navigation. Desktop nav links are hidden on mobile (`hidden md:block`). Use the `MobileMenu` Preact island in the actions slot for responsive mobile navigation.

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

**A11y features**: Skip-to-content link, `aria-label="Main navigation"` on desktop nav, `aria-current="page"` on active items, responsive desktop/mobile nav split.

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
**Hydration**: `client:visible`

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

### MobileMenu

**File**: `packages/ui/src/preact/MobileMenu.tsx`
**Hydration**: `client:load`
**Purpose**: Responsive hamburger menu for mobile navigation. Shows a toggle button (hidden on `md:` and above) that opens a slide-down nav panel. Handles Escape to close, body scroll lock, and click-outside dismiss.

```typescript
interface MobileMenuNavItem {
    label: string;
    href: string;
}

interface MobileMenuProps {
    items?: MobileMenuNavItem[];
    class?: string;
}
```

**HTML structure**:
```html
<div data-component="mobile-menu" class="md:hidden">
  <button data-part="toggle" aria-expanded="false" aria-controls="mobile-nav-panel" aria-label="Open menu">
    <svg><!-- hamburger or X icon --></svg>
  </button>
  <!-- When open: -->
  <div id="mobile-nav-panel" role="navigation" aria-label="Mobile navigation" data-part="panel">
    <nav>
      <ul>
        <li><a data-part="nav-link" href="/">Home</a></li>
        ...
      </ul>
    </nav>
  </div>
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

---

### AnalyticsScript

**File**: `packages/ui/src/astro/AnalyticsScript.astro`
**Purpose**: Renders analytics tracking script tags from resolved plugin config. Emits zero output when no config is provided, no providers are configured, or tracking is disabled in dev mode.

```typescript
interface Props {
    config?: ResolvedAnalyticsConfig;
}
```

**HTML structure**:
Renders raw `<script>` tags for each configured provider (Plausible, Umami, Fathom, GA4, or custom HTML). Output varies by provider. Renders nothing when disabled.

**Usage**:
```astro
---
import AnalyticsScript from '@ever-works/ui/astro/AnalyticsScript.astro';
import type { ResolvedAnalyticsConfig } from '@ever-works/plugin-analytics';
const config: ResolvedAnalyticsConfig = { /* from plugin pipeline */ };
---
<head>
  <AnalyticsScript config={config} />
</head>
```

---

### ItemBrowser

**File**: `packages/ui/src/preact/ItemBrowser.tsx`
**Purpose**: Composite Preact island combining FilterBar, SearchInput, SortSelect, LayoutSwitcher, and pagination into a single interactive browsing experience. Use as a single drop-in island for directory listing pages.
**Type**: Interactive (Preact)

```typescript
interface ItemBrowserProps {
    items: ItemData[];
    categories?: CategoryWithCount[];
    tags?: TagWithCount[];
    itemName?: string;         // singular, e.g. "Tool"
    itemsName?: string;        // plural, default: "Items"
    perPage?: number;          // default: 12
    layoutModes?: LayoutMode[]; // default: ['grid', 'list']
    initialLayout?: LayoutMode; // default: 'grid'
    renderItem?: (item: ItemData, layout: LayoutMode) => ComponentChildren;
    class?: string;
}
```

**HTML structure**:
```html
<div data-component="item-browser">
  <fieldset data-part="categories">…</fieldset>
  <fieldset data-part="tags">…</fieldset>
  <div data-part="toolbar">
    <SearchInput /><SortSelect /><LayoutSwitcher />
  </div>
  <div data-part="results-info">…</div>
  <div data-part="item-list" data-layout="grid|list|compact">…</div>
  <nav data-part="pagination">…</nav>
</div>
```

---

## Primitive Components (Astro)

> Low-level, composable building blocks from [fulldev/ui](https://github.com/fulldotdev/ui). These use `data-slot` attributes (not `data-component`) and Tailwind CSS classes. They are designed to be composed together — e.g., Card + CardHeader + CardTitle + CardContent.

### Avatar

**Files**: `packages/ui/src/primitives/avatar/`
**Components**: `Avatar.astro`, `AvatarImage.astro`, `AvatarFallback.astro`

```typescript
// Avatar.astro
interface Props extends HTMLAttributes<"div"> {
    size?: "default" | "sm" | "lg";  // default: "default"
}

// AvatarImage.astro — <img> inside Avatar
interface Props extends HTMLAttributes<"img"> {}

// AvatarFallback.astro — fallback content when image fails
interface Props extends HTMLAttributes<"div"> {}
```

**Usage**:
```astro
<Avatar size="lg">
    <AvatarImage src="/avatar.png" alt="User" />
    <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

**Slots**: `data-slot="avatar"`, `data-slot="avatar-image"`, `data-slot="avatar-fallback"`

---

### Badge

**Files**: `packages/ui/src/primitives/badge/`
**Components**: `Badge.astro`, `badge-variants.ts`

```typescript
interface Props<Tag extends HTMLTag> extends Polymorphic<{ as: Tag }> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
}
```

**Usage**:
```astro
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge as="a" href="/tag/typescript">Linked Badge</Badge>
```

**Slot**: `data-slot="badge"`

---

### Button

**Files**: `packages/ui/src/primitives/button/`
**Components**: `Button.astro`, `button-variants.ts`

```typescript
interface Props<Tag extends HTMLTag = "button"> extends Polymorphic<{ as: Tag }> {
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
    size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-sm";
}
```

Polymorphic: renders as `<a>` when `href` is provided, otherwise `<button>`.

**Usage**:
```astro
<Button>Click me</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button href="/about">Link Button</Button>
<Button variant="ghost" size="icon"><svg>…</svg></Button>
```

**Slot**: `data-slot="button"`

---

### Card

**Files**: `packages/ui/src/primitives/card/`
**Components**: `Card.astro`, `CardHeader.astro`, `CardTitle.astro`, `CardDescription.astro`, `CardContent.astro`, `CardFooter.astro`, `CardAction.astro`

```typescript
// Card.astro
interface Props extends HTMLAttributes<"div"> {
    size?: "default" | "sm";  // default: "default"
}

// CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction
// All extend HTMLAttributes<"div"> with no additional props (except CardAction which is a link)
```

**Usage**:
```astro
<Card>
    <CardHeader>
        <CardTitle>Item Name</CardTitle>
        <CardDescription>Short description</CardDescription>
        <CardAction href="/item/slug">View →</CardAction>
    </CardHeader>
    <CardContent>
        <p>Card body content here.</p>
    </CardContent>
    <CardFooter>
        <Badge>Tag</Badge>
    </CardFooter>
</Card>
```

**Slots**: `data-slot="card"`, `data-slot="card-header"`, `data-slot="card-title"`, `data-slot="card-description"`, `data-slot="card-content"`, `data-slot="card-footer"`, `data-slot="card-action"`

---

### Empty

**Files**: `packages/ui/src/primitives/empty/`
**Components**: `Empty.astro`, `EmptyTitle.astro`, `EmptyDescription.astro`

```typescript
// All extend HTMLAttributes<"div"> with no additional props
```

**Usage**:
```astro
<Empty>
    <EmptyTitle>No items found</EmptyTitle>
    <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
</Empty>
```

**Slots**: `data-slot="empty"`, `data-slot="empty-title"`, `data-slot="empty-description"`

---

### Separator

**Files**: `packages/ui/src/primitives/separator/`
**Components**: `Separator.astro`

```typescript
interface Props extends HTMLAttributes<"div"> {
    orientation?: "horizontal" | "vertical";  // default: "horizontal"
    decorative?: boolean;                      // default: true
}
```

**Usage**:
```astro
<Separator />
<Separator orientation="vertical" />
```

**Slot**: `data-slot="separator"`, with `data-orientation`, `data-horizontal` / `data-vertical` attributes.

---

### Table

**Files**: `packages/ui/src/primitives/table/`
**Components**: `Table.astro`, `TableHeader.astro`, `TableHead.astro`, `TableBody.astro`, `TableRow.astro`, `TableCell.astro`

```typescript
// Table.astro wraps in a scrollable container
// All sub-components extend their native HTML element attributes
```

**Usage**:
```astro
<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell>Shadcn UI</TableCell>
            <TableCell>Full Suite</TableCell>
            <TableCell><Badge>Active</Badge></TableCell>
        </TableRow>
    </TableBody>
</Table>
```

**Slots**: `data-slot="table-container"`, `data-slot="table"`, `data-slot="table-header"`, `data-slot="table-head"`, `data-slot="table-body"`, `data-slot="table-row"`, `data-slot="table-cell"`

---

## Preact Utility Components (shadcn-style)

> These are Preact (TSX) versions of common form elements, used inside interactive islands. Located in `packages/ui/src/components/ui/`.

| Component | File | Purpose |
|-----------|------|---------|
| `Badge` | `badge.tsx` | Preact badge with variant support |
| `Button` | `button.tsx` | Preact button with variant support |
| `Input` | `input.tsx` | Styled text input |
| `Label` | `label.tsx` | Form label |
| `Select` | `select.tsx` | Select dropdown |

These are primarily used inside Preact islands (e.g., `ItemBrowser`, `FilterBar`) and should not be used in Astro components (use the Astro primitives instead).

---

## Utility Functions

### cn()

**File**: `packages/ui/src/lib/utils.ts`
**Export**: `@ever-works/ui/lib/utils`

Merges Tailwind CSS classes with proper conflict resolution using `clsx` + `tailwind-merge`.

```typescript
cn(...inputs: ClassValue[]): string
```

### sortItemsByOption()

**File**: `packages/ui/src/lib/sort-items.ts`
**Export**: `@ever-works/ui/lib/sort-items`

Client-safe item sorting by `SortOption` string. Generic over any type with `{ name, updated_at, featured? }` — works with both `ItemData` from `@ever-works/core` and custom `BrowserItem` types in sample apps.

```typescript
type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'featured';

interface Sortable {
    name: string;
    updated_at: string;
    featured?: boolean;
}

sortItemsByOption<T extends Sortable>(items: T[], sort: SortOption): T[]
```

This is the canonical sort implementation used by `ItemBrowser` and all sample apps. Avoids duplicating sort logic across the codebase.

---

## Component Summary

| Category | Count | Location |
|----------|-------|----------|
| Astro (directory-specific) | 25 | `packages/ui/src/astro/` |
| Preact (interactive islands) | 8 | `packages/ui/src/preact/` |
| Primitive (Astro, from fulldev/ui) | 22 | `packages/ui/src/primitives/` |
| Preact utilities (shadcn-style) | 5 | `packages/ui/src/components/ui/` |
| **Total** | **60** | |
