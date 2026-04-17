# Feature: Sample Basic — React UI Components Directory

## Description

A complete, working reference implementation that demonstrates how AI builds a directory website from the minimal template. The sample implements a "React UI Components" directory — a curated listing of popular React component libraries, organized by category and tagged with relevant attributes.

This sample serves two purposes:
1. **Proof of concept** — Shows the template produces a real, polished directory website
2. **Reference for AI agents** — Demonstrates the full workflow from blank template to styled site

## User Stories

- As an **AI agent**, I want a complete reference implementation so I can follow the same patterns when building new directory sites.
- As a **developer**, I want to see a working example of all template features (plugins, pages, data, styling) assembled together.
- As a **visitor**, I want to browse React UI component libraries by category, tag, or search.
- As a **visitor**, I want to view detailed information about each component library.
- As a **visitor**, I want to switch between dark and light modes.
- As a **visitor**, I want a fast, responsive experience on any device.

## Feature Overview

| Aspect | Detail |
|--------|--------|
| Directory name | React UI Components |
| Item type | Component Library |
| Items count | 12 curated libraries |
| Categories | 5 (Form, Data Display, Navigation, Layout, Feedback) |
| Tags | 8+ (TypeScript, Accessible, Headless, Open Source, etc.) |
| Plugins | All 10 built-in plugins enabled (seo, pagination, filters, search, sort, sitemap, breadcrumbs, rss, related-items, analytics) |
| Styling | Tailwind CSS, modern clean design |
| Theme | Dark/light mode with system preference detection |
| Output | Fully static (Astro `output: 'static'`) |

## Content Data Structure

### Site Configuration (`.content/config.yml`)

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

### Categories (`.content/categories.yml`)

| ID | Name | Description |
|----|------|-------------|
| `form-components` | Form Components | Input fields, selects, checkboxes, date pickers, and form validation |
| `data-display` | Data Display | Tables, lists, cards, charts, and data visualization |
| `navigation` | Navigation | Menus, tabs, breadcrumbs, sidebars, and routing helpers |
| `layout` | Layout | Grids, stacks, containers, responsive utilities, and spacing |
| `feedback` | Feedback | Modals, toasts, alerts, progress bars, and loading states |

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

### Tags (`.content/tags.yml`)

| ID | Name | Description |
|----|------|-------------|
| `typescript` | TypeScript | First-class TypeScript support with full type definitions |
| `accessible` | Accessible | WAI-ARIA compliant with keyboard navigation support |
| `headless` | Headless | Unstyled, behavior-only components for full styling control |
| `open-source` | Open Source | Free and open-source software with permissive licenses |
| `styled` | Styled | Ships with a default theme and pre-built visual design |
| `react-server-components` | RSC Compatible | Compatible with React Server Components |
| `animation` | Animation | Built-in animation and transition support |
| `design-system` | Design System | Part of a comprehensive design system with guidelines |

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

### Sample Items (`.content/data/<slug>/<slug>.yml`)

Each item follows the `ItemData` schema from `@ever-works/core`.

#### 1. Radix UI
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

#### 2. Headless UI
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

#### 3. React Aria
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

#### 4. shadcn/ui
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

#### 5. Chakra UI
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

#### 6. Ant Design
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

#### 7. Material UI (MUI)
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

#### 8. Mantine
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

#### 9. Framer Motion
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

#### 10. React Table (TanStack Table)
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

#### 11. React Hook Form
```yaml
name: "React Hook Form"
description: "Performant, flexible and extensible forms with easy-to-use validation and minimal re-renders."
source_url: "https://react-hook-form.com"
category: "form-components"
tags: ["typescript", "open-source", "accessible"]
updated_at: "2026-01-22 10:00"
status: "approved"
featured: false
```

#### 12. React Spring
```yaml
name: "React Spring"
description: "A spring-physics based animation library that covers most UI-related animation needs with a modern, hook-based API."
source_url: "https://www.react-spring.dev"
category: "feedback"
tags: ["typescript", "open-source", "animation"]
updated_at: "2026-01-16 10:00"
status: "approved"
featured: false
```

## Page Designs

### Home Page (`/`)

The home page is the primary landing page. Layout sections from top to bottom:

1. **Header** — Site name, navigation links (Home, Categories, Tags), dark/light mode toggle
2. **Hero Section** — Large heading ("React UI Components"), subtitle ("Discover the best React component libraries for your next project"), search bar
3. **Category Grid** — 5 category cards in a responsive grid (2-3 columns), each showing name, description, and item count
4. **Featured Libraries** — 4 featured items in a card grid with icon, name, description, category badge, and tag pills
5. **All Libraries** — Paginated grid of all items (12 per page) with sort controls
6. **Footer** — Copyright, site links

### Item Detail Page (`/item/[slug]`)

1. **Breadcrumbs** — Home > Category > Item Name
2. **Item Header** — Icon (large), name (h1), description, "Visit Website" button
3. **Meta Sidebar** — Category link, tag pills, last updated date, license info
4. **Content Body** — Markdown content (if present) rendered as HTML
5. **Related Items** — Up to 6 items from the same category

### Category Listing Page (`/category/[slug]`)

1. **Category Header** — Category name (h1), description, item count
2. **Filter Bar** — Sort by (name, date), tag filter chips
3. **Item Grid** — All items in this category, paginated
4. **Back to Categories** — Link back to category index

### Tag Listing Page (`/tag/[slug]`)

1. **Tag Header** — Tag name (h1), description, item count badge
2. **Item Grid** — All items with this tag, displayed as cards
3. **Related Tags** — Other tags frequently paired with this one

### Categories Index (`/categories`)

1. **Page Header** — "All Categories" (h1)
2. **Category Grid** — All categories as cards with name, description, item count
3. **Each card links** to `/category/[slug]`

### Tags Index (`/tags`)

1. **Page Header** — "All Tags" (h1)
2. **Tag Cloud** — Tags displayed as pills/chips sized by item count
3. **Tag List** — Alphabetical list with item counts, linking to `/tag/[slug]`

### Paginated Listing (`/page/[page]`)

1. Same layout as home page listing section
2. **Pagination** — Previous / Page N of M / Next
3. No hero section (only page 1 has the hero)

### 404 Page

1. **Centered layout** — "Page Not Found" heading
2. **Helpful message** — Suggestion to browse categories or search
3. **Links** — Home, Categories, Tags

## Styling Approach

### Tailwind CSS v4

- Use `@tailwindcss/vite` plugin (Tailwind v4 API, not `@astrojs/tailwind` which is v3-only)
- Define design tokens in `global.css` via `@theme` directive
- Utility-first approach with semantic class composition for reusable patterns

### Design Tokens

```css
@theme {
  /* Colors — slate-based neutral with indigo accent */
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;

  /* Dark mode overrides via .dark class */
  --color-bg-dark: #0f172a;
  --color-bg-secondary-dark: #1e293b;
  --color-text-dark: #f1f5f9;
  --color-text-secondary-dark: #94a3b8;
  --color-border-dark: #334155;

  /* Spacing scale */
  --spacing-page: 1rem;
  --spacing-section: 3rem;

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.1);
  --shadow-card-hover: 0 4px 12px rgb(0 0 0 / 0.15);
}
```

### Dark/Light Mode

- System preference detection via `prefers-color-scheme`
- Manual toggle button in the header (persists to `localStorage`)
- `.dark` class on `<html>` controls dark mode
- Preact island for the toggle (interactive, client-side only)

### Responsive Breakpoints

- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1023px): Two-column grids
- **Desktop** (>= 1024px): Three-column grids, sidebar layouts

## Plugin Configuration

All 10 built-in plugins enabled in `plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';
import { breadcrumbsPlugin } from '@ever-works/plugin-breadcrumbs';
import { rssPlugin } from '@ever-works/plugin-rss';
import { analyticsPlugin } from '@ever-works/plugin-analytics';
import { relatedItemsPlugin } from '@ever-works/plugin-related-items';

export const plugins = definePlugins([
    seoPlugin(),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
    breadcrumbsPlugin(),
    rssPlugin(),
    relatedItemsPlugin({ maxItems: 4 }),
    analyticsPlugin({
        providers: [{ provider: 'custom', html: '<!-- analytics: demo -->' }],
    }),
]);
```

## Build Verification Steps

1. `pnpm install` — All dependencies resolve
2. `pnpm --filter @ever-works/sample-basic typecheck` — Zero TypeScript errors
3. `pnpm --filter @ever-works/sample-basic build` — Static build succeeds
4. Verify generated pages exist:
   - `dist/index.html` — Home page
   - `dist/item/radix-ui/index.html` — Item detail (one per item)
   - `dist/category/form-components/index.html` — Category listing (one per category)
   - `dist/tag/typescript/index.html` — Tag listing (one per tag)
   - `dist/categories/index.html` — Categories index
   - `dist/tags/index.html` — Tags index
   - `dist/404.html` — Not found page
5. All pages contain valid HTML with proper meta tags
6. Dark mode toggle functions (Preact island hydrates)
7. No console errors in development server

## File Structure

```
apps/sample-basic/
├── .content/
│   ├── config.yml
│   ├── categories.yml
│   ├── tags.yml
│   ├── collections.yml
│   ├── comparisons/
│   ├── pages/
│   └── data/
│       ├── radix-ui/
│       │   └── radix-ui.yml
│       ├── headless-ui/
│       │   └── headless-ui.yml
│       ├── react-aria/
│       │   └── react-aria.yml
│       ├── shadcn-ui/
│       │   └── shadcn-ui.yml
│       ├── chakra-ui/
│       │   └── chakra-ui.yml
│       ├── ant-design/
│       │   └── ant-design.yml
│       ├── material-ui/
│       │   └── material-ui.yml
│       ├── mantine/
│       │   └── mantine.yml
│       ├── framer-motion/
│       │   └── framer-motion.yml
│       ├── tanstack-table/
│       │   └── tanstack-table.yml
│       ├── react-hook-form/
│       │   └── react-hook-form.yml
│       └── react-spring/
│           └── react-spring.yml
├── scripts/
│   └── clone-content.ts
├── src/
│   ├── components/
│   │   ├── BreadcrumbNav.astro   — Breadcrumb navigation component
│   │   └── ItemBrowser.tsx       — Interactive item browsing component
│   ├── layouts/
│   │   └── BaseLayout.astro      — Styled root layout (header, footer, theme)
│   ├── lib/
│   │   ├── content.ts            — Content loading (same as web app)
│   │   └── plugins.config.ts     — Plugin configuration
│   ├── pages/
│   │   ├── index.astro           — Home (hero, search, categories, featured)
│   │   ├── categories.astro      — Categories index
│   │   ├── collections.astro     — Collections index
│   │   ├── comparisons.astro     — Comparisons index
│   │   ├── tags.astro            — Tags index
│   │   ├── 404.astro             — Not found
│   │   ├── atom.xml.ts           — Atom feed
│   │   ├── robots.txt.ts         — robots.txt generation
│   │   ├── rss.xml.ts            — RSS feed
│   │   ├── item/
│   │   │   └── [slug].astro      — Item detail
│   │   ├── category/
│   │   │   └── [slug].astro      — Category listing
│   │   ├── collection/
│   │   │   └── [slug].astro      — Collection detail
│   │   ├── comparison/
│   │   │   └── [slug].astro      — Comparison detail
│   │   ├── pages/
│   │   │   └── [slug].astro      — Static pages
│   │   ├── tag/
│   │   │   └── [slug].astro      — Tag listing
│   │   └── page/
│   │       └── [page].astro      — Paginated listing
│   └── styles/
│       └── global.css            — Tailwind v4 config + design tokens
├── astro.config.ts
├── package.json
└── tsconfig.json
```

## Dependencies

### Runtime
- `astro` ^6.1.7
- `@astrojs/preact` ^5.1.1
- `@astrojs/sitemap` ^3.7.2
- `@tailwindcss/vite` ^4.2.2
- `tailwindcss` ^4.2.2
- `preact` ^10.29.1
- `yaml` ^2.8.3
- `@ever-works/core` workspace:*
- `@ever-works/plugins` workspace:*
- `@ever-works/adapters` workspace:*
- `@ever-works/astro-integration` workspace:*
- `@ever-works/ui` workspace:*
- `@ever-works/plugin-seo` workspace:*
- `@ever-works/plugin-pagination` workspace:*
- `@ever-works/plugin-filters` workspace:*
- `@ever-works/plugin-search` workspace:*
- `@ever-works/plugin-sort` workspace:*
- `@ever-works/plugin-sitemap` workspace:*
- `@ever-works/plugin-breadcrumbs` workspace:*
- `@ever-works/plugin-rss` workspace:*
- `@ever-works/plugin-analytics` workspace:*
- `@ever-works/plugin-related-items` workspace:*

### Dev
- `@ever-works/tsconfig` workspace:*
- `@astrojs/check` ^0.9.8
- `pagefind` ^1.5.2
- `typescript` ^6.0.3

## Technical Notes

- The sample uses the same `content.ts` and `plugins.config.ts` pattern as `apps/web/`
- Styling is applied directly in `.astro` files via Tailwind utility classes — no shared component styles
- The `ThemeToggle.tsx` is a Preact island (`client:load`) for client-side interactivity
- The `.content/` directory is checked into the sample app (not cloned from a remote repo) so it works without environment variables
- `clone-content.ts` is still included for consistency but `.content/` already exists, so it is a no-op
