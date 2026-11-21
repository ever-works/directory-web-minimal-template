/**
 * Plugin configuration for the web app.
 *
 * Register and configure all plugins here.
 * Plugins are executed in dependency-resolved order by the PluginRunner.
 *
 * To disable a plugin, simply comment out or remove its line.
 * The build will work without any plugins — they are all optional.
 *
 * @see docs/specs/plugin-interface.md for the plugin API
 * @see docs/guides/creating-a-plugin.md for how to create custom plugins
 */

import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';
import { rssPlugin } from '@ever-works/plugin-rss';
import { relatedItemsPlugin } from '@ever-works/plugin-related-items';

/**
 * Active plugins for this site.
 *
 * Order does not matter here — `definePlugins` resolves dependency order.
 * Each plugin can be configured by passing options to its factory function.
 */
export const plugins = definePlugins([
    // SEO meta tags, Open Graph, JSON-LD structured data
    seoPlugin(),

    // Pagination utilities for listing pages
    paginationPlugin({ itemsPerPage: 12 }),

    // Client-side filtering by category, tag, and search
    filtersPlugin(),

    // Static search via Pagefind (index generated after build)
    searchPlugin(),

    // Sort utilities for item lists
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),

    // Sitemap configuration wrapper for @astrojs/sitemap
    sitemapPlugin(),

    // RSS 2.0 and Atom 1.0 feed generation
    rssPlugin(),

    // "Alternatives to …" on item pages + `related` in the Data API / MCP get_item.
    // minScore 0.5 drops candidates whose only link is the featured boost.
    relatedItemsPlugin({ maxItems: 6, minScore: 0.5 }),
]);
