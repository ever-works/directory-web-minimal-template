/**
 * Tests for @ever-works/plugin-sitemap barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as sitemap from '../index';

describe('@ever-works/plugin-sitemap barrel exports', () => {
    it('exports sitemapPlugin factory', () => {
        expect(sitemap.sitemapPlugin).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = ['sitemapPlugin'];
        const actualExports = Object.keys(sitemap);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
