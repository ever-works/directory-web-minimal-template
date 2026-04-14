/**
 * Tests for @ever-works/plugin-filters barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as filters from '../index';

describe('@ever-works/plugin-filters barrel exports', () => {
    it('exports filtersPlugin factory', () => {
        expect(filters.filtersPlugin).toBeTypeOf('function');
    });

    it('exports filterItems', () => {
        expect(filters.filterItems).toBeTypeOf('function');
    });

    it('exports parseFiltersFromUrl and serializeFiltersToUrl', () => {
        expect(filters.parseFiltersFromUrl).toBeTypeOf('function');
        expect(filters.serializeFiltersToUrl).toBeTypeOf('function');
    });

    it('exports DEFAULT_PARAM_NAMES', () => {
        expect(filters.DEFAULT_PARAM_NAMES).toBeDefined();
        expect(filters.DEFAULT_PARAM_NAMES).toHaveProperty('category');
        expect(filters.DEFAULT_PARAM_NAMES).toHaveProperty('tag');
        expect(filters.DEFAULT_PARAM_NAMES).toHaveProperty('search');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'filtersPlugin', 'filterItems', 'parseFiltersFromUrl',
            'serializeFiltersToUrl', 'DEFAULT_PARAM_NAMES',
        ];
        const actualExports = Object.keys(filters);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
