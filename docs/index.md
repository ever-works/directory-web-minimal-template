---
title: Documentation Index
sidebar_label: Home
slug: /
---

# Documentation Index

> Complete index of all documentation in this repository.
> Updated: 2026-04-17 (Iteration 76: spec drift audit, plugin-rss coverage 100%)

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
- **features/robots-txt.md** — robots.txt generation spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/robots-txt.md))
- **features/visual-regression.md** — Visual regression testing spec ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/visual-regression.md))

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
