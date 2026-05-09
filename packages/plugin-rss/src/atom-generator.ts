/**
 * Atom 1.0 feed generator.
 *
 * Thin wrapper around the [`feed`](https://www.npmjs.com/package/feed)
 * library — see {@link buildFeed}. The exported `toAtomDate` utility
 * is kept for backward compatibility with external callers that
 * imported it in earlier versions.
 *
 * @see https://www.rfc-editor.org/rfc/rfc4287
 */

import type { FeedEntry, ResolvedRssConfig } from './types';
import { buildFeed } from './feed-builder';

/**
 * Format an ISO-8601 date string as an Atom-compatible ISO-8601 datetime.
 *
 * Retained as a public export for backward compatibility.
 */
export function toAtomDate(isoDate: string): string {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
        return new Date().toISOString();
    }
    return date.toISOString();
}

/**
 * Generate a complete Atom 1.0 XML feed via the `feed` library.
 *
 * @param entries - Array of feed entries (already sorted and limited)
 * @param config - Resolved plugin configuration
 * @returns Valid Atom 1.0 XML string
 */
export function generateAtom(entries: FeedEntry[], config: ResolvedRssConfig): string {
    return buildFeed(entries, config).atom1();
}
