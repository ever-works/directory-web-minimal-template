import { describe, it, expect } from 'vitest';
import type { ItemData } from '@ever-works/core';
import { sortItems } from '../sort-items.js';

/** Helper to create a minimal valid ItemData object. */
function makeItem(overrides: Partial<ItemData> & { name: string }): ItemData {
    const { name, ...rest } = overrides;
    return {
        id: overrides.id ?? name.toLowerCase().replace(/\s+/g, '-'),
        name,
        slug: overrides.slug ?? name.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        source_url: 'https://example.com',
        category: 'general',
        tags: [],
        updated_at: '2024-01-01 00:00',
        status: 'approved',
        ...rest,
    };
}

const alpha = makeItem({ name: 'Alpha', updated_at: '2024-01-15 10:00' });
const bravo = makeItem({ name: 'Bravo', updated_at: '2024-03-20 08:00', featured: true });
const charlie = makeItem({ name: 'Charlie', updated_at: '2024-02-10 14:30' });
const delta = makeItem({ name: 'Delta', updated_at: '2024-04-05 09:00', featured: true });

describe('sortItems', () => {
    // ---- name sorting ----

    it('sorts by name ascending', () => {
        const result = sortItems([charlie, alpha, delta, bravo], 'name', 'asc');
        expect(result.map((i) => i.name)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
    });

    it('sorts by name descending', () => {
        const result = sortItems([charlie, alpha, delta, bravo], 'name', 'desc');
        expect(result.map((i) => i.name)).toEqual(['Delta', 'Charlie', 'Bravo', 'Alpha']);
    });

    // ---- updated_at sorting ----

    it('sorts by updated_at ascending (oldest first)', () => {
        const result = sortItems([charlie, alpha, delta, bravo], 'updated_at', 'asc');
        expect(result.map((i) => i.name)).toEqual(['Alpha', 'Charlie', 'Bravo', 'Delta']);
    });

    it('sorts by updated_at descending (newest first)', () => {
        const result = sortItems([charlie, alpha, delta, bravo], 'updated_at', 'desc');
        expect(result.map((i) => i.name)).toEqual(['Delta', 'Bravo', 'Charlie', 'Alpha']);
    });

    // ---- featured sorting ----

    it('sorts by featured ascending (featured first, then alphabetical within group)', () => {
        const result = sortItems([charlie, alpha, delta, bravo], 'featured', 'asc');
        // Featured first (Bravo, Delta), then non-featured (Alpha, Charlie)
        expect(result.map((i) => i.name)).toEqual(['Bravo', 'Delta', 'Alpha', 'Charlie']);
    });

    it('sorts by featured descending (non-featured first)', () => {
        const result = sortItems([charlie, alpha, delta, bravo], 'featured', 'desc');
        // Non-featured first (Alpha, Charlie), then featured (Bravo, Delta)
        expect(result.map((i) => i.name)).toEqual(['Alpha', 'Charlie', 'Bravo', 'Delta']);
    });

    // ---- immutability ----

    it('does not mutate the original array', () => {
        const original = [charlie, alpha, bravo];
        const originalCopy = [...original];
        sortItems(original, 'name', 'asc');
        expect(original).toEqual(originalCopy);
    });

    // ---- edge cases ----

    it('returns an empty array when given an empty array', () => {
        const result = sortItems([], 'name', 'asc');
        expect(result).toEqual([]);
    });

    it('returns an array with the same single item when given one item', () => {
        const result = sortItems([alpha], 'name', 'asc');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(alpha);
    });
});
