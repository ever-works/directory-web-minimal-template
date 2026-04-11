---
title: "Phase 4: Plugins"
sidebar_label: "Phase 4: Plugins"
---

# Phase 4: Built-in Plugins

> Core plugins that ship with the template

## Goal

Implement the essential plugins that most directory websites need. Each plugin is an independent package that can be enabled/disabled.

## Tasks

### 4.1 Plugin: `@ever-works/plugin-search`
- [x] Pagefind integration for post-build index generation
- [x] Build hook to run Pagefind after Astro build
- [x] Configuration: bundle path, index fields, language

### 4.2 Plugin: `@ever-works/plugin-filters`
- [x] `filterItems()` utility with category + tag + search filtering
- [x] URL parameter synchronization (parse/serialize)
- [x] Configuration: which filters to show, param names, URL sync toggle

### 4.3 Plugin: `@ever-works/plugin-pagination`
- [x] `paginate<T>()` utility with full metadata (hasPrev/hasNext, totalPages, etc.)
- [x] `generatePagePaths()` for Astro `getStaticPaths`
- [x] Configuration: items per page, max pages

### 4.4 Plugin: `@ever-works/plugin-seo`
- [x] `generateMetaTags()` — standard HTML, Open Graph, Twitter Cards
- [x] `generateJsonLd()` — Schema.org structured data (WebSite, ItemList, Product)
- [x] Configuration: title template, default image, Twitter handle, locale

### 4.5 Plugin: `@ever-works/plugin-sitemap`
- [x] Wraps Astro's built-in `@astrojs/sitemap` integration
- [x] Configuration: changefreq, priority, exclude patterns

### 4.6 Plugin: `@ever-works/plugin-sort`
- [x] `sortItems()` utility — name (locale-aware), date, featured-first
- [x] `onDataLoaded` hook applies default sort to items
- [x] Configuration: default sort field, direction, available options

### 4.7 Web App Integration
- [x] `plugins.config.ts` — registers all 6 plugins
- [x] `content.ts` — integrates PluginRunner pipeline
- [x] `BaseLayout.astro` — uses SEO meta tags
- [x] Pages use pagination and JSON-LD structured data
- [x] Paginated listing page (`/page/[page]`)

## Plugin Priority Order

1. **plugin-seo** — Essential for any website ✅
2. **plugin-pagination** — Needed for listing pages ✅
3. **plugin-filters** — Core directory functionality ✅
4. **plugin-search** — User expectation ✅
5. **plugin-sort** — Common directory feature ✅
6. **plugin-sitemap** — SEO requirement ✅

## Success Criteria

1. ✅ Each plugin works independently
2. ✅ Plugins can be enabled/disabled in `plugins.config.ts`
3. ✅ Disabling a plugin doesn't break the build
4. ✅ All plugins have TypeScript types and JSDoc
5. ✅ Pure utility functions exported for use outside plugin system
6. ✅ Full typecheck passes (0 errors, 0 warnings)
7. ✅ Build succeeds (8 pages in 2.88s)
