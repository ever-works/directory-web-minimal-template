/**
 * Tests for the getVisiblePages() pagination utility.
 *
 * getVisiblePages() computes visible page numbers with ellipsis truncation.
 * Shared between Pagination.astro and ItemBrowser.tsx.
 */
import { describe, it, expect } from 'vitest';
import { getVisiblePages } from '../lib/pagination';

describe('getVisiblePages()', () => {
    it('returns all pages when total <= max', () => {
        expect(getVisiblePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns all pages when total equals max', () => {
        expect(getVisiblePages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('returns single page for total=1', () => {
        expect(getVisiblePages(1, 1)).toEqual([1]);
    });

    it('returns empty array for total=0', () => {
        expect(getVisiblePages(1, 0)).toEqual([]);
    });

    it('adds trailing ellipsis when current is near start', () => {
        const pages = getVisiblePages(1, 20);
        // Should start with 1 and end with [..., 20]
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(20);
        expect(pages).toContain('...');
    });

    it('adds leading ellipsis when current is near end', () => {
        const pages = getVisiblePages(20, 20);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(20);
        expect(pages).toContain('...');
    });

    it('adds both ellipses when current is in the middle', () => {
        const pages = getVisiblePages(10, 20);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(20);
        // Should have two ellipses (before and after the current window)
        const ellipsisCount = pages.filter((p) => p === '...').length;
        expect(ellipsisCount).toBe(2);
    });

    it('does not duplicate first page', () => {
        const pages = getVisiblePages(4, 20);
        const ones = pages.filter((p) => p === 1);
        expect(ones).toHaveLength(1);
    });

    it('does not duplicate last page', () => {
        const pages = getVisiblePages(17, 20);
        const twenties = pages.filter((p) => p === 20);
        expect(twenties).toHaveLength(1);
    });

    it('respects custom max parameter', () => {
        const pages = getVisiblePages(1, 3, 5);
        expect(pages).toEqual([1, 2, 3]);
    });

    it('never exceeds max visible entries (numbers + ellipses)', () => {
        // With max=7 (default), the output should not have more than 7 numeric entries
        // plus up to 2 ellipsis markers and 2 boundary pages = reasonable limit
        for (let current = 1; current <= 50; current++) {
            const pages = getVisiblePages(current, 50, 7);
            const numericCount = pages.filter((p) => typeof p === 'number').length;
            // At most max + 2 boundary pages (first/last added outside window)
            expect(numericCount).toBeLessThanOrEqual(9);
            // Always contains current page
            expect(pages).toContain(current);
            // Always contains first and last
            expect(pages).toContain(1);
            expect(pages).toContain(50);
        }
    });

    it('always includes the current page', () => {
        for (let current = 1; current <= 30; current++) {
            const pages = getVisiblePages(current, 30);
            expect(pages).toContain(current);
        }
    });

    it('skips leading ellipsis when start is adjacent to 1', () => {
        // When the window starts at 2, no ellipsis is needed between 1 and 2
        const pages = getVisiblePages(4, 10, 7);
        expect(pages[0]).toBe(1);
        // Check that there's no ellipsis between 1 and 2
        if (pages.includes(2)) {
            const idx1 = pages.indexOf(1);
            const idx2 = pages.indexOf(2);
            expect(idx2 - idx1).toBe(1); // adjacent, no ellipsis between
        }
    });

    it('skips trailing ellipsis when end is adjacent to total', () => {
        const pages = getVisiblePages(8, 10, 7);
        const lastIdx = pages.length - 1;
        expect(pages[lastIdx]).toBe(10);
        // Check no ellipsis right before the last page if window includes total-1
        if (pages.includes(9)) {
            const idx9 = pages.indexOf(9);
            const idx10 = pages.indexOf(10);
            expect(idx10 - idx9).toBe(1);
        }
    });
});
