import { describe, it, expect } from 'vitest';
import type { ItemData } from '@ever-works/core';
import { computeScore, computeRelatedItems } from '../compute-related';
import type { ResolvedRelatedConfig } from '../types';

const DEFAULT_CONFIG: ResolvedRelatedConfig = {
    maxItems: 5,
    tagWeight: 1,
    categoryWeight: 2,
    featuredBoost: 0.5,
    minScore: 0,
};

function makeItem(overrides: Partial<ItemData>): ItemData {
    return {
        id: overrides.slug ?? 'item',
        slug: 'item',
        name: 'Item',
        description: 'A test item',
        source_url: 'https://example.com',
        category: 'default',
        tags: [],
        updated_at: '2026-01-01 00:00',
        status: 'approved',
        ...overrides,
    };
}

describe('computeScore', () => {
    it('returns 0 for items with no shared tags or category', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x'] });
        const candidate = makeItem({ slug: 'b', category: 'cat2', tags: ['y'] });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(0);
    });

    it('scores shared tags', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x', 'y', 'z'] });
        const candidate = makeItem({ slug: 'b', category: 'cat2', tags: ['y', 'z', 'w'] });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(2);
    });

    it('scores shared category', () => {
        const source = makeItem({ slug: 'a', category: 'cat1' });
        const candidate = makeItem({ slug: 'b', category: 'cat1' });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(2);
    });

    it('scores featured boost', () => {
        const source = makeItem({ slug: 'a', category: 'cat1' });
        const candidate = makeItem({ slug: 'b', category: 'cat2', featured: true });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(0.5);
    });

    it('combines tag + category + featured scores', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x', 'y'] });
        const candidate = makeItem({
            slug: 'b',
            category: 'cat1',
            tags: ['x'],
            featured: true,
        });
        // 1 shared tag (1) + same category (2) + featured (0.5) = 3.5
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(3.5);
    });

    it('handles array categories', () => {
        const source = makeItem({ slug: 'a', category: ['cat1', 'cat2'] });
        const candidate = makeItem({ slug: 'b', category: ['cat2', 'cat3'] });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(2);
    });

    it('handles empty tags gracefully', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: [] });
        const candidate = makeItem({ slug: 'b', category: 'cat2', tags: [] });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(0);
    });

    it('handles undefined tags', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: undefined as unknown as string[] });
        const candidate = makeItem({ slug: 'b', category: 'cat1', tags: undefined as unknown as string[] });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(2);
    });

    it('handles empty string category (non-array)', () => {
        const source = makeItem({ slug: 'a', category: '' });
        const candidate = makeItem({ slug: 'b', category: '' });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(0);
    });

    it('handles undefined category (non-array)', () => {
        const source = makeItem({ slug: 'a', category: undefined as unknown as string });
        const candidate = makeItem({ slug: 'b', category: undefined as unknown as string });
        expect(computeScore(source, candidate, DEFAULT_CONFIG)).toBe(0);
    });

    it('respects custom weights', () => {
        const config: ResolvedRelatedConfig = {
            ...DEFAULT_CONFIG,
            tagWeight: 3,
            categoryWeight: 5,
            featuredBoost: 2,
        };
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x'] });
        const candidate = makeItem({
            slug: 'b',
            category: 'cat1',
            tags: ['x'],
            featured: true,
        });
        // 1 shared tag (3) + same category (5) + featured (2) = 10
        expect(computeScore(source, candidate, config)).toBe(10);
    });
});

describe('computeRelatedItems', () => {
    it('returns empty for single item', () => {
        const item = makeItem({ slug: 'a' });
        const result = computeRelatedItems(item, [item], DEFAULT_CONFIG);
        expect(result).toEqual([]);
    });

    it('returns empty for zero items', () => {
        const item = makeItem({ slug: 'a' });
        const result = computeRelatedItems(item, [], DEFAULT_CONFIG);
        expect(result).toEqual([]);
    });

    it('excludes the source item from results', () => {
        const item = makeItem({ slug: 'a', category: 'cat1', tags: ['x'] });
        const result = computeRelatedItems(item, [item], DEFAULT_CONFIG);
        expect(result.every((r) => r.slug !== 'a')).toBe(true);
    });

    it('ranks items by score descending', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x', 'y'] });
        const low = makeItem({ slug: 'low', category: 'cat2', tags: ['x'] });
        const high = makeItem({ slug: 'high', category: 'cat1', tags: ['x', 'y'] });
        const mid = makeItem({ slug: 'mid', category: 'cat1', tags: [] });

        const result = computeRelatedItems(
            source,
            [source, low, high, mid],
            DEFAULT_CONFIG,
        );

        expect(result[0]!.slug).toBe('high');
        expect(result[1]!.slug).toBe('mid');
        expect(result[2]!.slug).toBe('low');
    });

    it('limits results to maxItems', () => {
        const source = makeItem({ slug: 'a', category: 'cat1' });
        const items = [source];
        for (let i = 0; i < 10; i++) {
            items.push(makeItem({ slug: `item-${i}`, category: 'cat1' }));
        }

        const config = { ...DEFAULT_CONFIG, maxItems: 3 };
        const result = computeRelatedItems(source, items, config);
        expect(result).toHaveLength(3);
    });

    it('filters items below minScore', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x'] });
        const unrelated = makeItem({ slug: 'b', category: 'cat2', tags: ['y'] });
        const related = makeItem({ slug: 'c', category: 'cat1', tags: ['x'] });

        const config = { ...DEFAULT_CONFIG, minScore: 1 };
        const result = computeRelatedItems(
            source,
            [source, unrelated, related],
            config,
        );

        expect(result).toHaveLength(1);
        expect(result[0]!.slug).toBe('c');
    });

    it('includes expected fields in RelatedItemRef', () => {
        const source = makeItem({ slug: 'a', category: 'cat1', tags: ['x'] });
        const candidate = makeItem({
            slug: 'b',
            name: 'Candidate',
            description: 'A candidate',
            category: 'cat1',
            tags: ['x'],
            icon_url: 'https://example.com/icon.png',
        });

        const result = computeRelatedItems(
            source,
            [source, candidate],
            DEFAULT_CONFIG,
        );

        expect(result[0]).toEqual({
            slug: 'b',
            name: 'Candidate',
            description: 'A candidate',
            category: 'cat1',
            icon_url: 'https://example.com/icon.png',
            score: 3,
        });
    });

    it('uses first category for array categories', () => {
        const source = makeItem({ slug: 'a', category: 'cat1' });
        const candidate = makeItem({
            slug: 'b',
            category: ['cat1', 'cat2'],
        });

        const result = computeRelatedItems(
            source,
            [source, candidate],
            DEFAULT_CONFIG,
        );

        expect(result[0]!.category).toBe('cat1');
    });

    it('sets category to undefined when candidate has empty string category', () => {
        const source = makeItem({ slug: 'a', tags: ['shared'] });
        const candidate = makeItem({
            slug: 'b',
            category: '',
            tags: ['shared'],
        });

        const result = computeRelatedItems(
            source,
            [source, candidate],
            DEFAULT_CONFIG,
        );

        expect(result[0]!.category).toBeUndefined();
    });

    it('handles candidates with no icon_url', () => {
        const source = makeItem({ slug: 'a', category: 'cat1' });
        const candidate = makeItem({
            slug: 'b',
            category: 'cat1',
            icon_url: undefined,
        });

        const result = computeRelatedItems(
            source,
            [source, candidate],
            DEFAULT_CONFIG,
        );

        expect(result[0]!.icon_url).toBeUndefined();
    });
});
