/**
 * Complete content data structure.
 * Returned by the content reader and passed through the plugin pipeline.
 */

import type { ItemData } from './item';
import type { CategoryWithCount } from './category';
import type { TagWithCount } from './tag';
import type { CollectionData } from './collection';
import type { ComparisonData } from './comparison';
import type { PageData } from './page';
import type { SiteConfig } from './config';

/**
 * Optional inline Markdown blocks from the data repository's `markdown/` folder.
 * Written by the Ever Works platform into every generated data repository.
 */
export interface MarkdownBlocks {
    /** `markdown/header.md` — directory introduction (H1 + description paragraph) */
    header?: string;

    /** `markdown/footer.md` — legal notice and license text */
    footer?: string;
}

/** The complete loaded content from a data repository */
export interface ContentData {
    /** All approved items with populated relations */
    items: ItemData[];

    /** All categories with item counts */
    categories: CategoryWithCount[];

    /** All active tags with item counts */
    tags: TagWithCount[];

    /** All active collections */
    collections: CollectionData[];

    /** All comparisons */
    comparisons: ComparisonData[];

    /** All static pages from .content/pages/ */
    pages: PageData[];

    /** Site configuration */
    config: SiteConfig;

    /** Total number of approved items */
    total: number;

    /**
     * Inline Markdown blocks (`markdown/header.md`, `markdown/footer.md`).
     * Present only when the data repository ships at least one of them.
     */
    blocks?: MarkdownBlocks;

    /**
     * Plugin-injected breadcrumb map.
     * Populated by `@ever-works/plugin-breadcrumbs` via `onDataLoaded` hook.
     * Maps page pathname → BreadcrumbEntry[].
     */
    _breadcrumbs?: Map<string, Array<{ label: string; href?: string }>>;

    /**
     * Plugin-injected analytics configuration.
     * Populated by `@ever-works/plugin-analytics` via `onDataLoaded` hook.
     * Type: `ResolvedAnalyticsConfig` from `@ever-works/plugin-analytics`.
     */
    _analytics?: unknown;

    /**
     * Plugin-injected related items.
     * Populated by `@ever-works/plugin-related-items` via `onDataLoaded` hook.
     * Each item receives a `_relatedItems` array via index signature.
     */
    _relatedItemsComputed?: boolean;
}
