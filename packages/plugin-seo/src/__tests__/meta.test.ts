import { describe, it, expect } from 'vitest';
import { generateMetaTags } from '../meta.js';
import type { PageMeta, SeoPluginOptions, MetaTag } from '../types.js';

/** Helper to find a tag by its value (e.g., 'og:title', 'description'). */
function findTag(tags: MetaTag[], value: string): MetaTag | undefined {
    return tags.find((t) => t.value === value);
}

describe('generateMetaTags', () => {
    it('generates basic tags with minimal input', () => {
        const page: PageMeta = { title: 'Hello', description: 'A page' };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        // Standard meta
        expect(findTag(tags, 'description')?.content).toBe('A page');
        expect(findTag(tags, 'robots')?.content).toBe('index, follow');

        // Open Graph
        expect(findTag(tags, 'og:title')?.content).toBe('Hello');
        expect(findTag(tags, 'og:description')?.content).toBe('A page');
        expect(findTag(tags, 'og:type')?.content).toBe('website');
        expect(findTag(tags, 'og:locale')?.content).toBe('en_US');

        // Twitter Card
        expect(findTag(tags, 'twitter:card')?.content).toBe('summary');
        expect(findTag(tags, 'twitter:title')?.content).toBe('Hello');
        expect(findTag(tags, 'twitter:description')?.content).toBe('A page');
    });

    it('applies titleTemplate with %s placeholder', () => {
        const page: PageMeta = { title: 'About', description: 'About us' };
        const options: SeoPluginOptions = { titleTemplate: '%s | My Site' };

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'og:title')?.content).toBe('About | My Site');
        expect(findTag(tags, 'twitter:title')?.content).toBe('About | My Site');
    });

    it('falls back to defaultDescription when page has no description', () => {
        const page: PageMeta = { title: 'No Desc', description: '' };
        const options: SeoPluginOptions = { defaultDescription: 'Fallback desc' };

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'description')?.content).toBe('Fallback desc');
        expect(findTag(tags, 'og:description')?.content).toBe('Fallback desc');
        expect(findTag(tags, 'twitter:description')?.content).toBe('Fallback desc');
    });

    it('falls back to defaultOgImage when page has no image', () => {
        const page: PageMeta = { title: 'Test', description: 'Desc' };
        const options: SeoPluginOptions = { defaultOgImage: 'https://example.com/default.png' };

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'og:image')?.content).toBe('https://example.com/default.png');
        expect(findTag(tags, 'twitter:image')?.content).toBe('https://example.com/default.png');
    });

    it('sets twitter:card to summary_large_image when image exists', () => {
        const page: PageMeta = {
            title: 'With Image',
            description: 'Has image',
            image: 'https://example.com/photo.jpg',
        };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'twitter:card')?.content).toBe('summary_large_image');
    });

    it('sets twitter:card to summary when no image exists', () => {
        const page: PageMeta = { title: 'No Image', description: 'No image' };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'twitter:card')?.content).toBe('summary');
    });

    it('includes twitter:site when twitterHandle is provided', () => {
        const page: PageMeta = { title: 'Twitter', description: 'Test' };
        const options: SeoPluginOptions = { twitterHandle: '@mysite' };

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'twitter:site')?.content).toBe('@mysite');
    });

    it('omits twitter:site when twitterHandle is not provided', () => {
        const page: PageMeta = { title: 'Twitter', description: 'Test' };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'twitter:site')).toBeUndefined();
    });

    it('includes og:url when page url is provided', () => {
        const page: PageMeta = {
            title: 'URL Page',
            description: 'Has URL',
            url: 'https://example.com/page',
        };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'og:url')?.content).toBe('https://example.com/page');
    });

    it('omits og:url when page url is not provided', () => {
        const page: PageMeta = { title: 'No URL', description: 'No URL' };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'og:url')).toBeUndefined();
    });

    it('uses custom locale and type', () => {
        const page: PageMeta = {
            title: 'Custom',
            description: 'Custom locale and type',
            type: 'article',
        };
        const options: SeoPluginOptions = { locale: 'fr_FR' };

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'og:locale')?.content).toBe('fr_FR');
        expect(findTag(tags, 'og:type')?.content).toBe('article');
    });

    it('omits description, og:description, and twitter:description when all sources are empty', () => {
        const page: PageMeta = { title: 'No Desc', description: '' };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'description')).toBeUndefined();
        expect(findTag(tags, 'og:description')).toBeUndefined();
        expect(findTag(tags, 'twitter:description')).toBeUndefined();
        expect(findTag(tags, 'og:title')?.content).toBe('No Desc');
    });

    it('omits og:image and twitter:image when no image from any source', () => {
        const page: PageMeta = { title: 'Bare', description: 'Test' };
        const options: SeoPluginOptions = {};

        const tags = generateMetaTags(page, options);

        expect(findTag(tags, 'og:image')).toBeUndefined();
        expect(findTag(tags, 'twitter:image')).toBeUndefined();
    });

    it('includes all expected tags with full options', () => {
        const page: PageMeta = {
            title: 'Full Page',
            description: 'Full description',
            url: 'https://example.com/full',
            image: 'https://example.com/full.jpg',
            type: 'product',
        };
        const options: SeoPluginOptions = {
            titleTemplate: '%s - Directory',
            twitterHandle: '@directory',
            locale: 'de_DE',
        };

        const tags = generateMetaTags(page, options);

        // Standard
        expect(findTag(tags, 'description')?.content).toBe('Full description');
        expect(findTag(tags, 'robots')?.content).toBe('index, follow');

        // OG
        expect(findTag(tags, 'og:title')?.content).toBe('Full Page - Directory');
        expect(findTag(tags, 'og:description')?.content).toBe('Full description');
        expect(findTag(tags, 'og:url')?.content).toBe('https://example.com/full');
        expect(findTag(tags, 'og:image')?.content).toBe('https://example.com/full.jpg');
        expect(findTag(tags, 'og:type')?.content).toBe('product');
        expect(findTag(tags, 'og:locale')?.content).toBe('de_DE');

        // Twitter
        expect(findTag(tags, 'twitter:card')?.content).toBe('summary_large_image');
        expect(findTag(tags, 'twitter:title')?.content).toBe('Full Page - Directory');
        expect(findTag(tags, 'twitter:description')?.content).toBe('Full description');
        expect(findTag(tags, 'twitter:image')?.content).toBe('https://example.com/full.jpg');
        expect(findTag(tags, 'twitter:site')?.content).toBe('@directory');

        // Key assertions on tag structure
        const ogTitleTag = findTag(tags, 'og:title');
        expect(ogTitleTag?.key).toBe('property');

        const descTag = findTag(tags, 'description');
        expect(descTag?.key).toBe('name');
    });
});
