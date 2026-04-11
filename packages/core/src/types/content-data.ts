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
}
