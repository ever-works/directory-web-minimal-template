# Feature: Headless UI Components

## Description

A library of unstyled, composable UI building blocks. Astro components for static rendering, Preact components for interactive islands. AI agents assemble and style these into complete directory pages.

## User Stories

- As an **AI agent**, I want headless components I can style with Tailwind CSS.
- As an **Astro page**, I want to render item cards in a grid layout.
- As a **user**, I want to search and filter directory items interactively.
- As a **developer**, I want to compose components using Astro slots.

## Acceptance Criteria

1. All static components render valid HTML without any CSS
2. All components use `data-component` and `data-part` attributes
3. All components accept a `class` prop for custom styling
4. Astro components use named slots for composition
5. Preact components hydrate correctly as Astro islands
6. All prop interfaces are documented with JSDoc
7. Components handle missing/optional data gracefully (no crashes)

## Technical Design

See:
- `docs/architecture/component-system.md` — Architecture
- `docs/specs/component-catalog.md` — Full catalog

## Package: `@ever-works/ui`

```
packages/ui/
├── src/
│   ├── types.ts          — All component prop interfaces
│   ├── astro/            — Static Astro components
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
│   ├── preact/           — Interactive Preact components
│   │   ├── SearchInput.tsx
│   │   ├── FilterBar.tsx
│   │   ├── SortSelect.tsx
│   │   ├── BackToTop.tsx
│   │   └── ThemeToggle.tsx
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```
