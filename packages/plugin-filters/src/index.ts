/**
 * @ever-works/plugin-filters
 *
 * Client-side filtering plugin for the Ever Works minimal directory template.
 * Provides category, tag, and search filtering with optional URL state sync.
 *
 * @example
 * ```typescript
 * import { filtersPlugin, filterItems, parseFiltersFromUrl } from '@ever-works/plugin-filters';
 * import type { ActiveFilters } from '@ever-works/plugin-filters';
 * ```
 */

export type {
    FiltersPluginOptions,
    FilterType,
    ParamNames,
    ActiveFilters,
} from './types';

export { DEFAULT_PARAM_NAMES } from './types';
export { filtersPlugin } from './plugin';
export { filterItems } from './filter-items';
export { parseFiltersFromUrl, serializeFiltersToUrl } from './url-sync';
