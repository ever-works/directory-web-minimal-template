/**
 * Pagination plugin factory.
 *
 * Creates a {@link Plugin} that merges pagination options
 * with the site configuration and exposes pagination utilities.
 */

import type { Plugin } from '@ever-works/plugins';
import type { PaginationPluginOptions } from './types';

/** Default items per page when neither options nor site config specify a value */
const DEFAULT_ITEMS_PER_PAGE = 12;

/**
 * Create the pagination plugin.
 *
 * Options provided here are merged with `config.pagination` from the
 * site configuration, with explicit options taking precedence.
 *
 * @param options - Optional overrides for pagination behaviour.
 * @returns A fully configured {@link Plugin} instance.
 *
 * @example
 * ```typescript
 * import { definePlugins } from '@ever-works/plugins';
 * import { paginationPlugin } from '@ever-works/plugin-pagination';
 *
 * export default definePlugins([
 *     paginationPlugin({ itemsPerPage: 24 }),
 * ]);
 * ```
 */
export function paginationPlugin(options: PaginationPluginOptions = {}): Plugin {
    return {
        id: 'pagination',
        name: 'Pagination Plugin',
        version: '0.1.0',
        description: 'Provides pagination utilities and page path generation for directory listings.',

        hooks: {
            async onInit(context) {
                const sitePerPage = context.config.pagination?.itemsPerPage;

                const resolvedPerPage =
                    options.itemsPerPage ?? sitePerPage ?? DEFAULT_ITEMS_PER_PAGE;

                const resolvedMaxPages = options.maxPages;

                context.log.info(
                    `Initialized — ${String(resolvedPerPage)} items/page` +
                        (resolvedMaxPages !== undefined
                            ? `, max ${String(resolvedMaxPages)} pages`
                            : ''),
                );

                context.log.debug(
                    `Source: ${options.itemsPerPage !== undefined ? 'plugin options' : sitePerPage !== undefined ? 'site config' : 'default'}`,
                );
            },
        },
    };
}
