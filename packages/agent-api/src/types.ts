/**
 * Agent Access Contract v1 — public JSON shapes.
 *
 * These interfaces are the wire contract shared by the minimal (Astro) and full (Next.js) Ever Works templates.
 * See `.specify/features/agent-access.md`. Changing a field is a breaking change for every agent that reads an
 * Ever Works directory; add fields instead of renaming them.
 */

/** Directory-level metadata (`/data/directory.json`, MCP `get_directory_info`). */
export interface DirectoryInfo {
    version: 1;
    /** Directory name (`company_name`) */
    name: string;
    /** One-paragraph description of the directory */
    description: string;
    /** Absolute site URL (no trailing slash) */
    url: string;
    /** Singular noun for items, e.g. "Tool" */
    item_name: string;
    /** Plural noun for items, e.g. "Tools" */
    items_name: string;
    counts: { items: number; categories: number; tags: number; collections: number; comparisons: number };
    /** Newest item `updated_at`, or null */
    updated_at: string | null;
    /** Public Git URL of the data repository when known */
    data_repository: string | null;
    /** Absolute URL of the "submit an item" page, when enabled */
    submit_url: string | null;
    endpoints: {
        items: string;
        /** Item endpoint template containing `{slug}` */
        item: string;
        categories: string;
        tags: string;
        openapi: string;
        llms: string;
        llms_full: string;
        sitemap: string;
        /** MCP endpoint, or null when the host cannot run it */
        mcp: string | null;
    };
    generator: 'ever-works-minimal' | 'ever-works';
}

/** Item as listed by `/data/items.json`, `search_items` and `list_items`. */
export interface ItemSummary {
    slug: string;
    name: string;
    description: string;
    /** Absolute URL of the item page on this directory */
    url: string;
    /** The item's own website (`source_url`) */
    website: string | null;
    /** Category display names */
    categories: string[];
    /** Category ids (from categories.yml; slugified when unknown) */
    category_ids: string[];
    /** Tag display names */
    tags: string[];
    tag_ids: string[];
    featured: boolean;
    /** `icon_url`, else `brand_logo_url` */
    logo: string | null;
    updated_at: string | null;
}

/** Full item (`/data/items/{slug}.json`, MCP `get_item`). */
export interface ItemDetail extends ItemSummary {
    /** Raw Markdown body */
    markdown: string | null;
    /** Absolute URL of the item's Markdown twin */
    markdown_url: string;
    images: string[];
    brand: string | null;
    publisher: string | null;
    /** Slugs of similar items */
    related: string[];
}

/** Category entry (`/data/categories.json`, MCP `list_categories`). */
export interface CategoryEntry {
    id: string;
    name: string;
    description: string | null;
    count: number;
    /** Absolute URL of the category page */
    url: string;
}

/** Tag entry (`/data/tags.json`, MCP `list_tags`). */
export interface TagEntry {
    id: string;
    name: string;
    count: number;
    /** Absolute URL of the tag page */
    url: string;
}

/** Envelope of `/data/items.json`. */
export interface ItemsDocument {
    version: 1;
    total: number;
    items: ItemSummary[];
}

/** Envelope of `/data/categories.json`. */
export interface CategoriesDocument {
    version: 1;
    total: number;
    categories: CategoryEntry[];
}

/** Envelope of `/data/tags.json`. */
export interface TagsDocument {
    version: 1;
    total: number;
    tags: TagEntry[];
}

/**
 * Everything the MCP handler needs. Built in-process (Astro) or assembled from the static `/data/*.json` files
 * (Cloudflare Worker). `getItem` is async so large Markdown bodies are only loaded on demand.
 */
export interface AgentDataset {
    directory: DirectoryInfo;
    items: ItemSummary[];
    categories: CategoryEntry[];
    tags: TagEntry[];
    getItem(slug: string): Promise<ItemDetail | null>;
}

/**
 * Compact search index for the browser (`/data/search-index.json`). Not part of the public contract — short keys keep
 * it small (~70 bytes per item after compression).
 */
export interface SearchIndex {
    v: 1;
    /** Categories as `[id, name]` */
    c: Array<[string, string]>;
    /** Tags as `[id, name]` */
    t: Array<[string, string]>;
    /** Items */
    i: SearchIndexItem[];
}

/** One item in the compact search index. */
export interface SearchIndexItem {
    /** slug */
    s: string;
    /** name */
    n: string;
    /** description, truncated */
    d: string;
    /** category indexes into `SearchIndex.c` */
    c: number[];
    /** tag indexes into `SearchIndex.t` */
    t: number[];
    /** featured flag (present only when true) */
    f?: 1;
    /** logo URL */
    l?: string;
    /** website URL */
    w?: string;
    /** updated date `YYYY-MM-DD` */
    u?: string;
}
