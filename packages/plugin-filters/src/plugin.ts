/**
 * Filters plugin factory.
 *
 * Creates a plugin that provides client-side filtering capabilities
 * for directory items by category, tag, and search query.
 */

import type { Plugin } from '@ever-works/plugins';
import type { FiltersPluginOptions, FilterType } from './types';

/** All available filter types */
const ALL_FILTER_TYPES: FilterType[] = ['category', 'tag', 'search'];

/**
 * Create a filters plugin instance.
 *
 * @param options - Plugin configuration options
 * @returns A configured filters plugin
 *
 * @example
 * ```typescript
 * import { filtersPlugin } from '@ever-works/plugin-filters';
 *
 * filtersPlugin({ enabledFilters: ['category', 'search'] });
 * ```
 */
export function filtersPlugin(options: FiltersPluginOptions = {}): Plugin {
    const enabledFilters = options.enabledFilters ?? ALL_FILTER_TYPES;

    return {
        id: 'filters',
        name: 'Filters Plugin',
        version: '0.1.0',
        description: 'Client-side filtering by category, tag, and search query with optional URL sync.',

        hooks: {
            async onInit(context) {
                context.log.info(
                    `Initialized with filters: [${enabledFilters.join(', ')}], URL sync: ${String(options.urlSync ?? true)}`
                );
            },
        },
    };
}
