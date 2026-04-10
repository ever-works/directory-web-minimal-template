/**
 * Meta tag generation utilities.
 *
 * Pure functions that produce an array of {@link MetaTag} objects from
 * per-page metadata and plugin-level options. The output is framework-
 * agnostic — the consuming Astro component renders the tags into `<head>`.
 */

import type { MetaTag, PageMeta, SeoPluginOptions } from './types.js';

/**
 * Generate a complete set of meta tags for a single page.
 *
 * Produces:
 * - Standard HTML meta tags (`description`, `robots`)
 * - Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale`)
 * - Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`)
 *
 * @param page    - Per-page metadata.
 * @param options - Plugin-wide SEO options providing defaults and templates.
 * @returns An array of {@link MetaTag} objects ready for rendering.
 *
 * @example
 * ```typescript
 * const tags = generateMetaTags(
 *     { title: 'Acme Tool', description: 'A great tool.' },
 *     { titleTemplate: '%s | My Directory', siteUrl: 'https://example.com' },
 * );
 * ```
 */
export function generateMetaTags(page: PageMeta, options: SeoPluginOptions): MetaTag[] {
    const tags: MetaTag[] = [];

    const resolvedTitle = resolveTitle(page.title, options);
    const description = page.description || options.defaultDescription || '';
    const image = page.image || options.defaultOgImage;
    const url = page.url;
    const locale = options.locale || 'en_US';
    const ogType = page.type || 'website';

    // --- Standard HTML meta ---

    if (description) {
        tags.push({ key: 'name', value: 'description', content: description });
    }

    tags.push({ key: 'name', value: 'robots', content: 'index, follow' });

    // --- Open Graph ---

    tags.push({ key: 'property', value: 'og:title', content: resolvedTitle });

    if (description) {
        tags.push({ key: 'property', value: 'og:description', content: description });
    }

    tags.push({ key: 'property', value: 'og:type', content: ogType });
    tags.push({ key: 'property', value: 'og:locale', content: locale });

    if (url) {
        tags.push({ key: 'property', value: 'og:url', content: url });
    }

    if (image) {
        tags.push({ key: 'property', value: 'og:image', content: image });
    }

    // --- Twitter Card ---

    tags.push({ key: 'name', value: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
    tags.push({ key: 'name', value: 'twitter:title', content: resolvedTitle });

    if (description) {
        tags.push({ key: 'name', value: 'twitter:description', content: description });
    }

    if (image) {
        tags.push({ key: 'name', value: 'twitter:image', content: image });
    }

    if (options.twitterHandle) {
        tags.push({ key: 'name', value: 'twitter:site', content: options.twitterHandle });
    }

    return tags;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Apply the title template if one is configured.
 *
 * @param title   - Raw page title.
 * @param options - Plugin options (may contain `titleTemplate`).
 * @returns The final `<title>` string.
 */
function resolveTitle(title: string, options: SeoPluginOptions): string {
    if (options.titleTemplate) {
        return options.titleTemplate.replace('%s', title);
    }
    return title;
}
