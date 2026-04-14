/**
 * Tests for @ever-works/plugin-seo barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as seo from '../index';

describe('@ever-works/plugin-seo barrel exports', () => {
    it('exports seoPlugin factory', () => {
        expect(seo.seoPlugin).toBeTypeOf('function');
    });

    it('exports generateMetaTags', () => {
        expect(seo.generateMetaTags).toBeTypeOf('function');
    });

    it('exports generateJsonLd and generateItemJsonLd', () => {
        expect(seo.generateJsonLd).toBeTypeOf('function');
        expect(seo.generateItemJsonLd).toBeTypeOf('function');
    });

    it('exports generateRobotsTxt', () => {
        expect(seo.generateRobotsTxt).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'seoPlugin', 'generateMetaTags', 'generateJsonLd',
            'generateItemJsonLd', 'generateRobotsTxt',
        ];
        const actualExports = Object.keys(seo);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
