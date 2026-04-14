/**
 * Client-safe item sorting by SortOption string.
 *
 * This is the canonical sort implementation for Preact interactive components.
 * Avoids duplicating the same logic in every sample app's ItemBrowser.
 *
 * Uses the same sort logic as @ever-works/plugin-sort but accepts a
 * combined SortOption ('name-asc', 'date-desc', 'featured') instead
 * of separate (field, direction) params — matching the UI component API.
 */

import type { SortOption } from '../types.js';

/** Minimal shape required for sorting — compatible with ItemData and BrowserItem. */
export interface Sortable {
    name: string;
    updated_at: string;
    featured?: boolean;
}

/**
 * Sort items by a SortOption string.
 *
 * Generic over any type with { name, updated_at, featured? } — works with
 * both `ItemData` from core and `BrowserItem` from sample apps.
 *
 * @param items - Items to sort (not mutated).
 * @param sort  - One of 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'featured'.
 * @returns A new sorted array.
 */
export function sortItemsByOption<T extends Sortable>(items: T[], sort: SortOption): T[] {
    const sorted = [...items];

    switch (sort) {
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'date-asc':
            return sorted.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
        case 'date-desc':
            return sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
        case 'featured':
        default:
            return sorted.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.name.localeCompare(b.name);
            });
    }
}
