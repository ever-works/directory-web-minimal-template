# Sample: React UI Components Directory

> A reference implementation built by AI from the minimal template.
> Demonstrates the full AI workflow from blank template to styled directory website.

## What This Is

A working directory website for **React UI Components**, showcasing 12 component libraries across 8 categories and 10 tags. Built using:

- The `@ever-works/web-minimal` template as the starting point
- `SKILLS.md` and `AGENTS.md` for AI guidance
- Claude Code (Opus 4.6) as the AI agent

## Features

- **12 React component libraries** — Radix UI, Headless UI, React Aria, shadcn/ui, Chakra UI, Ant Design, Material UI, Mantine, React Hook Form, TanStack Table, Framer Motion, React Spring
- **8 categories** — Form Components, Data Display, Navigation, Layout, Feedback, Animation, Headless, Full Suite
- **10 tags** — TypeScript, Accessible, Headless, Open Source, Tailwind CSS, and more
- **35 static pages** — Home, item details, category listings, tag listings, pagination
- **Modern Tailwind CSS design** — Clean, responsive, dark mode ready
- **SEO optimized** — Meta tags, Open Graph, JSON-LD structured data, sitemap
- **Extreme performance** — Fully static, zero unnecessary JS, ~3s build time

## How It Was Built

1. AI read `AGENTS.md` and `CLAUDE.md` to understand the template rules
2. AI created sample content data in `.content/` (config, categories, tags, items)
3. AI copied the template structure and configured plugins
4. AI applied Tailwind CSS styling to all headless components
5. AI built and verified — 35 pages, 0 errors, 3.07s build time

## Prompt Used

```
Implement a basic directory website for React UI Components using the
ever-works minimal template. The directory should show all React component
libraries with categories, tags, search, and a clean modern design with
Tailwind CSS. Support dark and light modes. Make it fully static and
deployable to Vercel.
```

## Running Locally

```bash
# From monorepo root
pnpm dev --filter @ever-works/sample-basic

# Or from this directory
pnpm dev
```

## Building

```bash
pnpm --filter @ever-works/sample-basic build
# Output: apps/sample-basic/dist/ (35 static pages)
```
