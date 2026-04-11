import { describe, it, expect } from 'vitest';
import { generateBreadcrumbs } from '../generator.js';
import type { ContentData } from '@ever-works/core';
import type { BreadcrumbsPluginOptions } from '../types.js';

/** Helper to create minimal ContentData for tests */
function createMockContentData(overrides: Partial<ContentData> = {}): ContentData {
    return {
        items: [],
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        config: {
            company_name: 'Test Site',
            item_name: 'Tool',
            items_name: 'Tools',
            copyright_year: 2025,
        },
        total: 0,
        ...overrides,
    };
}

describe('generateBreadcrumbs', () => {
    describe('default options', () => {
        it('should generate home trail', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            const trail = map.get('/');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(1);
            expect(trail![0]).toEqual({ label: 'Home' });
        });

        it('should generate categories index trail', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            const trail = map.get('/categories');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Categories' });
        });

        it('should generate category page trail', () => {
            const data = createMockContentData({
                categories: [
                    { id: 'dev-tools', name: 'Developer Tools', count: 5 },
                    { id: 'design', name: 'Design Tools', count: 3 },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/category/dev-tools');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(3);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Categories', href: '/categories' });
            expect(trail![2]).toEqual({ label: 'Developer Tools' });

            const trail2 = map.get('/category/design');
            expect(trail2).toBeDefined();
            expect(trail2![2]).toEqual({ label: 'Design Tools' });
        });

        it('should generate tags index trail', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            const trail = map.get('/tags');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Tags' });
        });

        it('should generate tag page trail', () => {
            const data = createMockContentData({
                tags: [
                    { id: 'typescript', name: 'TypeScript', count: 10 },
                    { id: 'react', name: 'React', count: 7 },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/tag/typescript');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(3);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Tags', href: '/tags' });
            expect(trail![2]).toEqual({ label: 'TypeScript' });

            const trail2 = map.get('/tag/react');
            expect(trail2).toBeDefined();
            expect(trail2![2]).toEqual({ label: 'React' });
        });

        it('should generate item page trail with primary category', () => {
            const data = createMockContentData({
                categories: [{ id: 'dev-tools', name: 'Developer Tools', count: 5 }],
                items: [
                    {
                        id: 'my-tool',
                        slug: 'my-tool',
                        name: 'My Tool',
                        description: 'A great tool',
                        source_url: 'https://example.com',
                        category: 'dev-tools',
                        tags: ['typescript'],
                        updated_at: '2025-01-01 12:00',
                        status: 'approved',
                    },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/item/my-tool');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(3);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Developer Tools', href: '/category/dev-tools' });
            expect(trail![2]).toEqual({ label: 'My Tool' });
        });

        it('should generate item page trail without category', () => {
            const data = createMockContentData({
                items: [
                    {
                        id: 'orphan',
                        slug: 'orphan',
                        name: 'Orphan Tool',
                        description: 'No category',
                        source_url: 'https://example.com',
                        category: '',
                        tags: [],
                        updated_at: '2025-01-01 12:00',
                        status: 'approved',
                    },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/item/orphan');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Orphan Tool' });
        });

        it('should generate item page trail with array category (uses first)', () => {
            const data = createMockContentData({
                categories: [
                    { id: 'dev-tools', name: 'Developer Tools', count: 5 },
                    { id: 'productivity', name: 'Productivity', count: 3 },
                ],
                items: [
                    {
                        id: 'multi-cat',
                        slug: 'multi-cat',
                        name: 'Multi Category Tool',
                        description: 'Has multiple categories',
                        source_url: 'https://example.com',
                        category: ['dev-tools', 'productivity'],
                        tags: [],
                        updated_at: '2025-01-01 12:00',
                        status: 'approved',
                    },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/item/multi-cat');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(3);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Developer Tools', href: '/category/dev-tools' });
            expect(trail![2]).toEqual({ label: 'Multi Category Tool' });
        });

        it('should generate collections index trail', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            const trail = map.get('/collections');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Collections' });
        });

        it('should generate collection page trail', () => {
            const data = createMockContentData({
                collections: [
                    {
                        id: 'popular',
                        slug: 'popular',
                        name: 'Popular Tools',
                        description: 'Most popular tools',
                    },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/collection/popular');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(3);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Collections', href: '/collections' });
            expect(trail![2]).toEqual({ label: 'Popular Tools' });
        });

        it('should generate comparisons index trail', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            const trail = map.get('/comparisons');
            expect(trail).toBeDefined();
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Comparisons' });
        });
    });

    describe('custom options', () => {
        it('should use custom homeLabel', () => {
            const data = createMockContentData();
            const options: BreadcrumbsPluginOptions = { homeLabel: 'Start' };
            const map = generateBreadcrumbs(data, options);

            const homeTrail = map.get('/');
            expect(homeTrail![0]).toEqual({ label: 'Start' });

            const catTrail = map.get('/categories');
            expect(catTrail![0]).toEqual({ label: 'Start', href: '/' });
        });

        it('should use custom homeHref', () => {
            const data = createMockContentData();
            const options: BreadcrumbsPluginOptions = { homeHref: '/home' };
            const map = generateBreadcrumbs(data, options);

            const catTrail = map.get('/categories');
            expect(catTrail![0]).toEqual({ label: 'Home', href: '/home' });
        });

        it('should exclude home when includeHome is false', () => {
            const data = createMockContentData({
                categories: [{ id: 'dev-tools', name: 'Developer Tools', count: 5 }],
            });
            const options: BreadcrumbsPluginOptions = { includeHome: false };
            const map = generateBreadcrumbs(data, options);

            // Categories index should only have "Categories"
            const catTrail = map.get('/categories');
            expect(catTrail).toHaveLength(1);
            expect(catTrail![0]).toEqual({ label: 'Categories' });

            // Category page should have "Categories" (linked) + category name
            const catPage = map.get('/category/dev-tools');
            expect(catPage).toHaveLength(2);
            expect(catPage![0]).toEqual({ label: 'Categories', href: '/categories' });
            expect(catPage![1]).toEqual({ label: 'Developer Tools' });

            // Tags index
            const tagsTrail = map.get('/tags');
            expect(tagsTrail).toHaveLength(1);
            expect(tagsTrail![0]).toEqual({ label: 'Tags' });

            // Comparisons index
            const compTrail = map.get('/comparisons');
            expect(compTrail).toHaveLength(1);
            expect(compTrail![0]).toEqual({ label: 'Comparisons' });

            // Home trail itself is always a single entry regardless
            const homeTrail = map.get('/');
            expect(homeTrail).toHaveLength(1);
            expect(homeTrail![0]).toEqual({ label: 'Home' });
        });

        it('should apply labelOverrides for index pages', () => {
            const data = createMockContentData({
                categories: [{ id: 'dev-tools', name: 'Developer Tools', count: 5 }],
                tags: [{ id: 'react', name: 'React', count: 3 }],
                collections: [
                    { id: 'popular', slug: 'popular', name: 'Popular', description: 'Popular items' },
                ],
            });
            const options: BreadcrumbsPluginOptions = {
                labelOverrides: {
                    '/categories': 'Browse Categories',
                    '/tags': 'All Tags',
                    '/collections': 'Curated Lists',
                    '/comparisons': 'Head-to-Head',
                },
            };
            const map = generateBreadcrumbs(data, options);

            // Categories index
            const catIndex = map.get('/categories');
            expect(catIndex![1]).toEqual({ label: 'Browse Categories' });

            // Category page inherits the overridden label for the parent link
            const catPage = map.get('/category/dev-tools');
            expect(catPage![1]).toEqual({ label: 'Browse Categories', href: '/categories' });

            // Tags index
            const tagIndex = map.get('/tags');
            expect(tagIndex![1]).toEqual({ label: 'All Tags' });

            // Tag page
            const tagPage = map.get('/tag/react');
            expect(tagPage![1]).toEqual({ label: 'All Tags', href: '/tags' });

            // Collections index
            const colIndex = map.get('/collections');
            expect(colIndex![1]).toEqual({ label: 'Curated Lists' });

            // Collection page
            const colPage = map.get('/collection/popular');
            expect(colPage![1]).toEqual({ label: 'Curated Lists', href: '/collections' });

            // Comparisons index
            const compIndex = map.get('/comparisons');
            expect(compIndex![1]).toEqual({ label: 'Head-to-Head' });
        });

        it('should combine custom homeLabel, homeHref, and labelOverrides', () => {
            const data = createMockContentData();
            const options: BreadcrumbsPluginOptions = {
                homeLabel: 'Dashboard',
                homeHref: '/dashboard',
                labelOverrides: {
                    '/categories': 'Sections',
                },
            };
            const map = generateBreadcrumbs(data, options);

            const homeTrail = map.get('/');
            expect(homeTrail![0]).toEqual({ label: 'Dashboard' });

            const catTrail = map.get('/categories');
            expect(catTrail![0]).toEqual({ label: 'Dashboard', href: '/dashboard' });
            expect(catTrail![1]).toEqual({ label: 'Sections' });
        });
    });

    describe('edge cases', () => {
        it('should handle empty data', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            // Should still have static trails
            expect(map.has('/')).toBe(true);
            expect(map.has('/categories')).toBe(true);
            expect(map.has('/tags')).toBe(true);
            expect(map.has('/collections')).toBe(true);
            expect(map.has('/comparisons')).toBe(true);

            // No dynamic trails
            expect(map.size).toBe(5);
        });

        it('should handle item with category ID not matching any known category', () => {
            const data = createMockContentData({
                categories: [{ id: 'dev-tools', name: 'Developer Tools', count: 5 }],
                items: [
                    {
                        id: 'mystery',
                        slug: 'mystery',
                        name: 'Mystery Item',
                        description: 'Unknown category',
                        source_url: 'https://example.com',
                        category: 'nonexistent-cat',
                        tags: [],
                        updated_at: '2025-01-01 12:00',
                        status: 'approved',
                    },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/item/mystery');
            expect(trail).toBeDefined();
            // No matching category, so no category breadcrumb
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Mystery Item' });
        });

        it('should handle item with empty array category', () => {
            const data = createMockContentData({
                items: [
                    {
                        id: 'empty-arr',
                        slug: 'empty-arr',
                        name: 'Empty Array Cat',
                        description: 'Empty array category',
                        source_url: 'https://example.com',
                        category: [] as unknown as string[],
                        tags: [],
                        updated_at: '2025-01-01 12:00',
                        status: 'approved',
                    },
                ],
            });
            const map = generateBreadcrumbs(data);

            const trail = map.get('/item/empty-arr');
            expect(trail).toBeDefined();
            // Empty array => primaryCatId is undefined
            expect(trail).toHaveLength(2);
            expect(trail![0]).toEqual({ label: 'Home', href: '/' });
            expect(trail![1]).toEqual({ label: 'Empty Array Cat' });
        });

        it('should return a Map instance', () => {
            const data = createMockContentData();
            const map = generateBreadcrumbs(data);

            expect(map).toBeInstanceOf(Map);
        });

        it('should generate trails for multiple categories, tags, items, and collections', () => {
            const data = createMockContentData({
                categories: [
                    { id: 'cat-a', name: 'Category A', count: 2 },
                    { id: 'cat-b', name: 'Category B', count: 1 },
                ],
                tags: [
                    { id: 'tag-x', name: 'Tag X', count: 3 },
                    { id: 'tag-y', name: 'Tag Y', count: 1 },
                ],
                items: [
                    {
                        id: 'item-1',
                        slug: 'item-1',
                        name: 'Item One',
                        description: '',
                        source_url: '',
                        category: 'cat-a',
                        tags: ['tag-x'],
                        updated_at: '',
                        status: 'approved',
                    },
                    {
                        id: 'item-2',
                        slug: 'item-2',
                        name: 'Item Two',
                        description: '',
                        source_url: '',
                        category: 'cat-b',
                        tags: ['tag-y'],
                        updated_at: '',
                        status: 'approved',
                    },
                ],
                collections: [
                    { id: 'col-1', slug: 'col-1', name: 'Collection One', description: '' },
                    { id: 'col-2', slug: 'col-2', name: 'Collection Two', description: '' },
                ],
            });
            const map = generateBreadcrumbs(data);

            // 5 static + 2 categories + 2 tags + 2 items + 2 collections = 13
            expect(map.size).toBe(13);

            expect(map.has('/category/cat-a')).toBe(true);
            expect(map.has('/category/cat-b')).toBe(true);
            expect(map.has('/tag/tag-x')).toBe(true);
            expect(map.has('/tag/tag-y')).toBe(true);
            expect(map.has('/item/item-1')).toBe(true);
            expect(map.has('/item/item-2')).toBe(true);
            expect(map.has('/collection/col-1')).toBe(true);
            expect(map.has('/collection/col-2')).toBe(true);
        });

        it('should not have href on the last breadcrumb entry (current page)', () => {
            const data = createMockContentData({
                categories: [{ id: 'dev', name: 'Dev', count: 1 }],
                tags: [{ id: 'ts', name: 'TS', count: 1 }],
                items: [
                    {
                        id: 'tool',
                        slug: 'tool',
                        name: 'Tool',
                        description: '',
                        source_url: '',
                        category: 'dev',
                        tags: ['ts'],
                        updated_at: '',
                        status: 'approved',
                    },
                ],
                collections: [{ id: 'best', slug: 'best', name: 'Best', description: '' }],
            });
            const map = generateBreadcrumbs(data);

            // Check that the last entry in each trail has no href
            for (const [, trail] of map) {
                const last = trail[trail.length - 1]!;
                expect(last.href).toBeUndefined();
            }
        });
    });
});
