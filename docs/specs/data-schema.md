---
title: "Data Schema"
sidebar_label: "Data Schema"
---

# Data Schema Specification

> Defines all data types used in the minimal directory template.
> These schemas match the full Next.js template's `.content/` format.

## Item Schema

**Source**: `.content/data/<slug>/<slug>.yml`

```yaml
# Required fields
name: "React Hook Form"
description: "Performant, flexible and extensible forms with easy-to-use validation."
source_url: "https://react-hook-form.com"
category: "forms"                    # or ["forms", "utilities"]
tags: ["typescript", "react", "forms", "validation"]
updated_at: "2026-01-15 10:30"
status: "approved"                   # draft | pending | approved | rejected

# Optional fields
featured: true
icon_url: "https://example.com/icon.png"
collections: ["top-picks", "developer-tools"]
brand: "React Hook Form"
brand_logo_url: "https://example.com/brand-logo.png"
images: ["https://example.com/screenshot1.png"]
publisher: "react-hook-form"
markdown: |
  ## Overview
  React Hook Form is a library for...
```

**Derived fields** (computed at load time):
- `id` — directory name
- `slug` — directory name

**Status filter**: Only `approved` items are shown in the public site. Other statuses are for the admin workflow in the full template.

## Category Schema

**Source**: `.content/categories.yml` or `.content/categories/categories.yml`

```yaml
- id: "forms"
  name: "Form Libraries"
  icon_url: "https://example.com/forms-icon.png"
  image_url: "https://example.com/forms-image.png"

- id: "data-display"
  name: "Data Display"

- id: "navigation"
  name: "Navigation"
```

## Tag Schema

**Source**: `.content/tags.yml`

```yaml
- id: "typescript"
  name: "TypeScript"
  isActive: true

- id: "react"
  name: "React"
  isActive: true

- id: "deprecated"
  name: "Deprecated"
  isActive: false
```

## Collection Schema

**Source**: `.content/collections.yml`

```yaml
- id: "top-picks"
  slug: "top-picks"
  name: "Top Picks"
  description: "Our favorite libraries and tools"
  icon_url: "https://example.com/star.png"
  items: ["react-hook-form", "tanstack-table", "radix-ui"]   # optional
  item_count: 3                                              # optional
  isActive: true
  created_at: "2026-01-01"                                   # optional
  updated_at: "2026-01-15"                                   # optional

- id: "new-releases"
  slug: "new-releases"
  name: "New Releases"
  description: "Recently added to the directory"
  items: []
  isActive: true
```

## Comparison Schema

**Source**: `.content/comparisons/<slug>/<slug>.yml` + `.md`

```yaml
# <slug>.yml
id: "react-hook-form-vs-formik"
slug: "react-hook-form-vs-formik"
title: "React Hook Form vs Formik"
item_a_slug: "react-hook-form"
item_b_slug: "formik"
item_a_name: "React Hook Form"
item_b_name: "Formik"
category: "forms"                       # optional
summary: "A comparison of two popular React form libraries"
verdict: "React Hook Form offers better performance with less re-renders"
verdict_winner: "item_a"
generated_at: "2026-01-10T12:00:00Z"
sources: ["https://example.com/benchmark"]   # optional
dimensions:
  - name: "Performance"
    item_a_summary: "Minimal re-renders, uncontrolled components"
    item_b_summary: "More re-renders with controlled components"
    item_a_score: 9
    item_b_score: 7
    winner: "item_a"
  - name: "Bundle Size"
    item_a_summary: "~9KB gzipped"
    item_b_summary: "~13KB gzipped"
    item_a_score: 9
    item_b_score: 7
    winner: "item_a"
```

```markdown
<!-- <slug>.md -->
# React Hook Form vs Formik

Both React Hook Form and Formik are popular...
```

## Site Config Schema

**Source**: `.content/config.yml`

```yaml
company_name: "React Components Directory"
item_name: "Component"
items_name: "Components"
copyright_year: 2026
app_url: "https://components.example.com"

logo:
  logo_image: "/logo.png"
  logo_image_dark: "/logo-dark.png"
  favicon: "/favicon.ico"

pagination:
  type: "standard"          # standard | infinite
  itemsPerPage: 20

settings:
  categories_enabled: true
  tags_enabled: true
  collections_enabled: true
  comparisons_enabled: true
  featured_enabled: true

# Custom navigation (optional)
custom_header:
  - label: "Blog"
    href: "https://blog.example.com"
    external: true
custom_footer:
  - label: "Privacy"
    href: "/privacy"

# Homepage display settings (optional)
homepage:
  hero_title: "Find the Best Components"
  hero_description: "Browse our curated directory"
  search_enabled: true
  default_view: "grid"           # grid | list
  default_sort: "featured"       # name-asc | name-desc | date-desc | featured
```

## Page Data

Static pages are stored as Markdown files in `.content/pages/`. Each page has YAML frontmatter for metadata.

```yaml
# .content/pages/about.md
---
title: "About Us"
description: "Learn about our directory"
---

Markdown content here...
```

TypeScript type: `PageData` with fields `slug`, `title`, `description?`, `content`, plus pass-through for additional frontmatter fields.

## Additional Fields

The template explicitly types the following fields on `ItemData`: `brand`, `brand_logo_url`, `images`, `publisher`. These are used by the full Next.js template and preserved here for compatibility. Built-in components do not render them by default, but custom components can access them directly.

### `meta` Field

`ItemData` has an explicit `meta?: Record<string, unknown>` field for domain-specific metadata. Vertical templates (jobs, events, real-estate) should use `meta` for custom fields:

```yaml
# Job listing example
meta:
  salary: "$120k - $150k"
  location: "Remote"
  company: "Acme Corp"

# Real estate example
meta:
  price: "$450,000"
  location: "Downtown"
  bedrooms: 3
```

Access in code: `item.meta?.salary`, `item.meta?.location`, etc.

### `_breadcrumbs` Field (Plugin-Injected)

`ContentData` has an optional `_breadcrumbs` field populated by `@ever-works/plugin-breadcrumbs` during the `onDataLoaded` hook. It is a `Map<string, Array<{ label: string; href?: string }>>` mapping page pathnames to breadcrumb trails. Access in Astro pages:

```typescript
const data = await getContent();
const crumbs = data._breadcrumbs?.get(Astro.url.pathname) ?? [];
```

### `_analytics` Field (Plugin-Injected)

`ContentData` has an optional `_analytics` field populated by `@ever-works/plugin-analytics` during the `onDataLoaded` hook. It holds the resolved analytics configuration (type: `ResolvedAnalyticsConfig` from `@ever-works/plugin-analytics`). Access in Astro layouts:

```typescript
const data = await getContent();
const analyticsConfig = data._analytics;
```

### `_relatedItemsComputed` Field (Plugin-Injected)

`ContentData` has an optional `_relatedItemsComputed` boolean flag set by `@ever-works/plugin-related-items` during the `onDataLoaded` hook. When `true`, each `ItemData` in `data.items` has a `_relatedItems` array injected via index signature containing related item references scored by shared tags and categories.

### Pass-Through

Config fields like `auth`, `mail`, `pricing`, `payment` are ignored by this template since we don't have auth, payments, or advanced customization features. They are preserved as `[key: string]: unknown` for forward compatibility.
