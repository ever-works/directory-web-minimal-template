/**
 * RSS 2.0 feed generator.
 *
 * Produces a valid RSS 2.0 XML string from an array of feed entries.
 * All text values are XML-escaped to prevent injection.
 *
 * @see https://www.rssboard.org/rss-specification
 */

import type { FeedEntry, ResolvedRssConfig } from './types';

/**
 * Escape special XML characters in text content.
 *
 * @param text - Raw text to escape
 * @returns XML-safe string
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
 * @param isoDate - ISO-8601 date string (e.g., "2026-01-15 10:30")
 * @returns RFC 2822 formatted date string
 */
export function toRfc2822(isoDate: string): string {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
        return new Date().toUTCString();
    }
    return date.toUTCString();
}

/**
 * Generate a complete RSS 2.0 XML feed.
 *
 * @param entries - Array of feed entries (already sorted and limited)
 * @param config - Resolved plugin configuration
 * @returns Valid RSS 2.0 XML string
 */
export function generateRss(entries: FeedEntry[], config: ResolvedRssConfig): string {
    const firstEntry = entries[0];
    const lastBuildDate = firstEntry ? toRfc2822(firstEntry.pubDate) : new Date().toUTCString();

    const atomLink = config.atom
        ? `    <atom:link href="${escapeXml(config.siteUrl)}/${escapeXml(config.rssFilename)}" rel="self" type="application/rss+xml" />\n`
        : '';

    const items = entries.map((entry) => {
        const category = entry.category ? `      <category>${escapeXml(entry.category)}</category>\n` : '';

        return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(entry.link)}</link>
      <description>${escapeXml(entry.description)}</description>
      <pubDate>${toRfc2822(entry.pubDate)}</pubDate>
      <guid isPermaLink="true">${escapeXml(entry.guid)}</guid>
${category}    </item>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.siteUrl)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>@ever-works/plugin-rss</generator>
${atomLink}${items.join('\n')}
  </channel>
</rss>`;
}
