/**
 * ContentCache — TTL-based content caching with deduplication.
 * Wraps loadContent() to avoid redundant I/O operations.
 *
 * - ttlMs: 0 = cache forever (build-time static mode)
 * - ttlMs > 0 = stale check on each get(), reload if expired
 * - Deduplicates concurrent get() calls (single inflight Promise)
 */

import type { ContentData } from './types/index.js';

/** Configuration for ContentCache */
export interface ContentCacheConfig {
    /** TTL in milliseconds. 0 = cache forever (static mode). Default: 0 */
    ttlMs: number;

    /** Called when cache is invalidated */
    onInvalidate?: () => void;
}

/** Cache status metadata */
export interface CacheStatus {
    /** Whether data is currently cached */
    cached: boolean;
    /** Timestamp when data was loaded (ms since epoch), null if not cached */
    loadedAt: number | null;
    /** Age of cached data in ms, null if not cached */
    ageMs: number | null;
    /** Configured TTL in ms */
    ttlMs: number;
}

export class ContentCache {
    private data: ContentData | null = null;
    private loadedAt = 0;
    private inflight: Promise<ContentData> | null = null;
    private readonly config: ContentCacheConfig;

    constructor(config?: Partial<ContentCacheConfig>) {
        this.config = {
            ttlMs: config?.ttlMs ?? 0,
            onInvalidate: config?.onInvalidate,
        };
    }

    /**
     * Get content, loading from the provided loader if cache is empty or stale.
     * Deduplicates concurrent calls — only one load runs at a time.
     */
    async get(loader: () => Promise<ContentData>): Promise<ContentData> {
        if (this.isValid()) {
            return this.data!;
        }

        // Deduplicate concurrent loads
        if (this.inflight) {
            return this.inflight;
        }

        this.inflight = loader().then((result) => {
            this.data = result;
            this.loadedAt = Date.now();
            this.inflight = null;
            return result;
        }).catch((error) => {
            this.inflight = null;
            throw error;
        });

        return this.inflight;
    }

    /** Force invalidate the cache. Next get() will reload. */
    invalidate(): void {
        this.data = null;
        this.loadedAt = 0;
        this.inflight = null;
        this.config.onInvalidate?.();
    }

    /** Check if cached data exists and is within TTL */
    isValid(): boolean {
        if (!this.data) return false;
        if (this.config.ttlMs === 0) return true; // 0 = cache forever
        return Date.now() - this.loadedAt < this.config.ttlMs;
    }

    /** Get cache metadata for status/debugging */
    getStatus(): CacheStatus {
        const cached = this.data !== null;
        return {
            cached,
            loadedAt: cached ? this.loadedAt : null,
            ageMs: cached ? Date.now() - this.loadedAt : null,
            ttlMs: this.config.ttlMs,
        };
    }
}
