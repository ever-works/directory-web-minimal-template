import { describe, it, expect } from 'vitest';
import { paginate, generatePagePaths } from '../paginate.js';

// ---------------------------------------------------------------------------
// paginate
// ---------------------------------------------------------------------------

describe('paginate', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1); // [1..25]

    it('returns the first page of a multi-page set', () => {
        const result = paginate(items, { page: 1, perPage: 10 });
        expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(result.currentPage).toBe(1);
        expect(result.totalPages).toBe(3);
        expect(result.totalItems).toBe(25);
    });

    it('returns the last (partial) page', () => {
        const result = paginate(items, { page: 3, perPage: 10 });
        expect(result.items).toEqual([21, 22, 23, 24, 25]);
        expect(result.currentPage).toBe(3);
    });

    it('returns a middle page', () => {
        const result = paginate(items, { page: 2, perPage: 10 });
        expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        expect(result.currentPage).toBe(2);
    });

    it('clamps page to max when page is too high', () => {
        const result = paginate(items, { page: 999, perPage: 10 });
        expect(result.currentPage).toBe(3);
        expect(result.items).toEqual([21, 22, 23, 24, 25]);
    });

    it('clamps page to 1 when page is too low', () => {
        const result = paginate(items, { page: -5, perPage: 10 });
        expect(result.currentPage).toBe(1);
        expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('sets hasPrev and hasNext correctly', () => {
        const first = paginate(items, { page: 1, perPage: 10 });
        expect(first.hasPrev).toBe(false);
        expect(first.hasNext).toBe(true);

        const middle = paginate(items, { page: 2, perPage: 10 });
        expect(middle.hasPrev).toBe(true);
        expect(middle.hasNext).toBe(true);

        const last = paginate(items, { page: 3, perPage: 10 });
        expect(last.hasPrev).toBe(true);
        expect(last.hasNext).toBe(false);
    });

    it('sets prevPage and nextPage correctly', () => {
        const first = paginate(items, { page: 1, perPage: 10 });
        expect(first.prevPage).toBeNull();
        expect(first.nextPage).toBe(2);

        const middle = paginate(items, { page: 2, perPage: 10 });
        expect(middle.prevPage).toBe(1);
        expect(middle.nextPage).toBe(3);

        const last = paginate(items, { page: 3, perPage: 10 });
        expect(last.prevPage).toBe(2);
        expect(last.nextPage).toBeNull();
    });

    it('throws RangeError when perPage < 1', () => {
        expect(() => paginate(items, { page: 1, perPage: 0 })).toThrow(RangeError);
        expect(() => paginate(items, { page: 1, perPage: -1 })).toThrow(RangeError);
    });

    it('returns totalPages=1 and empty items for an empty array', () => {
        const result = paginate([], { page: 1, perPage: 10 });
        expect(result.totalPages).toBe(1);
        expect(result.items).toEqual([]);
        expect(result.totalItems).toBe(0);
    });

    it('returns a single page when items fit exactly', () => {
        const exact = [1, 2, 3, 4, 5];
        const result = paginate(exact, { page: 1, perPage: 5 });
        expect(result.totalPages).toBe(1);
        expect(result.items).toEqual([1, 2, 3, 4, 5]);
        expect(result.hasPrev).toBe(false);
        expect(result.hasNext).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// generatePagePaths
// ---------------------------------------------------------------------------

describe('generatePagePaths', () => {
    it('generates the correct number of page entries', () => {
        const entries = generatePagePaths(25, 10);
        expect(entries).toHaveLength(3);
    });

    it('page params are strings', () => {
        const entries = generatePagePaths(25, 10);
        for (const entry of entries) {
            expect(typeof entry.params.page).toBe('string');
        }
        expect(entries[0]!.params.page).toBe('1');
        expect(entries[2]!.params.page).toBe('3');
    });

    it('props contain correct currentPage and totalPages', () => {
        const entries = generatePagePaths(25, 10);
        expect(entries[0]!.props).toEqual({ currentPage: 1, totalPages: 3 });
        expect(entries[1]!.props).toEqual({ currentPage: 2, totalPages: 3 });
        expect(entries[2]!.props).toEqual({ currentPage: 3, totalPages: 3 });
    });

    it('maxPages limits the output', () => {
        const entries = generatePagePaths(100, 10, 3);
        expect(entries).toHaveLength(3);
        expect(entries[2]!.props).toEqual({ currentPage: 3, totalPages: 3 });
    });

    it('returns 1 page entry when total is 0', () => {
        const entries = generatePagePaths(0, 10);
        expect(entries).toHaveLength(1);
        expect(entries[0]!.params.page).toBe('1');
        expect(entries[0]!.props).toEqual({ currentPage: 1, totalPages: 1 });
    });

    it('throws RangeError when perPage < 1', () => {
        expect(() => generatePagePaths(10, 0)).toThrow(RangeError);
        expect(() => generatePagePaths(10, -1)).toThrow(RangeError);
    });
});
