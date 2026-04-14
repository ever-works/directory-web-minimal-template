/**
 * Tests for @ever-works/plugin-breadcrumbs barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as breadcrumbs from '../index';

describe('@ever-works/plugin-breadcrumbs barrel exports', () => {
    it('exports breadcrumbsPlugin factory', () => {
        expect(breadcrumbs.breadcrumbsPlugin).toBeTypeOf('function');
    });

    it('exports generateBreadcrumbs', () => {
        expect(breadcrumbs.generateBreadcrumbs).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = ['breadcrumbsPlugin', 'generateBreadcrumbs'];
        const actualExports = Object.keys(breadcrumbs);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
