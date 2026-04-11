# Ever Works — Minimal Directory Web Template

## Project Overview

This is a **minimal, static-rendered Astro template** for AI-generated directory websites. It serves as a lightweight alternative to the full-featured Next.js `directory-web-template`. Users choose between the full Next.js template or this minimal Astro template that AI tools build upon.

**Key philosophy**: This template is an intentionally blank canvas with headless, composable building blocks. AI agents (Claude Code, etc.) assemble and style these components into complete directory websites.

## Architecture

- **Framework**: Astro 5 with Vite, fully static rendering (`output: 'static'`), NO SSR
- **Language**: TypeScript everywhere — no JS, no Python
- **Monorepo**: pnpm workspaces + Turborepo
- **Data**: Git-first — data stored in separate Git repos (YAML files), NO database, NO auth
- **UI**: Headless, unstyled composable components — AI applies styling
- **Deployment**: Vercel via GitHub Actions

## Monorepo Structure

```
/
├── apps/
│   ├── web/              — Astro static site (core template)
│   ├── web-e2e/          — Playwright E2E tests
│   ├── docs/             — Starlight (Astro) documentation site
│   └── sample-basic/     — Reference implementation (AI-generated from template)
├── packages/
│   ├── core/             — Data layer, content reader, types, schemas
│   ├── ui/               — Headless UI components (unstyled building blocks)
│   ├── plugins/          — Plugin system (runner, types, define-plugins)
│   ├── plugin-*/         — Built-in plugins (search, filters, pagination, seo, sitemap, sort, breadcrumbs)
│   ├── astro-integration/— Astro integration for plugin build lifecycle hooks
│   ├── adapters/         — Data source adapters (git, filesystem, etc.)
│   ├── tsconfig/         — Shared TypeScript configurations
│   └── eslint-config/    — Shared ESLint configuration
├── docs/                 — Documentation content (Markdown)
├── .specify/             — Spec-kit specifications
├── CLAUDE.md             — This file
├── AGENTS.md             — AI agent instructions
└── turbo.json            — Turborepo task configuration
```

## Critical Rules

1. **TypeScript only** — No `.js`, `.py`, or any non-TS source files
2. **No database** — All data comes from Git repos via YAML files
3. **No auth** — No user accounts, sessions, or authentication
4. **No payments** — No billing, subscriptions, or payment providers
5. **No SSR** — Fully static output only (`astro build` produces static HTML)
6. **Plugin everything** — Almost every feature must be a plugin. Core should be minimal.
7. **Git-first data** — Default data storage is Git repos. No DB, no custom storage.
8. **Extreme performance** — Every decision optimizes for speed
9. **Modular & replaceable** — Every component, adapter, and plugin can be swapped
10. **AI-optimized** — Clear naming, inline docs, explicit data contracts

## Data Source

The template connects to the same git-backed data repositories as the full Next.js template:

```
.content/
├── config.yml            — Site configuration
├── categories.yml        — Category definitions
├── tags.yml              — Tag definitions
├── collections.yml       — Collection definitions
├── data/
│   └── <item-slug>/
│       └── <item-slug>.yml  — Item data (YAML frontmatter)
├── comparisons/          — Item comparison data
└── pages/                — Static pages (Markdown)
```

**Environment variables:**
- `DATA_REPOSITORY` — GitHub URL of content repo (required)
- `GH_TOKEN` — GitHub PAT for private repos (optional)
- `GITHUB_BRANCH` — Branch to sync (default: `main`)

## Common Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all dev servers
pnpm dev:web              # Start only the web app
pnpm dev:docs             # Start only the docs site
pnpm build                # Build all apps
pnpm lint                 # Lint all packages
pnpm typecheck            # Type-check all packages
pnpm test                 # Run all unit tests (Vitest)
pnpm test:e2e             # Run E2E tests (Playwright)
pnpm clean                # Clean all build artifacts
```

## Code Style

- TypeScript strict mode
- No `any` types — use `unknown` and narrow
- Prefer named exports over default exports
- Use barrel files (`index.ts`) for public APIs
- Function components for UI (no classes)
- Prefer composition over inheritance
- Small, focused files — one concern per file
- Inline JSDoc comments on public APIs and data contracts

## Package Naming

- Workspace packages: `@ever-works/<name>`
- Plugins: `@ever-works/plugin-<name>`
- Adapters: `@ever-works/adapter-<name>`
- UI components: `@ever-works/ui`

## Safe Operations

These commands are always safe to run:
- `pnpm install`
- `pnpm dev` / `pnpm dev:web` / `pnpm dev:docs`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm clean`

## Before Making Changes

1. Read the relevant spec in `.specify/` or `docs/`
2. Check `docs/questions.md` for open decisions
3. Ensure changes align with the plugin architecture
4. Verify TypeScript strict compliance
5. Run `pnpm typecheck` and `pnpm lint` after changes
