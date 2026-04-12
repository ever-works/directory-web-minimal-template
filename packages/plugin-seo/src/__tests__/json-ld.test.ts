import { describe, it, expect } from 'vitest';
import { generateJsonLd, generateItemJsonLd } from '../json-ld.js';
import type {
    WebSiteInput,
    ItemListInput,
    ProductInput,
    BreadcrumbListInput,
    SoftwareApplicationInput,
    DirectoryItemInput,
} from '../types.js';

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

        it('includes potentialAction with SearchAction when searchAction is provided', () => {
            const data: WebSiteInput = {
                type: 'WebSite',
                name: 'My Directory',
                url: 'https://example.com',
                searchAction: 'https://example.com/search?q={search_term_string}',
            };

            const result = JSON.parse(generateJsonLd('WebSite', data));

            expect(result.potentialAction).toEqual({
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://example.com/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
            });
        });

        it('omits potentialAction when searchAction is not provided', () => {
            const data: WebSiteInput = {
                type: 'WebSite',
                name: 'My Directory',
                url: 'https://example.com',
            };

            const result = JSON.parse(generateJsonLd('WebSite', data));

            expect(result.potentialAction).toBeUndefined();
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

    describe('BreadcrumbList', () => {
        it('generates BreadcrumbList with 1-indexed positions', () => {
            const data: BreadcrumbListInput = {
                type: 'BreadcrumbList',
                items: [
                    { name: 'Home', url: 'https://example.com' },
                    { name: 'Tools', url: 'https://example.com/tools' },
                    { name: 'Editors', url: 'https://example.com/tools/editors' },
                ],
            };

            const result = JSON.parse(generateJsonLd('BreadcrumbList', data));

            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('BreadcrumbList');
            expect(result.itemListElement).toHaveLength(3);

            expect(result.itemListElement[0]).toEqual({
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://example.com',
            });

            expect(result.itemListElement[2]).toEqual({
                '@type': 'ListItem',
                position: 3,
                name: 'Editors',
                item: 'https://example.com/tools/editors',
            });
        });

        it('handles empty breadcrumb list', () => {
            const data: BreadcrumbListInput = {
                type: 'BreadcrumbList',
                items: [],
            };

            const result = JSON.parse(generateJsonLd('BreadcrumbList', data));

            expect(result['@type']).toBe('BreadcrumbList');
            expect(result.itemListElement).toHaveLength(0);
        });
    });

    describe('SoftwareApplication', () => {
        it('generates basic SoftwareApplication JSON-LD', () => {
            const data: SoftwareApplicationInput = {
                type: 'SoftwareApplication',
                name: 'VS Code',
                url: 'https://example.com/vscode',
            };

            const result = JSON.parse(generateJsonLd('SoftwareApplication', data));

            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('SoftwareApplication');
            expect(result.name).toBe('VS Code');
            expect(result.url).toBe('https://example.com/vscode');
            expect(result.description).toBeUndefined();
            expect(result.offers).toBeUndefined();
            expect(result.aggregateRating).toBeUndefined();
        });

        it('includes all optional fields when provided', () => {
            const data: SoftwareApplicationInput = {
                type: 'SoftwareApplication',
                name: 'VS Code',
                url: 'https://example.com/vscode',
                description: 'A code editor',
                image: 'https://example.com/vscode.png',
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'Windows, macOS, Linux',
                price: '0',
                priceCurrency: 'USD',
                ratingValue: 4.8,
                ratingCount: 12500,
            };

            const result = JSON.parse(generateJsonLd('SoftwareApplication', data));

            expect(result.description).toBe('A code editor');
            expect(result.image).toBe('https://example.com/vscode.png');
            expect(result.applicationCategory).toBe('DeveloperApplication');
            expect(result.operatingSystem).toBe('Windows, macOS, Linux');
            expect(result.offers).toEqual({
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            });
            expect(result.aggregateRating).toEqual({
                '@type': 'AggregateRating',
                ratingValue: 4.8,
                ratingCount: 12500,
            });
        });

        it('includes offers when only price is provided', () => {
            const data: SoftwareApplicationInput = {
                type: 'SoftwareApplication',
                name: 'Tool',
                url: 'https://example.com/tool',
                price: '9.99',
            };

            const result = JSON.parse(generateJsonLd('SoftwareApplication', data));

            expect(result.offers).toEqual({
                '@type': 'Offer',
                price: '9.99',
            });
        });

        it('omits aggregateRating when only ratingValue is provided', () => {
            const data: SoftwareApplicationInput = {
                type: 'SoftwareApplication',
                name: 'Tool',
                url: 'https://example.com/tool',
                ratingValue: 4.5,
            };

            const result = JSON.parse(generateJsonLd('SoftwareApplication', data));

            expect(result.aggregateRating).toBeUndefined();
        });
    });

    describe('generateItemJsonLd', () => {
        it('produces SoftwareApplication when applicationCategory is set', () => {
            const item: DirectoryItemInput = {
                name: 'Figma',
                url: 'https://example.com/figma',
                description: 'Design tool',
                applicationCategory: 'DesignApplication',
                price: '0',
                priceCurrency: 'USD',
            };

            const result = JSON.parse(generateItemJsonLd(item));

            expect(result['@type']).toBe('SoftwareApplication');
            expect(result.applicationCategory).toBe('DesignApplication');
            expect(result.offers).toEqual({
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            });
        });

        it('falls back to Product when applicationCategory is not set', () => {
            const item: DirectoryItemInput = {
                name: 'Keyboard',
                url: 'https://example.com/keyboard',
                description: 'Mechanical keyboard',
                image: 'https://example.com/kb.jpg',
            };

            const result = JSON.parse(generateItemJsonLd(item));

            expect(result['@type']).toBe('Product');
            expect(result.name).toBe('Keyboard');
            expect(result.description).toBe('Mechanical keyboard');
            expect(result.image).toBe('https://example.com/kb.jpg');
        });

        it('produces valid JSON-LD with minimal input', () => {
            const item: DirectoryItemInput = {
                name: 'Simple Item',
                url: 'https://example.com/simple',
            };

            const result = JSON.parse(generateItemJsonLd(item));

            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('Product');
            expect(result.name).toBe('Simple Item');
            expect(result.url).toBe('https://example.com/simple');
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
            const breadcrumbResult = JSON.parse(
                generateJsonLd('BreadcrumbList', { type: 'BreadcrumbList', items: [] }),
            );
            const softwareResult = JSON.parse(
                generateJsonLd('SoftwareApplication', {
                    type: 'SoftwareApplication',
                    name: 'A',
                    url: 'https://a.com',
                }),
            );

            expect(websiteResult['@context']).toBe('https://schema.org');
            expect(itemListResult['@context']).toBe('https://schema.org');
            expect(productResult['@context']).toBe('https://schema.org');
            expect(breadcrumbResult['@context']).toBe('https://schema.org');
            expect(softwareResult['@context']).toBe('https://schema.org');
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
            const breadcrumbResult = JSON.parse(
                generateJsonLd('BreadcrumbList', { type: 'BreadcrumbList', items: [] }),
            );
            const softwareResult = JSON.parse(
                generateJsonLd('SoftwareApplication', {
                    type: 'SoftwareApplication',
                    name: 'A',
                    url: 'https://a.com',
                }),
            );

            expect(websiteResult['@type']).toBe('WebSite');
            expect(itemListResult['@type']).toBe('ItemList');
            expect(productResult['@type']).toBe('Product');
            expect(breadcrumbResult['@type']).toBe('BreadcrumbList');
            expect(softwareResult['@type']).toBe('SoftwareApplication');
        });
    });
});
