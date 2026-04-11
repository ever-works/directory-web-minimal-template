---
title: "Phase 5: Sample Detail"
sidebar_label: "Phase 5: Detail"
---

# Phase 5: Sample Basic — Detailed Implementation Plan

> Concrete tasks, file paths, and code patterns for building the `apps/sample-basic/` reference implementation.

## Overview

This plan breaks Phase 5 into six sequential tasks. Each task lists exact file paths, content to create, and verification steps. The sample implements a "React UI Components" directory with full Tailwind CSS styling, dark/light mode, and all 6 built-in plugins.

**Prerequisite**: Phases 1-4 must be complete. All `@ever-works/*` packages must build and export correctly.

**Spec reference**: `.specify/features/sample-basic.md`

---

## Task 5.1: Set Up sample-basic Directory Structure

### Goal
Scaffold the `apps/sample-basic/` directory with proper config files, build tooling, and dependency declarations.

### 5.1.1 Update `package.json`

**File**: `apps/sample-basic/package.json`

Replace the existing package.json with the full dependency set. Key changes from the current version:
- Add `@tailwindcss/vite` (Tailwind v4 via Vite, not `@astrojs/tailwind` which is v3-only)
- Add all individual plugin packages (`@ever-works/plugin-*`)
- Add `@astrojs/check` for typecheck support
- Add `typecheck` and `lint` scripts
- Remove `@astrojs/tailwind` (v3-only, incompatible)

```json
{
    "name": "@ever-works/sample-basic",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "description": "Reference implementation: a React UI Components directory built by AI from the minimal template.",
    "scripts": {
        "predev": "tsx scripts/clone-content.ts",
        "dev": "astro dev --port 4323",
        "prebuild": "tsx scripts/clone-content.ts",
        "build": "astro build",
        "preview": "astro preview --port 4323",
        "typecheck": "astro check && tsc --noEmit",
        "lint": "eslint src/",
        "clean": "rm -rf dist .astro"
    },
    "dependencies": {
        "@astrojs/preact": "^4.0.0",
        "@astrojs/sitemap": "^3.3.0",
        "@ever-works/adapters": "workspace:*",
        "@ever-works/core": "workspace:*",
        "@ever-works/plugin-filters": "workspace:*",
        "@ever-works/plugin-pagination": "workspace:*",
        "@ever-works/plugin-search": "workspace:*",
        "@ever-works/plugin-seo": "workspace:*",
        "@ever-works/plugin-sitemap": "workspace:*",
        "@ever-works/plugin-sort": "workspace:*",
        "@ever-works/plugins": "workspace:*",
        "@ever-works/ui": "workspace:*",
        "@tailwindcss/vite": "^4.1.0",
        "astro": "^5.0.0",
        "preact": "^10.25.0",
        "tailwindcss": "^4.1.0",
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

### 5.1.2 Create `astro.config.ts`

**File**: `apps/sample-basic/astro.config.ts`

Copy from `apps/web/astro.config.ts`. Identical configuration — static output, Preact, sitemap, Tailwind v4 via Vite plugin.

```typescript
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    output: 'static',
    site: process.env.SITE_URL || 'https://react-ui-components.example.com',
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

### 5.1.3 Create `tsconfig.json`

**File**: `apps/sample-basic/tsconfig.json`

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

### 5.1.4 Copy `scripts/clone-content.ts`

**File**: `apps/sample-basic/scripts/clone-content.ts`

Copy from `apps/web/scripts/clone-content.ts` verbatim. Since `.content/` is checked into the sample app, this script will be a no-op (it skips when the directory exists), but it maintains consistency with the template pattern.

### 5.1.5 Create `src/env.d.ts`

**File**: `apps/sample-basic/src/env.d.ts`

```typescript
/// <reference types="astro/client" />
```

### Verification

```bash
cd apps/sample-basic
# Confirm all files exist
ls astro.config.ts tsconfig.json package.json scripts/clone-content.ts src/env.d.ts
# Install dependencies
pnpm install
```

---

## Task 5.2: Create Sample Content Data

### Goal
Populate `.content/` with the React UI Components directory data — config, categories, tags, and 10 item YAML files.

### 5.2.1 Create `.content/config.yml`

**File**: `apps/sample-basic/.content/config.yml`

```yaml
company_name: "React UI Components"
item_name: "Library"
items_name: "Libraries"
copyright_year: 2026
app_url: "https://react-ui-components.example.com"

pagination:
  type: "standard"
  itemsPerPage: 12

settings:
  categories_enabled: true
  tags_enabled: true
```

### 5.2.2 Create `.content/categories.yml`

**File**: `apps/sample-basic/.content/categories.yml`

```yaml
- id: "form-components"
  name: "Form Components"
  description: "Input fields, selects, checkboxes, date pickers, and form validation"

- id: "data-display"
  name: "Data Display"
  description: "Tables, lists, cards, charts, and data visualization"

- id: "navigation"
  name: "Navigation"
  description: "Menus, tabs, breadcrumbs, sidebars, and routing helpers"

- id: "layout"
  name: "Layout"
  description: "Grids, stacks, containers, responsive utilities, and spacing"

- id: "feedback"
  name: "Feedback"
  description: "Modals, toasts, alerts, progress bars, and loading states"
```

### 5.2.3 Create `.content/tags.yml`

**File**: `apps/sample-basic/.content/tags.yml`

```yaml
- id: "typescript"
  name: "TypeScript"
  description: "First-class TypeScript support with full type definitions"
  isActive: true

- id: "accessible"
  name: "Accessible"
  description: "WAI-ARIA compliant with keyboard navigation support"
  isActive: true

- id: "headless"
  name: "Headless"
  description: "Unstyled, behavior-only components for full styling control"
  isActive: true

- id: "open-source"
  name: "Open Source"
  description: "Free and open-source software with permissive licenses"
  isActive: true

- id: "styled"
  name: "Styled"
  description: "Ships with a default theme and pre-built visual design"
  isActive: true

- id: "react-server-components"
  name: "RSC Compatible"
  description: "Compatible with React Server Components"
  isActive: true

- id: "animation"
  name: "Animation"
  description: "Built-in animation and transition support"
  isActive: true

- id: "design-system"
  name: "Design System"
  description: "Part of a comprehensive design system with guidelines"
  isActive: true
```

### 5.2.4 Create `.content/collections.yml`

**File**: `apps/sample-basic/.content/collections.yml`

```yaml
# No collections in the basic sample
```

### 5.2.5 Create Item Data Files

Create one YAML file per item inside `.content/data/<slug>/<slug>.yml`. Each follows the `ItemData` schema.

**Directory structure to create:**
```
.content/data/
├── radix-ui/radix-ui.yml
├── headless-ui/headless-ui.yml
├── react-aria/react-aria.yml
├── shadcn-ui/shadcn-ui.yml
├── chakra-ui/chakra-ui.yml
├── ant-design/ant-design.yml
├── material-ui/material-ui.yml
├── mantine/mantine.yml
├── framer-motion/framer-motion.yml
└── tanstack-table/tanstack-table.yml
```

**File**: `apps/sample-basic/.content/data/radix-ui/radix-ui.yml`
```yaml
name: "Radix UI"
description: "Unstyled, accessible components for building high-quality design systems and web apps."
source_url: "https://www.radix-ui.com"
category: "form-components"
tags: ["typescript", "accessible", "headless", "open-source"]
updated_at: "2026-01-15 10:00"
status: "approved"
featured: true
```

**File**: `apps/sample-basic/.content/data/headless-ui/headless-ui.yml`
```yaml
name: "Headless UI"
description: "Completely unstyled, fully accessible UI components, designed to integrate with Tailwind CSS."
source_url: "https://headlessui.com"
category: "navigation"
tags: ["typescript", "accessible", "headless", "open-source"]
updated_at: "2026-01-10 10:00"
status: "approved"
featured: true
```

**File**: `apps/sample-basic/.content/data/react-aria/react-aria.yml`
```yaml
name: "React Aria"
description: "A library of React Hooks that provides accessible UI primitives for your design system."
source_url: "https://react-spectrum.adobe.com/react-aria"
category: "form-components"
tags: ["typescript", "accessible", "headless", "open-source"]
updated_at: "2026-01-12 10:00"
status: "approved"
featured: false
```

**File**: `apps/sample-basic/.content/data/shadcn-ui/shadcn-ui.yml`
```yaml
name: "shadcn/ui"
description: "Beautifully designed components built with Radix UI and Tailwind CSS. Copy and paste into your apps."
source_url: "https://ui.shadcn.com"
category: "form-components"
tags: ["typescript", "accessible", "open-source", "styled"]
updated_at: "2026-01-20 10:00"
status: "approved"
featured: true
```

**File**: `apps/sample-basic/.content/data/chakra-ui/chakra-ui.yml`
```yaml
name: "Chakra UI"
description: "A simple, modular and accessible component library that gives you the building blocks for React apps."
source_url: "https://chakra-ui.com"
category: "layout"
tags: ["typescript", "accessible", "styled", "open-source", "design-system"]
updated_at: "2026-01-08 10:00"
status: "approved"
featured: false
```

**File**: `apps/sample-basic/.content/data/ant-design/ant-design.yml`
```yaml
name: "Ant Design"
description: "An enterprise-class UI design language and React UI library with high-quality components."
source_url: "https://ant.design"
category: "data-display"
tags: ["typescript", "styled", "open-source", "design-system"]
updated_at: "2026-01-05 10:00"
status: "approved"
featured: false
```

**File**: `apps/sample-basic/.content/data/material-ui/material-ui.yml`
```yaml
name: "Material UI"
description: "Ready-to-use foundational React components implementing Google's Material Design."
source_url: "https://mui.com"
category: "form-components"
tags: ["typescript", "accessible", "styled", "open-source", "design-system"]
updated_at: "2026-01-03 10:00"
status: "approved"
featured: false
```

**File**: `apps/sample-basic/.content/data/mantine/mantine.yml`
```yaml
name: "Mantine"
description: "A fully featured React components library with 100+ hooks and components for building modern web apps."
source_url: "https://mantine.dev"
category: "form-components"
tags: ["typescript", "accessible", "styled", "open-source", "animation"]
updated_at: "2026-01-18 10:00"
status: "approved"
featured: true
```

**File**: `apps/sample-basic/.content/data/framer-motion/framer-motion.yml`
```yaml
name: "Framer Motion"
description: "A production-ready motion library for React with declarative animations and gesture support."
source_url: "https://www.framer.com/motion"
category: "feedback"
tags: ["typescript", "open-source", "animation"]
updated_at: "2026-01-14 10:00"
status: "approved"
featured: false
```

**File**: `apps/sample-basic/.content/data/tanstack-table/tanstack-table.yml`
```yaml
name: "TanStack Table"
description: "Headless UI for building powerful tables and datagrids with first-class TypeScript support."
source_url: "https://tanstack.com/table"
category: "data-display"
tags: ["typescript", "headless", "open-source"]
updated_at: "2026-01-11 10:00"
status: "approved"
featured: false
```

### Verification

```bash
# Count items — expect 10
ls apps/sample-basic/.content/data/ | wc -l

# Validate YAML syntax (quick check)
cd apps/sample-basic
node -e "const yaml = require('yaml'); const fs = require('fs'); console.log(yaml.parse(fs.readFileSync('.content/config.yml','utf8')))"
```

---

## Task 5.3: Set Up Plugin Configuration

### Goal
Configure `content.ts` and `plugins.config.ts` — the data-loading and plugin pipeline. These are functionally identical to `apps/web/` but can be customized.

### 5.3.1 Create `plugins.config.ts`

**File**: `apps/sample-basic/src/lib/plugins.config.ts`

```typescript
/**
 * Plugin configuration for the React UI Components sample.
 *
 * All 6 built-in plugins are enabled with sample-specific options.
 */

import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';

export const plugins = definePlugins([
    seoPlugin({
        titleTemplate: '%s | React UI Components',
    }),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
]);
```

### 5.3.2 Create `content.ts`

**File**: `apps/sample-basic/src/lib/content.ts`

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
# Confirm both files exist
ls apps/sample-basic/src/lib/content.ts apps/sample-basic/src/lib/plugins.config.ts
```

---

## Task 5.4: Create Styled Layouts

### Goal
Create the root layout with a modern Tailwind CSS design, header with navigation, dark/light mode toggle, and footer.

### 5.4.1 Create `global.css`

**File**: `apps/sample-basic/src/styles/global.css`

Tailwind v4 entry point with design tokens and base styles.

```css
@import "tailwindcss";

@theme {
    --color-primary: #4f46e5;
    --color-primary-hover: #4338ca;
}

/*
 * Base styles for the sample site.
 * Dark mode is controlled by the .dark class on <html>.
 */

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

/* Smooth transitions for dark mode */
body,
header,
footer,
main {
    transition: background-color 0.2s ease, color 0.2s ease;
}
```

### 5.4.2 Create `ThemeToggle.tsx`

**File**: `apps/sample-basic/src/components/ThemeToggle.tsx`

Preact island for dark/light mode toggle. Uses `client:load` directive in Astro.

```tsx
/**
 * ThemeToggle — Preact island for dark/light mode switching.
 *
 * Reads system preference on mount, checks localStorage for user override.
 * Toggles .dark class on <html> and persists choice to localStorage.
 */

import { useState, useEffect } from 'preact/hooks';

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        // Check localStorage first, then system preference
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') {
            setDark(true);
            document.documentElement.classList.add('dark');
        } else if (stored === 'light') {
            setDark(false);
            document.documentElement.classList.remove('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    function toggle() {
        const next = !dark;
        setDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    return (
        <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
            {dark ? (
                {/* Sun icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ) : (
                {/* Moon icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
}
```

### 5.4.3 Create `BaseLayout.astro`

**File**: `apps/sample-basic/src/layouts/BaseLayout.astro`

Styled root layout with Tailwind classes. Integrates `ThemeToggle` as a Preact island.

Key differences from the `apps/web/` headless BaseLayout:
- Full Tailwind CSS styling applied
- Dark mode support via `.dark` class
- `ThemeToggle` component in the header
- Responsive navigation
- Styled footer with links

```astro
---
/**
 * BaseLayout — Styled root layout for the React UI Components sample.
 *
 * Modern Tailwind CSS design with dark/light mode toggle.
 * Integrates with plugin-seo for meta tags and structured data.
 */
import type { SiteConfig } from '@ever-works/core';
import { generateMetaTags } from '@ever-works/plugin-seo';
import type { PageMeta } from '@ever-works/plugin-seo';
import ThemeToggle from '../components/ThemeToggle.tsx';
import '../styles/global.css';

interface Props {
    title: string;
    description?: string;
    config: SiteConfig;
    canonicalUrl?: string;
    ogImage?: string;
    pageType?: 'website' | 'article' | 'product';
}

const { title, description, config, canonicalUrl, ogImage, pageType = 'website' } = Astro.props;
const siteTitle = `${title} | ${config.company_name}`;
const metaDescription = description || `${config.company_name} — Browse ${config.items_name}`;

const pageMeta: PageMeta = {
    title: siteTitle,
    description: metaDescription,
    url: canonicalUrl || Astro.url.href,
    image: ogImage,
    type: pageType,
};

const metaTags = generateMetaTags(pageMeta, {});
---

<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="generator" content={Astro.generator} />
        <title>{siteTitle}</title>
        {metaTags.map((tag) => {
            if (tag.key === 'property') {
                return <meta property={tag.value} content={tag.content} />;
            }
            return <meta name={tag.value} content={tag.content} />;
        })}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <slot name="head" />
        {/* Inline script to prevent dark mode flash */}
        <script is:inline>
            (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>
    </head>
    <body class="min-h-screen flex flex-col">
        <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <a href="/" class="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {config.company_name}
                </a>
                <div class="flex items-center gap-1 sm:gap-4">
                    <nav class="flex items-center gap-1 sm:gap-2 text-sm">
                        <a href="/" class="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">Home</a>
                        <a href="/categories" class="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">Categories</a>
                        <a href="/tags" class="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">Tags</a>
                    </nav>
                    <ThemeToggle client:load />
                </div>
            </div>
        </header>

        <main class="flex-1">
            <slot />
        </main>

        <footer class="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                        &copy; {config.copyright_year} {config.company_name}
                    </p>
                    <nav class="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <a href="/" class="hover:text-slate-900 dark:hover:text-white transition-colors">Home</a>
                        <a href="/categories" class="hover:text-slate-900 dark:hover:text-white transition-colors">Categories</a>
                        <a href="/tags" class="hover:text-slate-900 dark:hover:text-white transition-colors">Tags</a>
                    </nav>
                </div>
            </div>
        </footer>
    </body>
</html>
```

### Verification

```bash
ls apps/sample-basic/src/styles/global.css
ls apps/sample-basic/src/components/ThemeToggle.tsx
ls apps/sample-basic/src/layouts/BaseLayout.astro
```

---

## Task 5.5: Create Styled Pages

### Goal
Create all page templates with full Tailwind CSS styling, data loading, and plugin integration.

### 5.5.1 Home Page — `index.astro`

**File**: `apps/sample-basic/src/pages/index.astro`

Sections:
1. Hero with gradient background, heading, subtitle, and search placeholder
2. Category grid (responsive 2-3 columns)
3. Featured items cards
4. All items grid (paginated, 12 per page)
5. Pagination link to page 2

Key patterns:
- `await getContent()` for data
- `paginate()` from `@ever-works/plugin-pagination`
- `generateJsonLd()` from `@ever-works/plugin-seo`
- Tailwind utility classes for all styling
- Dark mode variants via `dark:` prefix

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getContent } from '../lib/content';
import { paginate } from '@ever-works/plugin-pagination';
import { generateJsonLd } from '@ever-works/plugin-seo';

const { items, categories, tags, config } = await getContent();
const perPage = config.pagination?.itemsPerPage ?? 12;
const pagination = paginate(items, { page: 1, perPage });
const featuredItems = items.filter((i) => i.featured).slice(0, 4);

const jsonLd = generateJsonLd('WebSite', {
    type: 'WebSite',
    name: config.company_name,
    url: config.app_url ?? '',
});
---

<BaseLayout title="Home" config={config}>
    <Fragment slot="head">
        <script is:inline type="application/ld+json" set:html={jsonLd} />
    </Fragment>

    {/* Hero */}
    <section class="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-16 text-center text-white sm:py-24">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">{config.company_name}</h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
            Discover the best React component libraries for your next project.
            Browse {items.length} {items.length === 1 ? config.item_name : config.items_name}.
        </p>
    </section>

    {/* Categories */}
    ...

    {/* Featured */}
    ...

    {/* All Items Grid */}
    ...

    {/* Pagination */}
    ...
</BaseLayout>
```

**Implementation note**: The full page implementation should include complete markup for each section. The `...` placeholders above indicate where the remaining section markup goes — see the feature spec for layout details. Each section follows the same pattern: a `<section>` with `mx-auto max-w-6xl px-4 py-12 sm:px-6` container, responsive grid via `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`, and item cards with hover effects.

### 5.5.2 Item Detail Page — `item/[slug].astro`

**File**: `apps/sample-basic/src/pages/item/[slug].astro`

Pattern: `getStaticPaths()` generates one page per approved item.

Key sections:
- Breadcrumbs (Home > Category > Item)
- Item header with name, description, external link button
- Meta info: category badge, tag pills, last updated
- Markdown content (if present)
- Related items grid (up to 6 from same category)

### 5.5.3 Category Listing Page — `category/[slug].astro`

**File**: `apps/sample-basic/src/pages/category/[slug].astro`

Pattern: `getStaticPaths()` generates one page per category.

Key sections:
- Category name heading with description
- Item count badge
- Item cards grid filtered to this category

### 5.5.4 Tag Listing Page — `tag/[slug].astro`

**File**: `apps/sample-basic/src/pages/tag/[slug].astro`

Pattern: `getStaticPaths()` generates one page per active tag.

Key sections:
- Tag name heading with item count
- Item cards grid filtered to this tag

### 5.5.5 Categories Index — `categories.astro`

**File**: `apps/sample-basic/src/pages/categories.astro`

Lists all categories as cards with name, description, and item count.

### 5.5.6 Tags Index — `tags.astro`

**File**: `apps/sample-basic/src/pages/tags.astro`

Lists all tags as pill-shaped links with item counts. Sized proportionally by count.

### 5.5.7 Paginated Listing — `page/[page].astro`

**File**: `apps/sample-basic/src/pages/page/[page].astro`

Pattern: `getStaticPaths()` with `generatePagePaths()` from pagination plugin.

Key sections:
- Page heading ("All Libraries - Page N")
- Item cards grid
- Pagination controls (Previous / Page N of M / Next)

### 5.5.8 404 Page — `404.astro`

**File**: `apps/sample-basic/src/pages/404.astro`

Centered layout with:
- "Page Not Found" heading
- Helpful message
- Links back to Home, Categories, Tags

### Shared Patterns Across All Pages

**Item card markup** (reused in home, category, tag, and paginated pages):

```astro
<article class="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
        <a href={`/item/${item.slug}`} class="hover:text-indigo-600 dark:hover:text-indigo-400">
            {item.name}
        </a>
    </h3>
    {item.description && (
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {item.description}
        </p>
    )}
    <div class="mt-4 flex flex-wrap gap-2">
        <span class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {Array.isArray(item.category) ? item.category[0] : item.category}
        </span>
    </div>
</article>
```

**Tag pill markup**:

```astro
<a href={`/tag/${tag}`} class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 transition-colors">
    {tag}
</a>
```

### Verification

```bash
# All page files exist
ls apps/sample-basic/src/pages/index.astro
ls apps/sample-basic/src/pages/404.astro
ls apps/sample-basic/src/pages/categories.astro
ls apps/sample-basic/src/pages/tags.astro
ls apps/sample-basic/src/pages/item/\[slug\].astro
ls apps/sample-basic/src/pages/category/\[slug\].astro
ls apps/sample-basic/src/pages/tag/\[slug\].astro
ls apps/sample-basic/src/pages/page/\[page\].astro
```

---

## Task 5.6: Build Verification

### Goal
Verify the complete sample app builds, type-checks, and generates all expected static pages.

### 5.6.1 Install Dependencies

```bash
# From monorepo root
pnpm install
```

### 5.6.2 Type Check

```bash
pnpm --filter @ever-works/sample-basic typecheck
```

**Expected**: Zero errors, zero warnings.

**Common issues to fix**:
- Missing type imports from `@ever-works/core`
- Incorrect `PageMeta` or `SiteConfig` property names
- Preact JSX type mismatches (ensure `tsconfig` extends `@ever-works/tsconfig/astro.json`)

### 5.6.3 Build

```bash
pnpm --filter @ever-works/sample-basic build
```

**Expected**: Successful static build generating all pages.

### 5.6.4 Verify Generated Pages

```bash
# Check all expected output files exist
test -f apps/sample-basic/dist/index.html && echo "OK: Home page"
test -f apps/sample-basic/dist/404.html && echo "OK: 404 page"
test -f apps/sample-basic/dist/categories/index.html && echo "OK: Categories index"
test -f apps/sample-basic/dist/tags/index.html && echo "OK: Tags index"

# Item detail pages (one per item)
for slug in radix-ui headless-ui react-aria shadcn-ui chakra-ui ant-design material-ui mantine framer-motion tanstack-table; do
    test -f "apps/sample-basic/dist/item/${slug}/index.html" && echo "OK: Item ${slug}"
done

# Category pages (one per category)
for slug in form-components data-display navigation layout feedback; do
    test -f "apps/sample-basic/dist/category/${slug}/index.html" && echo "OK: Category ${slug}"
done

# Tag pages (one per tag)
for slug in typescript accessible headless open-source styled react-server-components animation design-system; do
    test -f "apps/sample-basic/dist/tag/${slug}/index.html" && echo "OK: Tag ${slug}"
done
```

### 5.6.5 Dev Server Smoke Test

```bash
pnpm --filter @ever-works/sample-basic dev
# Open http://localhost:4323 in browser
# Verify:
#   - Home page renders with hero, categories, featured items
#   - Dark/light mode toggle works
#   - Category links navigate correctly
#   - Item detail pages show full information
#   - Tag pages list correct items
#   - No console errors
```

### 5.6.6 Full Monorepo Build

```bash
# From monorepo root — both web and sample-basic should build
pnpm build
```

**Expected**: Both `apps/web` and `apps/sample-basic` build successfully without interfering with each other.

---

## Summary Checklist

| Task | Files | Status |
|------|-------|--------|
| 5.1 Directory structure | `package.json`, `astro.config.ts`, `tsconfig.json`, `clone-content.ts`, `env.d.ts` | [ ] |
| 5.2 Content data | `config.yml`, `categories.yml`, `tags.yml`, `collections.yml`, 10x item YAML files | [ ] |
| 5.3 Plugin config | `plugins.config.ts`, `content.ts` | [ ] |
| 5.4 Styled layouts | `global.css`, `ThemeToggle.tsx`, `BaseLayout.astro` | [ ] |
| 5.5 Styled pages | `index.astro`, `[slug].astro` (item, category, tag), `categories.astro`, `tags.astro`, `[page].astro`, `404.astro` | [ ] |
| 5.6 Build verification | typecheck, build, verify pages, dev server | [ ] |

## Success Criteria

1. `pnpm --filter @ever-works/sample-basic typecheck` passes with zero errors
2. `pnpm --filter @ever-works/sample-basic build` succeeds, generating 25+ static HTML files
3. All 10 item detail pages render with correct data
4. All 5 category pages render with filtered items
5. All 8 tag pages render with filtered items
6. Home page shows hero, categories, featured items, and paginated listing
7. Dark/light mode toggle works (Preact island hydrates and toggles `.dark` class)
8. No console errors in dev server
9. Full monorepo `pnpm build` succeeds (web + sample-basic)
