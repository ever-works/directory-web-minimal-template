/**
 * JSON Feed 1.1 generator.
 *
 * Thin wrapper around the [`feed`](https://www.npmjs.com/package/feed)
 * library — see {@link buildFeed}. The exported `toRfc3339` utility is
 * kept for backward compatibility with external callers.
 *
 * @see https://www.jsonfeed.org/version/1.1/
 */

import type { FeedEntry, ResolvedRssConfig } from './types';
import { buildFeed } from './feed-builder';

/**
 * Format an ISO-8601-ish date string as a strict RFC 3339 datetime.
 *
 * Retained as a public export for backward compatibility.
 */
export function toRfc3339(isoDate: string): string {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
        return new Date().toISOString();
    }
    return date.toISOString();
}

/**
 * Generate a complete JSON Feed 1.1 document via the `feed` library.
 *
 * The `feed` library currently emits the JSON Feed 1.0 version URL
 * (`https://jsonfeed.org/version/1`); we post-process to the 1.1 URL.
 * For the fields we emit, JSON Feed 1.0 and 1.1 are byte-compatible
 * apart from the version string — both versions agree on the shape of
 * `items[].id`, `items[].url`, `items[].title`, and friends.
 *
 * @param entries - Array of feed entries (already sorted and limited)
 * @param config - Resolved plugin configuration
 * @returns JSON string ready to serve as `application/feed+json`
 */
export function generateJsonFeed(entries: FeedEntry[], config: ResolvedRssConfig): string {
    const json = buildFeed(entries, config).json1();
    const parsed = JSON.parse(json) as Record<string, unknown>;
    parsed['version'] = 'https://jsonfeed.org/version/1.1';
    // JSON Feed 1.1 added an explicit `language` field; emit it for completeness.
    if (!parsed['language']) parsed['language'] = 'en';
    return JSON.stringify(parsed, null, 2);
}
