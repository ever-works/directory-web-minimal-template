---
title: "Phase 7: Sample Events"
sidebar_label: "Phase 7: Events"
---

# Phase 7: Sample Events — Detailed Implementation Plan

> Concrete tasks, file paths, and code patterns for building the `apps/sample-events/` reference implementation.

## Overview

This plan breaks Phase 7 into seven sequential tasks. Each task lists exact file paths, content to create, and verification steps. The sample implements a "Tech Events" directory with full Tailwind CSS styling, dark/light mode, collections, comparisons, and all 7 built-in plugins.

**Prerequisite**: Phases 1-6 must be complete. All `@ever-works/*` packages must build and export correctly. `apps/sample-basic/` and `apps/sample-jobs/` should be working references.

**Spec reference**: `.specify/features/sample-events.md`

---

## Task 7.1: Scaffold sample-events Directory Structure

### Goal
Create the `apps/sample-events/` directory with proper config files, build tooling, and dependency declarations.

### 7.1.1 Create `package.json`

**File**: `apps/sample-events/package.json`

```json
{
    "name": "@ever-works/sample-events",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "description": "Reference implementation: a tech events directory built by AI from the minimal template.",
    "scripts": {
        "predev": "tsx scripts/clone-content.ts",
        "dev": "astro dev --port 4325",
        "prebuild": "tsx scripts/clone-content.ts",
        "build": "astro build",
        "preview": "astro preview --port 4325",
        "typecheck": "astro check && tsc --noEmit",
        "lint": "eslint src/",
        "clean": "rm -rf dist .astro"
    },
    "dependencies": {
        "@astrojs/preact": "^4.1.0",
        "@astrojs/sitemap": "^3.7.0",
        "@ever-works/adapters": "workspace:*",
        "@ever-works/core": "workspace:*",
        "@ever-works/plugin-breadcrumbs": "workspace:*",
        "@ever-works/plugin-filters": "workspace:*",
        "@ever-works/plugin-pagination": "workspace:*",
        "@ever-works/plugin-search": "workspace:*",
        "@ever-works/plugin-seo": "workspace:*",
        "@ever-works/plugin-sitemap": "workspace:*",
        "@ever-works/plugin-sort": "workspace:*",
        "@ever-works/plugins": "workspace:*",
        "@ever-works/ui": "workspace:*",
        "@tailwindcss/vite": "^4.2.0",
        "astro": "^6.0.0",
        "preact": "^10.29.0",
        "tailwindcss": "^4.2.0",
        "yaml": "^2.7.0"
    },
    "devDependencies": {
        "@astrojs/check": "^0.9.8",
        "@ever-works/eslint-config": "workspace:*",
        "@ever-works/tsconfig": "workspace:*",
        "tsx": "^4.19.0",
        "typescript": "^5.7.0"
    }
}
```

**Note**: Port 4325 avoids conflicts with web (4321), sample-basic (4323), and sample-jobs (4324).

### 7.1.2 Create `astro.config.ts`

**File**: `apps/sample-events/astro.config.ts`

```typescript
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    output: 'static',
    site: process.env.SITE_URL || 'https://tech-events.example.com',
    integrations: [
        preact(),
        sitemap(),
    ],
    vite: {
        plugins: [
            tailwindcss(),
        ],
        optimizeDeps: {
            include: ['preact', 'yaml'],
        },
    },
});
```

### 7.1.3 Create `tsconfig.json`

**File**: `apps/sample-events/tsconfig.json`

```json
{
    "extends": "@ever-works/tsconfig/astro.json",
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.astro", "astro.config.ts"],
    "exclude": ["node_modules", "dist", ".astro"]
}
```

### 7.1.4 Copy `scripts/clone-content.ts`

**File**: `apps/sample-events/scripts/clone-content.ts`

Copy from `apps/web/scripts/clone-content.ts` verbatim. Since `.content/` is checked into the sample app, this script will be a no-op (it skips when the directory exists).

### 7.1.5 Create `src/env.d.ts`

**File**: `apps/sample-events/src/env.d.ts`

```typescript
/// <reference types="astro/client" />
```

### Verification

```bash
cd apps/sample-events
ls astro.config.ts tsconfig.json package.json scripts/clone-content.ts src/env.d.ts
pnpm install
```

---

## Task 7.2: Create Sample Content Data

### Goal
Populate `.content/` with the Tech Events directory data — config, categories, tags, collections, comparisons, static pages, and 10 event YAML files.

### 7.2.1 Create `.content/.works/works.yml`

**File**: `apps/sample-events/.content/.works/works.yml`

```yaml
company_name: "Tech Events"
item_name: "Event"
items_name: "Events"
copyright_year: 2026
app_url: "https://tech-events.example.com"

pagination:
  type: "standard"
  itemsPerPage: 12

settings:
  categories_enabled: true
  tags_enabled: true
```

### 7.2.2 Create `.content/categories.yml`

**File**: `apps/sample-events/.content/categories.yml`

```yaml
- id: "conference"
  name: "Conference"
  description: "Multi-day industry conferences with keynotes, tracks, and networking"

- id: "meetup"
  name: "Meetup"
  description: "Local community gatherings for talks, demos, and socializing"

- id: "workshop"
  name: "Workshop"
  description: "Hands-on training sessions focused on practical skills"

- id: "hackathon"
  name: "Hackathon"
  description: "Competitive coding events where teams build projects in a fixed timeframe"
```

### 7.2.3 Create `.content/tags.yml`

**File**: `apps/sample-events/.content/tags.yml`

```yaml
- id: "ai"
  name: "AI"
  description: "Artificial intelligence, machine learning, and deep learning topics"
  isActive: true

- id: "web"
  name: "Web"
  description: "Frontend, backend, and full-stack web development"
  isActive: true

- id: "mobile"
  name: "Mobile"
  description: "iOS, Android, React Native, and cross-platform mobile development"
  isActive: true

- id: "devops"
  name: "DevOps"
  description: "CI/CD, infrastructure, containers, and platform engineering"
  isActive: true

- id: "cloud"
  name: "Cloud"
  description: "Cloud platforms, serverless, and distributed systems"
  isActive: true

- id: "open-source"
  name: "Open Source"
  description: "Open-source projects, communities, and contributions"
  isActive: true

- id: "beginner-friendly"
  name: "Beginner Friendly"
  description: "Accessible to newcomers with introductory-level content"
  isActive: true

- id: "networking"
  name: "Networking"
  description: "Strong emphasis on professional networking and community building"
  isActive: true

- id: "hands-on"
  name: "Hands-On"
  description: "Interactive sessions with live coding or lab exercises"
  isActive: true

- id: "keynote"
  name: "Keynote"
  description: "Features notable keynote speakers from the industry"
  isActive: true
```

### 7.2.4 Create `.content/collections.yml`

**File**: `apps/sample-events/.content/collections.yml`

```yaml
- id: "must-attend-2026"
  name: "Must-Attend 2026"
  description: "The most anticipated tech events of 2026 that every developer should consider attending."
  items:
    - "react-summit"
    - "next-conf"
    - "ai-dev-summit"
    - "kubecon-europe"
    - "github-universe"

- id: "free-events"
  name: "Free Events"
  description: "High-quality tech events that are completely free to attend, either in-person or virtually."
  items:
    - "next-conf"
    - "react-meetup-sf"
    - "open-source-hackathon"
```

### 7.2.5 Create Comparison Files

**File**: `apps/sample-events/.content/comparisons/react-summit-vs-next-conf.yml`

```yaml
id: "react-summit-vs-next-conf"
name: "React Summit vs Next.js Conf"
description: "Comparing two premier React ecosystem conferences — a large in-person summit versus a free virtual event."
items:
  - "react-summit"
  - "next-conf"
```

**File**: `apps/sample-events/.content/comparisons/ai-dev-summit-vs-mlops-workshop.yml`

```yaml
id: "ai-dev-summit-vs-mlops-workshop"
name: "AI Dev Summit vs MLOps Workshop"
description: "A large-scale AI conference compared to an intensive hands-on workshop — different formats for learning AI and ML."
items:
  - "ai-dev-summit"
  - "mlops-workshop"
```

### 7.2.6 Create Static Pages

**File**: `apps/sample-events/.content/pages/about.md`

```markdown
---
title: "About Tech Events"
slug: "about"
---

Tech Events is a curated directory of the best technology conferences, meetups, workshops, and hackathons for developers. We help you discover events that match your interests, skill level, and budget.
```

**File**: `apps/sample-events/.content/pages/submit.md`

```markdown
---
title: "Submit an Event"
slug: "submit"
---

Want to list your tech event in our directory? We welcome submissions for conferences, meetups, workshops, and hackathons related to software development and technology.
```

### 7.2.7 Create Item Data Files

Create one YAML file per event inside `.content/data/<slug>/<slug>.yml`. Each follows the `ItemData` schema with an additional `meta` object for event-specific fields.

**Directory structure to create:**
```
.content/data/
├── react-summit/react-summit.yml
├── next-conf/next-conf.yml
├── ai-dev-summit/ai-dev-summit.yml
├── kubecon-europe/kubecon-europe.yml
├── react-meetup-sf/react-meetup-sf.yml
├── mlops-workshop/mlops-workshop.yml
├── github-universe/github-universe.yml
├── mobile-dev-camp/mobile-dev-camp.yml
├── open-source-hackathon/open-source-hackathon.yml
└── cloud-native-hackathon/cloud-native-hackathon.yml
```

All 10 event YAML files are specified in full in `.specify/features/sample-events.md`. Each contains:
- `name`, `description`, `source_url` — standard ItemData fields
- `category` — one of: conference, meetup, workshop, hackathon
- `tags` — array of tag IDs
- `updated_at`, `status`, `featured` — standard metadata
- `meta` — event-specific fields: `date_start`, `date_end`, `location`, `format`, `price`, `speakers`, `attendees`

### Verification

```bash
# Count items — expect 10
ls apps/sample-events/.content/data/ | wc -l

# Count comparisons — expect 2
ls apps/sample-events/.content/comparisons/ | wc -l

# Count static pages — expect 2
ls apps/sample-events/.content/pages/ | wc -l

# Validate YAML syntax
cd apps/sample-events
node -e "const yaml = require('yaml'); const fs = require('fs'); console.log(yaml.parse(fs.readFileSync('.content/.works/works.yml','utf8')))"
```

---

## Task 7.3: Set Up Plugin Configuration

### Goal
Configure `content.ts` and `plugins.config.ts` — the data-loading and plugin pipeline.

### 7.3.1 Create `plugins.config.ts`

**File**: `apps/sample-events/src/lib/plugins.config.ts`

```typescript
/**
 * Plugin configuration for the Tech Events sample.
 *
 * All 7 built-in plugins are enabled with events-specific options.
 */

import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { breadcrumbsPlugin } from '@ever-works/plugin-breadcrumbs';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';

export const plugins = definePlugins([
    seoPlugin({
        titleTemplate: '%s | Tech Events',
    }),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    breadcrumbsPlugin(),
    sitemapPlugin(),
]);
```

### 7.3.2 Create `content.ts`

**File**: `apps/sample-events/src/lib/content.ts`

Copy from `apps/web/src/lib/content.ts` verbatim. The module is generic — it reads whatever is in `.content/` and runs the plugin pipeline.

```typescript
/**
 * Content loading utility — identical to apps/web/src/lib/content.ts
 * Loads data from .content/, runs plugin pipeline, caches result.
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent } from '@ever-works/core';
import type { ContentData } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { plugins } from './plugins.config.js';

let _cached: ContentData | null = null;
const runner = new PluginRunner(plugins);
let _initialized = false;

export async function getContent(): Promise<ContentData> {
    if (_cached) return _cached;

    const adapterConfig = resolveAdapterConfig();
    const adapter = createAdapter(adapterConfig);
    await adapter.init(adapterConfig);

    let data = await loadContent(adapter);

    const baseContext = {
        config: data.config,
        contentPath: (adapterConfig.localPath as string) ?? '.content',
        outDir: 'dist',
    };

    if (!_initialized) {
        await runner.runInit(baseContext);
        _initialized = true;
    }

    data = await runner.runDataLoaded(data, baseContext);

    _cached = data;
    return _cached;
}

export function getPluginRunner(): PluginRunner {
    return runner;
}

export function invalidateCache(): void {
    _cached = null;
}
```

### Verification

```bash
ls apps/sample-events/src/lib/content.ts apps/sample-events/src/lib/plugins.config.ts
```

---

## Task 7.4: Create Styled Layouts

### Goal
Create the root layout with a teal-accented Tailwind CSS design, header with navigation, dark/light mode toggle, and footer.

### 7.4.1 Create `global.css`

**File**: `apps/sample-events/src/styles/global.css`

Tailwind v4 entry point with design tokens. Uses a teal accent color to differentiate from sample-basic (indigo) and sample-jobs.

```css
@import "tailwindcss";

@theme {
    --color-primary: #0d9488;
    --color-primary-hover: #0f766e;
}

html {
    scroll-behavior: smooth;
}

body {
    @apply bg-white text-slate-900 antialiased;
    font-family: system-ui, -apple-system, sans-serif;
}

html.dark body {
    @apply bg-slate-950 text-slate-100;
}

body, header, footer, main {
    transition: background-color 0.2s ease, color 0.2s ease;
}
```

### 7.4.2 Create `ThemeToggle.tsx`

**File**: `apps/sample-events/src/components/ThemeToggle.tsx`

Copy from `apps/sample-basic/src/components/ThemeToggle.tsx` verbatim. The theme toggle is framework-agnostic.

### 7.4.3 Create `BaseLayout.astro`

**File**: `apps/sample-events/src/layouts/BaseLayout.astro`

Follows the same structure as sample-basic's BaseLayout but with:
- "Tech Events" branding
- Navigation links: Home, Categories, Tags, Collections, Comparisons
- Teal accent color scheme
- ThemeToggle Preact island in header

### Verification

```bash
ls apps/sample-events/src/styles/global.css
ls apps/sample-events/src/components/ThemeToggle.tsx
ls apps/sample-events/src/layouts/BaseLayout.astro
```

---

## Task 7.5: Create All Pages

### Goal
Implement all Astro pages — home, item detail, category listing, tag listing, collection, comparison, pagination, static pages, and 404.

### 7.5.1 Home Page

**File**: `apps/sample-events/src/pages/index.astro`

Layout sections:
1. Hero with "Tech Events" heading, subtitle, and search input
2. Category grid (4 cards — Conference, Meetup, Workshop, Hackathon)
3. Featured events (4 cards with date badges, location, and category pills)
4. All events grid (paginated, 12 per page) with sort controls

### 7.5.2 Event Detail Page

**File**: `apps/sample-events/src/pages/item/[slug].astro`

Uses `getStaticPaths()` to generate one page per event. Layout:
1. Breadcrumbs (Home > Category > Event Name)
2. Event header with name, description, date range, location
3. Meta sidebar: category, tags, format, price, speakers, attendees
4. Markdown content body (if present)
5. Related events from the same category (up to 6)

Key difference from sample-basic: the meta sidebar renders event-specific `meta` fields (dates, price, location, speakers).

### 7.5.3 Category Pages

**File**: `apps/sample-events/src/pages/categories.astro` — Index of all 4 categories
**File**: `apps/sample-events/src/pages/category/[slug].astro` — Events in a category

### 7.5.4 Tag Pages

**File**: `apps/sample-events/src/pages/tags.astro` — Index with tag cloud
**File**: `apps/sample-events/src/pages/tag/[slug].astro` — Events with a tag

### 7.5.5 Collection Pages

**File**: `apps/sample-events/src/pages/collections.astro` — Index of all collections
**File**: `apps/sample-events/src/pages/collection/[slug].astro` — Events in a collection

### 7.5.6 Comparison Pages

**File**: `apps/sample-events/src/pages/comparisons.astro` — Index of all comparisons
**File**: `apps/sample-events/src/pages/comparison/[slug].astro` — Side-by-side comparison table

The comparison page displays two events in a table with rows for: date, location, format, price, speakers, attendees, category, and tags.

### 7.5.7 Static Content Pages

**File**: `apps/sample-events/src/pages/pages/[slug].astro` — Renders markdown from `.content/pages/`

### 7.5.8 Pagination

**File**: `apps/sample-events/src/pages/page/[page].astro` — Paginated event listing (pages 2+)

### 7.5.9 404 Page

**File**: `apps/sample-events/src/pages/404.astro`

Centered layout with "Page Not Found" heading, suggestion to browse categories, and links to Home, Categories, Tags.

### Verification

```bash
# Count page files — expect 14 .astro files
find apps/sample-events/src/pages -name "*.astro" | wc -l

# Dev server should start without errors
cd apps/sample-events && pnpm dev
```

---

## Task 7.6: Build Verification & Testing

### Goal
Confirm the sample builds, generates all expected pages, and passes type checking.

### 7.6.1 Type Check

```bash
pnpm --filter @ever-works/sample-events typecheck
```

Expected: zero errors.

### 7.6.2 Build

```bash
pnpm --filter @ever-works/sample-events build
```

Expected: static build succeeds with all pages generated.

### 7.6.3 Verify Generated Pages

```bash
# Core pages
test -f apps/sample-events/dist/index.html
test -f apps/sample-events/dist/404.html
test -f apps/sample-events/dist/categories/index.html
test -f apps/sample-events/dist/tags/index.html
test -f apps/sample-events/dist/collections/index.html
test -f apps/sample-events/dist/comparisons/index.html

# Event detail pages (spot check)
test -f apps/sample-events/dist/item/react-summit/index.html
test -f apps/sample-events/dist/item/next-conf/index.html
test -f apps/sample-events/dist/item/ai-dev-summit/index.html

# Category pages
test -f apps/sample-events/dist/category/conference/index.html
test -f apps/sample-events/dist/category/meetup/index.html
test -f apps/sample-events/dist/category/workshop/index.html
test -f apps/sample-events/dist/category/hackathon/index.html

# Tag pages (spot check)
test -f apps/sample-events/dist/tag/ai/index.html
test -f apps/sample-events/dist/tag/web/index.html

# Collection pages
test -f apps/sample-events/dist/collection/must-attend-2026/index.html
test -f apps/sample-events/dist/collection/free-events/index.html

# Comparison pages
test -f apps/sample-events/dist/comparison/react-summit-vs-next-conf/index.html
test -f apps/sample-events/dist/comparison/ai-dev-summit-vs-mlops-workshop/index.html

# Static pages
test -f apps/sample-events/dist/pages/about/index.html
test -f apps/sample-events/dist/pages/submit/index.html
```

### 7.6.4 Visual Smoke Test

Start the preview server and manually verify:
1. Home page loads with hero, category grid, and featured events
2. Event detail page shows all meta fields (dates, location, price, speakers)
3. Dark mode toggle works
4. Collection pages list the correct events
5. Comparison pages show side-by-side tables
6. 404 page renders correctly
7. No console errors

```bash
cd apps/sample-events && pnpm preview
# Visit http://localhost:4325
```

---

## Task 7.7: CI Integration & Monorepo Wiring

### Goal
Wire the sample into the monorepo build system and CI pipeline.

### 7.7.1 Update `turbo.json`

Ensure sample-events follows the same task graph as other apps. No changes should be needed if `turbo.json` uses workspace globs.

### 7.7.2 Update CI Workflow

**File**: `.github/workflows/ci.yml`

Add `sample-events` to the build matrix or E2E step alongside sample-basic and sample-jobs:

```yaml
# In the build job or E2E job:
- name: Build sample-events
  run: pnpm --filter @ever-works/sample-events build
```

### 7.7.3 Add E2E Tests (Optional)

**File**: `apps/web-e2e/tests/sample-events.spec.ts`

Basic smoke tests for the events sample:
1. Home page renders with "Tech Events" heading
2. Category page loads for `/category/conference`
3. Event detail page loads for `/item/react-summit`
4. Collection page loads for `/collection/must-attend-2026`
5. Comparison page loads for `/comparison/react-summit-vs-next-conf`
6. 404 page renders for invalid route

### Verification

```bash
# Full monorepo build
pnpm build

# Confirm sample-events built successfully
test -d apps/sample-events/dist

# Run E2E if tests are added
pnpm test:e2e
```

---

## Summary

| Task | Description | Files Created | Estimate |
|------|-------------|--------------|----------|
| 7.1 | Scaffold directory structure | 5 | 30 min |
| 7.2 | Create sample content data | 17 (config + categories + tags + collections + 2 comparisons + 2 pages + 10 items) | 1 hr |
| 7.3 | Plugin configuration | 2 | 15 min |
| 7.4 | Styled layouts | 3 | 1 hr |
| 7.5 | All pages | 14 | 3 hr |
| 7.6 | Build verification | 0 (verification only) | 30 min |
| 7.7 | CI integration | 1-2 | 30 min |
| **Total** | | **~42 files** | **~6.5 hr** |

## Key Differences from sample-basic

1. **Event-specific metadata** — Items include `meta` fields (dates, location, price, speakers) rendered in the detail sidebar
2. **Collections** — Two curated collections demonstrate the collections plugin feature
3. **Comparisons** — Two side-by-side comparisons demonstrate the comparison page feature
4. **Static pages** — About and Submit pages demonstrate the static pages feature
5. **Breadcrumbs plugin** — Enabled (sample-basic does not use it)
6. **Teal accent color** — Visual differentiation from sample-basic (indigo) and sample-jobs
7. **4 categories** — Fewer but more distinct categories reflecting event types
