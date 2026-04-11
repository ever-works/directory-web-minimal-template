/**
 * Pure utility for sorting directory items.
 *
 * Returns a new sorted array — the input is never mutated.
 */

import type { ItemData } from '@ever-works/core';
import type { SortField, SortDirection } from './types';

/**
 * Sort items by the given field and direction.
 *
 * - `'name'`: alphabetical sort (locale-aware)
 * - `'updated_at'`: date sort (newest or oldest first)
 * - `'featured'`: featured items first, then alphabetical by name
 *
 * @param items     - The items to sort.
 * @param field     - Which field to sort by.
 * @param direction - `'asc'` for ascending, `'desc'` for descending.
 * @returns A new sorted array. The original array is not mutated.
 */
export function sortItems(
    items: ItemData[],
    field: SortField,
    direction: SortDirection,
): ItemData[] {
    const sorted = [...items];
    const dirMultiplier = direction === 'asc' ? 1 : -1;

    switch (field) {
        case 'name':
            sorted.sort(
                (a, b) => a.name.localeCompare(b.name) * dirMultiplier,
            );
            break;

        case 'updated_at':
            sorted.sort((a, b) => {
                const dateA = new Date(a.updated_at).getTime();
                const dateB = new Date(b.updated_at).getTime();
                return (dateA - dateB) * dirMultiplier;
            });
            break;

        case 'featured':
            sorted.sort((a, b) => {
                const featA = a.featured === true ? 1 : 0;
                const featB = b.featured === true ? 1 : 0;

                // Featured items first when ascending, last when descending
                if (featA !== featB) {
                    return (featB - featA) * dirMultiplier;
                }

                // Within the same featured group, sort alphabetically by name
                return a.name.localeCompare(b.name);
            });
            break;

        default: {
            // Exhaustive check — ensures all SortField values are handled
            const _exhaustive: never = field;
            throw new Error(`Unknown sort field: ${String(_exhaustive)}`);
        }
    }

    return sorted;
}
