---
title: "Architecture Overview"
sidebar_label: "Overview"
---

# Architecture Overview

## System Design

The minimal directory template follows a **layered, plugin-based architecture** optimized for static site generation and AI-driven customization.

```
┌─────────────────────────────────────────────────────┐
│                    apps/web (Astro)                  │
│  Pages · Layouts · Routes · Static Build Pipeline   │
├─────────────────────────────────────────────────────┤
│                  Plugin System                       │
│  Search · Filters · SEO · Pagination · Sort · ...   │
├─────────────────────────────────────────────────────┤
│               @ever-works/ui                         │
│  Headless Components · Astro Components · Islands   │
├─────────────────────────────────────────────────────┤
│              @ever-works/core                        │
│  Types · Schemas · Content Reader · Config Loader   │
├─────────────────────────────────────────────────────┤
│            @ever-works/adapters                      │
│  Git Adapter (isomorphic-git) · Filesystem Adapter  │
├─────────────────────────────────────────────────────┤
│     @ever-works/sync · @ever-works/astro-integration │
│  Content sync · Webhooks · ISR · Build lifecycle    │
├─────────────────────────────────────────────────────┤
│              Data Repository (.content/)             │
│  YAML Files · Categories · Tags · Collections       │
└─────────────────────────────────────────────────────┘
```

## Layers

### 1. Data Layer (`@ever-works/core` + `@ever-works/adapters` + `@ever-works/sync`)

- **Adapters** provide raw file access via `isomorphic-git` (pure JS, no git binary) or filesystem
- **Core** parses YAML, validates against TypeScript interfaces, exposes typed APIs
- **Sync** orchestrates content refresh (webhooks, polling, ISR triggers)
- **Astro Integration** (`@ever-works/astro-integration`) provides build lifecycle hooks and webhook endpoint
- Content is pre-rendered at build time; ISR enables on-demand regeneration when content changes

### 2. Component Layer (`@ever-works/ui`)

- **Headless, unstyled** building blocks
- Astro components (`.astro`) for static parts
- Preact components (`.tsx`) for interactive islands
- No opinion on styling — AI applies Tailwind, CSS modules, or custom CSS
- Components expose clear props interfaces documented with JSDoc

### 3. Plugin Layer (`@ever-works/plugins`)

- Plugin system with registration, lifecycle hooks, and configuration
- Built-in plugins for common directory features:
  - `plugin-search` — Static search via Pagefind
  - `plugin-filters` — Category/tag filtering
  - `plugin-pagination` — Pagination strategies
  - `plugin-seo` — Meta tags, JSON-LD structured data
  - `plugin-sort` — Item sorting (name, date, featured)
  - `plugin-sitemap` — XML sitemap generation
  - `plugin-rss` — RSS 2.0 and Atom 1.0 feed generation
  - `plugin-breadcrumbs` — Auto-generate breadcrumb trails
  - `plugin-analytics` — Privacy-friendly analytics (Plausible, Umami, Fathom, GA4, custom)
  - `plugin-related-items` — Compute related items based on shared tags/categories
- Plugins can transform data, add build hooks, modify pipeline

### 4. Application Layer (`apps/web`)

- Astro pages assemble components and plugins
- File-based routing: `/item/[slug]`, `/category/[slug]`, `/tag/[slug]`
- Layouts provide page structure
- Minimal — intentionally a blank canvas for AI to build upon

## Key Design Decisions

### Static-First
- `output: 'static'` — all pages pre-rendered at build time
- ISR mode injects `/api/webhook` endpoint for content sync; pure static mode has no server endpoints
- Content changes handled via ISR (on-demand regeneration) or full rebuild + redeploy
- Enables CDN-edge caching for maximum performance

### Plugin-Everything
- Core template is deliberately minimal
- Features are plugins that can be enabled/disabled
- Each plugin is an independent package
- Plugins declare their dependencies on other plugins

### Git-First Data
- Primary data source is a Git repository
- YAML files for structured data
- Same format as the full Next.js template
- No database required
- Data adapter pattern allows future alternative sources

### AI-Optimized
- Clear, predictable file structure
- Explicit naming (no abbreviations)
- Inline documentation on all extension points
- Data contracts defined as TypeScript interfaces
- AGENTS.md + SKILLS.md guide AI agents

## Data Flow

```
Build Time:
  1. prebuild script clones DATA_REPOSITORY → .content/
  2. Astro build starts
  3. @ever-works/adapters reads .content/ files
  4. @ever-works/core parses YAML → typed data
  5. Plugins process/transform data
  6. @ever-works/ui components render data
  7. Astro generates static HTML/CSS/JS
  8. Pagefind indexes output for search
  9. Static files ready for deployment

Runtime (Browser):
  1. Static HTML served from CDN
  2. Astro islands hydrate interactive components
  3. Client-side search via Pagefind index
  4. Client-side filtering (if enabled)
  5. No server communication needed
```

## Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 1.5s |
| Total Blocking Time | < 50ms |
| Cumulative Layout Shift | < 0.05 |
| JS Bundle (listing page) | < 20KB gzipped |
| CSS (without AI styling) | < 5KB gzipped |
