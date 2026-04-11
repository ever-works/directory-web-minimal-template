---
title: Component System
description: Headless, unstyled UI building blocks for AI-driven directory websites.
---

The component system provides **headless, unstyled building blocks** that AI agents assemble and style.

## Design Principles

1. **Headless** — No visual styling. Semantic HTML with data attributes.
2. **Composable** — Small, single-purpose components.
3. **Accessible** — ARIA attributes, keyboard navigation.
4. **Framework-flexible** — Astro for static, Preact for interactive.

## Static Components (Astro)

| Component | Purpose |
|-----------|---------|
| `ItemCard` | Single directory item card |
| `ItemGrid` | Responsive grid layout |
| `ItemList` | Vertical list layout |
| `ItemDetail` | Full item detail view |
| `CategoryList` | List of categories |
| `CategoryBadge` | Single category badge |
| `TagList` | List of tags |
| `TagBadge` | Single tag badge |
| `CollectionCard` | Collection card |
| `Breadcrumbs` | Breadcrumb navigation |
| `Pagination` | Page navigation |
| `SiteHeader` | Site header/nav |
| `SiteFooter` | Site footer |
| `Hero` | Hero section |
| `EmptyState` | No results message |
| `ComparisonTable` | Comparison view |
| `SEO` | Meta tags component |

## Interactive Components (Preact)

| Component | Hydration | Purpose |
|-----------|-----------|---------|
| `SearchInput` | `client:load` | Search with debounce |
| `FilterBar` | `client:visible` | Category/tag filters |
| `SortSelect` | `client:visible` | Sort dropdown |
| `BackToTop` | `client:idle` | Scroll-to-top button |
| `ThemeToggle` | `client:load` | Dark/light toggle |

## Styling Strategy

Components ship with **no CSS**. AI agents apply styling using:
- Tailwind CSS utility classes (recommended)
- CSS targeting `data-component` and `data-part` attributes
- CSS Modules
