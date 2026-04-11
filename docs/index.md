# Documentation Index

> Complete index of all documentation in this repository.
> Updated: 2026-04-11 (Phase 7: UI package integration, docs polish, content gaps filled)

## Root Documents

- [CLAUDE.md](../CLAUDE.md) — Claude Code instructions, project overview, commands
- [AGENTS.md](../AGENTS.md) — AI agent rules (R1-R14), working process, data contracts, available pages/components/plugins
- [SKILLS.md](../SKILLS.md) — Step-by-step AI agent skills for building directory sites
- [README.md](../README.md) — Project README

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

- [../.specify/project.md](../.specify/project.md) — Project specification (goals, non-goals, tech stack, timeline)
- [../.specify/features/data-layer.md](../.specify/features/data-layer.md) — Data layer feature spec
- [../.specify/features/plugin-system.md](../.specify/features/plugin-system.md) — Plugin system feature spec
- [../.specify/features/ui-components.md](../.specify/features/ui-components.md) — UI components feature spec
- [../.specify/features/web-app.md](../.specify/features/web-app.md) — Web app feature spec (all page routes)
- [../.specify/features/plugins-phase4.md](../.specify/features/plugins-phase4.md) — Phase 4 built-in plugins detailed spec
- [../.specify/features/sample-basic.md](../.specify/features/sample-basic.md) — Sample basic implementation spec

## Guides

- [guides/creating-a-plugin.md](guides/creating-a-plugin.md) — How to create a plugin
- [guides/creating-an-adapter.md](guides/creating-an-adapter.md) — How to create a data adapter
- [guides/building-from-template.md](guides/building-from-template.md) — How AI builds a site from template

## Reference

- [questions.md](questions.md) — Open questions and decisions (Q1-Q10 with defaults)
- [log.md](log.md) — Change log (all phases tracked)
