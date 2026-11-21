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
import { getSite } from '../lib/site';
import { buildAiCrawlerRules, generateRobotsTxt, resolveAiCrawlerPolicy } from '@ever-works/plugin-seo';

// '/api/' only holds the ISR webhook. The agent data API lives under '/data/' and stays crawlable.
const SHARED_DISALLOW = ['/api/'] as const;

export const GET: APIRoute = async () => {
    const site = await getSite();

    const policy = resolveAiCrawlerPolicy(process.env['AI_CRAWLERS']);
    const aiRules = buildAiCrawlerRules(policy, SHARED_DISALLOW);

    const txt = generateRobotsTxt({
        // Absolute Sitemap: line (SITE_URL, else app_url) — a relative sitemap URL is ignored by crawlers.
        siteUrl: site.siteUrl,
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
