---
title: Quickstart
sidebar_label: Quickstart
description: Get up and running with the Ever Works minimal directory template in 5 minutes.
---

## Prerequisites

- **Node.js** 20+ (24 LTS recommended)
- **pnpm** 10+
- **Git** 2.30+

## 1. Clone the Template

```bash
git clone https://github.com/ever-works/directory-web-minimal-template my-directory
cd my-directory
pnpm install
```

## 2. Add Content

Create a `.content/` directory in `apps/web/` with your data:

```
apps/web/.content/
├── config.yml          # Site name, URL, branding
├── categories.yml      # Category definitions
├── tags.yml            # Tag definitions
├── collections.yml     # Optional item collections
├── data/
│   ├── my-item/
│   │   └── my-item.yml # Item data (YAML)
│   └── another-item/
│       └── another-item.yml
└── comparisons/        # Optional item comparisons
```

### Minimal config.yml

```yaml
company_name: "My Directory"
items_name: "Tools"
item_name: "Tool"
app_url: "https://my-directory.example.com"
```

### Minimal item YAML

```yaml
name: "My First Tool"
slug: "my-first-tool"
description: "A great tool for doing things."
source_url: "https://example.com"
category: "utilities"
tags: ["open-source", "typescript"]
status: "approved"
updated_at: "2026-01-01 00:00"
```

Or clone from a git repo by setting the `DATA_REPOSITORY` environment variable:

```bash
# .env
DATA_REPOSITORY=https://github.com/your-org/your-content-repo
```

## 3. Start Development

```bash
pnpm dev:web
```

Open [http://localhost:4321](http://localhost:4321).

## 4. Customize Pages

Edit pages in `apps/web/src/pages/`. The template uses headless components from `@ever-works/ui`:

```astro
---
import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
import { getContent } from '../lib/content';
const { items } = await getContent();
---
<ItemGrid items={items} />
```

Apply your own Tailwind CSS styles — the components are unstyled by default.

## 5. Build and Deploy

```bash
pnpm build        # Build all apps
```

Deploy to Vercel:

```bash
npx vercel deploy
```

Or push to GitHub with the included CI/CD workflow (`.github/workflows/deploy.yml`).

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:web` | Start web app only |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm clean` | Clean build artifacts |

## Next Steps

- [Building from Template](/guides/building-from-template/) — Full AI-assisted build workflow
- [Creating a Plugin](/guides/creating-a-plugin/) — Extend with custom plugins
- [Interactive Components](/guides/interactive-components/) — Add search, filters, dark mode
- [Architecture Overview](/architecture/overview/) — Understand the system design
