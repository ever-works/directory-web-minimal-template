---
title: Documentation Index
sidebar_label: Home
slug: /
---

# Documentation Index

> Complete index of all documentation in this repository.
> Updated: 2026-04-27 (Iteration 109: **Q24 ✅ RESOLVED — `LayoutSwitcher` `EMPTY_MODES` allocation fix landed.** Source-side audit identified the same per-render array allocation bug that `FilterBar.tsx` had pre-iteration-105: the default `modes = ['grid', 'list']` allocated a fresh `[]` per render and `useEffect([persistKey, modes])` fired every render — racing the post-click `localStorage.setItem(...)`. Fix is a 1-line source change + 6-line comment block + 1-line frozen `EMPTY_MODES: readonly LayoutMode[]` sentinel in `packages/ui/src/preact/LayoutSwitcher.tsx`, mirroring `EMPTY_TAGS` in `FilterBar.tsx`. Verified across **3 isolated runs of `layout-switcher.ct.test.tsx`** (12/12 each in 40-46s) and **2 full-suite runs of `pnpm test:ct`** (43/43 each in 1m12-18s) on Windows + Node 24.14.0 + Chromium 147. The `net::ERR_CONNECTION_REFUSED` observation from iteration 108 (Q24 hypothesis B) did not reproduce — it was a downstream effect of the race producing extra mounts/retries, not an independent dev-server bug. New spec at `.specify/features/q24-layoutswitcher-empty-modes.md` and plan at `docs/plans/q24-layoutswitcher-empty-modes.md`. **Codebase pattern now documented**: any non-primitive default prop flowing into a `useEffect` dep array MUST be reference-stable across renders. `MobileMenu.tsx`'s `items = []` default is exempt because `items` does not appear in any `useEffect` dep array. Iteration-107 "12/12 pass in ~1 min" claim is now reproducible. Remaining follow-ups: Q22 #2 (`pnpm test:ui:safe` removal), Q22 #3 (`playwright-coverage` integration), CI matrix observation. Q22 / Q23 / Q24 are all CLOSED.)

## Root Documents

> These files live at the repository root and are not part of the Docusaurus docs site.
> View them on GitHub or in the cloned repository.

- **CLAUDE.md** — Claude Code instructions, project overview, commands ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/CLAUDE.md))
- **AGENTS.md** — AI agent rules (R1-R15 under Mandatory Rules), working process, data contracts, available pages/components/plugins ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/AGENTS.md))
- **SKILLS.md** — Step-by-step AI agent skills for building directory sites ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/SKILLS.md))
- **README.md** — Project README ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/README.md))

## Overview

- [overview.md](overview.md) — Project overview, philosophy, tech stack, quick start

## Architecture

- [architecture/overview.md](architecture/overview.md) — High-level architecture overview, data flow, performance budget
- [architecture/data-layer.md](architecture/data-layer.md) — Data layer design (git-first), content repo structure, all data types
- [architecture/plugin-system.md](architecture/plugin-system.md) — Plugin architecture, lifecycle hooks, plugin types
- [architecture/adapter-system.md](architecture/adapter-system.md) — Adapter pattern for data sources (git, filesystem)
- [architecture/component-system.md](architecture/component-system.md) — Headless UI component design, island architecture
- [architecture/content-sync.md](architecture/content-sync.md) — Content synchronization, caching, ISR architecture
- [architecture/testing-runners.md](architecture/testing-runners.md) — Vitest vs. Playwright CT vs. Playwright E2E decision matrix; authoring conventions; Q22 background

## Plans

- [plans/phase-1-foundation.md](plans/phase-1-foundation.md) — Phase 1: Monorepo scaffold, core types, data layer
- [plans/phase-2-components.md](plans/phase-2-components.md) — Phase 2: Headless UI components
- [plans/phase-3-web-app.md](plans/phase-3-web-app.md) — Phase 3: Astro web app with pages
- [plans/phase-4-plugins.md](plans/phase-4-plugins.md) — Phase 4: Built-in plugins (search, filters, etc.)
- [plans/phase-4b-plugin-analytics.md](plans/phase-4b-plugin-analytics.md) — Phase 4b: Analytics plugin (Plausible, Umami, Fathom, GA4, custom)
- [plans/phase-5-sample.md](plans/phase-5-sample.md) — Phase 5: Sample implementations
- [plans/phase-5-sample-detail.md](plans/phase-5-sample-detail.md) — Phase 5: Detailed implementation plan for sample-basic
- [plans/phase-6-deployment.md](plans/phase-6-deployment.md) — Phase 6: Deployment, CI/CD, docs site
- [plans/phase-7-sample-events.md](plans/phase-7-sample-events.md) — Phase 7: Sample events/conferences directory
- [plans/phase-8-sample-real-estate.md](plans/phase-8-sample-real-estate.md) — Phase 8: Sample real estate/property listings directory
- [plans/q22-playwright-ct.md](plans/q22-playwright-ct.md) — Q22: Migrate `FilterBar` tests to Playwright Component Testing (Option D)
- [plans/q22-upstream-repro.md](plans/q22-upstream-repro.md) — Q22: Minimal upstream repro template for `vitest-dev/vitest`
- [plans/q22-mobilemenu-ct.md](plans/q22-mobilemenu-ct.md) — Q22 follow-up #1: Preemptive `MobileMenu` Playwright CT migration
- [plans/q24-layoutswitcher-empty-modes.md](plans/q24-layoutswitcher-empty-modes.md) — Q24: `LayoutSwitcher` `EMPTY_MODES` allocation fix (mirror of iteration-105 `EMPTY_TAGS`)

## Specifications

- [specs/data-schema.md](specs/data-schema.md) — Data schema specification (Item, Category, Tag, Collection, Comparison, Config)
- [specs/plugin-interface.md](specs/plugin-interface.md) — Plugin interface contract (hooks, context, lifecycle)
- [specs/adapter-interface.md](specs/adapter-interface.md) — Adapter interface contract (DataAdapter, AdapterConfig)
- [specs/component-catalog.md](specs/component-catalog.md) — Component catalog (all Astro, Preact, and primitive components)


## Spec Kit (.specify/)

> These files live in the `.specify/` directory at the repository root.
> View them on GitHub or in the cloned repository.

- **project.md** — Project specification (goals, non-goals, tech stack, timeline) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/project.md))
- **features/data-layer.md** — Data layer feature spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/data-layer.md))
- **features/plugin-system.md** — Plugin system feature spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-system.md))
- **features/ui-components.md** — UI components feature spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/ui-components.md))
- **features/web-app.md** — Web app feature spec (all page routes) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/web-app.md))
- **features/plugins-phase4.md** — Phase 4 built-in plugins detailed spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugins-phase4.md))
- **features/sample-basic.md** — Sample basic implementation spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/sample-basic.md))
- **features/plugin-breadcrumbs.md** — Breadcrumbs plugin spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-breadcrumbs.md))
- **features/testing.md** — Unit testing infrastructure spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/testing.md))
- **features/static-pages.md** — Static pages feature spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/static-pages.md))
- **features/sample-git.md** — Sample Git reference implementation spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/sample-git.md))
- **features/content-sync.md** — Content sync, caching & ISR spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/content-sync.md))
- **features/sample-jobs.md** — Sample Jobs (job board directory) spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/sample-jobs.md))
- **features/sample-events.md** — Sample Events (conferences/meetups directory) spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/sample-events.md))
- **features/sample-real-estate.md** — Sample Real Estate (property listings directory) spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/sample-real-estate.md))
- **features/lighthouse-ci.md** — Lighthouse CI performance testing spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/lighthouse-ci.md))
- **features/plugin-rss.md** — RSS/Atom feed plugin spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-rss.md))
- **features/plugin-analytics.md** — Analytics plugin spec (Plausible, Umami, Fathom, GA4, custom) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-analytics.md))
- **features/plugin-related-items.md** — Related items plugin spec (tag/category scoring, build-time computation) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-related-items.md))
- **features/plugin-filters.md** — Filters plugin spec (category, tag, search filtering with URL sync) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-filters.md))
- **features/plugin-search.md** — Search plugin spec (Pagefind static search indexing) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-search.md))
- **features/plugin-pagination.md** — Pagination plugin spec (page calculation, URL patterns) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-pagination.md))
- **features/plugin-sort.md** — Sort plugin spec (name, date, featured sorting) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-sort.md))
- **features/plugin-sitemap.md** — Sitemap plugin spec (@astrojs/sitemap config wrapper) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/plugin-sitemap.md))
- **features/robots-txt.md** — robots.txt generation spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/robots-txt.md))
- **features/visual-regression.md** — Visual regression testing spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/visual-regression.md))
- **features/q22-playwright-ct.md** — Q22 resolution: Playwright Component Testing migration spec for `FilterBar` ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q22-playwright-ct.md))
- **features/q22-mobilemenu-ct.md** — Q22 follow-up #1: Preemptive `MobileMenu` Playwright CT migration spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q22-mobilemenu-ct.md))
- **features/q24-layoutswitcher-empty-modes.md** — Q24: `LayoutSwitcher` `EMPTY_MODES` allocation fix spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q24-layoutswitcher-empty-modes.md))

## Guides

- [guides/quickstart.md](guides/quickstart.md) — Quick start guide for getting up and running
- [guides/getting-started.md](guides/getting-started.md) — Step-by-step tutorial: build a full directory site from scratch
- [guides/building-from-template.md](guides/building-from-template.md) — How AI builds a site from template
- [guides/customizing.md](guides/customizing.md) — Customize theming, layouts, components, plugins, and data fields
- [guides/creating-a-plugin.md](guides/creating-a-plugin.md) — How to create a plugin
- [guides/creating-an-adapter.md](guides/creating-an-adapter.md) — How to create a data adapter
- [guides/interactive-components.md](guides/interactive-components.md) — How to use Preact interactive islands (search, filter, sort, theme, back-to-top)
- [guides/content-sync.md](guides/content-sync.md) — Content sync setup (webhooks, polling, ISR)
- [guides/analytics.md](guides/analytics.md) — How to add analytics (Plausible, Umami, Fathom, GA4, custom)
- [guides/deployment.md](guides/deployment.md) — How to deploy to Vercel and other static hosts
- [guides/performance-testing.md](guides/performance-testing.md) — Lighthouse CI performance testing setup and configuration
- [guides/troubleshooting.md](guides/troubleshooting.md) — Common issues and solutions

## Reference

- [questions.md](questions.md) — Open questions and decisions (Q1-Q20 with defaults)
- [log.md](log.md) — Change log (all iterations tracked)
