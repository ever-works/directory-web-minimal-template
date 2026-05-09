/**
 * RSS 2.0 feed generator.
 *
 * Thin wrapper around the [`feed`](https://www.npmjs.com/package/feed)
 * library — see {@link buildFeed}. The exported `escapeXml` and
 * `toRfc2822` utilities are kept for backward compatibility with
 * external callers that imported them in earlier versions; new code
 * should rely on the library to escape/format internally.
 *
 * @see https://www.rssboard.org/rss-specification
 */

import type { FeedEntry, ResolvedRssConfig } from './types';
import { buildFeed } from './feed-builder';

/**
 * Escape special XML characters in text content.
 *
 * Retained as a public export for backward compatibility. Internal
 * callers no longer need it — the `feed` library escapes XML itself.
 */
export function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Format an ISO-8601 date string as an RFC 2822 date for RSS.
 *
 * Retained as a public export for backward compatibility.
 */
export function toRfc2822(isoDate: string): string {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
        return new Date().toUTCString();
    }
    return date.toUTCString();
}

/**
 * Generate a complete RSS 2.0 XML feed via the `feed` library.
 *
 * @param entries - Array of feed entries (already sorted and limited)
 * @param config - Resolved plugin configuration
 * @returns Valid RSS 2.0 XML string
 */
export function generateRss(entries: FeedEntry[], config: ResolvedRssConfig): string {
    return buildFeed(entries, config).rss2();
}
