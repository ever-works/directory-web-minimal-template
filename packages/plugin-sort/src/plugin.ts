/**
 * Sort plugin factory.
 *
 * Creates a {@link Plugin} that sorts directory items during the build pipeline.
 * The sort is applied in the `onDataLoaded` hook so downstream plugins and
 * page generation receive items in the configured order.
 */

import type { Plugin } from '@ever-works/plugins';
import type { SortPluginOptions, ResolvedSortConfig } from './types.js';
import { sortItems } from './sort-items.js';

/** All available sort fields */
const ALL_SORT_OPTIONS: ResolvedSortConfig['sortOptions'] = [
    'name',
    'updated_at',
    'featured',
];

/**
 * Resolve user-supplied options into a fully populated config.
 *
 * @param options - Partial options from the consumer.
 * @returns Resolved config with defaults applied.
 */
function resolveConfig(options: SortPluginOptions): ResolvedSortConfig {
    return {
        defaultSort: options.defaultSort ?? 'name',
        defaultDirection: options.defaultDirection ?? 'asc',
        sortOptions: options.sortOptions ?? ALL_SORT_OPTIONS,
    };
}

/**
 * Create a sort plugin instance.
 *
 * @param options - Optional configuration for default sort behaviour.
 * @returns A {@link Plugin} that sorts items in `onDataLoaded`.
 *
 * @example
 * ```typescript
 * import { definePlugins } from '@ever-works/plugins';
 * import { sortPlugin } from '@ever-works/plugin-sort';
 *
 * export default definePlugins([
 *     sortPlugin({ defaultSort: 'updated_at', defaultDirection: 'desc' }),
 * ]);
 * ```
 */
export function sortPlugin(options: SortPluginOptions = {}): Plugin {
    const config = resolveConfig(options);

    return {
        id: 'sort',
        name: 'Sort Plugin',
        version: '0.1.0',
        description:
            'Sorts directory items by name, date, or featured status.',

        hooks: {
            async onInit({ log }) {
                log.info(
                    `Initialized — default sort: ${config.defaultSort} (${config.defaultDirection})`,
                );
                log.debug(
                    `Available sort options: ${config.sortOptions.join(', ')}`,
                );
            },

            async onDataLoaded(data, { log }) {
                const sorted = sortItems(
                    data.items,
                    config.defaultSort,
                    config.defaultDirection,
                );

                log.info(
                    `Sorted ${sorted.length} items by ${config.defaultSort} (${config.defaultDirection})`,
                );

                return { ...data, items: sorted };
            },
        },
    };
}
