---
title: "Sample Jobs — Job Board Directory"
status: implemented
priority: medium
---

# Sample Jobs — Job Board Directory

> Reference implementation: A job board directory built by AI from the minimal template.

## Overview

`apps/sample-jobs/` is a vertical-specific sample demonstrating a job board use case.
It follows the same architecture as `apps/sample-basic/` but with job-listing content.

## Content Structure

### config.yml
- `company_name`: "Remote Tech Jobs"
- `item_name`: "Job"
- `items_name`: "Jobs"

### Categories (6)
- engineering, design, product, marketing, data-science, devops

### Tags (10)
- remote, full-time, part-time, contract, senior, junior, mid-level, startup, enterprise, visa-sponsor

### Items (8 job listings)
1. senior-frontend-engineer — Vercel, Engineering
2. product-designer — Linear, Design
3. backend-engineer-rust — Cloudflare, Engineering
4. data-scientist — Stripe, Data Science
5. devops-engineer — GitLab, DevOps
6. junior-react-developer — Shopify, Engineering
7. head-of-marketing — Notion, Marketing
8. product-manager — Figma, Product

### Comparisons (2)
- vercel-vs-cloudflare
- linear-vs-figma

### Collections (2)
- top-remote-engineering-jobs
- design-and-product-roles

## Pages

Same page routes as sample-basic:
- `/` — Home with featured jobs
- `/categories` — All categories
- `/category/[slug]` — Items in category
- `/tags` — All tags
- `/tag/[slug]` — Items with tag
- `/item/[slug]` — Job detail page
- `/page/[page]` — Paginated listing
- `/collections` — All collections
- `/collection/[slug]` — Items in collection
- `/comparisons` — All comparisons
- `/comparison/[slug]` — Side-by-side comparison
- `/pages/[slug]` — Static content pages
- `/404` — Not found page

## Technical Details

- Port: 4324 (dev server)
- Site URL: https://remote-tech-jobs.example.com
- Dependencies: Same as sample-basic
- Static output only
- Tailwind CSS for styling
- Plugin pipeline: SEO, pagination, filters, search, sort, breadcrumbs, sitemap, rss, analytics, related-items

## CI Integration

Built in the E2E job of `.github/workflows/ci.yml` alongside sample-basic.
