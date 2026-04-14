/**
 * robots.txt endpoint.
 *
 * Generates a static robots.txt at /robots.txt with sitemap reference
 * and default crawl rules. Uses @ever-works/plugin-seo for generation.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { generateRobotsTxt } from '@ever-works/plugin-seo';

export const GET: APIRoute = async () => {
    const { config: siteConfig } = await getContent();

    const txt = generateRobotsTxt({
        siteUrl: siteConfig.app_url ?? '',
        disallow: ['/api/'],
    });

    return new Response(txt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
        },
    });
};
