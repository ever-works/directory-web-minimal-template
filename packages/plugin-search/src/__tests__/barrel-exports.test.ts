/**
 * Tests for @ever-works/plugin-search barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as search from '../index';

describe('@ever-works/plugin-search barrel exports', () => {
    it('exports searchPlugin factory', () => {
        expect(search.searchPlugin).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = ['searchPlugin'];
        const actualExports = Object.keys(search);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
