---
title: Overview
sidebar_label: Overview
description: Ever Works Minimal Directory Web Template — a lightweight, AI-optimized Astro template for directory websites.
---

# Ever Works Minimal Directory Template

A **minimal, static-rendered Astro template** for AI-generated directory websites. It serves as a lightweight alternative to the full-featured Next.js `directory-web-template`.

## Philosophy

This template is an **intentionally blank canvas** with headless, composable building blocks. AI agents (Claude Code, etc.) assemble and style these components into complete directory websites.

## Key Features

- **Static-first**: Astro 5 with fully static output (`output: 'static'`), no SSR
- **Plugin architecture**: Almost every feature is a plugin that can be enabled/disabled
- **Git-first data**: Content stored in YAML files within Git repositories
- **Headless components**: 24 Astro + 8 Preact unstyled building blocks + 14 primitive components
- **AI-optimized**: Clear naming, inline docs, explicit data contracts
- **Extreme performance**: Zero unnecessary JS, Astro islands architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 (static output) |
| Build | Vite + Turborepo |
| Language | TypeScript (strict) |
| Interactive Islands | Preact |
| CSS | Tailwind CSS v4 (AI-applied) |
| Search | Pagefind (static) |
| Data | YAML in Git repos |
| Package Manager | pnpm 10 |
| Deployment | Vercel |
| Testing | Playwright (E2E) |

## Quick Start

```bash
git clone https://github.com/ever-works/directory-web-minimal-template
cd directory-web-minimal-template
pnpm install
pnpm dev
```

## Monorepo Structure

```
/
├── apps/
│   ├── web/              — Astro static site (core template)
│   ├── web-e2e/          — Playwright E2E tests
│   ├── docs/             — Docusaurus documentation site
│   ├── sample-basic/     — Reference implementation (React UI Components directory)
│   ├── sample-git/       — Git adapter reference (1495 pages)
│   ├── sample-jobs/      — Job board directory sample
│   ├── sample-events/    — Tech events directory sample
│   └── sample-real-estate/ — Property listings directory sample
├── packages/
│   ├── core/             — Data layer, content reader, types, schemas
│   ├── ui/               — Headless UI components (24 Astro + 7 Preact + 22 primitives)
│   ├── plugins/          — Plugin system (runner, types, define-plugins)
│   ├── adapters/         — Data source adapters (git, filesystem)
│   ├── astro-integration/— Astro integration for plugin build lifecycle
│   ├── sync/             — Content synchronization (webhooks, polling, ISR)
│   ├── plugin-seo/       — SEO plugin (meta tags, JSON-LD)
│   ├── plugin-pagination/— Pagination plugin
│   ├── plugin-filters/   — Filters plugin
│   ├── plugin-search/    — Search plugin (Pagefind)
│   ├── plugin-sort/      — Sort plugin
│   ├── plugin-sitemap/   — Sitemap plugin
│   ├── plugin-breadcrumbs/— Breadcrumbs plugin
│   ├── tsconfig/         — Shared TypeScript configurations
│   └── eslint-config/    — Shared ESLint configuration
└── docs/                 — Documentation source (Markdown)
```
