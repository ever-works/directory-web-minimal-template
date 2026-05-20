/**
 * JSON Feed 1.1 endpoint.
 *
 * Generates a static JSON feed at /feed.json containing the most
 * recent directory items. Sibling to /rss.xml and /atom.xml, intended
 * for consumers that prefer JSON (AI agents, dashboards, custom
 * integrations) over XML.
 *
 * @see https://www.jsonfeed.org/version/1.1/
 */

import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { buildFeedEntries, generateJsonFeed, resolveRssConfig } from '@ever-works/plugin-rss';

export const GET: APIRoute = async () => {
    const { items, config: siteConfig } = await getContent();

    const rssConfig = resolveRssConfig(
        { siteUrl: siteConfig.app_url },
        siteConfig.company_name
    );

    const entries = buildFeedEntries(items, rssConfig);
    const json = generateJsonFeed(entries, rssConfig);

    return new Response(json, {
        headers: {
            // Per JSON Feed 1.1 the canonical content type is
            // application/feed+json; we keep a cache-friendly TTL the
            // same as the XML siblings.
            'Content-Type': 'application/feed+json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
};
