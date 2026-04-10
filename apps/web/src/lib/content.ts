/**
 * Content loading utility for the Astro web app.
 *
 * Initializes the data adapter and loads all content once at build time.
 * Astro's static build calls getStaticPaths / frontmatter at build,
 * so this module caches the loaded content across page generations.
 *
 * @example
 * ```astro
 * ---
 * import { getContent } from '../lib/content';
 * const { items, categories, tags, config } = await getContent();
 * ---
 * ```
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent } from '@ever-works/core';
import type { ContentData } from '@ever-works/core';

/** Cached content — loaded once per build */
let _cached: ContentData | null = null;

/**
 * Get all content from the data repository.
 * Results are cached in memory for the duration of the build.
 */
export async function getContent(): Promise<ContentData> {
    if (_cached) return _cached;

    const config = resolveAdapterConfig();
    const adapter = createAdapter(config);
    await adapter.init(config);

    _cached = await loadContent(adapter);
    return _cached;
}

/**
 * Invalidate the content cache.
 * Useful in dev mode when content changes.
 */
export function invalidateCache(): void {
    _cached = null;
}
