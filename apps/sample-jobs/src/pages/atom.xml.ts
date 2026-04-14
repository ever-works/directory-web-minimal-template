import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { buildFeedEntries, generateAtom, resolveRssConfig } from '@ever-works/plugin-rss';

export const GET: APIRoute = async () => {
    const { items, config: siteConfig } = await getContent();
    const rssConfig = resolveRssConfig({ siteUrl: siteConfig.app_url }, siteConfig.company_name);
    const entries = buildFeedEntries(items, rssConfig);
    return new Response(generateAtom(entries, rssConfig), {
        headers: { 'Content-Type': 'application/atom+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
};
