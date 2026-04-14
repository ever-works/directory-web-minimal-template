/**
 * Tests for @ever-works/plugin-pagination barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as pagination from '../index';

describe('@ever-works/plugin-pagination barrel exports', () => {
    it('exports paginationPlugin factory', () => {
        expect(pagination.paginationPlugin).toBeTypeOf('function');
    });

    it('exports paginate', () => {
        expect(pagination.paginate).toBeTypeOf('function');
    });

    it('exports generatePagePaths', () => {
        expect(pagination.generatePagePaths).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = ['paginationPlugin', 'paginate', 'generatePagePaths'];
        const actualExports = Object.keys(pagination);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
