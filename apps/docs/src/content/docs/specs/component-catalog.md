---
title: Component Catalog
description: Complete catalog of all headless UI components in the template.
---

All components are in `@ever-works/ui` and are **headless** (no styling applied).

## Import Patterns

**Astro components:**
```astro
---
import ItemCard from '@ever-works/ui/astro/ItemCard.astro';
---
<ItemCard item={item} class="my-custom-class" />
```

**Preact interactive components:**
```astro
---
import SearchInput from '@ever-works/ui/preact/SearchInput';
---
<SearchInput client:load placeholder="Search..." />
```

## Static Components (Astro)

### Item Components
- **ItemCard** — Single item card with icon, name, description, category, tags
- **ItemGrid** — Responsive grid (`columns` prop: 2/3/4)
- **ItemList** — Vertical list layout
- **ItemDetail** — Full item view with header, meta, content, related items

### Category & Tag Components
- **CategoryList** — Category list with counts
- **CategoryBadge** — Single category chip
- **TagList** — Tag list with counts
- **TagBadge** — Single tag chip

### Navigation Components
- **Breadcrumbs** — Breadcrumb trail with JSON-LD
- **Pagination** — Page navigation with ellipsis

### Layout Components
- **SiteHeader** — Header with logo, nav, actions slot
- **SiteFooter** — Footer with branding, copyright
- **Hero** — Hero section with title, subtitle, CTA

### Other
- **CollectionCard** — Collection card
- **ComparisonTable** — Side-by-side comparison
- **EmptyState** — No results message
- **SEO** — Meta tags for `<head>`

## Interactive Components (Preact)

- **SearchInput** — Debounced search input with clear button
- **FilterBar** — Category/tag toggle filters
- **SortSelect** — Sort order dropdown
- **BackToTop** — Scroll-to-top button (appears on scroll)
- **ThemeToggle** — Dark/light mode with localStorage

## Styling Hooks

All components use `data-component` and `data-part` attributes:

```css
[data-component="item-card"] { /* card container */ }
[data-component="item-card"] [data-part="name"] { /* item name */ }
[data-component="item-card"][data-featured] { /* featured items */ }
```
