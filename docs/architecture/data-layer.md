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
│  fetchItems() · fetchCategories() · ...  │
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
    /** Whether collection is active */
    isActive?: boolean;
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
}
```

## Content Reader API

The `@ever-works/core` package exposes these functions:

```typescript
/** Load site configuration */
function loadConfig(contentPath: string): Promise<SiteConfig>;

/** Load all approved items with category/tag population */
function loadItems(contentPath: string): Promise<{
    items: ItemData[];
    categories: CategoryWithCount[];
    tags: TagWithCount[];
    collections: CollectionData[];
    total: number;
}>;

/** Load a single item by slug */
function loadItem(contentPath: string, slug: string): Promise<ItemData | null>;

/** Load all categories */
function loadCategories(contentPath: string): Promise<CategoryData[]>;

/** Load all tags */
function loadTags(contentPath: string): Promise<TagData[]>;

/** Load all collections */
function loadCollections(contentPath: string): Promise<CollectionData[]>;

/** Load all comparisons */
function loadComparisons(contentPath: string): Promise<ComparisonData[]>;

/** Load a single comparison by slug */
function loadComparison(contentPath: string, slug: string): Promise<ComparisonData | null>;
```

## Adapter Interface

Data source adapters implement this interface:

```typescript
interface DataAdapter {
    /** Unique adapter identifier */
    readonly id: string;

    /** Initialize the data source (e.g., clone repo) */
    init(config: AdapterConfig): Promise<void>;

    /** Read a single file's contents */
    readFile(path: string): Promise<string>;

    /** List files in a directory */
    listFiles(dir: string): Promise<string[]>;

    /** Check if a path exists */
    exists(path: string): Promise<boolean>;

    /** Get the resolved content root path */
    getContentPath(): string;
}

interface AdapterConfig {
    /** Content repository URL (for git adapter) */
    repository?: string;
    /** Auth token (for git adapter) */
    token?: string;
    /** Branch name (for git adapter) */
    branch?: string;
    /** Local filesystem path (for filesystem adapter) */
    localPath?: string;
}
```

### Built-in Adapters

1. **GitAdapter** — Clones a git repository at build time
   - Uses `git clone --depth 1` for speed
   - Clones into `.content/` directory
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
