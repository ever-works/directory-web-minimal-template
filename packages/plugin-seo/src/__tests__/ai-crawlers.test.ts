import { describe, expect, it } from 'vitest';
import {
    AI_CRAWLER_USER_AGENTS,
    buildAiCrawlerRules,
    generateRobotsTxt,
    resolveAiCrawlerPolicy,
} from '../robots.js';

describe('AI_CRAWLER_USER_AGENTS', () => {
    it('includes the major LLM crawlers', () => {
        // Spot-check well-known operators across families.
        expect(AI_CRAWLER_USER_AGENTS).toContain('GPTBot');
        expect(AI_CRAWLER_USER_AGENTS).toContain('ClaudeBot');
        expect(AI_CRAWLER_USER_AGENTS).toContain('PerplexityBot');
        expect(AI_CRAWLER_USER_AGENTS).toContain('Google-Extended');
        expect(AI_CRAWLER_USER_AGENTS).toContain('Applebot-Extended');
        expect(AI_CRAWLER_USER_AGENTS).toContain('CCBot');
        expect(AI_CRAWLER_USER_AGENTS).toContain('Meta-ExternalAgent');
    });

    it('contains no duplicates', () => {
        const set = new Set(AI_CRAWLER_USER_AGENTS);
        expect(set.size).toBe(AI_CRAWLER_USER_AGENTS.length);
    });
});

describe('resolveAiCrawlerPolicy', () => {
    it('defaults to allow when value is empty/undefined/null', () => {
        expect(resolveAiCrawlerPolicy(undefined).mode).toBe('allow');
        expect(resolveAiCrawlerPolicy(null).mode).toBe('allow');
        expect(resolveAiCrawlerPolicy('').mode).toBe('allow');
        expect(resolveAiCrawlerPolicy('   ').mode).toBe('allow');
    });

    it('recognizes the literal "allow" / "disallow" / "none" tokens (case-insensitive)', () => {
        expect(resolveAiCrawlerPolicy('allow').mode).toBe('allow');
        expect(resolveAiCrawlerPolicy('ALLOW').mode).toBe('allow');
        expect(resolveAiCrawlerPolicy('disallow').mode).toBe('disallow');
        expect(resolveAiCrawlerPolicy('DISALLOW').mode).toBe('disallow');
        expect(resolveAiCrawlerPolicy('none').mode).toBe('none');
        expect(resolveAiCrawlerPolicy('None').mode).toBe('none');
    });

    it('parses a comma-separated allow-list into selective mode', () => {
        const policy = resolveAiCrawlerPolicy('GPTBot, ClaudeBot ,PerplexityBot');
        expect(policy.mode).toBe('selective');
        expect(policy.allowList).toEqual(['GPTBot', 'ClaudeBot', 'PerplexityBot']);
    });

    it('falls back to allow when comma-list parses to nothing', () => {
        expect(resolveAiCrawlerPolicy(',,').mode).toBe('allow');
    });
});

describe('buildAiCrawlerRules', () => {
    const sharedDisallow = ['/api/', '/admin/'] as const;

    it('returns an empty list for mode "none"', () => {
        expect(buildAiCrawlerRules({ mode: 'none', allowList: [] })).toEqual([]);
    });

    it('emits Disallow: / for every bot when mode is "disallow"', () => {
        const rules = buildAiCrawlerRules({ mode: 'disallow', allowList: [] });
        expect(rules.length).toBe(AI_CRAWLER_USER_AGENTS.length);
        for (const rule of rules) {
            expect(rule.disallow).toEqual(['/']);
            expect(rule.allow).toBeUndefined();
        }
    });

    it('emits Allow: / + sharedDisallow for every bot when mode is "allow"', () => {
        const rules = buildAiCrawlerRules({ mode: 'allow', allowList: AI_CRAWLER_USER_AGENTS }, sharedDisallow);
        expect(rules.length).toBe(AI_CRAWLER_USER_AGENTS.length);
        for (const rule of rules) {
            expect(rule.allow).toEqual(['/']);
            expect(rule.disallow).toEqual(['/api/', '/admin/']);
        }
    });

    it('omits the sharedDisallow block when none is provided', () => {
        const rules = buildAiCrawlerRules({ mode: 'allow', allowList: AI_CRAWLER_USER_AGENTS });
        for (const rule of rules) {
            expect(rule.allow).toEqual(['/']);
            expect(rule.disallow).toBeUndefined();
        }
    });

    it('selective mode allows listed bots and disallows everything else', () => {
        const allowed = ['GPTBot', 'ClaudeBot'];
        const rules = buildAiCrawlerRules({ mode: 'selective', allowList: allowed }, sharedDisallow);

        const gptbot = rules.find((r) => r.userAgent === 'GPTBot');
        const claude = rules.find((r) => r.userAgent === 'ClaudeBot');
        const ccbot = rules.find((r) => r.userAgent === 'CCBot');

        expect(gptbot?.allow).toEqual(['/']);
        expect(gptbot?.disallow).toEqual(['/api/', '/admin/']);
        expect(claude?.allow).toEqual(['/']);
        expect(ccbot?.disallow).toEqual(['/']);
        expect(ccbot?.allow).toBeUndefined();
    });

    it('selective mode is case-insensitive on bot names', () => {
        const rules = buildAiCrawlerRules({ mode: 'selective', allowList: ['gptbot'] });
        const gptbot = rules.find((r) => r.userAgent === 'GPTBot');
        expect(gptbot?.allow).toEqual(['/']);
    });
});

describe('generateRobotsTxt with AI-crawler rules', () => {
    it('renders both the * rule and per-bot rules in order', () => {
        const policy = resolveAiCrawlerPolicy('allow');
        const aiRules = buildAiCrawlerRules(policy, ['/api/']);
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            rules: [{ userAgent: '*', allow: ['/'], disallow: ['/api/'] }, ...aiRules],
        });

        // Every listed bot appears as its own User-agent block.
        for (const bot of AI_CRAWLER_USER_AGENTS) {
            expect(txt).toContain(`User-agent: ${bot}`);
        }
        // Sitemap is emitted at the end as before.
        expect(txt).toContain('Sitemap: https://example.com/sitemap-index.xml');
    });
});
