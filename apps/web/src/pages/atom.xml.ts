/**
 * Atom 1.0 feed endpoint.
 *
 * Generates a static Atom feed at /atom.xml containing the most recent
 * directory items. Uses @ever-works/plugin-rss for feed generation.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { buildFeedEntries, generateAtom, resolveRssConfig } from '@ever-works/plugin-rss';

export const GET: APIRoute = async () => {
    const { items, config: siteConfig } = await getContent();

    const rssConfig = resolveRssConfig(
        { siteUrl: siteConfig.app_url },
        siteConfig.company_name
    );

    const entries = buildFeedEntries(items, rssConfig);
    const xml = generateAtom(entries, rssConfig);

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/atom+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
};
