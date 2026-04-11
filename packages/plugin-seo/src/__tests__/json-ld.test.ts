import { describe, it, expect } from 'vitest';
import { generateJsonLd } from '../json-ld.js';
import type { WebSiteInput, ItemListInput, ProductInput } from '../types.js';

describe('generateJsonLd', () => {
    describe('WebSite', () => {
        it('generates basic WebSite JSON-LD with name and url', () => {
            const data: WebSiteInput = {
                type: 'WebSite',
                name: 'My Directory',
                url: 'https://example.com',
            };

            const result = JSON.parse(generateJsonLd('WebSite', data));

            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('WebSite');
            expect(result.name).toBe('My Directory');
            expect(result.url).toBe('https://example.com');
            expect(result.description).toBeUndefined();
        });

        it('includes description when provided', () => {
            const data: WebSiteInput = {
                type: 'WebSite',
                name: 'My Directory',
                url: 'https://example.com',
                description: 'A directory of tools',
            };

            const result = JSON.parse(generateJsonLd('WebSite', data));

            expect(result.description).toBe('A directory of tools');
        });
    });

    describe('ItemList', () => {
        it('generates ItemList with 1-indexed positions', () => {
            const data: ItemListInput = {
                type: 'ItemList',
                items: [
                    { name: 'Item A', url: 'https://example.com/a' },
                    { name: 'Item B', url: 'https://example.com/b' },
                    { name: 'Item C', url: 'https://example.com/c' },
                ],
            };

            const result = JSON.parse(generateJsonLd('ItemList', data));

            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('ItemList');
            expect(result.itemListElement).toHaveLength(3);

            expect(result.itemListElement[0]).toEqual({
                '@type': 'ListItem',
                position: 1,
                name: 'Item A',
                url: 'https://example.com/a',
            });

            expect(result.itemListElement[1]).toEqual({
                '@type': 'ListItem',
                position: 2,
                name: 'Item B',
                url: 'https://example.com/b',
            });

            expect(result.itemListElement[2]).toEqual({
                '@type': 'ListItem',
                position: 3,
                name: 'Item C',
                url: 'https://example.com/c',
            });
        });
    });

    describe('Product', () => {
        it('generates basic Product JSON-LD with name and url', () => {
            const data: ProductInput = {
                type: 'Product',
                name: 'Widget Pro',
                url: 'https://example.com/widget-pro',
            };

            const result = JSON.parse(generateJsonLd('Product', data));

            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('Product');
            expect(result.name).toBe('Widget Pro');
            expect(result.url).toBe('https://example.com/widget-pro');
            expect(result.description).toBeUndefined();
            expect(result.image).toBeUndefined();
        });

        it('includes description and image when provided', () => {
            const data: ProductInput = {
                type: 'Product',
                name: 'Widget Pro',
                url: 'https://example.com/widget-pro',
                description: 'The best widget',
                image: 'https://example.com/widget.jpg',
            };

            const result = JSON.parse(generateJsonLd('Product', data));

            expect(result.description).toBe('The best widget');
            expect(result.image).toBe('https://example.com/widget.jpg');
        });
    });

    describe('common structure', () => {
        it('all outputs include @context set to https://schema.org', () => {
            const websiteResult = JSON.parse(
                generateJsonLd('WebSite', { type: 'WebSite', name: 'S', url: 'https://s.com' }),
            );
            const itemListResult = JSON.parse(
                generateJsonLd('ItemList', { type: 'ItemList', items: [] }),
            );
            const productResult = JSON.parse(
                generateJsonLd('Product', { type: 'Product', name: 'P', url: 'https://p.com' }),
            );

            expect(websiteResult['@context']).toBe('https://schema.org');
            expect(itemListResult['@context']).toBe('https://schema.org');
            expect(productResult['@context']).toBe('https://schema.org');
        });

        it('all outputs have the correct @type', () => {
            const websiteResult = JSON.parse(
                generateJsonLd('WebSite', { type: 'WebSite', name: 'S', url: 'https://s.com' }),
            );
            const itemListResult = JSON.parse(
                generateJsonLd('ItemList', { type: 'ItemList', items: [] }),
            );
            const productResult = JSON.parse(
                generateJsonLd('Product', { type: 'Product', name: 'P', url: 'https://p.com' }),
            );

            expect(websiteResult['@type']).toBe('WebSite');
            expect(itemListResult['@type']).toBe('ItemList');
            expect(productResult['@type']).toBe('Product');
        });
    });
});
