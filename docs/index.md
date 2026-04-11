---
title: Documentation Index
sidebar_label: Home
slug: /
---

# Documentation Index

> Complete index of all documentation in this repository.
> Updated: 2026-04-11 (Iteration 18: Docs frontmatter, E2E CI, sample-git)

## Root Documents

> These files live at the repository root and are not part of the Docusaurus docs site.
> View them on GitHub or in the cloned repository.

- **CLAUDE.md** — Claude Code instructions, project overview, commands ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/CLAUDE.md))
- **AGENTS.md** — AI agent rules (R1-R14 under Mandatory Rules), working process, data contracts, available pages/components/plugins ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/AGENTS.md))
- **SKILLS.md** — Step-by-step AI agent skills for building directory sites ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/SKILLS.md))
- **README.md** — Project README ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/README.md))

## Architecture

- [architecture/overview.md](architecture/overview.md) — High-level architecture overview, data flow, performance budget
- [architecture/data-layer.md](architecture/data-layer.md) — Data layer design (git-first), content repo structure, all data types
- [architecture/plugin-system.md](architecture/plugin-system.md) — Plugin architecture, lifecycle hooks, plugin types
- [architecture/adapter-system.md](architecture/adapter-system.md) — Adapter pattern for data sources (git, filesystem)
- [architecture/component-system.md](architecture/component-system.md) — Headless UI component design, island architecture

## Plans

- [plans/phase-1-foundation.md](plans/phase-1-foundation.md) — Phase 1: Monorepo scaffold, core types, data layer
- [plans/phase-2-components.md](plans/phase-2-components.md) — Phase 2: Headless UI components
- [plans/phase-3-web-app.md](plans/phase-3-web-app.md) — Phase 3: Astro web app with pages
- [plans/phase-4-plugins.md](plans/phase-4-plugins.md) — Phase 4: Built-in plugins (search, filters, etc.)
- [plans/phase-5-sample.md](plans/phase-5-sample.md) — Phase 5: Sample implementations
- [plans/phase-5-sample-detail.md](plans/phase-5-sample-detail.md) — Phase 5: Detailed implementation plan for sample-basic
- [plans/phase-6-deployment.md](plans/phase-6-deployment.md) — Phase 6: Deployment, CI/CD, docs site

## Specifications

- [specs/data-schema.md](specs/data-schema.md) — Data schema specification (Item, Category, Tag, Collection, Comparison, Config)
- [specs/plugin-interface.md](specs/plugin-interface.md) — Plugin interface contract (hooks, context, lifecycle)
- [specs/adapter-interface.md](specs/adapter-interface.md) — Adapter interface contract (DataAdapter, AdapterConfig)
- [specs/component-catalog.md](specs/component-catalog.md) — Component catalog specification (17 Astro + 5 Preact)

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

## Guides

- [guides/creating-a-plugin.md](guides/creating-a-plugin.md) — How to create a plugin
- [guides/creating-an-adapter.md](guides/creating-an-adapter.md) — How to create a data adapter
- [guides/building-from-template.md](guides/building-from-template.md) — How AI builds a site from template
- [guides/interactive-components.md](guides/interactive-components.md) — How to use Preact interactive islands (search, filter, sort, theme, back-to-top)
- [guides/deployment.md](guides/deployment.md) — How to deploy to Vercel and other static hosts
- [guides/troubleshooting.md](guides/troubleshooting.md) — Common issues and solutions

## Reference

- [questions.md](questions.md) — Open questions and decisions (Q1-Q11 with defaults)
- [log.md](log.md) — Change log (all iterations tracked)
