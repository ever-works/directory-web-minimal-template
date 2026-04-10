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
2. `/items/` lists all approved items with pagination
3. `/items/[slug]` renders full item detail
4. `/categories/` lists all categories with item counts
5. `/categories/[slug]` lists items in that category
6. `/tags/` lists all active tags
7. `/tags/[slug]` lists items with that tag
8. `/collections/` lists all active collections
9. `/collections/[slug]` lists items in that collection
10. `/comparisons/` lists all comparisons
11. `/comparisons/[slug]` renders comparison detail
12. 404 page for unknown routes
13. Build generates fully static HTML (no SSR)
14. All pages pass basic accessibility checks
15. Lighthouse performance score > 90

## Pages

| Route | Template | Data |
|-------|----------|------|
| `/` | Home | config, featured items, categories |
| `/items/` | Listing | all items (paginated) |
| `/items/[slug]` | Detail | single item |
| `/categories/` | Listing | categories with counts |
| `/categories/[slug]` | Listing | items by category |
| `/tags/` | Listing | tags with counts |
| `/tags/[slug]` | Listing | items by tag |
| `/collections/` | Listing | collections |
| `/collections/[slug]` | Listing | items in collection |
| `/comparisons/` | Listing | comparisons |
| `/comparisons/[slug]` | Detail | comparison data |

## Technical Design

See:
- `docs/plans/phase-3-web-app.md` — Implementation plan
- `docs/architecture/overview.md` — System architecture
