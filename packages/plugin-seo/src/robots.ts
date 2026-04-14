/**
 * robots.txt generator.
 *
 * Produces a standards-compliant robots.txt string with sitemap reference,
 * user-agent rules, and optional crawl delay directives.
 *
 * @see https://www.robotstxt.org/robotstxt.html
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
