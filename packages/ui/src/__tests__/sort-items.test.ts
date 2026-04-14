/**
 * Tests for the sortItemsByOption() utility function.
 *
 * This is the canonical client-side sort used by ItemBrowser and sample apps.
 */
import { describe, it, expect } from 'vitest';
import { sortItemsByOption } from '../lib/sort-items';
import type { Sortable } from '../lib/sort-items';

/** Minimal sortable item for testing. */
interface TestItem extends Sortable {
    slug: string;
}

function makeItem(overrides: Partial<TestItem> & { name: string }): TestItem {
    return {
        slug: overrides.name.toLowerCase().replace(/\s+/g, '-'),
        updated_at: '2024-01-01 00:00',
        featured: false,
        ...overrides,
    };
}

const alpha = makeItem({ name: 'Alpha', updated_at: '2024-01-15 12:00' });
const beta = makeItem({ name: 'Beta', updated_at: '2024-03-10 08:00', featured: true });
const gamma = makeItem({ name: 'Gamma', updated_at: '2024-02-20 16:00' });
const delta = makeItem({ name: 'Delta', updated_at: '2024-04-05 10:00', featured: true });

const items: TestItem[] = [gamma, alpha, delta, beta];

describe('sortItemsByOption()', () => {
    it('does not mutate the original array', () => {
        const original = [...items];
        sortItemsByOption(items, 'name-asc');
        expect(items).toEqual(original);
    });

    it('sorts by name ascending', () => {
        const sorted = sortItemsByOption(items, 'name-asc');
        expect(sorted.map((i) => i.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    });

    it('sorts by name descending', () => {
        const sorted = sortItemsByOption(items, 'name-desc');
        expect(sorted.map((i) => i.name)).toEqual(['Gamma', 'Delta', 'Beta', 'Alpha']);
    });

    it('sorts by date ascending (oldest first)', () => {
        const sorted = sortItemsByOption(items, 'date-asc');
        expect(sorted.map((i) => i.name)).toEqual(['Alpha', 'Gamma', 'Beta', 'Delta']);
    });

    it('sorts by date descending (newest first)', () => {
        const sorted = sortItemsByOption(items, 'date-desc');
        expect(sorted.map((i) => i.name)).toEqual(['Delta', 'Beta', 'Gamma', 'Alpha']);
    });

    it('sorts featured items first, then alphabetically', () => {
        const sorted = sortItemsByOption(items, 'featured');
        expect(sorted.map((i) => i.name)).toEqual(['Beta', 'Delta', 'Alpha', 'Gamma']);
    });

    it('handles empty array', () => {
        expect(sortItemsByOption([], 'name-asc')).toEqual([]);
    });

    it('handles single item', () => {
        const result = sortItemsByOption([alpha], 'name-desc');
        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe('Alpha');
    });

    it('handles all items featured — falls back to alphabetical', () => {
        const allFeatured = items.map((i) => ({ ...i, featured: true }));
        const sorted = sortItemsByOption(allFeatured, 'featured');
        expect(sorted.map((i) => i.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    });

    it('handles no items featured — sorts alphabetically', () => {
        const noneFeatured = items.map((i) => ({ ...i, featured: false }));
        const sorted = sortItemsByOption(noneFeatured, 'featured');
        expect(sorted.map((i) => i.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    });

    it('handles items with same name — stable-ish sort', () => {
        const dupes = [
            makeItem({ name: 'Same', updated_at: '2024-01-01 00:00' }),
            makeItem({ name: 'Same', updated_at: '2024-06-01 00:00' }),
        ];
        const sorted = sortItemsByOption(dupes, 'name-asc');
        expect(sorted).toHaveLength(2);
        expect(sorted[0]!.name).toBe('Same');
    });

    it('sorts by date with identical dates — preserves relative order', () => {
        const sameDate = [
            makeItem({ name: 'Zebra', updated_at: '2024-05-01 12:00' }),
            makeItem({ name: 'Apple', updated_at: '2024-05-01 12:00' }),
        ];
        const sorted = sortItemsByOption(sameDate, 'date-asc');
        expect(sorted).toHaveLength(2);
    });
});
