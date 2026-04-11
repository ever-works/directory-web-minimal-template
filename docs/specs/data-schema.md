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
  items: ["react-hook-form", "tanstack-table", "radix-ui"]
  isActive: true

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
category: "forms"
summary: "A comparison of two popular React form libraries"
verdict: "React Hook Form offers better performance with less re-renders"
verdict_winner: "item_a"
generated_at: "2026-01-10T12:00:00Z"
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
```

## Minimal Fields for This Template

The minimal template only uses a subset of the full template's fields. Fields not listed above (e.g., `location`, `submitted_by`, `reviewed_by`, `promo_code`, `showSurveys`, `publisher`, `action`, `brand`, `brand_logo_url`, `images`) are available in the raw YAML but not used by any built-in component. They are passed through as `[key: string]: unknown` for custom use.

Similarly, config fields like `auth`, `mail`, `pricing`, `payment`, `custom_hero`, `custom_header`, `custom_footer` are ignored by this template since we don't have auth, payments, or advanced customization features.
