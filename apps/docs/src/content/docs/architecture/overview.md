---
title: Architecture Overview
description: High-level architecture of the Ever Works Minimal Directory Template.
---

The minimal directory template follows a **layered, plugin-based architecture** optimized for static site generation and AI-driven customization.

## Layers

### 1. Data Layer (`@ever-works/core` + `@ever-works/adapters`)

- **Adapters** provide raw file access (git clone, filesystem read)
- **Core** parses YAML, validates types, exposes typed APIs
- All data loaded at build time — no runtime data fetching

### 2. Component Layer (`@ever-works/ui`)

- 17 Astro components (static) + 5 Preact components (interactive islands)
- **Headless, unstyled** — AI applies Tailwind or custom CSS
- Components expose `data-component` and `data-part` attributes for styling

### 3. Plugin Layer (`@ever-works/plugins`)

- Plugin system with lifecycle hooks: `onInit`, `onDataLoaded`, `onBeforeBuild`, `onAfterBuild`
- 6 built-in plugins: SEO, pagination, filters, search, sort, sitemap
- Dependency resolution via topological sort

### 4. Application Layer (`apps/web`)

- Astro pages assemble components and plugins
- File-based routing with 12 page routes
- Minimal — intentionally a blank canvas for AI

## Data Flow

1. Prebuild script clones `DATA_REPOSITORY` → `.content/`
2. Astro build starts
3. Adapters read `.content/` files
4. Core parses YAML → typed data
5. Plugins transform data (pipeline)
6. UI components render data
7. Astro generates static HTML
8. Pagefind indexes output for search

## Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 1.5s |
| Total Blocking Time | < 50ms |
| JS Bundle (listing page) | < 20KB gzipped |
