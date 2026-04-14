/**
 * Tests for @ever-works/plugin-rss barrel export (index.ts).
 */
import { describe, it, expect } from 'vitest';
import * as rss from '../index';

describe('@ever-works/plugin-rss barrel exports', () => {
    it('exports rssPlugin factory', () => {
        expect(rss.rssPlugin).toBeTypeOf('function');
    });

    it('exports buildFeedEntries', () => {
        expect(rss.buildFeedEntries).toBeTypeOf('function');
    });

    it('exports resolveRssConfig', () => {
        expect(rss.resolveRssConfig).toBeTypeOf('function');
    });

    it('exports generateRss and escapeXml and toRfc2822', () => {
        expect(rss.generateRss).toBeTypeOf('function');
        expect(rss.escapeXml).toBeTypeOf('function');
        expect(rss.toRfc2822).toBeTypeOf('function');
    });

    it('exports generateAtom and toAtomDate', () => {
        expect(rss.generateAtom).toBeTypeOf('function');
        expect(rss.toAtomDate).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'rssPlugin', 'buildFeedEntries', 'resolveRssConfig',
            'generateRss', 'escapeXml', 'toRfc2822',
            'generateAtom', 'toAtomDate',
        ];
        const actualExports = Object.keys(rss);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
