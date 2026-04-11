/**
 * Sitemap plugin implementation.
 *
 * Wraps Astro's built-in `@astrojs/sitemap` integration with
 * directory-specific defaults. The actual sitemap generation is
 * handled by `@astrojs/sitemap` in `astro.config.ts`.
 *
 * This plugin provides configuration and logging only.
 */

import type { Plugin } from '@ever-works/plugins';
import type { SitemapPluginOptions, ResolvedSitemapConfig } from './types';

/** Default configuration values */
const DEFAULTS: ResolvedSitemapConfig = {
    changefreq: 'weekly',
    priority: 0.7,
    exclude: [],
};

/**
 * Create the sitemap plugin.
 *
 * @param options - Optional configuration overrides
 * @returns A configured Plugin instance
 *
 * @example
 * ```typescript
 * import { sitemapPlugin } from '@ever-works/plugin-sitemap';
 *
 * sitemapPlugin({ changefreq: 'daily', priority: 0.8 });
 * ```
 */
export function sitemapPlugin(options?: SitemapPluginOptions): Plugin {
    const resolved: ResolvedSitemapConfig = {
        changefreq: options?.changefreq ?? DEFAULTS.changefreq,
        priority: options?.priority ?? DEFAULTS.priority,
        exclude: options?.exclude ?? DEFAULTS.exclude,
    };

    return {
        id: 'sitemap',
        name: 'Sitemap Plugin',
        version: '0.1.0',
        description: 'Wraps Astro sitemap integration with directory-specific defaults',

        hooks: {
            async onInit(context) {
                context.log.info(
                    `Sitemap: changefreq=${resolved.changefreq}, priority=${resolved.priority}`,
                );
                if (resolved.exclude.length > 0) {
                    context.log.info(`Sitemap: excluding ${resolved.exclude.join(', ')}`);
                }
            },
        },
    };
}
