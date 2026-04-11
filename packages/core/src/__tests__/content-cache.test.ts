import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContentCache } from '../content-cache.js';
import type { ContentData, SiteConfig } from '../types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestConfig(): SiteConfig {
    return {
        company_name: 'Test',
        item_name: 'Item',
        items_name: 'Items',
        copyright_year: 2025,
    };
}

function createTestData(overrides?: Partial<ContentData>): ContentData {
    return {
        items: [],
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: createTestConfig(),
        total: 0,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ContentCache', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // ------------------------------------------------------------------
    // constructor / defaults
    // ------------------------------------------------------------------
    describe('constructor', () => {
        it('creates a cache with default ttlMs of 0 (cache forever)', () => {
            const cache = new ContentCache();
            const status = cache.getStatus();
            expect(status.ttlMs).toBe(0);
            expect(status.cached).toBe(false);
        });

        it('accepts a custom ttlMs', () => {
            const cache = new ContentCache({ ttlMs: 5000 });
            const status = cache.getStatus();
            expect(status.ttlMs).toBe(5000);
        });
    });

    // ------------------------------------------------------------------
    // get — loading
    // ------------------------------------------------------------------
    describe('get', () => {
        it('calls the loader on first get', async () => {
            const cache = new ContentCache();
            const data = createTestData({ total: 10 });
            const loader = vi.fn().mockResolvedValue(data);

            const result = await cache.get(loader);

            expect(loader).toHaveBeenCalledOnce();
            expect(result).toBe(data);
            expect(result.total).toBe(10);
        });

        it('returns cached data on subsequent get without calling loader again (ttl=0)', async () => {
            const cache = new ContentCache({ ttlMs: 0 });
            const data = createTestData({ total: 42 });
            const loader = vi.fn().mockResolvedValue(data);

            const first = await cache.get(loader);
            const second = await cache.get(loader);

            expect(loader).toHaveBeenCalledOnce();
            expect(second).toBe(first);
        });

        it('reloads when TTL expires', async () => {
            const cache = new ContentCache({ ttlMs: 1000 });
            const data1 = createTestData({ total: 1 });
            const data2 = createTestData({ total: 2 });
            const loader = vi.fn()
                .mockResolvedValueOnce(data1)
                .mockResolvedValueOnce(data2);

            // First load
            const first = await cache.get(loader);
            expect(first.total).toBe(1);
            expect(loader).toHaveBeenCalledTimes(1);

            // Within TTL — should not reload
            vi.advanceTimersByTime(500);
            const second = await cache.get(loader);
            expect(second.total).toBe(1);
            expect(loader).toHaveBeenCalledTimes(1);

            // Past TTL — should reload
            vi.advanceTimersByTime(600);
            const third = await cache.get(loader);
            expect(third.total).toBe(2);
            expect(loader).toHaveBeenCalledTimes(2);
        });

        it('caches forever when ttlMs is 0', async () => {
            const cache = new ContentCache({ ttlMs: 0 });
            const data = createTestData();
            const loader = vi.fn().mockResolvedValue(data);

            await cache.get(loader);

            // Advance far into the future
            vi.advanceTimersByTime(999_999_999);

            await cache.get(loader);
            expect(loader).toHaveBeenCalledOnce();
        });
    });

    // ------------------------------------------------------------------
    // get — deduplication
    // ------------------------------------------------------------------
    describe('deduplication', () => {
        it('deduplicates concurrent get calls', async () => {
            const cache = new ContentCache();
            const data = createTestData({ total: 5 });

            let resolveLoader!: (value: ContentData) => void;
            const loader = vi.fn().mockReturnValue(
                new Promise<ContentData>((r) => { resolveLoader = r; }),
            );

            // Start two concurrent gets
            const promise1 = cache.get(loader);
            const promise2 = cache.get(loader);

            // Resolve the single inflight load
            resolveLoader(data);

            const [result1, result2] = await Promise.all([promise1, promise2]);

            expect(loader).toHaveBeenCalledOnce();
            expect(result1).toBe(data);
            expect(result2).toBe(data);
        });

        it('allows a new load after the previous one completes', async () => {
            const cache = new ContentCache({ ttlMs: 100 });
            const data1 = createTestData({ total: 1 });
            const data2 = createTestData({ total: 2 });
            const loader = vi.fn()
                .mockResolvedValueOnce(data1)
                .mockResolvedValueOnce(data2);

            await cache.get(loader);
            expect(loader).toHaveBeenCalledTimes(1);

            // Expire the cache
            vi.advanceTimersByTime(200);

            const result = await cache.get(loader);
            expect(result.total).toBe(2);
            expect(loader).toHaveBeenCalledTimes(2);
        });
    });

    // ------------------------------------------------------------------
    // get — error handling
    // ------------------------------------------------------------------
    describe('error handling', () => {
        it('propagates loader errors', async () => {
            const cache = new ContentCache();
            const loader = vi.fn().mockRejectedValue(new Error('Load failed'));

            await expect(cache.get(loader)).rejects.toThrow('Load failed');
        });

        it('allows retry after a failed load', async () => {
            const cache = new ContentCache();
            const data = createTestData({ total: 99 });
            const loader = vi.fn()
                .mockRejectedValueOnce(new Error('First attempt failed'))
                .mockResolvedValueOnce(data);

            // First attempt fails
            await expect(cache.get(loader)).rejects.toThrow('First attempt failed');

            // Second attempt succeeds
            const result = await cache.get(loader);
            expect(result.total).toBe(99);
            expect(loader).toHaveBeenCalledTimes(2);
        });

        it('clears inflight promise on error so subsequent calls retry', async () => {
            const cache = new ContentCache();
            const data = createTestData();

            const loader = vi.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValueOnce(data);

            await expect(cache.get(loader)).rejects.toThrow('fail');

            // Should not be stuck in inflight state
            const result = await cache.get(loader);
            expect(result).toBe(data);
        });
    });

    // ------------------------------------------------------------------
    // invalidate
    // ------------------------------------------------------------------
    describe('invalidate', () => {
        it('forces reload on next get', async () => {
            const cache = new ContentCache({ ttlMs: 0 }); // cache forever
            const data1 = createTestData({ total: 1 });
            const data2 = createTestData({ total: 2 });
            const loader = vi.fn()
                .mockResolvedValueOnce(data1)
                .mockResolvedValueOnce(data2);

            await cache.get(loader);
            expect(loader).toHaveBeenCalledTimes(1);

            cache.invalidate();

            const result = await cache.get(loader);
            expect(result.total).toBe(2);
            expect(loader).toHaveBeenCalledTimes(2);
        });

        it('calls onInvalidate callback when set', () => {
            const onInvalidate = vi.fn();
            const cache = new ContentCache({ onInvalidate });

            cache.invalidate();

            expect(onInvalidate).toHaveBeenCalledOnce();
        });

        it('does not call onInvalidate when not set', () => {
            const cache = new ContentCache();

            // Should not throw
            expect(() => cache.invalidate()).not.toThrow();
        });

        it('clears cached data', async () => {
            const cache = new ContentCache();
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            expect(cache.isValid()).toBe(true);

            cache.invalidate();
            expect(cache.isValid()).toBe(false);
        });
    });

    // ------------------------------------------------------------------
    // isValid
    // ------------------------------------------------------------------
    describe('isValid', () => {
        it('returns false when no data is cached', () => {
            const cache = new ContentCache();
            expect(cache.isValid()).toBe(false);
        });

        it('returns true after data is loaded (ttl=0)', async () => {
            const cache = new ContentCache({ ttlMs: 0 });
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            expect(cache.isValid()).toBe(true);
        });

        it('returns true within TTL window', async () => {
            const cache = new ContentCache({ ttlMs: 5000 });
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            vi.advanceTimersByTime(3000);
            expect(cache.isValid()).toBe(true);
        });

        it('returns false after TTL expires', async () => {
            const cache = new ContentCache({ ttlMs: 5000 });
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            vi.advanceTimersByTime(6000);
            expect(cache.isValid()).toBe(false);
        });

        it('returns false after invalidate', async () => {
            const cache = new ContentCache({ ttlMs: 0 });
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            cache.invalidate();
            expect(cache.isValid()).toBe(false);
        });
    });

    // ------------------------------------------------------------------
    // getStatus
    // ------------------------------------------------------------------
    describe('getStatus', () => {
        it('returns not-cached status initially', () => {
            const cache = new ContentCache({ ttlMs: 1000 });
            const status = cache.getStatus();

            expect(status.cached).toBe(false);
            expect(status.loadedAt).toBeNull();
            expect(status.ageMs).toBeNull();
            expect(status.ttlMs).toBe(1000);
        });

        it('returns cached status after loading', async () => {
            vi.setSystemTime(new Date('2025-06-01T00:00:00Z'));

            const cache = new ContentCache({ ttlMs: 5000 });
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            const status = cache.getStatus();

            expect(status.cached).toBe(true);
            expect(status.loadedAt).toBe(Date.now());
            expect(status.ageMs).toBe(0);
            expect(status.ttlMs).toBe(5000);
        });

        it('shows increasing ageMs over time', async () => {
            const cache = new ContentCache({ ttlMs: 10000 });
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);

            vi.advanceTimersByTime(3000);
            const status = cache.getStatus();

            expect(status.cached).toBe(true);
            expect(status.ageMs).toBe(3000);
        });

        it('returns not-cached status after invalidation', async () => {
            const cache = new ContentCache();
            const loader = vi.fn().mockResolvedValue(createTestData());

            await cache.get(loader);
            cache.invalidate();

            const status = cache.getStatus();
            expect(status.cached).toBe(false);
            expect(status.loadedAt).toBeNull();
            expect(status.ageMs).toBeNull();
        });
    });
});
