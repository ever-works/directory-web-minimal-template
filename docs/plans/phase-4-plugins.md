# Phase 4: Built-in Plugins

> Core plugins that ship with the template

## Goal

Implement the essential plugins that most directory websites need. Each plugin is an independent package that can be enabled/disabled.

## Tasks

### 4.1 Plugin: `@ever-works/plugin-search`
- [ ] Pagefind integration for post-build index generation
- [ ] `SearchInput` component integration
- [ ] Search results page or component
- [ ] Build hook to run Pagefind after Astro build
- [ ] Configuration: index fields, weights, language

### 4.2 Plugin: `@ever-works/plugin-filters`
- [ ] Category filter component
- [ ] Tag filter component
- [ ] Combined filter bar
- [ ] URL parameter synchronization (e.g., `?category=foo&tag=bar`)
- [ ] Client-side filtering of pre-loaded items
- [ ] Configuration: which filters to show, default states

### 4.3 Plugin: `@ever-works/plugin-pagination`
- [ ] Standard pagination (page numbers, prev/next)
- [ ] `getStaticPaths` helper for paginated routes
- [ ] Configuration: items per page, max pages

### 4.4 Plugin: `@ever-works/plugin-seo`
- [ ] Meta tag generation (title, description, Open Graph, Twitter Cards)
- [ ] JSON-LD structured data (Organization, WebSite, ItemList, Product)
- [ ] Canonical URL generation
- [ ] Configuration: site name, default image, social handles

### 4.5 Plugin: `@ever-works/plugin-sitemap`
- [ ] XML sitemap generation at build time
- [ ] Configurable priority and change frequency
- [ ] Uses Astro's built-in sitemap integration

### 4.6 Plugin: `@ever-works/plugin-rss`
- [ ] RSS feed generation
- [ ] Recent items feed
- [ ] Per-category feeds (optional)

### 4.7 Plugin: `@ever-works/plugin-sort`
- [ ] Sort controls component
- [ ] Sort options: name (A-Z, Z-A), date (newest, oldest), featured first
- [ ] URL parameter for sort state

### 4.8 Plugin: `@ever-works/plugin-breadcrumbs`
- [ ] Auto-generate breadcrumbs from route structure
- [ ] Configurable labels and icons

## Plugin Priority Order

1. **plugin-seo** — Essential for any website
2. **plugin-pagination** — Needed for listing pages
3. **plugin-filters** — Core directory functionality
4. **plugin-search** — User expectation
5. **plugin-sort** — Common directory feature
6. **plugin-sitemap** — SEO requirement
7. **plugin-breadcrumbs** — Navigation aid
8. **plugin-rss** — Nice to have

## Success Criteria

1. Each plugin works independently
2. Plugins can be enabled/disabled in `plugins.config.ts`
3. Disabling a plugin doesn't break the build
4. All plugins have TypeScript types and JSDoc
5. Search returns relevant results from static index
6. Filters update URL params and filter items client-side
