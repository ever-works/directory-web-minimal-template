/**
 * Pure utility functions for pagination.
 *
 * These are framework-agnostic and can be used both
 * inside the plugin pipeline and directly in Astro pages.
 */

import type { PaginateOptions, PaginationResult, PagePathEntry } from './types.js';

/**
 * Slice an array of items for a given page.
 *
 * @typeParam T - The item type.
 * @param items   - The full list of items to paginate.
 * @param options - Page number (1-indexed) and items per page.
 * @returns A {@link PaginationResult} containing the page slice and metadata.
 *
 * @example
 * ```typescript
 * const result = paginate(allItems, { page: 2, perPage: 10 });
 * // result.items   — items 11..20
 * // result.hasNext — true if there are more pages
 * ```
 */
export function paginate<T>(items: readonly T[], options: PaginateOptions): PaginationResult<T> {
    const { page, perPage } = options;

    if (perPage < 1) {
        throw new RangeError('perPage must be at least 1');
    }

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Clamp page to valid range
    const currentPage = Math.max(1, Math.min(page, totalPages));

    const start = (currentPage - 1) * perPage;
    const end = Math.min(start + perPage, totalItems);
    const pageItems = items.slice(start, end);

    return {
        items: pageItems,
        currentPage,
        totalPages,
        totalItems,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
    };
}

/**
 * Generate Astro `getStaticPaths` entries for paginated routes.
 *
 * Page 1 uses param `"1"`, page 2 uses `"2"`, etc.
 *
 * @param total    - Total number of items to paginate across.
 * @param perPage  - Items per page.
 * @param maxPages - Optional cap on the number of pages generated.
 * @returns An array of {@link PagePathEntry} objects for Astro's `getStaticPaths`.
 *
 * @example
 * ```typescript
 * // In an Astro [...page].astro file:
 * export function getStaticPaths() {
 *     return generatePagePaths(items.length, 12);
 * }
 * ```
 */
export function generatePagePaths(
    total: number,
    perPage: number,
    maxPages?: number,
): PagePathEntry[] {
    if (perPage < 1) {
        throw new RangeError('perPage must be at least 1');
    }

    const rawTotalPages = Math.max(1, Math.ceil(total / perPage));
    const totalPages = maxPages !== undefined ? Math.min(rawTotalPages, maxPages) : rawTotalPages;

    const entries: PagePathEntry[] = [];
    for (let i = 1; i <= totalPages; i++) {
        entries.push({
            params: { page: String(i) },
            props: { currentPage: i, totalPages },
        });
    }

    return entries;
}
