import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { generateRobotsTxt } from '@ever-works/plugin-seo';

export const GET: APIRoute = async () => {
    const { config: siteConfig } = await getContent();
    return new Response(generateRobotsTxt({ siteUrl: siteConfig.app_url ?? '', disallow: ['/api/'] }), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
    });
};
