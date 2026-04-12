# Ever Works — Minimal Directory Web Template

A minimal, static-rendered **Astro** template for AI-generated directory websites. Lightweight alternative to the [full-featured Next.js template](https://github.com/ever-works/directory-web-template).

## Philosophy

This template is an **intentionally blank canvas** with headless, composable building blocks. AI agents (Claude Code, Cursor, etc.) assemble and style these components into complete directory websites in minutes.

**No opinions on design.** No pre-built pages. No styling. Just the data layer, components, and plugin system — ready for AI to build upon.

## Features

- **Astro 6** with fully static output (no SSR)
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
- No server-side rendering
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
  web/              Astro static site (core template)
  web-e2e/          Playwright E2E tests
  docs/             Docusaurus documentation site
  sample-basic/     Reference: React UI Components (hardcoded data)
  sample-git/       Reference: Time Tracking (Git data adapter)

packages/
  core/             Data layer, types, content reader
  ui/               Headless UI components (17 Astro + 5 Preact)
  plugins/          Plugin system (runner, lifecycle hooks)
  adapters/         Data source adapters (git, filesystem)
  plugin-seo/       Meta tags, Open Graph, JSON-LD
  plugin-pagination/ Paginate item arrays
  plugin-filters/   Client-side category/tag filtering
  plugin-search/    Static search via Pagefind
  plugin-sort/      Sort items by name, date, featured
  plugin-sitemap/   XML sitemap generation
  tsconfig/         Shared TypeScript configurations
  eslint-config/    Shared ESLint configuration
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:web` | Start only the web app |
| `pnpm dev:docs` | Start only the docs site |
| `pnpm run dev:sample-git` | Start the Git-backed sample |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm clean` | Clean all build artifacts |

## Samples

| Sample | Port | Description |
|--------|------|-------------|
| `sample-basic` | 4323 | Hardcoded React UI Components directory (12 items). Demonstrates the basics. |
| `sample-git` | 4324 | Time Tracking directory (**3,200+ items**) loaded from a remote Git repository. Dark theme, pagination, collapsible sections. |

## For AI Agents

Read these files before working on this codebase:

1. **`CLAUDE.md`** — Project overview, rules, and commands
2. **`AGENTS.md`** — Mandatory rules (R1-R14), working process, data contracts
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
