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
│   ├── astro/            — Static Astro components (25 total)
│   │   ├── AnalyticsScript.astro    — Added in Phase 16
│   │   ├── Breadcrumbs.astro
│   │   ├── CategoryBadge.astro
│   │   ├── CategoryList.astro
│   │   ├── CollectionCard.astro
│   │   ├── ComparisonTable.astro
│   │   ├── EmptyState.astro
│   │   ├── FeaturedBadge.astro       — Added in Phase 12
│   │   ├── FeaturedSection.astro     — Added in Phase 12
│   │   ├── Hero.astro
│   │   ├── ItemCTA.astro             — Added in Phase 12
│   │   ├── ItemCard.astro
│   │   ├── ItemContent.astro         — Added in Phase 12
│   │   ├── ItemDetail.astro
│   │   ├── ItemGrid.astro
│   │   ├── ItemList.astro
│   │   ├── ItemMetadata.astro        — Added in Phase 12
│   │   ├── Pagination.astro
│   │   ├── SEO.astro                 — Added in Phase 14
│   │   ├── ShareButton.astro         — Added in Phase 12
│   │   ├── SimilarItems.astro        — Added in Phase 12
│   │   ├── SiteFooter.astro
│   │   ├── SiteHeader.astro
│   │   ├── TagBadge.astro
│   │   └── TagList.astro
│   ├── preact/           — Interactive Preact components (8 total)
│   │   ├── BackToTop.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ItemBrowser.tsx           — Added in Phase 12
│   │   ├── LayoutSwitcher.tsx        — Added in Phase 12
│   │   ├── MobileMenu.tsx            — Added in Phase 13
│   │   ├── SearchInput.tsx
│   │   ├── SortSelect.tsx
│   │   └── ThemeToggle.tsx
│   ├── primitives/       — Headless primitive components
│   │   ├── avatar/
│   │   ├── badge/
│   │   ├── button/
│   │   ├── card/
│   │   ├── empty/
│   │   ├── separator/
│   │   └── table/
│   ├── components/
│   │   └── ui/           — Styled UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   ├── lib/              — Shared utilities
│   │   ├── keyboard.ts
│   │   ├── pagination.ts
│   │   ├── sort-items.ts
│   │   └── utils.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```
