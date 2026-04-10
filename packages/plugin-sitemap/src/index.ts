/**
 * @ever-works/plugin-sitemap
 *
 * Sitemap plugin wrapping Astro's built-in sitemap integration
 * with directory-specific defaults and configuration.
 *
 * @example
 * ```typescript
 * import { sitemapPlugin } from '@ever-works/plugin-sitemap';
 *
 * sitemapPlugin({ changefreq: 'daily', priority: 0.8 });
 * ```
 */

export { sitemapPlugin } from './plugin.js';
export type {
    SitemapPluginOptions,
    ResolvedSitemapConfig,
    ChangeFrequency,
} from './types.js';
