/**
 * RSS/Atom feed plugin factory.
 *
 * Creates a {@link Plugin} that prepares feed generation configuration.
 * The actual feed XML is generated via the exported utility functions
 * ({@link generateRss}, {@link generateAtom}) at page render time.
 *
 * Feed entries are built from `ContentData.items` by the consumer
 * (Astro page) using the {@link buildFeedEntries} helper.
 */

import type { Plugin, PluginContext } from '@ever-works/plugins';
import type { ContentData, ItemData } from '@ever-works/core';
import type { RssPluginOptions, ResolvedRssConfig, FeedEntry } from './types';

/** Default configuration values. */
const DEFAULTS: ResolvedRssConfig = {
    title: '',
    description: '',
    siteUrl: '',
    limit: 50,
    atom: true,
    jsonFeed: true,
    rssFilename: 'rss.xml',
    atomFilename: 'atom.xml',
    jsonFeedFilename: 'feed.json',
    sortBy: 'date-desc',
};

/**
 * Build feed entries from content data items.
 *
 * Sorts items according to the configured order, limits to the
 * configured maximum, and maps each item to a {@link FeedEntry}.
 *
 * @param items - Array of directory items
 * @param config - Resolved plugin configuration
 * @returns Array of feed entries ready for XML generation
 */
export function buildFeedEntries(
    items: ItemData[],
    config: Pick<ResolvedRssConfig, 'siteUrl' | 'limit' | 'sortBy'>
): FeedEntry[] {
    const sorted = [...items].sort((a, b) => {
        switch (config.sortBy) {
            case 'date-desc':
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            case 'date-asc':
                return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    const limited = sorted.slice(0, config.limit);
    const siteUrl = config.siteUrl.replace(/\/$/, '');

    return limited.map((item) => ({
        title: item.name,
        link: `${siteUrl}/item/${item.slug}/`,
        description: item.description,
        pubDate: item.updated_at,
        guid: `${siteUrl}/item/${item.slug}/`,
        category: Array.isArray(item.category) ? item.category[0] : item.category || undefined,
    }));
}

/**
 * Create an RSS/Atom feed plugin instance.
 *
 * @param options - Optional configuration overrides
 * @returns A configured {@link Plugin} ready for `definePlugins()`
 *
 * @example
 * ```typescript
 * import { rssPlugin } from '@ever-works/plugin-rss';
 *
 * rssPlugin({
 *     siteUrl: 'https://example.com',
 *     limit: 25,
 * });
 * ```
 */
export function rssPlugin(options: RssPluginOptions = {}): Plugin {
    return {
        id: 'rss',
        name: 'RSS Feed Plugin',
        version: '0.1.0',
        description: 'Generates RSS 2.0 and Atom 1.0 feeds for directory items.',

        hooks: {
            async onInit(context: PluginContext): Promise<void> {
                const siteUrl = options.siteUrl ?? '';

                if (!siteUrl) {
                    context.log.warn('RSS plugin: "siteUrl" not set. Feed URLs will be relative.');
                }

                context.log.info('RSS plugin initialized');
                context.log.debug(`Feed limit: ${options.limit ?? DEFAULTS.limit}`);
                context.log.debug(`Atom feed: ${options.atom !== false ? 'enabled' : 'disabled'}`);
            },

            async onDataLoaded(data: ContentData, _context: PluginContext): Promise<ContentData> {
                return data;
            },
        },
    };
}

/**
 * Resolve user options into a complete configuration with defaults.
 *
 * @param options - User-provided options
 * @param companyName - Fallback title from site config
 * @returns Fully resolved configuration
 */
export function resolveRssConfig(
    options: RssPluginOptions,
    companyName: string
): ResolvedRssConfig {
    return {
        title: options.title ?? companyName,
        description: options.description ?? `Latest items from ${companyName}`,
        siteUrl: (options.siteUrl ?? '').replace(/\/$/, ''),
        limit: options.limit ?? DEFAULTS.limit,
        atom: options.atom !== false,
        jsonFeed: options.jsonFeed !== false,
        rssFilename: options.rssFilename ?? DEFAULTS.rssFilename,
        atomFilename: options.atomFilename ?? DEFAULTS.atomFilename,
        jsonFeedFilename: options.jsonFeedFilename ?? DEFAULTS.jsonFeedFilename,
        sortBy: options.sortBy ?? DEFAULTS.sortBy,
    };
}
