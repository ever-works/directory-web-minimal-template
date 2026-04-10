/**
 * Sitemap plugin type definitions.
 *
 * This plugin wraps Astro's built-in `@astrojs/sitemap` integration
 * with project-specific defaults for directory websites.
 */

/** Configuration options for the sitemap plugin */
export interface SitemapPluginOptions {
    /** Default change frequency for item pages (default: 'weekly') */
    changefreq?: ChangeFrequency;

    /** Default priority for item pages (default: 0.7) */
    priority?: number;

    /** Page paths to exclude from the sitemap (glob patterns) */
    exclude?: string[];
}

/** Valid sitemap change frequency values */
export type ChangeFrequency =
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';

/** Resolved sitemap configuration (all fields required) */
export interface ResolvedSitemapConfig {
    changefreq: ChangeFrequency;
    priority: number;
    exclude: string[];
}
