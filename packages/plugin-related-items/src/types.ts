/**
 * Types for the related items plugin.
 */

/** Reference to a related item with relevance score */
export interface RelatedItemRef {
    /** Item slug */
    slug: string;
    /** Item display name */
    name: string;
    /** Item description */
    description?: string;
    /** Item category slug */
    category?: string;
    /** Item icon URL */
    icon_url?: string;
    /** Relevance score (higher = more related) */
    score: number;
}

/** User-facing plugin options */
export interface RelatedItemsPluginOptions {
    /** Max related items per item (default: 5) */
    maxItems?: number;
    /** Score weight for each shared tag (default: 1) */
    tagWeight?: number;
    /** Score weight for shared category (default: 2) */
    categoryWeight?: number;
    /** Bonus score for featured items (default: 0.5) */
    featuredBoost?: number;
    /** Minimum score to include a related item (default: 0) */
    minScore?: number;
}

/** Fully resolved config with all defaults applied */
export interface ResolvedRelatedConfig {
    maxItems: number;
    tagWeight: number;
    categoryWeight: number;
    featuredBoost: number;
    minScore: number;
}
