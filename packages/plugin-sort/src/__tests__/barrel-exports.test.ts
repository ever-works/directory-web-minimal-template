/**
 * Tests for @ever-works/plugin-sort barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as sort from '../index';

describe('@ever-works/plugin-sort barrel exports', () => {
    it('exports sortPlugin factory', () => {
        expect(sort.sortPlugin).toBeTypeOf('function');
    });

    it('exports sortItems', () => {
        expect(sort.sortItems).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = ['sortPlugin', 'sortItems'];
        const actualExports = Object.keys(sort);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
