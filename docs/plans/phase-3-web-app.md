# Phase 3: Astro Web Application

> The core Astro app with pages, layouts, and routing

## Goal

Create the `apps/web` Astro application that assembles components, loads data, and generates static pages for a directory website. This is the intentionally minimal "blank canvas" that AI builds upon.

## Tasks

### 3.1 App Setup
- [ ] `apps/web/package.json` with Astro dependencies
- [ ] `apps/web/astro.config.ts` — Static output, Preact integration, Tailwind
- [ ] `apps/web/tsconfig.json` — Extends shared config
- [ ] `apps/web/src/env.d.ts` — Astro env types

### 3.2 Layouts
- [ ] `src/layouts/BaseLayout.astro` — HTML shell, head, body, meta
- [ ] `src/layouts/DirectoryLayout.astro` — Header + content + footer

### 3.3 Pages (File-Based Routing)
- [ ] `src/pages/index.astro` — Home page (hero + featured items + category list)
- [ ] `src/pages/items/index.astro` — All items listing with pagination
- [ ] `src/pages/items/[slug].astro` — Individual item detail page
- [ ] `src/pages/categories/index.astro` — All categories listing
- [ ] `src/pages/categories/[slug].astro` — Items filtered by category
- [ ] `src/pages/tags/index.astro` — All tags listing
- [ ] `src/pages/tags/[slug].astro` — Items filtered by tag
- [ ] `src/pages/collections/index.astro` — All collections listing
- [ ] `src/pages/collections/[slug].astro` — Items in a collection
- [ ] `src/pages/comparisons/index.astro` — All comparisons listing
- [ ] `src/pages/comparisons/[slug].astro` — Individual comparison view
- [ ] `src/pages/404.astro` — Custom 404 page

### 3.4 Data Integration
- [ ] `src/lib/data.ts` — Helper to load data using @ever-works/core
- [ ] `src/lib/config.ts` — Config loader wrapper
- [ ] Plugin configuration: `plugins.config.ts`

### 3.5 Build Pipeline
- [ ] `scripts/clone-content.ts` — Prebuild content clone
- [ ] `scripts/post-build.ts` — Post-build plugin hooks (e.g., Pagefind indexing)
- [ ] `.env.example` — Required environment variables

### 3.6 Static Generation
- [ ] `getStaticPaths()` for all dynamic routes
- [ ] Pagination for listing pages
- [ ] Category/tag count computation
- [ ] Featured items sorting

## Pages Overview

| Route | Description | Data Source |
|-------|-------------|-------------|
| `/` | Home page | config + featured items + categories |
| `/items/` | All items listing | all approved items |
| `/items/[slug]` | Item detail | single item by slug |
| `/categories/` | Categories listing | all categories with counts |
| `/categories/[slug]` | Category items | items filtered by category |
| `/tags/` | Tags listing | all tags with counts |
| `/tags/[slug]` | Tag items | items filtered by tag |
| `/collections/` | Collections listing | all active collections |
| `/collections/[slug]` | Collection items | items in collection |
| `/comparisons/` | Comparisons listing | all comparisons |
| `/comparisons/[slug]` | Comparison detail | single comparison |

## Success Criteria

1. `pnpm dev:web` starts the dev server
2. `pnpm build` generates static HTML for all pages
3. All dynamic routes generate correct pages for sample data
4. Items, categories, tags, collections render correctly
5. Pagination works on listing pages
6. 404 page renders for unknown routes
