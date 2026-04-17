import { describe, it, expect } from 'vitest';
import * as exports from '../index';

describe('@ever-works/plugin-related-items barrel exports', () => {
    it('exports relatedItemsPlugin', () => {
        expect(exports.relatedItemsPlugin).toBeDefined();
        expect(typeof exports.relatedItemsPlugin).toBe('function');
    });

    it('exports computeRelatedItems', () => {
        expect(exports.computeRelatedItems).toBeDefined();
        expect(typeof exports.computeRelatedItems).toBe('function');
    });

    it('exports computeScore', () => {
        expect(exports.computeScore).toBeDefined();
        expect(typeof exports.computeScore).toBe('function');
    });

    it('exports resolveRelatedConfig', () => {
        expect(exports.resolveRelatedConfig).toBeDefined();
        expect(typeof exports.resolveRelatedConfig).toBe('function');
    });
});
