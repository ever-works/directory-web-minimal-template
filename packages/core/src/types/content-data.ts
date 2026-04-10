/**
 * Complete content data structure.
 * Returned by the content reader and passed through the plugin pipeline.
 */

import type { ItemData } from './item.js';
import type { CategoryWithCount } from './category.js';
import type { TagWithCount } from './tag.js';
import type { CollectionData } from './collection.js';
import type { ComparisonData } from './comparison.js';
import type { SiteConfig } from './config.js';

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

    /** Site configuration */
    config: SiteConfig;

    /** Total number of approved items */
    total: number;
}
