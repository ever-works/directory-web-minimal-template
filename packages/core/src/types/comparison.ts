/**
 * Comparison data types.
 * Parsed from `.content/comparisons/<slug>/<slug>.yml`.
 */

/** A comparison between two directory items */
export interface ComparisonData {
    /** Unique identifier */
    id: string;

    /** URL-safe slug */
    slug: string;

    /** Comparison title (e.g., "Item A vs Item B") */
    title: string;

    /** Slug of the first item */
    item_a_slug: string;

    /** Slug of the second item */
    item_b_slug: string;

    /** Display name of the first item */
    item_a_name: string;

    /** Display name of the second item */
    item_b_name: string;

    /** Category this comparison belongs to */
    category?: string;

    /** Brief summary of the comparison */
    summary?: string;

    /** Overall verdict text */
    verdict?: string;

    /** Which item wins overall */
    verdict_winner?: 'item_a' | 'item_b' | 'tie';

    /** Detailed comparison dimensions */
    dimensions?: ComparisonDimension[];

    /** When this comparison was generated/written */
    generated_at?: string;

    /** Source references */
    sources?: string[];

    /** Long-form markdown content (from companion .md file) */
    content?: string;
}

/** A single dimension of comparison (e.g., "Performance", "Pricing") */
export interface ComparisonDimension {
    /** Dimension name */
    name: string;

    /** Summary for item A in this dimension */
    item_a_summary?: string;

    /** Summary for item B in this dimension */
    item_b_summary?: string;

    /** Score for item A (0-10) */
    item_a_score?: number;

    /** Score for item B (0-10) */
    item_b_score?: number;

    /** Which item wins in this dimension */
    winner?: 'item_a' | 'item_b' | 'tie';
}
