/**
 * @ever-works/plugin-rss
 *
 * RSS 2.0 and Atom 1.0 feed generation plugin for directory items.
 * Generates static XML feeds at build time.
 *
 * @example
 * ```typescript
 * import { rssPlugin, buildFeedEntries, generateRss, generateAtom, resolveRssConfig } from '@ever-works/plugin-rss';
 *
 * // In definePlugins()
 * rssPlugin({ siteUrl: 'https://example.com', limit: 25 });
 *
 * // In Astro page (rss.xml.ts)
 * const config = resolveRssConfig(options, siteConfig.company_name);
 * const entries = buildFeedEntries(items, config);
 * const xml = generateRss(entries, config);
 * ```
 */

export { rssPlugin, buildFeedEntries, resolveRssConfig } from './plugin';
export { generateRss, escapeXml, toRfc2822 } from './rss-generator';
export { generateAtom, toAtomDate } from './atom-generator';
export { generateJsonFeed, toRfc3339 } from './json-feed-generator';
export type { RssPluginOptions, ResolvedRssConfig, FeedEntry } from './types';
