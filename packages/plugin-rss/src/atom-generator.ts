/**
 * Atom 1.0 feed generator.
 *
 * Produces a valid Atom 1.0 XML string from an array of feed entries.
 *
 * @see https://www.rfc-editor.org/rfc/rfc4287
 */

import type { FeedEntry, ResolvedRssConfig } from './types';
import { escapeXml } from './rss-generator';

/**
 * Format an ISO-8601 date string as an Atom-compatible ISO-8601 datetime.
 *
 * @param isoDate - ISO-8601 date string (e.g., "2026-01-15 10:30")
 * @returns ISO-8601 datetime string suitable for Atom feeds
 */
export function toAtomDate(isoDate: string): string {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
        return new Date().toISOString();
    }
    return date.toISOString();
}

/**
 * Generate a complete Atom 1.0 XML feed.
 *
 * @param entries - Array of feed entries (already sorted and limited)
 * @param config - Resolved plugin configuration
 * @returns Valid Atom 1.0 XML string
 */
export function generateAtom(entries: FeedEntry[], config: ResolvedRssConfig): string {
    const firstEntry = entries[0];
    const updated = firstEntry ? toAtomDate(firstEntry.pubDate) : new Date().toISOString();

    const atomEntries = entries.map((entry) => {
        const category = entry.category
            ? `    <category term="${escapeXml(entry.category)}" />\n`
            : '';

        return `  <entry>
    <title>${escapeXml(entry.title)}</title>
    <link href="${escapeXml(entry.link)}" />
    <id>${escapeXml(entry.guid)}</id>
    <updated>${toAtomDate(entry.pubDate)}</updated>
    <summary>${escapeXml(entry.description)}</summary>
${category}  </entry>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <link href="${escapeXml(config.siteUrl)}" />
  <link href="${escapeXml(config.siteUrl)}/${escapeXml(config.atomFilename)}" rel="self" />
  <id>${escapeXml(config.siteUrl)}/</id>
  <updated>${updated}</updated>
  <subtitle>${escapeXml(config.description)}</subtitle>
  <generator>@ever-works/plugin-rss</generator>
${atomEntries.join('\n')}
</feed>`;
}
