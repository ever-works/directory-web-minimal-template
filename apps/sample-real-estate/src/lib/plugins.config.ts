/**
 * Plugin configuration for the Dream Properties directory.
 */

import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';
import { breadcrumbsPlugin } from '@ever-works/plugin-breadcrumbs';
import { rssPlugin } from '@ever-works/plugin-rss';
import { analyticsPlugin } from '@ever-works/plugin-analytics';
import { relatedItemsPlugin } from '@ever-works/plugin-related-items';

export const plugins = definePlugins([
    seoPlugin({
        titleTemplate: '%s | Dream Properties',
    }),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
    breadcrumbsPlugin(),
    rssPlugin(),
    relatedItemsPlugin({ maxItems: 4 }),
    analyticsPlugin({
        providers: [{ provider: 'custom', html: '<!-- analytics: demo -->' }],
    }),
]);
