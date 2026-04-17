# Feature: Astro Web Application

## Description

The core Astro application that assembles components, loads data, and generates static pages. Provides file-based routing for all directory page types.

## User Stories

- As a **visitor**, I want to browse all items on a listing page.
- As a **visitor**, I want to view details of a single item.
- As a **visitor**, I want to browse items by category.
- As a **visitor**, I want to browse items by tag.
- As a **visitor**, I want to see item collections.
- As a **visitor**, I want to compare two items side by side.
- As a **visitor**, I want to search for items.
- As a **visitor**, I want a fast-loading, accessible website.

## Acceptance Criteria

1. Home page renders with hero, featured items, and category list
2. `/page/[page]` lists all approved items with pagination
3. `/item/[slug]` renders full item detail
4. `/categories` lists all categories with item counts
5. `/category/[slug]` lists items in that category
6. `/tags` lists all active tags
7. `/tag/[slug]` lists items with that tag
8. `/collections` lists all active collections
9. `/collection/[slug]` lists items in that collection
10. `/comparisons` lists all comparisons
11. `/comparison/[slug]` renders comparison detail
12. 404 page for unknown routes
13. Build generates fully static HTML (no SSR)
14. All pages pass basic accessibility checks
15. Lighthouse performance score > 90

## Pages

| Route | File | Data |
|-------|------|------|
| `/` | `index.astro` | config, featured items, categories |
| `/page/[page]` | `page/[page].astro` | all items (paginated) |
| `/item/[slug]` | `item/[slug].astro` | single item detail |
| `/categories` | `categories.astro` | categories with counts |
| `/category/[slug]` | `category/[slug].astro` | items by category |
| `/tags` | `tags.astro` | tags with counts |
| `/tag/[slug]` | `tag/[slug].astro` | items by tag |
| `/collections` | `collections.astro` | collections |
| `/collection/[slug]` | `collection/[slug].astro` | items in collection |
| `/comparisons` | `comparisons.astro` | comparisons |
| `/comparison/[slug]` | `comparison/[slug].astro` | comparison data |
| `/404` | `404.astro` | not found page |
| `/pages/[slug]` | `pages/[slug].astro` | static content pages (from `.content/pages/`) |
| `/rss.xml` | `rss.xml.ts` | RSS 2.0 feed |
| `/atom.xml` | `atom.xml.ts` | Atom 1.0 feed |
| `/robots.txt` | `robots.txt.ts` | robots.txt |

## Technical Design

See:
- `docs/plans/phase-3-web-app.md` — Implementation plan
- `docs/architecture/overview.md` — System architecture
