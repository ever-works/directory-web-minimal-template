import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { buildFeedEntries, generateRss, resolveRssConfig } from '@ever-works/plugin-rss';

export const GET: APIRoute = async () => {
    const { items, config: siteConfig } = await getContent();
    const rssConfig = resolveRssConfig({ siteUrl: siteConfig.app_url }, siteConfig.company_name);
    const entries = buildFeedEntries(items, rssConfig);
    return new Response(generateRss(entries, rssConfig), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
};
