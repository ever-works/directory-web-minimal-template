/**
 * Tests for URL synchronization utilities — parsing and serializing filter state.
 */

import { describe, it, expect } from 'vitest';
import { parseFiltersFromUrl, serializeFiltersToUrl } from '../url-sync';
import type { ActiveFilters } from '../types';

describe('parseFiltersFromUrl', () => {
    it('returns empty filters for URL with no params', () => {
        const url = new URL('https://example.com');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual([]);
        expect(filters.tags).toEqual([]);
        expect(filters.search).toBe('');
    });

    it('parses a single category', () => {
        const url = new URL('https://example.com?category=tools');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual(['tools']);
    });

    it('parses comma-separated categories', () => {
        const url = new URL('https://example.com?category=tools,apps,libraries');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual(['tools', 'apps', 'libraries']);
    });

    it('parses comma-separated tags', () => {
        const url = new URL('https://example.com?tag=open-source,free');
        const filters = parseFiltersFromUrl(url);

        expect(filters.tags).toEqual(['open-source', 'free']);
    });

    it('parses search query from q param', () => {
        const url = new URL('https://example.com?q=deploy');
        const filters = parseFiltersFromUrl(url);

        expect(filters.search).toBe('deploy');
    });

    it('parses all filter types together', () => {
        const url = new URL('https://example.com?category=tools,apps&tag=free&q=react');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual(['tools', 'apps']);
        expect(filters.tags).toEqual(['free']);
        expect(filters.search).toBe('react');
    });

    it('trims whitespace from comma-separated values', () => {
        const url = new URL('https://example.com?category=tools%20,%20apps%20');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual(['tools', 'apps']);
    });

    it('filters out empty segments from comma-separated values', () => {
        const url = new URL('https://example.com?category=tools,,apps,');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual(['tools', 'apps']);
    });

    it('trims search query whitespace', () => {
        const url = new URL('https://example.com?q=%20deploy%20');
        const filters = parseFiltersFromUrl(url);

        expect(filters.search).toBe('deploy');
    });

    it('handles empty param values as empty filters', () => {
        const url = new URL('https://example.com?category=&tag=&q=');
        const filters = parseFiltersFromUrl(url);

        expect(filters.categories).toEqual([]);
        expect(filters.tags).toEqual([]);
        expect(filters.search).toBe('');
    });

    describe('custom param names', () => {
        it('uses custom category param name', () => {
            const url = new URL('https://example.com?cat=tools');
            const filters = parseFiltersFromUrl(url, { category: 'cat' });

            expect(filters.categories).toEqual(['tools']);
        });

        it('uses custom tag param name', () => {
            const url = new URL('https://example.com?label=react');
            const filters = parseFiltersFromUrl(url, { tag: 'label' });

            expect(filters.tags).toEqual(['react']);
        });

        it('uses custom search param name', () => {
            const url = new URL('https://example.com?search=deploy');
            const filters = parseFiltersFromUrl(url, { search: 'search' });

            expect(filters.search).toBe('deploy');
        });

        it('uses defaults for unspecified custom params', () => {
            const url = new URL('https://example.com?cat=tools&tag=react&q=deploy');
            const filters = parseFiltersFromUrl(url, { category: 'cat' });

            expect(filters.categories).toEqual(['tools']);
            expect(filters.tags).toEqual(['react']); // default 'tag'
            expect(filters.search).toBe('deploy'); // default 'q'
        });
    });
});

describe('serializeFiltersToUrl', () => {
    it('returns empty params for empty filters', () => {
        const filters: ActiveFilters = {
            categories: [],
            tags: [],
            search: '',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.toString()).toBe('');
    });

    it('serializes a single category', () => {
        const filters: ActiveFilters = {
            categories: ['tools'],
            tags: [],
            search: '',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.get('category')).toBe('tools');
        expect(params.has('tag')).toBe(false);
        expect(params.has('q')).toBe(false);
    });

    it('serializes multiple categories as comma-separated', () => {
        const filters: ActiveFilters = {
            categories: ['tools', 'apps'],
            tags: [],
            search: '',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.get('category')).toBe('tools,apps');
    });

    it('serializes tags as comma-separated', () => {
        const filters: ActiveFilters = {
            categories: [],
            tags: ['open-source', 'free'],
            search: '',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.get('tag')).toBe('open-source,free');
    });

    it('serializes search query', () => {
        const filters: ActiveFilters = {
            categories: [],
            tags: [],
            search: 'react hooks',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.get('q')).toBe('react hooks');
    });

    it('serializes all filter types', () => {
        const filters: ActiveFilters = {
            categories: ['tools'],
            tags: ['free'],
            search: 'deploy',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.get('category')).toBe('tools');
        expect(params.get('tag')).toBe('free');
        expect(params.get('q')).toBe('deploy');
    });

    it('omits whitespace-only search', () => {
        const filters: ActiveFilters = {
            categories: [],
            tags: [],
            search: '   ',
        };
        const params = serializeFiltersToUrl(filters);

        expect(params.has('q')).toBe(false);
    });

    describe('custom param names', () => {
        it('uses custom param names for serialization', () => {
            const filters: ActiveFilters = {
                categories: ['tools'],
                tags: ['react'],
                search: 'deploy',
            };
            const params = serializeFiltersToUrl(filters, {
                category: 'cat',
                tag: 'label',
                search: 'search',
            });

            expect(params.get('cat')).toBe('tools');
            expect(params.get('label')).toBe('react');
            expect(params.get('search')).toBe('deploy');
        });
    });
});

describe('round-trip serialization', () => {
    it('parse(serialize(filters)) returns original filters', () => {
        const original: ActiveFilters = {
            categories: ['tools', 'apps'],
            tags: ['open-source', 'free'],
            search: 'deploy hooks',
        };

        const params = serializeFiltersToUrl(original);
        const url = new URL(`https://example.com?${params.toString()}`);
        const roundTripped = parseFiltersFromUrl(url);

        expect(roundTripped.categories).toEqual(original.categories);
        expect(roundTripped.tags).toEqual(original.tags);
        expect(roundTripped.search).toBe(original.search);
    });

    it('round-trip with custom param names', () => {
        const original: ActiveFilters = {
            categories: ['a', 'b'],
            tags: ['x'],
            search: 'test',
        };
        const customParams = { category: 'c', tag: 't', search: 's' };

        const params = serializeFiltersToUrl(original, customParams);
        const url = new URL(`https://example.com?${params.toString()}`);
        const roundTripped = parseFiltersFromUrl(url, customParams);

        expect(roundTripped).toEqual(original);
    });

    it('round-trip with empty filters', () => {
        const original: ActiveFilters = {
            categories: [],
            tags: [],
            search: '',
        };

        const params = serializeFiltersToUrl(original);
        const url = new URL(`https://example.com?${params.toString()}`);
        const roundTripped = parseFiltersFromUrl(url);

        expect(roundTripped).toEqual(original);
    });
});
