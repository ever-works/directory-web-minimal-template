/**
 * robots.txt endpoint.
 *
 * Generates a static robots.txt at /robots.txt with sitemap reference
 * and default crawl rules. Uses @ever-works/plugin-seo for generation.
 *
 * Emits an explicit AI-crawler allow-list (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended, etc.) so directory operators take an
 * unambiguous stance toward LLM crawlers. The default policy is
 * "allow"; override via the `AI_CRAWLERS` environment variable
 * (`allow` | `disallow` | `none` | comma-list of bot names).
 */

import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { buildAiCrawlerRules, generateRobotsTxt, resolveAiCrawlerPolicy } from '@ever-works/plugin-seo';

const SHARED_DISALLOW = ['/api/'] as const;

export const GET: APIRoute = async () => {
    const { config: siteConfig } = await getContent();

    const policy = resolveAiCrawlerPolicy(process.env['AI_CRAWLERS']);
    const aiRules = buildAiCrawlerRules(policy, SHARED_DISALLOW);

    const txt = generateRobotsTxt({
        siteUrl: siteConfig.app_url ?? '',
        rules: [
            { userAgent: '*', allow: ['/'], disallow: [...SHARED_DISALLOW] },
            ...aiRules,
        ],
    });

    return new Response(txt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
        },
    });
};
