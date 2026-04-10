/**
 * @ever-works/plugin-sort
 *
 * Sort plugin for the Ever Works minimal directory template.
 * Provides configurable item sorting by name, date, or featured status.
 *
 * @example
 * ```typescript
 * import { sortPlugin } from '@ever-works/plugin-sort';
 * import type { SortField, SortDirection } from '@ever-works/plugin-sort';
 * ```
 */

export { sortPlugin } from './plugin.js';
export { sortItems } from './sort-items.js';
export type {
    SortField,
    SortDirection,
    SortPluginOptions,
    ResolvedSortConfig,
} from './types.js';
