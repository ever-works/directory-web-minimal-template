/**
 * Related items plugin factory.
 *
 * Creates a {@link Plugin} that computes related items for each directory item
 * during the build pipeline. Injects `_relatedItems` into each item's data,
 * consumed by the `SimilarItems` Astro component on detail pages.
 */

import type { Plugin } from '@ever-works/plugins';
import type { RelatedItemsPluginOptions } from './types';
import { resolveRelatedConfig } from './resolve-config';
import { computeRelatedItems } from './compute-related';

/**
 * Create a related items plugin instance.
 *
 * @param options - Optional configuration for scoring weights and limits
 * @returns A {@link Plugin} that computes related items in `onDataLoaded`
 *
 * @example
 * ```typescript
 * import { definePlugins } from '@ever-works/plugins';
 * import { relatedItemsPlugin } from '@ever-works/plugin-related-items';
 *
 * export default definePlugins([
 *     relatedItemsPlugin({ maxItems: 4, tagWeight: 1.5 }),
 * ]);
 * ```
 */
export function relatedItemsPlugin(
    options: RelatedItemsPluginOptions = {},
): Plugin {
    const config = resolveRelatedConfig(options);

    return {
        id: 'related-items',
        name: 'Related Items Plugin',
        version: '0.1.0',
        description:
            'Computes related items based on shared tags and categories.',

        hooks: {
            async onInit({ log }) {
                log.info(
                    `Initialized — max ${config.maxItems} related items per item (tag:${config.tagWeight}, cat:${config.categoryWeight}, featured:+${config.featuredBoost})`,
                );
            },

            async onDataLoaded(data, { log }) {
                const items = data.items;
                let totalRelations = 0;

                for (const item of items) {
                    const related = computeRelatedItems(item, items, config);
                    (item as Record<string, unknown>)._relatedItems = related;
                    totalRelations += related.length;
                }

                log.info(
                    `Computed ${totalRelations} related-item links across ${items.length} items`,
                );

                return data;
            },
        },
    };
}
