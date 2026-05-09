/**
 * robots.txt generator.
 *
 * Produces a standards-compliant robots.txt string with sitemap reference,
 * user-agent rules, and optional crawl delay directives.
 *
 * Also exports the canonical Ever Works AI-crawler allow-list and a
 * helper that converts a high-level policy ("allow", "disallow",
 * "none", or a comma-list) into per-bot {@link RobotsTxtRule} entries
 * that callers can splice into their `rules` array.
 *
 * @see https://www.robotstxt.org/robotstxt.html
 * @see https://llmstxt.org/
 */

/**
 * A single user-agent specific rule set for robots.txt.
 */
export interface RobotsTxtRule {
    /** User-agent string (e.g., 'Googlebot', '*'). */
    userAgent: string;

    /** Paths to allow crawling. */
    allow?: string[];

    /** Paths to disallow crawling. */
    disallow?: string[];

    /** Crawl delay in seconds. */
    crawlDelay?: number;
}

/**
 * Configuration options for robots.txt generation.
 */
export interface RobotsTxtOptions {
    /** Base URL of the site for sitemap reference. */
    siteUrl: string;

    /** Sitemap filename (default: 'sitemap-index.xml'). */
    sitemapFilename?: string;

    /** Paths to disallow for all crawlers (default: []). */
    disallow?: string[];

    /** Paths to explicitly allow (default: ['/']). */
    allow?: string[];

    /**
     * Additional user-agent specific rule sets.
     * If provided, these are rendered INSTEAD of the default `*` rule.
     * To keep the default `*` rule, include a rule with `userAgent: '*'`.
     */
    rules?: RobotsTxtRule[];
}

/**
 * Generate a standards-compliant robots.txt string.
 *
 * @param options - Configuration options
 * @returns robots.txt content string
 *
 * @example
 * ```typescript
 * const txt = generateRobotsTxt({
 *     siteUrl: 'https://example.com',
 *     disallow: ['/api/', '/admin/'],
 * });
 * ```
 */
export function generateRobotsTxt(options: RobotsTxtOptions): string {
    const siteUrl = options.siteUrl.replace(/\/$/, '');
    const sitemapFilename = options.sitemapFilename ?? 'sitemap-index.xml';
    const lines: string[] = [];

    if (options.rules && options.rules.length > 0) {
        for (const rule of options.rules) {
            lines.push(`User-agent: ${rule.userAgent}`);

            if (rule.allow) {
                for (const path of rule.allow) {
                    lines.push(`Allow: ${path}`);
                }
            }

            if (rule.disallow) {
                for (const path of rule.disallow) {
                    lines.push(`Disallow: ${path}`);
                }
            }

            if (rule.crawlDelay !== undefined) {
                lines.push(`Crawl-delay: ${rule.crawlDelay}`);
            }

            lines.push('');
        }
    } else {
        lines.push('User-agent: *');

        const allowPaths = options.allow ?? ['/'];
        for (const path of allowPaths) {
            lines.push(`Allow: ${path}`);
        }

        const disallowPaths = options.disallow ?? [];
        for (const path of disallowPaths) {
            lines.push(`Disallow: ${path}`);
        }

        lines.push('');
    }

    lines.push(`Sitemap: ${siteUrl}/${sitemapFilename}`);
    lines.push('');

    return lines.join('\n');
}

// ---------------------------------------------------------------------------
// AI crawler allow-list
// ---------------------------------------------------------------------------

/**
 * The canonical list of AI-crawler user-agent strings the Ever Works
 * minimal template recognizes. Sorted by operator for readability.
 *
 * Each entry is a published user-agent string from the bot's operator
 * documentation. Adding speculative entries dilutes the signal and
 * risks false positives, so keep this list focused on bots whose
 * operators have publicly documented their UA.
 */
export const AI_CRAWLER_USER_AGENTS: readonly string[] = [
    // OpenAI
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    // Anthropic
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    // Perplexity
    'PerplexityBot',
    'Perplexity-User',
    // Google (Bard / Gemini opt-in token)
    'Google-Extended',
    // Apple Intelligence
    'Applebot-Extended',
    // Common Crawl (training data for many LLMs)
    'CCBot',
    // ByteDance
    'Bytespider',
    // Meta (Llama-family)
    'Meta-ExternalAgent',
    'Meta-ExternalFetcher',
    // DuckDuckGo Assist
    'DuckAssistBot',
    // Amazon
    'Amazonbot',
    // Cohere
    'cohere-ai',
    'cohere-training-data-crawler',
    // You.com
    'YouBot',
    // Mistral
    'MistralAI-User',
    // Diffbot
    'Diffbot',
    // Timpi
    'Timpibot',
];

/** Mode controlling how AI crawlers render into robots.txt. */
export type AiCrawlerMode = 'allow' | 'disallow' | 'none' | 'selective';

/** Resolved AI-crawler policy derived from caller input. */
export interface AiCrawlerPolicy {
    mode: AiCrawlerMode;
    /** When mode === 'selective', these bots are allowed; the rest disallowed. */
    allowList: readonly string[];
}

/**
 * Resolve an AI-crawler policy from a user-supplied value.
 *
 * Accepts:
 *   - `undefined` / `null` / `''` / `'allow'` → allow every listed bot (default).
 *   - `'disallow'` → emit `Disallow: /` for every listed bot.
 *   - `'none'`     → don't emit any AI-crawler rules at all.
 *   - comma-list (e.g. `'GPTBot,ClaudeBot'`) → allow these, disallow the rest.
 *
 * @param raw - Raw value, typically from `process.env.AI_CRAWLERS`.
 */
export function resolveAiCrawlerPolicy(raw: string | undefined | null): AiCrawlerPolicy {
    const value = (raw ?? '').trim();

    if (!value || value.toLowerCase() === 'allow') {
        return { mode: 'allow', allowList: AI_CRAWLER_USER_AGENTS };
    }
    if (value.toLowerCase() === 'disallow') {
        return { mode: 'disallow', allowList: [] };
    }
    if (value.toLowerCase() === 'none') {
        return { mode: 'none', allowList: [] };
    }

    const allowList = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    if (allowList.length === 0) {
        return { mode: 'allow', allowList: AI_CRAWLER_USER_AGENTS };
    }

    return { mode: 'selective', allowList };
}

/**
 * Build per-bot {@link RobotsTxtRule} entries for a resolved AI-crawler
 * policy.
 *
 * @param policy - Resolved policy from {@link resolveAiCrawlerPolicy}.
 * @param sharedDisallow - Paths that allowed bots should still be
 *   disallowed from (typically `['/api/']`). Mirrors the shared
 *   disallow block of the generic `User-agent: *` rule.
 */
export function buildAiCrawlerRules(
    policy: AiCrawlerPolicy,
    sharedDisallow: readonly string[] = []
): RobotsTxtRule[] {
    if (policy.mode === 'none') {
        return [];
    }

    if (policy.mode === 'disallow') {
        return AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
            userAgent,
            disallow: ['/'],
        }));
    }

    if (policy.mode === 'allow') {
        return AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
            userAgent,
            allow: ['/'],
            ...(sharedDisallow.length > 0 ? { disallow: [...sharedDisallow] } : {}),
        }));
    }

    // selective
    const allowed = new Set(policy.allowList.map((s) => s.toLowerCase()));
    return AI_CRAWLER_USER_AGENTS.map((userAgent) => {
        const isAllowed = allowed.has(userAgent.toLowerCase());
        return isAllowed
            ? {
                  userAgent,
                  allow: ['/'],
                  ...(sharedDisallow.length > 0 ? { disallow: [...sharedDisallow] } : {}),
              }
            : { userAgent, disallow: ['/'] };
    });
}
