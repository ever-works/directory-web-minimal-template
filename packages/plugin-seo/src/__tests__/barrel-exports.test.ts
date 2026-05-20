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

    it('exports the AI-crawler helpers', () => {
        expect(Array.isArray(seo.AI_CRAWLER_USER_AGENTS)).toBe(true);
        expect(seo.resolveAiCrawlerPolicy).toBeTypeOf('function');
        expect(seo.buildAiCrawlerRules).toBeTypeOf('function');
    });

    it('exports the Markdown-mirror renderers and llms-full helper', () => {
        expect(seo.renderItemMarkdown).toBeTypeOf('function');
        expect(seo.renderCategoryMarkdown).toBeTypeOf('function');
        expect(seo.renderTagMarkdown).toBeTypeOf('function');
        expect(seo.renderCollectionMarkdown).toBeTypeOf('function');
        expect(seo.renderComparisonMarkdown).toBeTypeOf('function');
        expect(seo.renderStaticPageMarkdown).toBeTypeOf('function');
        expect(seo.generateLlmsFullTxt).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'seoPlugin',
            'generateMetaTags',
            'generateJsonLd',
            'generateItemJsonLd',
            'generateRobotsTxt',
            'AI_CRAWLER_USER_AGENTS',
            'resolveAiCrawlerPolicy',
            'buildAiCrawlerRules',
            'renderItemMarkdown',
            'renderCategoryMarkdown',
            'renderTagMarkdown',
            'renderCollectionMarkdown',
            'renderComparisonMarkdown',
            'renderStaticPageMarkdown',
            'generateLlmsFullTxt',
        ];
        const actualExports = Object.keys(seo);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
