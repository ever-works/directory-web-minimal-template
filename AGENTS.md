# AI Agent Instructions — Ever Works Minimal Directory Template

> This file is the primary instruction set for all AI agents working on this codebase.
> Read CLAUDE.md first for project overview, then follow these rules.

## Mandatory Rules

Every document, specification, code file, and decision MUST comply with these rules. Cross-check before creating anything:

### R1: TypeScript Only
- All source code must be TypeScript (`.ts`, `.tsx`, `.astro`)
- No JavaScript (`.js`, `.jsx`), Python, or any other language for source files
- Config files (`.json`, `.yaml`, `.toml`) are acceptable

### R2: Plugin Architecture
- Almost every feature MUST be a plugin
- Almost every UI feature MUST be a plugin
- Core should contain only the absolute minimum: data loading, type definitions, plugin system
- Plugins live in `packages/` as separate packages
- Plugins can be enabled/disabled/replaced independently
- Default plugins ship with the template; users can swap them

### R3: Git-First Data
- Default data storage is Git repositories (YAML files)
- No database by default (plugins may add DB support later)
- No custom storage backends by default
- Data repo structure must match the full Next.js template's `.content/` format

### R4: No Advanced Features
- No authentication / user accounts
- No payments / billing / subscriptions
- No geo / maps / location services
- No CRM integration
- No analytics (can be added as plugin later)
- No i18n (can be added as plugin later)
- No rich text editor

### R5: ISR by Default, Static Opt-Out
- Default: `output: 'static'` with Vercel adapter conditionally added for ISR
- All pages pre-rendered at build time; ISR handles on-demand regeneration when content changes
- Opt-out: Set `ENABLE_ISR=false` for pure static output (`output: 'static'`)
- No client-side data fetching for core content (hydration for interactions only)

### R6: Extreme Performance
- Zero unnecessary JavaScript in output
- Astro islands architecture — hydrate only what needs interactivity
- Minimal CSS — headless components, AI applies styling
- No large runtime dependencies (no React Query, no Zustand, etc.)
- Prefer Astro's built-in features over external libraries

### R7: Modular & Replaceable
- Every component, adapter, plugin can be swapped
- Use dependency injection / configuration over hard-coded imports
- Adapter pattern for all external integrations
- Clear interfaces/contracts between modules

### R8: AI-Optimized Codebase
- Explicit file naming — no abbreviations
- Inline JSDoc comments on all public APIs
- Data contracts documented with TypeScript interfaces
- Extension points clearly marked with comments
- `AGENTS.md` and `CLAUDE.md` always up to date

### R9: Documentation First
- Do NOT implement code without a spec/plan in `.specify/` or `docs/`
- Every feature needs a written spec before implementation
- Update `docs/index.md` when adding docs
- Update `docs/log.md` when making changes
- Add questions to `docs/questions.md` — pick a default, note alternatives

### R10: Use Existing Libraries
- Prefer popular, well-maintained packages over custom implementations
- Do NOT build what already exists as a popular package
- Exception: if the existing package is too heavy or doesn't fit the plugin architecture

### R11: Do Not Remove, Only Improve
- Never delete existing code/docs without moving or improving
- Refactoring and reorganization is fine
- If something seems wrong, improve it — don't delete it

### R12: Monorepo Structure
- This is a pnpm workspaces + Turborepo monorepo
- Apps live in `apps/` — each is a deployable application
- Packages live in `packages/` — shared libraries, plugins, adapters, UI
- Everything that can be a package SHOULD be a package
- Keep packages small and focused (single responsibility)

### R13: Exhaustive Documentation
- Be exhaustive in documentation — do NOT summarize
- All specs, plans, architecture docs must be thorough enough for AI agents to work autonomously
- If something is not clear or has multiple options, add it to `docs/questions.md`
- Every new package/feature gets JSDoc on all public exports

### R14: Convention Over Configuration
- Good defaults for everything
- Users can override via config when needed

### R15: Specification First
- Always write specs and documentation BEFORE implementation code
- Every feature must have a `.specify/features/<name>.md` spec before coding starts
- Architecture decisions documented in `docs/architecture/` before building
- Guides written in `docs/guides/` alongside or before implementation
- If a question arises during spec writing, add it to `docs/questions.md` with a `[DEFAULT]` choice
- Cross-check: no PR / commit should introduce code without a matching spec
- Prefer conventions that reduce boilerplate

## Working Process

### Before Starting Any Task
1. Check current state: read `docs/log.md` for recent changes
2. Check specs: read relevant `.specify/` specs
3. Check questions: read `docs/questions.md` for open decisions
4. Check rules: verify task aligns with R1-R15 above

### When Creating New Features
1. Write spec in `.specify/` folder first
2. Document plan in `docs/plans/`
3. Add any questions to `docs/questions.md`
4. Implement as a plugin (R2) unless it's truly core
5. Add TypeScript types and JSDoc comments
6. Update `docs/index.md` and `docs/log.md`

### When Uncertain
1. Add question to `docs/questions.md` with options
2. Select a reasonable default (mark it as `[DEFAULT]`)
3. Proceed with the default choice
4. Owner will review and adjust later

## File Structure Conventions

```
packages/<name>/
├── src/
│   ├── index.ts          — Public API (barrel export)
│   ├── types.ts          — TypeScript interfaces
│   └── ...               — Implementation files
├── package.json
├── tsconfig.json
└── README.md
```

```
apps/web/
├── src/
│   ├── layouts/          — Page layouts
│   ├── pages/            — Astro pages (file-based routing)
│   ├── styles/           — Global styles (minimal)
│   └── lib/              — App-specific utilities
├── public/               — Static assets
├── astro.config.ts
├── package.json
└── tsconfig.json
```

## Data Contracts

### Item (from `.content/data/<slug>/<slug>.yml`)
```typescript
interface ItemData {
    id: string;
    name: string;
    slug: string;
    description: string;
    source_url: string;
    category: string | string[];
    tags: string[];
    collections?: string[];
    featured?: boolean;
    icon_url?: string;
    brand?: string;
    brand_logo_url?: string;
    images?: string[];
    publisher?: string;
    updated_at: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    markdown?: string;
    meta?: Record<string, unknown>; // domain-specific metadata (jobs, events, real-estate)
    [key: string]: unknown; // pass-through for additional YAML fields
}
```

### Category (from `.content/categories.yml`)
```typescript
interface CategoryData {
    id: string;
    name: string;
    icon_url?: string;
    image_url?: string;
}
```

### Tag (from `.content/tags.yml`)
```typescript
interface TagData {
    id: string;
    name: string;
    isActive?: boolean;
}
```

### Collection (from `.content/collections.yml`)
```typescript
interface CollectionData {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon_url?: string;
    items?: string[];
    item_count?: number;
    isActive?: boolean;
    created_at?: string;
    updated_at?: string;
}
```

### Comparison (from `.content/comparisons/<slug>/<slug>.yml`)
```typescript
interface ComparisonData {
    id: string;
    slug: string;
    title: string;
    item_a_slug: string;
    item_b_slug: string;
    item_a_name: string;
    item_b_name: string;
    category?: string;
    summary?: string;
    verdict?: string;
    verdict_winner?: 'item_a' | 'item_b' | 'tie';
    dimensions?: ComparisonDimension[];
    generated_at?: string;
    sources?: string[];
    content?: string; // from companion .md file
}

interface ComparisonDimension {
    name: string;
    item_a_summary?: string;
    item_b_summary?: string;
    item_a_score?: number;
    item_b_score?: number;
    winner?: 'item_a' | 'item_b' | 'tie';
}
```

### Page (from `.content/pages/<slug>.md`)
```typescript
interface PageData {
    slug: string;
    title: string;
    description?: string;
    content: string; // markdown body
    [key: string]: unknown; // additional frontmatter fields
}
```

### Config (from `.content/config.yml`)
```typescript
interface NavLinkItem {
    label: string;
    href: string;
    external?: boolean;
}

interface HomepageConfig {
    hero_title?: string;
    hero_description?: string;
    search_enabled?: boolean;
    default_view?: 'grid' | 'list';
    default_sort?: 'name-asc' | 'name-desc' | 'date-desc' | 'featured';
}

interface SiteConfig {
    company_name: string;
    item_name: string;
    items_name: string;
    copyright_year: number;
    app_url?: string;
    logo?: {
        logo_image?: string;
        logo_image_dark?: string;
        favicon?: string;
    };
    pagination?: {
        type: 'standard' | 'infinite';
        itemsPerPage: number;
    };
    settings?: {
        categories_enabled?: boolean;
        tags_enabled?: boolean;
        collections_enabled?: boolean;
        comparisons_enabled?: boolean;
        featured_enabled?: boolean;
        [key: string]: unknown;
    };
    custom_header?: NavLinkItem[];
    custom_footer?: NavLinkItem[];
    homepage?: HomepageConfig;
    [key: string]: unknown;
}
```

## Cross-Check Checklist

Before creating or modifying ANY file, verify:

- [ ] TypeScript only? (R1)
- [ ] Is this a plugin or should it be? (R2)
- [ ] Git-first data? No DB? (R3)
- [ ] No advanced features (auth, payments, geo)? (R4)
- [ ] ISR by default, static opt-out? (R5)
- [ ] Performance-optimal? No unnecessary deps? (R6)
- [ ] Modular and replaceable? (R7)
- [ ] Clear naming, JSDoc, data contracts? (R8)
- [ ] Spec/plan exists before implementation? (R9)
- [ ] Using existing popular library if available? (R10)
- [ ] Not removing, only improving? (R11)
- [ ] Proper monorepo structure? (R12)
- [ ] Exhaustive documentation? (R13)
- [ ] Convention over configuration? Good defaults? (R14)
- [ ] Spec/plan written before implementation? (R15)

## Skills for AI Agents

When building a directory website from this template, an AI agent should:

1. **Read the data repo** — Understand what items, categories, tags exist
2. **Choose a layout** — Select from available layout plugins or create custom
3. **Apply styling** — Use Tailwind CSS or custom CSS on headless components
4. **Configure pages** — Set up routes for listings, item details, categories, tags
5. **Add plugins** — Enable search, filtering, comparison, etc.
6. **Build & deploy** — Static build, deploy to Vercel

See `SKILLS.md` for detailed step-by-step guides.

## Available Pages (apps/web)

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.astro` | Home page with hero, categories, item grid |
| `/page/[page]` | `page/[page].astro` | Paginated item listing |
| `/item/[slug]` | `item/[slug].astro` | Item detail page |
| `/categories` | `categories.astro` | Categories index |
| `/category/[slug]` | `category/[slug].astro` | Items by category |
| `/tags` | `tags.astro` | Tags index |
| `/tag/[slug]` | `tag/[slug].astro` | Items by tag |
| `/collections` | `collections.astro` | Collections index |
| `/collection/[slug]` | `collection/[slug].astro` | Items in collection |
| `/comparisons` | `comparisons.astro` | Comparisons index |
| `/comparison/[slug]` | `comparison/[slug].astro` | Comparison detail |
| `/pages/[slug]` | `pages/[slug].astro` | Static content page (from `.content/pages/`) |
| `/rss.xml` | `rss.xml.ts` | RSS 2.0 feed (items) |
| `/atom.xml` | `atom.xml.ts` | Atom 1.0 feed (items) |
| `/robots.txt` | `robots.txt.ts` | robots.txt with sitemap reference |
| `/404` | `404.astro` | Not found page |

## Available UI Components (packages/ui)

### Primitives (inspired by fulldev/ui — `src/primitives/`)
Low-level, styled components inspired by [fulldev/ui](https://github.com/fulldotdev/ui) patterns, implemented locally. These are the building blocks:
- **Badge** — Labels, tags, status indicators (variants: default, secondary, outline, ghost, destructive, link)
- **Button** — Polymorphic button/link (variants: default, outline, secondary, ghost, destructive, link)
- **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction
- **Table** — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- **Avatar** — Avatar, AvatarImage, AvatarFallback
- **Separator** — Horizontal/vertical divider
- **Empty** — Empty, EmptyTitle, EmptyDescription

Import: `import Badge from '@ever-works/ui/primitives/badge/Badge.astro'`

### Directory Wrappers (Astro — `src/astro/`)
Directory-specific components that compose primitive components with domain types:
`ItemCard`, `ItemGrid`, `ItemList`, `ItemDetail`, `CategoryList`, `CategoryBadge`,
`TagList`, `TagBadge`, `CollectionCard`, `ComparisonTable`, `Breadcrumbs`, `Pagination`,
`SiteHeader`, `SiteFooter`, `Hero`, `EmptyState`, `SEO`,
`FeaturedBadge`, `FeaturedSection`, `ItemContent`, `ItemMetadata`, `ItemCTA`,
`ShareButton`, `SimilarItems`

Import: `import ItemCard from '@ever-works/ui/astro/ItemCard.astro'`

### Interactive (Preact islands — `src/preact/`)
`SearchInput`, `FilterBar`, `SortSelect`, `BackToTop`, `ThemeToggle`, `LayoutSwitcher`, `ItemBrowser`, `MobileMenu`

**Usage pattern**: Standalone components (ThemeToggle, BackToTop, MobileMenu) go directly in layouts. Data-driven components (SearchInput, FilterBar, SortSelect) should be composed into a Preact island (e.g., `ItemBrowser.tsx`) that manages client-side filtering state. See `apps/sample-basic/src/components/ItemBrowser.tsx` for a reference implementation and `docs/guides/interactive-components.md` for the full guide.

### Preact Utility Components (shadcn-style — `src/components/ui/`)
Used inside Preact islands (e.g., `ItemBrowser`, `FilterBar`). Not for Astro components — use primitives instead.
`Badge`, `Button`, `Input`, `Label`, `Select`

Import: `import { Button } from '@ever-works/ui/components/ui/button'`

### Utility
- `cn()` from `@ever-works/ui/lib/utils` — Tailwind class merging (clsx + tailwind-merge)

## Available Plugins (packages/plugin-*)

| Plugin | Purpose |
|--------|---------|
| `plugin-seo` | Meta tags, Open Graph, JSON-LD, robots.txt |
| `plugin-pagination` | Paginate item arrays |
| `plugin-filters` | Client-side category/tag filtering |
| `plugin-search` | Static search via Pagefind |
| `plugin-sort` | Sort items by name, date, featured |
| `plugin-sitemap` | XML sitemap generation |
| `plugin-rss` | RSS 2.0 and Atom 1.0 feed generation |
| `plugin-breadcrumbs` | Auto-generate breadcrumb trails for all page types |
| `plugin-analytics` | Privacy-friendly analytics (Plausible, Umami, Fathom, GA4, custom) |
