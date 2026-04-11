# @ever-works/ui

Headless, composable UI components for the Ever Works minimal directory template. This package provides building blocks at three layers: **primitives**, **domain components**, and **interactive islands**.

## Package Structure

```
src/
├── primitives/        Astro — generic UI primitives (from fulldev/ui)
│   ├── avatar/
│   ├── badge/
│   ├── button/
│   ├── card/
│   ├── empty/
│   ├── separator/
│   └── table/
├── astro/             Astro — directory-specific components built on primitives
│   ├── ItemCard.astro
│   ├── ItemGrid.astro
│   ├── ItemList.astro
│   ├── ItemDetail.astro
│   ├── CategoryBadge.astro
│   ├── CategoryList.astro
│   ├── TagBadge.astro
│   ├── TagList.astro
│   ├── CollectionCard.astro
│   ├── ComparisonTable.astro
│   ├── Breadcrumbs.astro
│   ├── Pagination.astro
│   ├── Hero.astro
│   ├── SiteHeader.astro
│   ├── SiteFooter.astro
│   ├── EmptyState.astro
│   └── SEO.astro
├── preact/            Preact — interactive islands (client-side JS)
│   ├── SearchInput.tsx
│   ├── FilterBar.tsx
│   ├── SortSelect.tsx
│   ├── ThemeToggle.tsx
│   └── BackToTop.tsx
├── components/ui/     Preact — shadcn-style primitives for use inside islands
│   ├── badge.tsx
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── select.tsx
├── lib/
│   └── utils.ts       cn() utility (clsx + tailwind-merge)
├── types.ts           TypeScript prop interfaces for all components
└── index.ts           Barrel — re-exports prop types
```

## Three Layers Explained

### 1. Primitives (`src/primitives/`) — Generic UI building blocks

**Technology:** Astro components (`.astro` files)
**Ships JS to browser:** No — renders to static HTML at build time

These are generic, framework-agnostic UI primitives ported from [fulldev/ui](https://github.com/fulldotdev/ui). They know nothing about directories, items, or categories. Think of them as the equivalent of shadcn/ui components but for Astro's server-side rendering.

Each primitive uses [class-variance-authority (CVA)](https://cva.style/) for variant styling. The variant definitions live in companion `*-variants.ts` files so both Astro and Preact components can share the same styles.

| Primitive | Parts | Purpose |
|-----------|-------|---------|
| **Avatar** | Avatar, AvatarImage, AvatarFallback | User/item avatar with fallback |
| **Badge** | Badge + badge-variants.ts | Labels, tags, status indicators |
| **Button** | Button + button-variants.ts | Actions, links, CTAs |
| **Card** | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction | Content containers |
| **Empty** | Empty, EmptyTitle, EmptyDescription | Empty state messaging |
| **Separator** | Separator | Visual divider |
| **Table** | Table, TableHeader, TableBody, TableRow, TableHead, TableCell | Tabular data |

**When to use:** When building new Astro components that need standard UI elements. Compose these instead of writing raw HTML with Tailwind classes.

### 2. Domain Components (`src/astro/`) — Directory-specific views

**Technology:** Astro components (`.astro` files)
**Ships JS to browser:** No — renders to static HTML at build time

These are the directory-specific components that combine primitives with data types from `@ever-works/core`. They accept typed props like `ItemData`, `CategoryData`, and `ComparisonData` and render them using the primitives layer.

| Component | Wraps | Purpose |
|-----------|-------|---------|
| **ItemCard** | Card + Badge | Single item card with icon, name, description, categories, tags |
| **ItemGrid** | — | Responsive CSS grid of ItemCard components |
| **ItemList** | — | Vertical list of ItemCard components |
| **ItemDetail** | Card + Badge + Separator + Button | Full item detail view |
| **CategoryBadge** | Badge (outline) | Single category label |
| **CategoryList** | — | Grid of CategoryBadge components |
| **TagBadge** | Badge (secondary) | Single tag label |
| **TagList** | — | Flex-wrap list of TagBadge components |
| **CollectionCard** | Card | Collection card with item count |
| **ComparisonTable** | Table + Badge | Side-by-side comparison table |
| **EmptyState** | Empty | "No results" messaging |
| **Hero** | Button | Page hero with title, subtitle, CTA |
| **SiteHeader** | Button (ghost) | Sticky navigation header |
| **SiteFooter** | Separator | Footer with site info |
| **Pagination** | — | Page navigation with number/ellipsis logic |
| **Breadcrumbs** | — | Breadcrumb nav with JSON-LD structured data |
| **SEO** | — | Meta tags, Open Graph, Twitter Card, JSON-LD |

**When to use:** In Astro page files. These are the primary building blocks for assembling directory pages.

### 3. Interactive Islands (`src/preact/`) — Client-side interactivity

**Technology:** Preact components (`.tsx` files)
**Ships JS to browser:** Yes — hydrated via Astro's island architecture (`client:load`, `client:visible`)

These handle features that require client-side JavaScript: search, filtering, sorting, theme switching. They use Astro's [islands architecture](https://docs.astro.build/en/concepts/islands/) — only these components ship JavaScript to the browser. Everything else is zero-JS static HTML.

| Component | Purpose | Hydration |
|-----------|---------|-----------|
| **SearchInput** | Debounced search input with clear button | `client:load` |
| **FilterBar** | Category (single-select) + tag (multi-select) filters | `client:load` |
| **SortSelect** | Sort dropdown (name, date, featured) | `client:load` |
| **ThemeToggle** | Light/dark mode toggle | `client:load` |
| **BackToTop** | Scroll-to-top button (appears after scroll threshold) | `client:visible` |

**When to use:** When a feature needs to respond to user interaction. Import them in `.astro` pages with a `client:*` directive.

### 4. Preact Primitives (`src/components/ui/`) — Shadcn-style for islands

**Technology:** Preact components (`.tsx` files)
**Ships JS to browser:** Yes — bundled into the island that imports them

These are Preact equivalents of the Astro primitives, needed because Astro components can't be used inside Preact islands. They share the same CVA variant definitions (from `src/primitives/*/`) to maintain visual consistency.

| Component | Shares variants with | Used by |
|-----------|---------------------|---------|
| **Badge** | `primitives/badge/badge-variants.ts` | FilterBar |
| **Button** | `primitives/button/button-variants.ts` | SearchInput, FilterBar, BackToTop, ThemeToggle |
| **Input** | — | SearchInput |
| **Label** | — | FilterBar |
| **Select** | — | SortSelect |

**When to use:** Only inside Preact interactive islands. Never import these in Astro pages — use the Astro primitives or domain components instead.

## Why Astro vs Preact?

The split follows Astro's islands architecture philosophy:

| | Astro Components | Preact Components |
|---|---|---|
| **Renders** | Server-side at build time | Client-side in browser |
| **JavaScript sent** | Zero | Only for that island |
| **Use for** | Static content, layout, SEO | User interaction, state |
| **Props from** | `@ever-works/core` types | Props + callbacks |
| **Can contain** | Other Astro components, Preact islands | Only Preact components |
| **Examples** | ItemCard, Hero, SEO | SearchInput, FilterBar |

**Rule of thumb:** If it doesn't need to respond to clicks, keypresses, or state changes, it should be an Astro component. This keeps the page weight minimal — only interactive elements ship JavaScript.

## Third-Party Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [class-variance-authority](https://cva.style/) | ^0.7.1 | Variant-based component styling (defines variants like `variant="outline"`) |
| [clsx](https://github.com/lukeed/clsx) | ^2.1.1 | Conditional class name composition |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^3.0.0 | Tailwind class deduplication and conflict resolution |

These three together power the `cn()` utility — the standard pattern from shadcn/ui for merging Tailwind classes safely.

### Design System Origin

The primitives layer is based on [fulldev/ui](https://github.com/fulldotdev/ui), an Astro-native component library inspired by shadcn/ui. We chose it because:

- Native Astro components (not React wrappers) — zero client JS for static parts
- CVA-based variants — same pattern as shadcn/ui, familiar to AI agents
- Composable — Card is Card + CardHeader + CardTitle, not a monolithic component
- Tailwind v4 compatible

## Import Patterns

### In Astro pages (`.astro` files)

```astro
---
// Domain components — the primary building blocks
import ItemCard from '@ever-works/ui/astro/ItemCard.astro';
import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
import SEO from '@ever-works/ui/astro/SEO.astro';

// Primitives — for custom layouts
import Card from '@ever-works/ui/primitives/card/Card.astro';
import Badge from '@ever-works/ui/primitives/badge/Badge.astro';

// Interactive islands — need client:* directive
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
---

<SEO title="Home" description="..." />
<ItemGrid items={items} columns={3} />
<SearchInput client:load placeholder="Search items..." />
```

### In Preact islands (`.tsx` files)

```tsx
// Only use Preact primitives inside islands — never Astro components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
```

### TypeScript types

```ts
// All prop interfaces are available from the barrel export
import type { ItemCardProps, SearchInputProps, SortOption } from '@ever-works/ui';
```

## Data Attributes

All components emit `data-component` and `data-part` attributes for styling hooks and test selectors:

```html
<!-- data-component identifies the component -->
<div data-component="item-card">
  <!-- data-part identifies sub-elements -->
  <img data-part="icon" />
  <a data-part="name">...</a>
  <span data-part="category">...</span>
  <span data-part="tag">...</span>
</div>
```

AI agents and custom CSS can target these without depending on class names:

```css
[data-component="item-card"] { /* card styling */ }
[data-component="item-card"] [data-part="name"] { /* name styling */ }
[data-component="item-card"][data-featured] { /* featured items */ }
```

## Extending

To add a new static component, create an `.astro` file in `src/astro/` that composes primitives. To add a new interactive component, create a `.tsx` file in `src/preact/`. Add the prop types to `src/types.ts` and the export path to `package.json` exports map.

See [docs/guides/interactive-components.md](../../docs/guides/interactive-components.md) for the full guide on wiring interactive islands.
