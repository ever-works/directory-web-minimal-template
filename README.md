# Ever Works — Minimal Directory Web Template

A minimal, static-rendered **Astro** template for AI-generated directory websites. Lightweight alternative to the [full-featured Next.js template](https://github.com/ever-works/directory-web-template).

## Philosophy

This template is an **intentionally blank canvas** with headless, composable building blocks. AI agents (Claude Code, Cursor, etc.) assemble and style these components into complete directory websites in minutes.

**No opinions on design.** No pre-built pages. No styling. Just the data layer, components, and plugin system — ready for AI to build upon.

## Features

- **Astro 6** with static output and optional ISR via `@astrojs/vercel`
- **Plugin architecture** — almost every feature is a plugin
- **Git-first data** — content stored in separate Git repos (YAML)
- **Headless UI components** — unstyled building blocks for AI to style
- **Preact islands** — lightweight interactivity where needed
- **Tailwind CSS** ready — AI applies styling
- **TypeScript** throughout — strict mode, full type safety
- **Extreme performance** — minimal JS, CDN-optimized static output

## What's NOT Included (By Design)

- No authentication / user accounts
- No database
- No payments / billing
- No traditional SSR (ISR supported via Vercel adapter)
- No geo / maps
- No CRM integrations

These can all be added as plugins when needed.

## Quick Start

```bash
# Clone the template
git clone https://github.com/ever-works/directory-web-minimal-template
cd directory-web-minimal-template

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your DATA_REPOSITORY URL

# Start development
pnpm dev:web
```

## Monorepo Structure

```
apps/
  web/                Astro static site (core template)
  web-e2e/            Playwright E2E tests (367 test cases, 57 spec files, 11 projects incl. mobile + visual regression)
  docs/               Docusaurus documentation site
  sample-basic/       Reference: React UI Components (hardcoded data)
  sample-jobs/        Reference: Remote Tech Jobs directory
  sample-events/      Reference: Tech Events/Conferences directory
  sample-real-estate/ Reference: Property Listings directory
  sample-git/         Reference: Time Tracking (Git data adapter, 3200+ items)

packages/
  core/               Data layer, types, content reader
  ui/                 Headless UI components (25 Astro + 8 Preact + 22 primitives + 5 shadcn-style)
  plugins/            Plugin system (runner, lifecycle hooks)
  adapters/           Data source adapters (git, filesystem)
  astro-integration/  Astro integration for plugin build lifecycle
  sync/               Content sync orchestration (webhooks, polling, ISR)
  plugin-seo/         Meta tags, Open Graph, JSON-LD
  plugin-pagination/  Paginate item arrays
  plugin-filters/     Client-side category/tag filtering
  plugin-search/      Static search via Pagefind
  plugin-sort/        Sort items by name, date, featured
  plugin-sitemap/     XML sitemap generation
  plugin-breadcrumbs/ Auto-generate breadcrumb trails
  plugin-rss/         RSS 2.0 + Atom 1.0 feed generation
  plugin-analytics/   Privacy-friendly analytics (Plausible, Umami, Fathom, GA4, custom)
  plugin-related-items/ Compute related items based on shared tags/categories
  tsconfig/           Shared TypeScript configurations
  eslint-config/      Shared ESLint configuration
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:web` | Start only the web app |
| `pnpm dev:docs` | Start only the docs site |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm lint:fix` | Lint and auto-fix all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run unit tests (Vitest) — 1122 tests, 73 test files, 16 suites |
| `pnpm test:coverage` | Run unit tests with V8 coverage reports |
| `pnpm test:ct` | Run `@ever-works/ui` Playwright Component Tests — 48 tests, 3 files (FilterBar / LayoutSwitcher / MobileMenu) in real Chromium. First run requires `pnpm test:ct:install`. |
| `pnpm test:ct:install` | Install Chromium for Playwright CT (one-time per machine; safe to re-run). |
| `pnpm coverage` | Merge Vitest + Playwright CT V8 coverage into `packages/ui/coverage/merged/` (single per-package number — branches 100%, functions 100%, lines 99.76%). |
| `pnpm test:e2e` | Run E2E tests — 367 tests, 57 specs, 11 projects (Playwright) |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean all build artifacts |

The defensive `pnpm test:ui:safe` per-file Vitest fallback is kept for diagnostic use only — see `CLAUDE.md` "Common Commands" for the canonical and exhaustive list.

## Samples

| Sample | Port | Description |
|--------|------|-------------|
| `sample-basic` | 4323 | React UI Components directory (12 items, hardcoded data). Blue theme. |
| `sample-jobs` | 4324 | Remote Tech Jobs directory. Green theme with job-specific meta fields. |
| `sample-events` | 4325 | Tech Events/Conferences directory. Teal theme with event dates, locations. |
| `sample-real-estate` | 4326 | Property Listings directory. Amber theme with price, bedrooms, sqft. |
| `sample-git` | 4327 | Time Tracking directory (**3,200+ items**) loaded from a remote Git repository. Dark theme. |

## For AI Agents

Read these files before working on this codebase:

1. **`CLAUDE.md`** — Project overview, rules, and commands
2. **`AGENTS.md`** — Mandatory rules (R1-R15), working process, data contracts
3. **`SKILLS.md`** — Step-by-step skills for building directory sites
4. **`docs/questions.md`** — Open design decisions with default choices
5. **`.specify/`** — Feature specifications

## Data Source

The template connects to Git repositories containing YAML data files. The data format is compatible with the full Next.js template — same categories, tags, items, collections, and comparisons.

Set `DATA_REPOSITORY` in your `.env` file to point to your data repo.

## Deployment

Deploy to Vercel:

```bash
# Via Vercel CLI
vercel

# Via GitHub Actions (automatic on push to main)
```

## License

AGPL-3.0 — see [LICENSE](LICENSE)
