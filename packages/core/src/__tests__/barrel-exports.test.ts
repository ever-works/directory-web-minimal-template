/**
 * Tests for @ever-works/core barrel export (index.ts).
 *
 * Validates that all public API symbols are re-exported correctly.
 * Catches accidental removal or renaming of exports.
 */
import { describe, it, expect } from 'vitest';
import * as core from '../index';

describe('@ever-works/core barrel exports', () => {
    // Loaders
    it('exports loadConfig', () => {
        expect(core.loadConfig).toBeTypeOf('function');
    });

    it('exports loadCategories', () => {
        expect(core.loadCategories).toBeTypeOf('function');
    });

    it('exports loadTags', () => {
        expect(core.loadTags).toBeTypeOf('function');
    });

    it('exports loadCollections', () => {
        expect(core.loadCollections).toBeTypeOf('function');
    });

    it('exports loadItems and loadItem', () => {
        expect(core.loadItems).toBeTypeOf('function');
        expect(core.loadItem).toBeTypeOf('function');
    });

    it('exports loadComparisons and loadComparison', () => {
        expect(core.loadComparisons).toBeTypeOf('function');
        expect(core.loadComparison).toBeTypeOf('function');
    });

    it('exports loadPages and loadPage', () => {
        expect(core.loadPages).toBeTypeOf('function');
        expect(core.loadPage).toBeTypeOf('function');
    });

    // Content reader
    it('exports loadContent', () => {
        expect(core.loadContent).toBeTypeOf('function');
    });

    // Content cache
    it('exports ContentCache class', () => {
        expect(core.ContentCache).toBeTypeOf('function');
    });

    // Logger
    it('exports coreLogger and createCoreLogger', () => {
        expect(core.coreLogger).toBeDefined();
        expect(core.createCoreLogger).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'loadConfig', 'loadCategories', 'loadTags', 'loadCollections',
            'loadItems', 'loadItem', 'loadComparisons', 'loadComparison',
            'loadPages', 'loadPage', 'loadContent', 'ContentCache',
            'coreLogger', 'createCoreLogger',
        ];
        const actualExports = Object.keys(core);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
