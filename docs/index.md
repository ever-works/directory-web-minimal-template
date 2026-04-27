---
title: Documentation Index
sidebar_label: Home
slug: /
---

# Documentation Index

> Complete index of all documentation in this repository.
> Updated: 2026-04-27 (Iteration 112: **Q25 npm-registry validation + Phase 0 prerequisite (`packages/ui/.gitignore`) created.** Two parallel docs/prep deliverables, both low-risk and gated. (1) **Q25 npm-registry validation**: before any `pnpm add` lands, verified `monocart-coverage-reports@2.12.11` (`latest` dist-tag, above the spec's `^2.11.0` floor — pin bumped to `^2.12.0` to lock the verified branch) and `monocart-reporter@2.10.1` (`latest`, pin bumped to `^2.10.0`) are still actively published. README inspection confirms `playwright-ct-react` is an explicitly listed integration example, the "Automatic Merging" / "Manual Merging" sections describe the Vitest-unit + Playwright-CT merge flow we need (matches AC #4), and `entryFilter`/`sourceFilter` API matches the plan's Phase 1 step 2 settings. Q25 default (Option A — `monocart-coverage-reports`) holds; the spec's "Library may not exist" risk (R6) drops to "library may mis-handle our specific Vite/Preact alias" — a much narrower Phase 0 surface. (2) **`packages/ui/.gitignore` created** (first per-package gitignore in the repo) with a single `scratch/` line plus a header comment block referencing the plan and spec. Most generic patterns (`node_modules/`, `coverage/`, `dist/`, `test-results/`, `playwright-report/`) are already covered by the repo-root `.gitignore`; this file's only purpose is the scratch-dir convention required by Phase 0 step 1 of the plan. **Phase 0 (the smoke test itself) was NOT executed in iteration 112** — three reasons documented in the log: (a) validation already shrank Phase 0's scope; (b) cron-task autonomy + browser-cold-start fragility argues against coupling a brand-new dev dep + new Playwright reporter + browser launch in one autonomous iteration; (c) the plan's iteration sequencing already lists Phase 0 alone as ~30 min Low-risk. Iteration 113 inherits a fully unblocked Phase 0 (gitignore exists, library version is verified, hand-off checklist sits at the bottom of the log entry). Files changed: `docs/questions.md` Q25, `.specify/features/q22-playwright-coverage.md` Decisions table, `docs/plans/q22-playwright-coverage.md` header + Phase 0/1 step 1. Files created: `packages/ui/.gitignore`. Iteration 111 history below.)
>
> Iteration 111 (now superseded by 112 above for the front-page descriptor): **CLAUDE.md drift fix — `pnpm test:ct` + `pnpm test:ct:install` now listed in Common Commands and Safe Operations.** The Playwright CT toolchain has been the canonical signal for `FilterBar`/`LayoutSwitcher`/`MobileMenu` since iteration 105, but CLAUDE.md never picked it up; new contributors / AI agents reading the file cold would have missed it. Also captures a CT-flake observation from iteration 111's verification (`filter-bar.ct › selects category on click` failed once, passed on retry; not opening Q26 yet — single-occurrence flake within Playwright cold-start tolerance, will revisit if it recurs ≥3× in the next 3 iterations). Q22 follow-up #3 (`playwright-coverage` integration) verified upstream: `monocart-coverage-reports@2.12.11` + `monocart-reporter@2.10.1` both above the spec's `^2.11.0` pin — Phase 0 smoke test is the cleanest single-iteration unit for the next run. Doc-only iteration; no code/dep changes.
>
> Iteration 110 (history): **Q22 follow-up #2 SUPERSEDED + Q22 follow-up #3 spec/plan authored.** Two parallel deliverables. (1) **Follow-up #2 — `pnpm test:ui:safe` removal — SUPERSEDED**: plain `pnpm --filter @ever-works/ui test` runs all 11 Vitest files (174 tests) in ~98s on Windows + Node 24.14.0, verified 2 of 2 consecutive runs. Q22 IPC-hang fingerprint does not reproduce. The cron-task instruction "Do NOT remove anything (move or improve is OK)" + AGENTS.md R15 ("Replace, don't remove") preclude outright deletion; the script is **soft-deprecated** via JSDoc + CLAUDE.md note as a defensive fallback for any future Vitest/jsdom/Node regression. `docs/architecture/testing-runners.md` "Future work" entry flipped from "OPEN" to "~~SUPERSEDED~~". Zero file deletions. (2) **Follow-up #3 — `playwright-coverage` integration — SPECIFIED + PLANNED**: new spec at `.specify/features/q22-playwright-coverage.md` (10 acceptance criteria, library risk analysis, AGENTS.md R1-R15 cross-check) and 5-phase execution plan at `docs/plans/q22-playwright-coverage.md` (Phase 0 smoke test gate before any code lands; Phase 5 status flip). New question Q25 in `docs/questions.md` captures the library choice (`monocart-coverage-reports` 2.x [DEFAULT] vs `@bgotink/playwright-coverage` vs custom harness vs defer-indefinitely). Default rationale: monocart explicitly supports `playwright-ct-react`, explicitly supports merging V8 coverage from multiple sources, emits V8-native reports matching Vitest's existing provider. When this lands across iterations 111-114, the three exclusions in `packages/ui/vitest.config.ts` (FilterBar, LayoutSwitcher, MobileMenu) drop and the per-package branch number reflects the full surface area rather than measured-surface-only. Q22 / Q23 / Q24 remain CLOSED; Q22 follow-ups #1 / #2 are now CLOSED (#2 via supersession); only Q22 follow-up #3 + Q25 + CI-matrix-observation remain open.

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
- [plans/q22-playwright-coverage.md](plans/q22-playwright-coverage.md) — Q22 follow-up #3: `playwright-coverage` integration (5 phases, `monocart-coverage-reports` default; gated on Phase 0 smoke test)

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
- **features/q22-playwright-coverage.md** — Q22 follow-up #3: `playwright-coverage` integration spec (V8 coverage merge for Vitest + Playwright CT runs) ([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q22-playwright-coverage.md))

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
