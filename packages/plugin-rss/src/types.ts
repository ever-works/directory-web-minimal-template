/**
 * Type definitions for the RSS/Atom feed plugin.
 *
 * Configures feed generation for directory items. Feeds are generated
 * at build time as static XML files.
 */

/** Configuration options for the RSS feed plugin factory. */
export interface RssPluginOptions {
    /** Feed title. Falls back to `config.company_name`. */
    title?: string;

    /** Feed description / subtitle. */
    description?: string;

    /** Base URL of the site (e.g., "https://example.com"). Required for absolute URLs. */
    siteUrl?: string;

    /** Maximum number of items in the feed (default: 50). */
    limit?: number;

    /** Whether to generate Atom 1.0 feed alongside RSS (default: true). */
    atom?: boolean;

    /** Whether to generate JSON Feed 1.1 alongside RSS (default: true). */
    jsonFeed?: boolean;

    /** RSS feed filename (default: 'rss.xml'). */
    rssFilename?: string;

    /** Atom feed filename (default: 'atom.xml'). */
    atomFilename?: string;

    /** JSON Feed filename (default: 'feed.json'). */
    jsonFeedFilename?: string;

    /** Sort order for feed items (default: 'date-desc'). */
    sortBy?: 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
}

/** Resolved RSS plugin configuration (all fields have values). */
export interface ResolvedRssConfig {
    title: string;
    description: string;
    siteUrl: string;
    limit: number;
    atom: boolean;
    jsonFeed: boolean;
    rssFilename: string;
    atomFilename: string;
    jsonFeedFilename: string;
    sortBy: 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
}

/** A single feed entry, derived from an `ItemData`. */
export interface FeedEntry {
    /** Entry title. */
    title: string;

    /** Absolute URL to the item page. */
    link: string;

    /** Short description. */
    description: string;

    /** ISO-8601 publication / update date. */
    pubDate: string;

    /** Globally unique identifier (usually same as link). */
    guid: string;

    /** Category name (first category of the item). */
    category?: string;
}
