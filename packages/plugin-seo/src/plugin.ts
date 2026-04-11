/**
 * SEO plugin factory.
 *
 * Creates a {@link Plugin} that integrates SEO metadata generation into the
 * build pipeline. The plugin itself does not transform content data — SEO
 * tags are computed at render time via the pure utility functions exported
 * from this package ({@link generateMetaTags}, {@link generateJsonLd}).
 *
 * The `onInit` hook validates the provided options and logs startup info.
 * The `onDataLoaded` hook passes data through unchanged.
 */

import type { Plugin } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';
import type { PluginContext } from '@ever-works/plugins';
import type { SeoPluginOptions } from './types';

/** Plugin identifier constant. */
const PLUGIN_ID = 'seo';

/**
 * Create an SEO plugin instance.
 *
 * @param options - Optional configuration. All fields have sensible defaults.
 * @returns A valid {@link Plugin} ready for use with `definePlugins()`.
 *
 * @example
 * ```typescript
 * import { definePlugins } from '@ever-works/plugins';
 * import { seoPlugin } from '@ever-works/plugin-seo';
 *
 * export default definePlugins([
 *     seoPlugin({
 *         titleTemplate: '%s | My Directory',
 *         siteUrl: 'https://example.com',
 *     }),
 * ]);
 * ```
 */
export function seoPlugin(options: SeoPluginOptions = {}): Plugin {
    return {
        id: PLUGIN_ID,
        name: 'SEO Plugin',
        version: '0.1.0',
        description: 'Generates meta tags, Open Graph, Twitter Cards, and JSON-LD structured data for directory pages.',

        hooks: {
            async onInit(context: PluginContext): Promise<void> {
                validateOptions(options, context);
                context.log.info('SEO plugin initialized');

                if (options.siteUrl) {
                    context.log.debug(`Site URL: ${options.siteUrl}`);
                }

                if (options.titleTemplate) {
                    context.log.debug(`Title template: ${options.titleTemplate}`);
                }

                const jsonLdEnabled = options.jsonLd !== false;
                context.log.debug(`JSON-LD generation: ${jsonLdEnabled ? 'enabled' : 'disabled'}`);
            },

            async onDataLoaded(data: ContentData, _context: PluginContext): Promise<ContentData> {
                // SEO tags are computed at render time, not during data loading.
                // Pass content through unchanged.
                return data;
            },
        },
    };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate plugin options and warn about potential configuration issues.
 * Does not throw — issues are logged as warnings.
 */
function validateOptions(options: SeoPluginOptions, context: PluginContext): void {
    if (options.siteUrl) {
        try {
            new URL(options.siteUrl);
        } catch {
            context.log.warn(`"siteUrl" is not a valid URL: ${options.siteUrl}`);
        }
    }

    if (options.titleTemplate && !options.titleTemplate.includes('%s')) {
        context.log.warn('"titleTemplate" does not contain a "%s" placeholder. Page titles will not be inserted.');
    }

    if (options.twitterHandle && !options.twitterHandle.startsWith('@')) {
        context.log.warn(`"twitterHandle" should start with "@". Got: ${options.twitterHandle}`);
    }

    if (options.defaultOgImage) {
        try {
            new URL(options.defaultOgImage);
        } catch {
            context.log.warn(`"defaultOgImage" is not a valid URL: ${options.defaultOgImage}`);
        }
    }
}
