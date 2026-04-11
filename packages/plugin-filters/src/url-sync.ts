/**
 * URL synchronization utilities for filter state.
 *
 * Categories and tags are stored as comma-separated values in URL params.
 */

import type { ActiveFilters, ParamNames } from './types';
import { DEFAULT_PARAM_NAMES } from './types';

/**
 * Resolve partial param names to full required param names.
 */
function resolveParamNames(paramNames?: ParamNames): Required<ParamNames> {
    return {
        category: paramNames?.category ?? DEFAULT_PARAM_NAMES.category,
        tag: paramNames?.tag ?? DEFAULT_PARAM_NAMES.tag,
        search: paramNames?.search ?? DEFAULT_PARAM_NAMES.search,
    };
}

/**
 * Parse a comma-separated URL param into a string array.
 * Returns an empty array for null/empty values.
 */
function parseCommaSeparated(value: string | null): string[] {
    if (value === null || value.trim() === '') {
        return [];
    }
    return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
}

/**
 * Parse URL search params into an {@link ActiveFilters} object.
 *
 * Categories and tags are expected as comma-separated values.
 *
 * @param url - The URL to parse filters from
 * @param paramNames - Custom parameter name mapping (optional)
 * @returns Parsed active filters
 *
 * @example
 * ```typescript
 * const url = new URL('https://example.com?category=tools,apps&q=deploy');
 * const filters = parseFiltersFromUrl(url);
 * // { categories: ['tools', 'apps'], tags: [], search: 'deploy' }
 * ```
 */
export function parseFiltersFromUrl(url: URL, paramNames?: ParamNames): ActiveFilters {
    const names = resolveParamNames(paramNames);

    return {
        categories: parseCommaSeparated(url.searchParams.get(names.category)),
        tags: parseCommaSeparated(url.searchParams.get(names.tag)),
        search: url.searchParams.get(names.search)?.trim() ?? '',
    };
}

/**
 * Serialize an {@link ActiveFilters} object into URL search params.
 *
 * Empty filter groups are omitted from the output.
 * Categories and tags are joined as comma-separated values.
 *
 * @param filters - The active filters to serialize
 * @param paramNames - Custom parameter name mapping (optional)
 * @returns URLSearchParams ready for use in a URL
 *
 * @example
 * ```typescript
 * const params = serializeFiltersToUrl({
 *     categories: ['tools'],
 *     tags: ['open-source', 'free'],
 *     search: '',
 * });
 * // "category=tools&tag=open-source%2Cfree"
 * ```
 */
export function serializeFiltersToUrl(filters: ActiveFilters, paramNames?: ParamNames): URLSearchParams {
    const names = resolveParamNames(paramNames);
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
        params.set(names.category, filters.categories.join(','));
    }

    if (filters.tags.length > 0) {
        params.set(names.tag, filters.tags.join(','));
    }

    if (filters.search.trim() !== '') {
        params.set(names.search, filters.search.trim());
    }

    return params;
}
