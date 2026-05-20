---
title: "Phase 8: Sample Real Estate"
sidebar_label: "Phase 8: Real Estate"
status: implementing
---

# Phase 8: Sample Real Estate — Detailed Implementation Plan

> Concrete tasks, file paths, and code patterns for building the `apps/sample-real-estate/` reference implementation.

## Overview

This plan breaks Phase 8 into seven sequential tasks. Each task lists exact file paths, content to create, and verification steps. The sample implements a "Dream Properties" property listings directory with full Tailwind CSS styling, dark/light mode, collections, comparisons, and all 7 built-in plugins.

**Prerequisite**: Phases 1-4 must be complete. All `@ever-works/*` packages must build and export correctly. `apps/sample-basic/`, `apps/sample-jobs/`, and `apps/sample-events/` should be working references.

**Spec reference**: `.specify/features/sample-real-estate.md`

---

## Task 8.1: Scaffold sample-real-estate Directory Structure

### Goal
Create the `apps/sample-real-estate/` directory with proper config files, build tooling, and dependency declarations.

### 8.1.1 Create `package.json`

**File**: `apps/sample-real-estate/package.json`

```json
{
    "name": "@ever-works/sample-real-estate",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "description": "Reference implementation: a property listings directory built by AI from the minimal template.",
    "scripts": {
        "predev": "tsx scripts/clone-content.ts",
        "dev": "astro dev --port 4326",
        "prebuild": "tsx scripts/clone-content.ts",
        "build": "astro build",
        "preview": "astro preview --port 4326",
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

**Note**: Port 4326 avoids conflicts with web (4321), sample-basic (4323), sample-jobs (4324), and sample-events (4325).

### 8.1.2 Create `astro.config.ts`

**File**: `apps/sample-real-estate/astro.config.ts`

```typescript
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    output: 'static',
    site: process.env.SITE_URL || 'https://dream-properties.example.com',
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

### 8.1.3 Create `tsconfig.json`

**File**: `apps/sample-real-estate/tsconfig.json`

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

### 8.1.4 Copy `scripts/clone-content.ts`

**File**: `apps/sample-real-estate/scripts/clone-content.ts`

Copy from `apps/web/scripts/clone-content.ts` verbatim. Since `.content/` is checked into the sample app, this script will be a no-op (it skips when the directory exists).

### 8.1.5 Create `src/env.d.ts`

**File**: `apps/sample-real-estate/src/env.d.ts`

```typescript
/// <reference types="astro/client" />
```

### Verification

```bash
cd apps/sample-real-estate
ls astro.config.ts tsconfig.json package.json scripts/clone-content.ts src/env.d.ts
pnpm install
```

---

## Task 8.2: Create Sample Content Data

### Goal
Populate `.content/` with the Dream Properties directory data — config, categories, tags, collections, comparisons, static pages, and 10 property YAML files.

### 8.2.1 Create `.content/.works/works.yml`

**File**: `apps/sample-real-estate/.content/.works/works.yml`

```yaml
company_name: "Dream Properties"
item_name: "Property"
items_name: "Properties"
copyright_year: 2026
app_url: "https://dream-properties.example.com"

pagination:
  type: "standard"
  itemsPerPage: 12

settings:
  categories_enabled: true
  tags_enabled: true
```

### 8.2.2 Create `.content/categories.yml`

**File**: `apps/sample-real-estate/.content/categories.yml`

```yaml
- id: "apartment"
  name: "Apartment"
  description: "Condos, lofts, and multi-unit dwellings in urban locations"

- id: "house"
  name: "House"
  description: "Single-family homes, townhouses, and detached residences"

- id: "commercial"
  name: "Commercial"
  description: "Office spaces, retail units, and mixed-use properties"

- id: "land"
  name: "Land"
  description: "Vacant lots, development parcels, and agricultural land"
```

### 8.2.3 Create `.content/tags.yml`

**File**: `apps/sample-real-estate/.content/tags.yml`

```yaml
- id: "downtown"
  name: "Downtown"
  description: "Located in the city center or business district"
  isActive: true

- id: "suburban"
  name: "Suburban"
  description: "Located in residential suburbs with good schools"
  isActive: true

- id: "waterfront"
  name: "Waterfront"
  description: "Ocean, lake, or river views and access"
  isActive: true

- id: "garden"
  name: "Garden"
  description: "Private garden, yard, or outdoor space"
  isActive: true

- id: "parking"
  name: "Parking"
  description: "Dedicated parking spaces or garage included"
  isActive: true

- id: "furnished"
  name: "Furnished"
  description: "Comes fully or partially furnished"
  isActive: true

- id: "pet-friendly"
  name: "Pet-Friendly"
  description: "Allows pets with no restrictions"
  isActive: true

- id: "new-build"
  name: "New Build"
  description: "Recently constructed or renovated property"
  isActive: true

- id: "investment"
  name: "Investment"
  description: "Strong rental yield or appreciation potential"
  isActive: true

- id: "luxury"
  name: "Luxury"
  description: "High-end finishes, premium amenities, prime location"
  isActive: true
```

### 8.2.4 Create `.content/collections.yml`

**File**: `apps/sample-real-estate/.content/collections.yml`

```yaml
- id: "under-500k"
  name: "Under $500K"
  description: "Quality properties at an accessible price point — great first homes and investment opportunities."
  items:
    - "downtown-loft"
    - "craftsman-bungalow"
    - "coworking-retail"
    - "micro-studio"
    - "farmland-acreage"

- id: "luxury-collection"
  name: "Luxury Collection"
  description: "Premium properties with exceptional finishes, prime locations, and top-tier amenities."
  items:
    - "waterfront-penthouse"
    - "suburban-family-home"
    - "lake-house-retreat"
```

### 8.2.5 Create Comparison Files

**File**: `apps/sample-real-estate/.content/comparisons/downtown-loft-vs-suburban-house.yml`

```yaml
title: "Downtown Loft vs Suburban Family Home"
item_a_slug: "downtown-loft"
item_b_slug: "suburban-family-home"
item_a_name: "Downtown Loft"
item_b_name: "Suburban Family Home"
summary: "City loft living versus suburban family home — comparing lifestyle, space, and value."
verdict: "The loft suits single professionals or couples who value walkability and urban culture. The suburban home is ideal for families needing space, a yard, and quieter surroundings."
verdict_winner: "tie"
dimensions:
  - name: "Price"
    item_a_summary: "$485,000 for 1,200 sqft"
    item_b_summary: "$625,000 for 2,400 sqft"
    item_a_score: 7
    item_b_score: 8
    winner: "item_b"
  - name: "Location"
    item_a_summary: "Downtown Portland, walkable to everything"
    item_b_summary: "Quiet Austin suburb, car-dependent"
    item_a_score: 9
    item_b_score: 6
    winner: "item_a"
  - name: "Space"
    item_a_summary: "1 bed / 1 bath, open-plan living"
    item_b_summary: "4 bed / 2.5 bath, fenced yard"
    item_a_score: 5
    item_b_score: 9
    winner: "item_b"
  - name: "Investment Potential"
    item_a_summary: "Strong rental market in downtown area"
    item_b_summary: "Good appreciation in growing suburb"
    item_a_score: 8
    item_b_score: 8
    winner: "tie"
```

**File**: `apps/sample-real-estate/.content/comparisons/office-space-vs-coworking.yml`

```yaml
title: "Modern Office vs Coworking Retail Unit"
item_a_slug: "modern-office"
item_b_slug: "coworking-retail"
item_a_name: "Modern Office Space"
item_b_name: "Coworking Retail Unit"
summary: "Comparing a premium Class A office to a street-level coworking space for small business owners."
verdict: "The Class A office is best for established companies needing prestige and privacy. The retail coworking space offers better street presence and lower entry cost for startups and boutiques."
verdict_winner: "tie"
dimensions:
  - name: "Price"
    item_a_summary: "$1,200,000 for 5,000 sqft"
    item_b_summary: "$380,000 for 2,200 sqft"
    item_a_score: 5
    item_b_score: 9
    winner: "item_b"
  - name: "Visibility"
    item_a_summary: "Upper-floor office, limited street presence"
    item_b_summary: "Street-level with large storefront windows"
    item_a_score: 5
    item_b_score: 9
    winner: "item_b"
  - name: "Amenities"
    item_a_summary: "Gym, cafe, rooftop, fiber internet"
    item_b_summary: "Shared courtyard, basic utilities"
    item_a_score: 9
    item_b_score: 6
    winner: "item_a"
  - name: "Prestige"
    item_a_summary: "LEED-certified Class A building"
    item_b_summary: "Trendy neighborhood retail space"
    item_a_score: 9
    item_b_score: 7
    winner: "item_a"
```

### 8.2.6 Create Static Pages

**File**: `apps/sample-real-estate/.content/pages/about.md`

```markdown
---
title: "About Dream Properties"
slug: "about"
---

Dream Properties is a curated directory of the best real estate listings. We help you find your perfect home, investment property, or commercial space.
```

**File**: `apps/sample-real-estate/.content/pages/contact.md`

```markdown
---
title: "Contact Us"
slug: "contact"
---

Interested in a property? Our team of licensed agents is ready to help you schedule viewings, negotiate offers, and close deals.
```

### 8.2.7 Create Item Data Files

Create one YAML file per property inside `.content/data/<slug>/<slug>.yml`. Each follows the `ItemData` schema with an additional `meta` object for property-specific fields.

**Directory structure to create:**
```
.content/data/
├── downtown-loft/downtown-loft.yml
├── suburban-family-home/suburban-family-home.yml
├── waterfront-penthouse/waterfront-penthouse.yml
├── craftsman-bungalow/craftsman-bungalow.yml
├── modern-office/modern-office.yml
├── coworking-retail/coworking-retail.yml
├── lake-house-retreat/lake-house-retreat.yml
├── development-parcel/development-parcel.yml
├── micro-studio/micro-studio.yml
└── farmland-acreage/farmland-acreage.yml
```

All 10 property YAML files are specified in full in `.specify/features/sample-real-estate.md`. Each contains:
- `name`, `description`, `source_url` — standard ItemData fields
- `category` — one of: apartment, house, commercial, land
- `tags` — array of tag IDs
- `updated_at`, `status`, `featured` — standard metadata
- `meta` — property-specific fields: `price`, `bedrooms`, `bathrooms`, `sqft`, `location`, `year_built`, `lot_size`, `mls_number`

### Verification

```bash
# Count items — expect 10
ls apps/sample-real-estate/.content/data/ | wc -l

# Count comparisons — expect 2
ls apps/sample-real-estate/.content/comparisons/ | wc -l

# Count static pages — expect 2
ls apps/sample-real-estate/.content/pages/ | wc -l

# Validate YAML syntax
cd apps/sample-real-estate
node -e "const yaml = require('yaml'); const fs = require('fs'); console.log(yaml.parse(fs.readFileSync('.content/.works/works.yml','utf8')))"
```

---

## Task 8.3: Set Up Plugin Configuration

### Goal
Configure `content.ts` and `plugins.config.ts` — the data-loading and plugin pipeline.

### 8.3.1 Create `plugins.config.ts`

**File**: `apps/sample-real-estate/src/lib/plugins.config.ts`

```typescript
/**
 * Plugin configuration for the Dream Properties sample.
 *
 * All 7 built-in plugins are enabled with real-estate-specific options.
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
        titleTemplate: '%s | Dream Properties',
    }),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    breadcrumbsPlugin(),
    sitemapPlugin(),
]);
```

### 8.3.2 Create `content.ts`

**File**: `apps/sample-real-estate/src/lib/content.ts`

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
ls apps/sample-real-estate/src/lib/content.ts apps/sample-real-estate/src/lib/plugins.config.ts
```

---

## Task 8.4: Create Styled Layouts

### Goal
Create the root layout with an amber-accented Tailwind CSS design, header with navigation, dark/light mode toggle, and footer.

### 8.4.1 Create `global.css`

**File**: `apps/sample-real-estate/src/styles/global.css`

Tailwind v4 entry point with design tokens. Uses an amber accent color to differentiate from sample-basic (indigo), sample-jobs, and sample-events (teal).

```css
@import "tailwindcss";

@theme {
    --color-primary: #d97706;
    --color-primary-hover: #b45309;
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

### 8.4.2 Create `ThemeToggle.tsx`

**File**: `apps/sample-real-estate/src/components/ThemeToggle.tsx`

Copy from `apps/sample-basic/src/components/ThemeToggle.tsx` verbatim. The theme toggle is framework-agnostic.

### 8.4.3 Create `BaseLayout.astro`

**File**: `apps/sample-real-estate/src/layouts/BaseLayout.astro`

Follows the same structure as sample-events' BaseLayout but with:
- "Dream Properties" branding
- Navigation links: Home, Categories, Tags, Collections, Comparisons
- Amber accent color scheme
- ThemeToggle Preact island in header

### Verification

```bash
ls apps/sample-real-estate/src/styles/global.css
ls apps/sample-real-estate/src/components/ThemeToggle.tsx
ls apps/sample-real-estate/src/layouts/BaseLayout.astro
```

---

## Task 8.5: Create All Pages

### Goal
Implement all Astro pages — home, item detail, category listing, tag listing, collection, comparison, pagination, static pages, and 404.

### 8.5.1 Home Page

**File**: `apps/sample-real-estate/src/pages/index.astro`

Layout sections:
1. Hero with "Dream Properties" heading, subtitle, and search input
2. Category grid (4 cards — Apartment, House, Commercial, Land)
3. Featured properties (4 cards with price badges, location, and bedroom/bathroom counts)
4. All properties grid (paginated, 12 per page) with sort controls

### 8.5.2 Property Detail Page

**File**: `apps/sample-real-estate/src/pages/item/[slug].astro`

Uses `getStaticPaths()` to generate one page per property. Layout:
1. Breadcrumbs (Home > Category > Property Name)
2. Property header with name, description, price, and location
3. Meta sidebar: category, tags, bedrooms, bathrooms, sqft, year built, lot size, MLS number
4. Markdown content body (if present)
5. Related properties from the same category (up to 6)

Key difference from sample-basic: the meta sidebar renders property-specific `meta` fields (price, bedrooms, bathrooms, sqft, location, year_built, lot_size, mls_number).

### 8.5.3 Category Pages

**File**: `apps/sample-real-estate/src/pages/categories.astro` — Index of all 4 categories
**File**: `apps/sample-real-estate/src/pages/category/[slug].astro` — Properties in a category

### 8.5.4 Tag Pages

**File**: `apps/sample-real-estate/src/pages/tags.astro` — Index with tag cloud
**File**: `apps/sample-real-estate/src/pages/tag/[slug].astro` — Properties with a tag

### 8.5.5 Collection Pages

**File**: `apps/sample-real-estate/src/pages/collections.astro` — Index of all collections
**File**: `apps/sample-real-estate/src/pages/collection/[slug].astro` — Properties in a collection

### 8.5.6 Comparison Pages

**File**: `apps/sample-real-estate/src/pages/comparisons.astro` — Index of all comparisons
**File**: `apps/sample-real-estate/src/pages/comparison/[slug].astro` — Side-by-side comparison table

The comparison page displays two properties in a table with rows for: price, bedrooms, bathrooms, sqft, location, year built, lot size, category, and tags.

### 8.5.7 Static Content Pages

**File**: `apps/sample-real-estate/src/pages/pages/[slug].astro` — Renders markdown from `.content/pages/`

### 8.5.8 Pagination

**File**: `apps/sample-real-estate/src/pages/page/[page].astro` — Paginated property listing (pages 2+)

### 8.5.9 ItemBrowser Component

**File**: `apps/sample-real-estate/src/components/ItemBrowser.tsx`

Preact island component providing client-side search, filtering, and sorting for the property grid. Same pattern as sample-events but styled with amber accents.

### 8.5.10 BreadcrumbNav Component

**File**: `apps/sample-real-estate/src/components/BreadcrumbNav.astro`

Astro component rendering breadcrumb navigation using the breadcrumbs plugin. Renders a `<nav>` with `<ol>` list of links for Home > Category > Property Name.

### 8.5.11 404 Page

**File**: `apps/sample-real-estate/src/pages/404.astro`

Centered layout with "Page Not Found" heading, suggestion to browse categories, and links to Home, Categories, Tags.

### Verification

```bash
# Count page files — expect 14 .astro files
find apps/sample-real-estate/src/pages -name "*.astro" | wc -l

# Dev server should start without errors
cd apps/sample-real-estate && pnpm dev
```

---

## Task 8.6: Build Verification & Testing

### Goal
Confirm the sample builds, generates all expected pages, and passes type checking.

### 8.6.1 Type Check

```bash
pnpm --filter @ever-works/sample-real-estate typecheck
```

Expected: zero errors.

### 8.6.2 Build

```bash
pnpm --filter @ever-works/sample-real-estate build
```

Expected: static build succeeds with all pages generated.

### 8.6.3 Verify Generated Pages

```bash
# Core pages
test -f apps/sample-real-estate/dist/index.html
test -f apps/sample-real-estate/dist/404.html
test -f apps/sample-real-estate/dist/categories/index.html
test -f apps/sample-real-estate/dist/tags/index.html
test -f apps/sample-real-estate/dist/collections/index.html
test -f apps/sample-real-estate/dist/comparisons/index.html

# Property detail pages (spot check)
test -f apps/sample-real-estate/dist/item/downtown-loft/index.html
test -f apps/sample-real-estate/dist/item/suburban-family-home/index.html
test -f apps/sample-real-estate/dist/item/waterfront-penthouse/index.html

# Category pages
test -f apps/sample-real-estate/dist/category/apartment/index.html
test -f apps/sample-real-estate/dist/category/house/index.html
test -f apps/sample-real-estate/dist/category/commercial/index.html
test -f apps/sample-real-estate/dist/category/land/index.html

# Tag pages (spot check)
test -f apps/sample-real-estate/dist/tag/downtown/index.html
test -f apps/sample-real-estate/dist/tag/luxury/index.html

# Collection pages
test -f apps/sample-real-estate/dist/collection/under-500k/index.html
test -f apps/sample-real-estate/dist/collection/luxury-collection/index.html

# Comparison pages
test -f apps/sample-real-estate/dist/comparison/downtown-loft-vs-suburban-house/index.html
test -f apps/sample-real-estate/dist/comparison/office-space-vs-coworking/index.html

# Static pages
test -f apps/sample-real-estate/dist/pages/about/index.html
test -f apps/sample-real-estate/dist/pages/contact/index.html
```

### 8.6.4 Expected Page Count

| Page Type | Count | Detail |
|-----------|-------|--------|
| Home | 1 | `/` |
| Property detail | 10 | `/item/<slug>` |
| Categories index | 1 | `/categories` |
| Category pages | 4 | `/category/<slug>` |
| Tags index | 1 | `/tags` |
| Tag pages | 10 | `/tag/<slug>` |
| Collections index | 1 | `/collections` |
| Collection pages | 2 | `/collection/<slug>` |
| Comparisons index | 1 | `/comparisons` |
| Comparison pages | 2 | `/comparison/<slug>` |
| Static pages | 2 | `/pages/about`, `/pages/contact` |
| 404 | 1 | `/404` |
| **Total** | **~36+** | Plus pagination pages if items exceed 12 per page |

### 8.6.5 Visual Smoke Test

Start the preview server and manually verify:
1. Home page loads with hero, category grid, and featured properties
2. Property detail page shows all meta fields (price, bedrooms, bathrooms, sqft, location)
3. Dark mode toggle works
4. Collection pages list the correct properties
5. Comparison pages show side-by-side tables
6. 404 page renders correctly
7. No console errors

```bash
cd apps/sample-real-estate && pnpm preview
# Visit http://localhost:4326
```

---

## Task 8.7: CI Integration & Monorepo Wiring

### Goal
Wire the sample into the monorepo build system and CI pipeline.

### 8.7.1 Update `turbo.json`

Ensure sample-real-estate follows the same task graph as other apps. No changes should be needed if `turbo.json` uses workspace globs.

### 8.7.2 Update CI Workflow

**File**: `.github/workflows/ci.yml`

Add `sample-real-estate` to the build matrix or E2E step alongside sample-basic, sample-jobs, and sample-events:

```yaml
# In the build job or E2E job:
- name: Build sample-real-estate
  run: pnpm --filter @ever-works/sample-real-estate build
```

### 8.7.3 Add E2E Tests (Optional)

**File**: `apps/web-e2e/tests/sample-real-estate.spec.ts`

Basic smoke tests for the real estate sample:
1. Home page renders with "Dream Properties" heading
2. Category page loads for `/category/apartment`
3. Property detail page loads for `/item/downtown-loft`
4. Collection page loads for `/collection/under-500k`
5. Comparison page loads for `/comparison/downtown-loft-vs-suburban-house`
6. 404 page renders for invalid route

### Verification

```bash
# Full monorepo build
pnpm build

# Confirm sample-real-estate built successfully
test -d apps/sample-real-estate/dist

# Run E2E if tests are added
pnpm test:e2e
```

---

## Summary

| Task | Description | Files Created | Estimate |
|------|-------------|--------------|----------|
| 8.1 | Scaffold directory structure | 5 | 30 min |
| 8.2 | Create sample content data | 17 (config + categories + tags + collections + 2 comparisons + 2 pages + 10 items) | 1 hr |
| 8.3 | Plugin configuration | 2 | 15 min |
| 8.4 | Styled layouts | 3 | 1 hr |
| 8.5 | All pages + components | 16 (14 pages + ItemBrowser + BreadcrumbNav) | 3 hr |
| 8.6 | Build verification | 0 (verification only) | 30 min |
| 8.7 | CI integration | 1-2 | 30 min |
| **Total** | | **~44 files** | **~6.5 hr** |

## Success Criteria

- [ ] All `@ever-works/*` packages build without errors
- [ ] `pnpm --filter @ever-works/sample-real-estate typecheck` passes with zero errors
- [ ] `pnpm --filter @ever-works/sample-real-estate build` completes successfully
- [ ] All ~36+ expected pages are generated in `dist/`
- [ ] Home page displays hero, category grid, featured properties, and search
- [ ] Property detail pages render all meta fields (price, bedrooms, sqft, location, etc.)
- [ ] Collections and comparisons render correctly
- [ ] Dark/light mode toggle works
- [ ] No TypeScript or runtime errors in development or production builds
- [ ] CI workflow includes sample-real-estate build step

## Key Differences from Other Samples

1. **Property-specific metadata** — Items include `meta` fields (price, bedrooms, bathrooms, sqft, location, year_built, lot_size, mls_number) rendered in the detail sidebar
2. **Amber brand color** — Visual differentiation from sample-basic (indigo), sample-jobs, and sample-events (teal)
3. **Real estate content** — 10 property listings across 4 categories: Apartment, House, Commercial, Land
4. **Comparison format** — Uses dimensioned scoring format (item_a/item_b with score dimensions) rather than simple item ID pairs
5. **Collections** — Two curated collections ("Under $500K" and "Luxury Collection") demonstrate price-based and quality-based grouping
6. **Static pages** — About and Contact pages demonstrate the static pages feature
7. **Breadcrumbs plugin** — Enabled (matches sample-events pattern)
8. **Port 4326** — Next available port in the sample app sequence
