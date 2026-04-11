/**
 * Pure utility for filtering directory items.
 */

import type { ItemData } from '@ever-works/core';
import type { ActiveFilters } from './types';

/**
 * Normalize an item's category field to an array.
 * Handles both single string and string[] values.
 */
function normalizeCategories(category: string | string[]): string[] {
    return Array.isArray(category) ? category : [category];
}

/**
 * Filter items by active filters (category, tag, search).
 *
 * - Category and tag filters use **OR** logic within their group.
 * - All filter groups use **AND** logic between them.
 * - Search matches against item name or description (case-insensitive).
 *
 * @param items - The full list of items to filter
 * @param filters - Currently active filter state
 * @returns Items that match all active filter groups
 *
 * @example
 * ```typescript
 * const visible = filterItems(allItems, {
 *     categories: ['tools'],
 *     tags: ['open-source'],
 *     search: 'deploy',
 * });
 * ```
 */
export function filterItems(items: readonly ItemData[], filters: ActiveFilters): ItemData[] {
    let result: ItemData[] = [...items];

    // Category filter (OR within group)
    if (filters.categories.length > 0) {
        const selected = new Set(filters.categories);
        result = result.filter((item) => {
            const itemCategories = normalizeCategories(item.category);
            return itemCategories.some((cat) => selected.has(cat));
        });
    }

    // Tag filter (OR within group)
    if (filters.tags.length > 0) {
        const selected = new Set(filters.tags);
        result = result.filter((item) =>
            item.tags.some((tag) => selected.has(tag))
        );
    }

    // Search filter (name or description, case-insensitive)
    if (filters.search.trim() !== '') {
        const query = filters.search.trim().toLowerCase();
        result = result.filter((item) => {
            const name = item.name.toLowerCase();
            const description = item.description.toLowerCase();
            return name.includes(query) || description.includes(query);
        });
    }

    return result;
}
