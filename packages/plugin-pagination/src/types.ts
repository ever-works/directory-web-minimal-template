/**
 * Type definitions for the pagination plugin.
 *
 * Covers plugin options, the paginate utility result,
 * and Astro `getStaticPaths` entry generation.
 */

/** Configuration options for the pagination plugin */
export interface PaginationPluginOptions {
    /** Items per page (default: 12) */
    itemsPerPage?: number;
    /** Maximum pages to generate (default: unlimited) */
    maxPages?: number;
}

/** Options for the paginate utility function */
export interface PaginateOptions {
    /** Current page number (1-indexed) */
    page: number;
    /** Items per page */
    perPage: number;
}

/** Result of paginating a list */
export interface PaginationResult<T> {
    /** Items on the current page */
    items: T[];
    /** Current page number (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of items */
    totalItems: number;
    /** Whether there is a previous page */
    hasPrev: boolean;
    /** Whether there is a next page */
    hasNext: boolean;
    /** Previous page number (null if first page) */
    prevPage: number | null;
    /** Next page number (null if last page) */
    nextPage: number | null;
}

/** Entry for Astro's getStaticPaths */
export interface PagePathEntry {
    params: { page: string };
    props: { currentPage: number; totalPages: number };
}
