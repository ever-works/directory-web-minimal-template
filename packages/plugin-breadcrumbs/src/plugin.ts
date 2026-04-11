/**
 * Breadcrumbs plugin factory.
 *
 * Creates a Plugin that auto-generates breadcrumb trails for all known
 * page types. The generated breadcrumb map is stored on the content data
 * as `_breadcrumbs` (a Map<string, BreadcrumbEntry[]>).
 *
 * Pages can then use:
 * ```typescript
 * const crumbs = data._breadcrumbs?.get(Astro.url.pathname);
 * ```
 */

import type { Plugin, PluginContext } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';
import type { BreadcrumbsPluginOptions } from './types.js';
import { generateBreadcrumbs } from './generator.js';

const PLUGIN_ID = 'breadcrumbs';

export function breadcrumbsPlugin(options: BreadcrumbsPluginOptions = {}): Plugin {
    return {
        id: PLUGIN_ID,
        name: 'Breadcrumbs Plugin',
        version: '0.1.0',
        description: 'Auto-generates breadcrumb navigation trails for all directory pages.',

        hooks: {
            async onInit(context: PluginContext): Promise<void> {
                context.log.info('Breadcrumbs plugin initialized');
                if (options.homeLabel) {
                    context.log.debug(`Home label: ${options.homeLabel}`);
                }
            },

            async onDataLoaded(data: ContentData, context: PluginContext): Promise<ContentData> {
                const breadcrumbs = generateBreadcrumbs(data, options);
                context.log.info(`Generated breadcrumbs for ${breadcrumbs.size} pages`);

                // Attach breadcrumbs to content data as metadata
                return {
                    ...data,
                    _breadcrumbs: breadcrumbs,
                } as ContentData & { _breadcrumbs: typeof breadcrumbs };
            },
        },
    };
}
