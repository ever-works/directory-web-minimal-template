/**
 * Shared `feed` library wrapper.
 *
 * The package's three serialized formats (RSS 2.0, Atom 1.0, JSON Feed
 * 1.1) all describe the same set of items, so they share a single
 * populated `Feed` instance built here. Callers in
 * `{rss,atom,json-feed}-generator.ts` simply call the matching
 * `.rss2()`, `.atom1()`, or `.json1()` serializer on the result.
 *
 * @see https://www.npmjs.com/package/feed
 */

import { Feed } from 'feed';
import type { FeedEntry, ResolvedRssConfig } from './types';

/** Parse an ISO-8601-ish string into a `Date`, falling back to `now`. */
export function toSafeDate(iso: string): Date {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Build a populated `Feed` instance from entries + plugin config.
 *
 * @param entries - Pre-sorted, pre-limited feed entries.
 * @param config - Resolved plugin configuration.
 */
export function buildFeed(entries: readonly FeedEntry[], config: ResolvedRssConfig): Feed {
    const siteUrl = config.siteUrl.replace(/\/+$/, '');
    const updated = entries[0] ? toSafeDate(entries[0].pubDate) : new Date();

    const feed = new Feed({
        title: config.title,
        description: config.description,
        id: `${siteUrl}/`,
        link: siteUrl || undefined,
        language: 'en',
        copyright: config.title,
        updated,
        generator: '@ever-works/plugin-rss',
        feedLinks: {
            rss: siteUrl ? `${siteUrl}/${config.rssFilename}` : undefined,
            atom: siteUrl ? `${siteUrl}/${config.atomFilename}` : undefined,
            json: siteUrl ? `${siteUrl}/${config.jsonFeedFilename}` : undefined
        }
    });

    for (const entry of entries) {
        const date = toSafeDate(entry.pubDate);
        feed.addItem({
            title: entry.title,
            id: entry.guid,
            link: entry.link,
            description: entry.description,
            // Set both `date` (→ JSON Feed `date_modified`) and `published`
            // (→ JSON Feed `date_published`) so consumers can read either.
            // Our directory items have only `updated_at`, so we use it for
            // both fields.
            date,
            published: date,
            ...(entry.category ? { category: [{ name: entry.category }] } : {})
        });
    }

    return feed;
}
