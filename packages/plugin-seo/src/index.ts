/**
 * @ever-works/plugin-seo
 *
 * SEO plugin for the Ever Works minimal directory template.
 * Provides meta tag generation, Open Graph / Twitter Card tags,
 * and JSON-LD structured data utilities.
 *
 * @example
 * ```typescript
 * import { seoPlugin, generateMetaTags, generateJsonLd } from '@ever-works/plugin-seo';
 * import { definePlugins } from '@ever-works/plugins';
 *
 * // Register the plugin
 * export default definePlugins([
 *     seoPlugin({ titleTemplate: '%s | My Directory' }),
 * ]);
 *
 * // In an Astro component
 * const tags = generateMetaTags(
 *     { title: 'Home', description: 'Welcome' },
 *     { titleTemplate: '%s | My Directory' },
 * );
 * ```
 */

// Plugin factory
export { seoPlugin } from './plugin.js';

// Utility functions
export { generateMetaTags } from './meta.js';
export { generateJsonLd } from './json-ld.js';

// Types
export type {
    SeoPluginOptions,
    PageMeta,
    MetaTag,
    JsonLdType,
    JsonLdInput,
    WebSiteInput,
    ItemListInput,
    ItemListEntry,
    ProductInput,
} from './types.js';
