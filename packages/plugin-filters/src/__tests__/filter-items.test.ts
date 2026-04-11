import { describe, it, expect } from 'vitest';
import { filterItems } from '../filter-items.js';
import type { ActiveFilters } from '../types.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Minimal defaults for an ItemData object. Override fields as needed. */
function makeItem(overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    description: string;
    source_url: string;
    category: string | string[];
    tags: string[];
    featured: boolean;
    updated_at: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
}> = {}) {
    return {
        id: overrides.id ?? 'item-1',
        name: overrides.name ?? 'Test Item',
        slug: overrides.slug ?? 'test-item',
        description: overrides.description ?? 'A test item description',
        source_url: overrides.source_url ?? 'https://example.com',
        category: overrides.category ?? 'general',
        tags: overrides.tags ?? [],
        featured: overrides.featured ?? false,
        updated_at: overrides.updated_at ?? '2025-01-01 00:00',
        status: overrides.status ?? 'approved',
    };
}

/** Shorthand for an empty / no-op filter set. */
function noFilters(): ActiveFilters {
    return { categories: [], tags: [], search: '' };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const itemAlpha = makeItem({
    id: 'alpha',
    name: 'Alpha Tool',
    slug: 'alpha-tool',
    description: 'A powerful deployment tool',
    category: 'tools',
    tags: ['open-source', 'devops'],
});

const itemBravo = makeItem({
    id: 'bravo',
    name: 'Bravo Platform',
    slug: 'bravo-platform',
    description: 'Enterprise platform for teams',
    category: 'platforms',
    tags: ['enterprise', 'saas'],
});

const itemCharlie = makeItem({
    id: 'charlie',
    name: 'Charlie Library',
    slug: 'charlie-library',
    description: 'Lightweight utility library',
    category: 'libraries',
    tags: ['open-source', 'lightweight'],
});

const itemDelta = makeItem({
    id: 'delta',
    name: 'Delta Service',
    slug: 'delta-service',
    description: 'Cloud deployment service',
    category: ['tools', 'platforms'],
    tags: ['cloud', 'devops'],
});

const allItems = [itemAlpha, itemBravo, itemCharlie, itemDelta];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('filterItems', () => {
    // 1. No filters active
    describe('when no filters are active', () => {
        it('returns all items when categories, tags, and search are empty', () => {
            const result = filterItems(allItems, noFilters());
            expect(result).toEqual(allItems);
        });

        it('returns a new array (not the same reference)', () => {
            const result = filterItems(allItems, noFilters());
            expect(result).not.toBe(allItems);
        });
    });

    // 2. Category filter — single string category on items
    describe('category filter (string category)', () => {
        it('filters by a single category', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                categories: ['tools'],
            });
            expect(result.map((i) => i.id)).toEqual(['alpha', 'delta']);
        });

        it('uses OR logic for multiple selected categories', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                categories: ['tools', 'libraries'],
            });
            expect(result.map((i) => i.id)).toEqual(['alpha', 'charlie', 'delta']);
        });

        it('returns empty when no items match the category', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                categories: ['nonexistent'],
            });
            expect(result).toEqual([]);
        });
    });

    // 3. Category filter — array categories on items
    describe('category filter with array categories on items', () => {
        it('matches an item whose category array contains a selected value', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                categories: ['platforms'],
            });
            // itemBravo has category 'platforms', itemDelta has category ['tools','platforms']
            expect(result.map((i) => i.id)).toEqual(['bravo', 'delta']);
        });

        it('matches when any element of the category array is in the filter set', () => {
            const multiCatItem = makeItem({
                id: 'multi',
                category: ['analytics', 'dashboards', 'tools'],
                tags: [],
            });
            const result = filterItems([multiCatItem], {
                ...noFilters(),
                categories: ['dashboards'],
            });
            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe('multi');
        });
    });

    // 4. Tag filter
    describe('tag filter', () => {
        it('filters by a single tag', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                tags: ['open-source'],
            });
            expect(result.map((i) => i.id)).toEqual(['alpha', 'charlie']);
        });

        it('uses OR logic for multiple selected tags', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                tags: ['enterprise', 'cloud'],
            });
            expect(result.map((i) => i.id)).toEqual(['bravo', 'delta']);
        });

        it('returns empty when no items match the tag', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                tags: ['nonexistent-tag'],
            });
            expect(result).toEqual([]);
        });
    });

    // 5. Search filter
    describe('search filter', () => {
        it('matches against item name (case-insensitive)', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: 'alpha',
            });
            expect(result.map((i) => i.id)).toEqual(['alpha']);
        });

        it('matches against item description (case-insensitive)', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: 'deployment',
            });
            // Alpha description: "A powerful deployment tool"
            // Delta description: "Cloud deployment service"
            expect(result.map((i) => i.id)).toEqual(['alpha', 'delta']);
        });

        it('is case-insensitive', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: 'BRAVO',
            });
            expect(result.map((i) => i.id)).toEqual(['bravo']);
        });

        it('matches partial strings', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: 'plat',
            });
            // Bravo name: "Bravo Platform", Delta description doesn't match "plat"
            expect(result.map((i) => i.id)).toEqual(['bravo']);
        });

        it('trims whitespace from search query', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: '  alpha  ',
            });
            expect(result.map((i) => i.id)).toEqual(['alpha']);
        });

        it('treats whitespace-only search as no filter', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: '   ',
            });
            expect(result).toEqual(allItems);
        });
    });

    // 6. Combined filters (AND between groups)
    describe('combined filters', () => {
        it('applies category AND tag filters together', () => {
            const result = filterItems(allItems, {
                categories: ['tools'],
                tags: ['devops'],
                search: '',
            });
            // tools: alpha, delta; devops: alpha, delta => intersection: alpha, delta
            expect(result.map((i) => i.id)).toEqual(['alpha', 'delta']);
        });

        it('category AND tag with disjoint results returns empty', () => {
            const result = filterItems(allItems, {
                categories: ['libraries'],
                tags: ['enterprise'],
                search: '',
            });
            // libraries: charlie; enterprise: bravo => intersection: empty
            expect(result).toEqual([]);
        });

        it('applies category AND search together', () => {
            const result = filterItems(allItems, {
                categories: ['tools'],
                tags: [],
                search: 'powerful',
            });
            // tools: alpha, delta; "powerful" in description: alpha
            expect(result.map((i) => i.id)).toEqual(['alpha']);
        });

        it('applies tag AND search together', () => {
            const result = filterItems(allItems, {
                categories: [],
                tags: ['open-source'],
                search: 'library',
            });
            // open-source: alpha, charlie; "library" in name: charlie
            expect(result.map((i) => i.id)).toEqual(['charlie']);
        });

        it('applies all three filters together', () => {
            const result = filterItems(allItems, {
                categories: ['tools', 'platforms'],
                tags: ['devops'],
                search: 'cloud',
            });
            // categories tools|platforms: alpha, bravo, delta
            // tags devops: alpha, delta
            // search "cloud": delta (description: "Cloud deployment service")
            expect(result.map((i) => i.id)).toEqual(['delta']);
        });

        it('returns empty when all three filters conflict', () => {
            const result = filterItems(allItems, {
                categories: ['libraries'],
                tags: ['enterprise'],
                search: 'deployment',
            });
            expect(result).toEqual([]);
        });
    });

    // 7. Empty result when nothing matches
    describe('empty results', () => {
        it('returns empty array when category filter excludes everything', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                categories: ['does-not-exist'],
            });
            expect(result).toEqual([]);
        });

        it('returns empty array when tag filter excludes everything', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                tags: ['does-not-exist'],
            });
            expect(result).toEqual([]);
        });

        it('returns empty array when search matches nothing', () => {
            const result = filterItems(allItems, {
                ...noFilters(),
                search: 'zzzzzznotfound',
            });
            expect(result).toEqual([]);
        });
    });

    // 8. Empty items array
    describe('empty items array', () => {
        it('returns empty array when items list is empty with no filters', () => {
            const result = filterItems([], noFilters());
            expect(result).toEqual([]);
        });

        it('returns empty array when items list is empty with active filters', () => {
            const result = filterItems([], {
                categories: ['tools'],
                tags: ['open-source'],
                search: 'test',
            });
            expect(result).toEqual([]);
        });
    });
});
