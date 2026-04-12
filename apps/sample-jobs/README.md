# Sample: Remote Tech Jobs Directory

> A reference implementation built by AI from the minimal template.
> Demonstrates a job board vertical with role-specific metadata and curated collections.

## What This Is

A working directory website for **Remote Tech Jobs**, showcasing 8 job postings across 6 categories and 10 tags. Built using:

- The `@ever-works/web-minimal` template as the starting point
- `SKILLS.md` and `AGENTS.md` for AI guidance
- Claude Code (Opus 4.6) as the AI agent

## Features

- **8 remote job listings** — Senior Frontend Engineer, Backend Engineer (Rust), DevOps Engineer, Data Scientist, Product Designer, Product Manager, Head of Marketing, Junior React Developer
- **6 categories** — Engineering, Design, Product, Marketing, Data Science, DevOps
- **10 tags** — Remote, Full-Time, Part-Time, Contract, Senior, Junior, Mid-Level, Startup, Enterprise, Visa Sponsor
- **2 curated collections** — Top Remote Engineering Jobs, Design & Product Roles
- **2 comparisons** — Side-by-side job comparisons
- **Static pages** — Home, item details, category listings, tag listings, collections, comparisons, pagination
- **Modern Tailwind CSS design** — Clean, responsive, dark mode ready
- **SEO optimized** — Meta tags, Open Graph, JSON-LD structured data, sitemap
- **Extreme performance** — Fully static, zero unnecessary JS

## Content Structure

```
.content/
├── config.yml          — Site config ("Remote Tech Jobs", item_name: "Job")
├── categories.yml      — 6 job categories (Engineering, Design, Product, ...)
├── tags.yml            — 10 tags (Remote, Full-Time, Senior, Contract, ...)
├── collections.yml     — 2 curated lists (Top Engineering Jobs, Design & Product)
├── comparisons/        — 2 job comparison pages
└── data/
    └── <job-slug>/
        └── <job-slug>.yml  — Job data (title, description, category, tags)
```

## Pages

| Route | Description |
|---|---|
| `/` | Home — all job listings with search and filters |
| `/item/[slug]` | Job detail page |
| `/categories` | All categories listing |
| `/category/[slug]` | Jobs filtered by category |
| `/tags` | All tags listing |
| `/tag/[slug]` | Jobs filtered by tag |
| `/collections` | All curated collections |
| `/collection/[slug]` | Collection detail page |
| `/comparisons` | All comparisons |
| `/comparison/[slug]` | Side-by-side job comparison |
| `/page/[page]` | Paginated job listings |

## How It Was Built

1. AI read `AGENTS.md` and `CLAUDE.md` to understand the template rules
2. AI created job-specific content data in `.content/` (config, categories, tags, items)
3. AI copied the template structure and configured plugins
4. AI applied Tailwind CSS styling to all headless components
5. AI built and verified — static pages, 0 errors

## Prompt Used

```
Implement a job board directory website for Remote Tech Jobs using the
ever-works minimal template. The directory should list remote tech job
postings with categories (Engineering, Design, Product, etc.), tags
(Remote, Full-Time, Senior, etc.), search, and a clean modern design
with Tailwind CSS. Support dark and light modes. Make it fully static
and deployable to Vercel.
```

## Key Customizations

- **Job-specific vocabulary** — Items are called "Jobs" throughout the UI
- **Employment type tags** — Full-Time, Part-Time, Contract distinguish job types
- **Seniority tags** — Senior, Mid-Level, Junior for experience filtering
- **Company tags** — Startup vs Enterprise to indicate company size
- **Curated collections** — Hand-picked groupings like "Top Remote Engineering Jobs"

## Running Locally

```bash
# From monorepo root
pnpm dev --filter @ever-works/sample-jobs

# Or from this directory
pnpm dev
```

## Building

```bash
pnpm --filter @ever-works/sample-jobs build
# Output: apps/sample-jobs/dist/
```
