---
title: "Data Layer"
sidebar_label: "Data Layer"
---

# Data Layer Architecture

## Overview

The data layer is the foundation of the template. It reads structured data from Git-backed repositories and exposes it as typed TypeScript objects to the rest of the system.

## Architecture

```
┌──────────────────────────────────────────┐
│           Content Reader API             │
│  loadItems() · loadCategories() · ...    │
├──────────────────────────────────────────┤
│            YAML Parser                    │
│  Parses .yml files → typed objects       │
├──────────────────────────────────────────┤
│          File System Reader               │
│  Reads from .content/ directory          │
├──────────────────────────────────────────┤
│         Data Source Adapter               │
│  GitAdapter · FilesystemAdapter          │
├──────────────────────────────────────────┤
│        .content/ (cloned repo)           │
│  config.yml · data/ · categories.yml     │
└──────────────────────────────────────────┘
```

## Content Repository Structure

The `.content/` directory follows the same structure as the full Next.js template:

```
.content/
├── config.yml                    # Site-wide configuration
├── categories.yml                # Category definitions (flat YAML array)
│   OR categories/
│       └── categories.yml
├── tags.yml                      # Tag definitions (flat YAML array)
├── collections.yml               # Collection definitions
├── data/                         # Item data directory
│   ├── <item-slug>/
│   │   ├── <item-slug>.yml       # Item data (primary)
│   │   └── <item-slug>.<lang>.yml # i18n overlay (future)
│   └── ...
├── comparisons/                  # Comparison data
│   ├── <comparison-slug>/
│   │   ├── <comparison-slug>.yml # Comparison metadata
│   │   └── <comparison-slug>.md  # Comparison content
│   └── ...
└── pages/                        # Static pages (Markdown/MDX)
    └── ...
```

## Data Types

### ItemData

```typescript
/** A single directory item, parsed from .content/data/<slug>/<slug>.yml */
interface ItemData {
    /** Unique identifier, derived from directory name */
    id: string;
    /** Display name */
    name: string;
    /** URL-safe slug, same as directory name */
    slug: string;
    /** Short description */
    description: string;
    /** External URL for the item */
    source_url: string;
    /** Category ID(s) this item belongs to */
    category: string | string[];
    /** Tag IDs associated with this item */
    tags: string[];
    /** Collection IDs this item belongs to */
    collections?: string[];
    /** Whether this item is featured */
    featured?: boolean;
    /** URL to item's icon/logo */
    icon_url?: string;
    /** Brand name associated with the item */
    brand?: string;
    /** URL to the brand's logo image */
    brand_logo_url?: string;
    /** Array of screenshot/image URLs */
    images?: string[];
    /** Publisher name for display */
    publisher?: string;
    /** Last update timestamp (yyyy-MM-dd HH:mm format) */
    updated_at: string;
    /** Approval status */
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    /** Markdown content body */
    markdown?: string;
    /** All other fields are passed through as-is */
    [key: string]: unknown;
}
```

### CategoryData

```typescript
/** A category definition from categories.yml */
interface CategoryData {
    /** Unique identifier (slug-style) */
    id: string;
    /** Display name */
    name: string;
    /** Optional icon URL */
    icon_url?: string;
    /** Optional image URL */
    image_url?: string;
}

/** Category with computed item count */
interface CategoryWithCount extends CategoryData {
    count: number;
}
```

### TagData

```typescript
/** A tag definition from tags.yml */
interface TagData {
    /** Unique identifier */
    id: string;
    /** Display name */
    name: string;
    /** Whether this tag is active */
    isActive?: boolean;
}

/** Tag with computed item count */
interface TagWithCount extends TagData {
    count: number;
}
```

### CollectionData

```typescript
/** A collection definition from collections.yml */
interface CollectionData {
    /** Unique identifier */
    id: string;
    /** URL-safe slug */
    slug: string;
    /** Display name */
    name: string;
    /** Description text */
    description: string;
    /** Optional icon URL */
    icon_url?: string;
    /** Item slugs in this collection */
    items?: string[];
    /** Number of items in this collection (from YAML or computed) */
    item_count?: number;
    /** Whether collection is active */
    isActive?: boolean;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
}
```

### PageData

```typescript
/** A static page parsed from .content/pages/<slug>.md */
interface PageData {
    /** URL-safe slug derived from filename */
    slug: string;
    /** Page title from frontmatter */
    title: string;
    /** Page description from frontmatter */
    description?: string;
    /** Raw markdown content (body after frontmatter) */
    content: string;
    /** Pass-through for additional frontmatter fields */
    [key: string]: unknown;
}
```

### ComparisonData

```typescript
/** A comparison between two items */
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
    /** Source URLs referenced in the comparison */
    sources?: string[];
    /** Long-form markdown content (from companion .md file) */
    content?: string;
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

### SiteConfig

```typescript
/** Site configuration from config.yml */
interface SiteConfig {
    company_name: string;
    item_name: string;
    items_name: string;
    copyright_year: number;
    app_url?: string;
    logo?: LogoConfig;
    pagination?: PaginationConfig;
    settings?: SettingsConfig;
    custom_header?: NavLinkItem[];
    custom_footer?: NavLinkItem[];
    homepage?: HomepageConfig;
    [key: string]: unknown;
}

interface LogoConfig {
    logo_image?: string;
    logo_image_dark?: string;
    favicon?: string;
}

interface PaginationConfig {
    type: 'standard' | 'infinite';
    itemsPerPage: number;
}

interface SettingsConfig {
    categories_enabled?: boolean;
    tags_enabled?: boolean;
    collections_enabled?: boolean;
    comparisons_enabled?: boolean;
    featured_enabled?: boolean;
}
```

## Content Reader API

The `@ever-works/core` package exposes these functions:

```typescript
/** Load site configuration */
function loadConfig(adapter: DataAdapter): Promise<SiteConfig>;

/** Load all approved items */
function loadItems(adapter: DataAdapter): Promise<ItemData[]>;

/** Load a single item by slug */
function loadItem(adapter: DataAdapter, slug: string): Promise<ItemData | null>;

/** Load all categories */
function loadCategories(adapter: DataAdapter): Promise<CategoryData[]>;

/** Load all tags */
function loadTags(adapter: DataAdapter): Promise<TagData[]>;

/** Load all collections */
function loadCollections(adapter: DataAdapter): Promise<CollectionData[]>;

/** Load all comparisons */
function loadComparisons(adapter: DataAdapter): Promise<ComparisonData[]>;

/** Load a single comparison by slug */
function loadComparison(adapter: DataAdapter, slug: string): Promise<ComparisonData | null>;

/** Load all static pages */
function loadPages(adapter: DataAdapter): Promise<PageData[]>;

/** Load a single page by slug */
function loadPage(adapter: DataAdapter, slug: string): Promise<PageData | null>;
```

Note: The `loadContent()` utility in `apps/web/src/lib/content.ts` composes these loaders together and computes `CategoryWithCount[]` / `TagWithCount[]` with item counts.

## Adapter Interface

Data source adapters implement this interface:

```typescript
interface DataAdapter {
    /** Unique adapter identifier */
    readonly id: string;

    /** Human-readable name */
    readonly name: string;

    /** Initialize the data source (e.g., clone repo) */
    init(config: AdapterConfig): Promise<void>;

    /** Read a single file's contents */
    readFile(path: string): Promise<string>;

    /** List files in a directory */
    listFiles(dir: string): Promise<string[]>;

    /** List immediate subdirectories in a directory */
    listDirectories(dir: string): Promise<string[]>;

    /** Check if a path exists */
    exists(path: string): Promise<boolean>;

    /** Get the resolved content root path */
    getContentPath(): string;

    /** Pull latest changes from remote. Returns true if content changed. */
    refresh(): Promise<boolean>;

    /** Get current HEAD ref for change detection (commit SHA or mtime hash) */
    getHeadRef(): Promise<string | null>;
}

interface AdapterConfig {
    /** Content repository URL (for git adapter) */
    repository?: string;
    /** Auth token (for git adapter) */
    token?: string;
    /** Branch name (for git adapter, default: 'main') */
    branch?: string;
    /** Local filesystem path (for filesystem adapter) */
    localPath?: string;
    /** Clone depth for git (default: 1 for shallow clone) */
    cloneDepth?: number;
    /** Additional adapter-specific options */
    [key: string]: unknown;
}
```

### Built-in Adapters

1. **GitAdapter** — Clones a git repository at build time
   - Uses `isomorphic-git` (pure JS, no git binary required)
   - Shallow clone (depth 1) into `.content/` directory
   - Requires `DATA_REPOSITORY` env var

2. **FilesystemAdapter** — Reads from a local directory
   - For development: point to a local content directory
   - No git operations needed
   - Requires `CONTENT_PATH` env var

## Build-Time Data Loading

All data is loaded at build time in Astro:

```typescript
// In an Astro page or component:
import { loadItems, loadConfig } from '@ever-works/core';

const contentPath = import.meta.env.CONTENT_PATH || '.content';
const config = await loadConfig(contentPath);
const { items, categories, tags } = await loadItems(contentPath);
```

There is NO runtime data fetching. All content is baked into the static HTML at build time. Content changes require a rebuild and redeploy.
