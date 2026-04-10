# Phase 2: Headless UI Components

> Unstyled, composable building blocks for directory websites

## Goal

Create a library of headless UI components that AI agents can assemble and style. Components should render semantic HTML with data attributes for styling hooks.

## Tasks

### 2.1 Package: `@ever-works/ui`
- [ ] Package setup: `package.json`, `tsconfig.json`
- [ ] `src/types.ts` — All component prop interfaces

### 2.2 Static Astro Components
- [ ] `ItemCard.astro` — Single item card with slots
- [ ] `ItemGrid.astro` — Responsive grid of item cards
- [ ] `ItemList.astro` — Vertical list of item cards
- [ ] `ItemDetail.astro` — Full item detail view
- [ ] `CategoryList.astro` — List of category links
- [ ] `CategoryBadge.astro` — Single category badge/pill
- [ ] `TagList.astro` — List of tag links
- [ ] `TagBadge.astro` — Single tag badge/pill
- [ ] `CollectionCard.astro` — Collection summary
- [ ] `Breadcrumbs.astro` — Breadcrumb navigation
- [ ] `Pagination.astro` — Page controls (prev/next, page numbers)
- [ ] `SiteHeader.astro` — Header with navigation
- [ ] `SiteFooter.astro` — Footer with links
- [ ] `Hero.astro` — Hero section with title/subtitle/CTA
- [ ] `EmptyState.astro` — No results found message
- [ ] `ComparisonTable.astro` — Side-by-side item comparison

### 2.3 Interactive Preact Components
- [ ] `SearchInput.tsx` — Text search with debounce
- [ ] `FilterBar.tsx` — Category/tag filter controls
- [ ] `SortSelect.tsx` — Sort order dropdown
- [ ] `BackToTop.tsx` — Scroll-to-top button
- [ ] `ThemeToggle.tsx` — Dark/light mode toggle

## Design Rules

1. All components use `data-component` attribute for identification
2. All sub-parts use `data-part` attribute for styling hooks
3. Components accept `class` prop for custom styling
4. Use Astro slots for composition
5. No CSS shipped with components
6. JSDoc comments on all props
7. ARIA attributes for accessibility

## Success Criteria

1. All components render valid HTML without styling
2. Components can be composed together (slots work)
3. Interactive components hydrate correctly as islands
4. TypeScript types are correct for all props
5. `pnpm typecheck` passes
