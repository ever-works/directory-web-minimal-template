/**
 * @ever-works/plugin-pagination
 *
 * Pagination utilities for the Ever Works minimal directory template.
 * Provides a plugin for the build pipeline and pure utility functions
 * for slicing item lists and generating Astro static paths.
 *
 * @example
 * ```typescript
 * import { paginationPlugin, paginate, generatePagePaths } from '@ever-works/plugin-pagination';
 * ```
 */

export { paginationPlugin } from './plugin';
export { paginate, generatePagePaths } from './paginate';
export type {
    PaginationPluginOptions,
    PaginateOptions,
    PaginationResult,
    PagePathEntry,
} from './types';
