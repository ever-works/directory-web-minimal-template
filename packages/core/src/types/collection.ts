/**
 * Collection data type.
 * Parsed from `.content/collections.yml`.
 */

/** A curated collection of items */
export interface CollectionData {
    /** Unique identifier */
    id: string;

    /** URL-safe slug */
    slug: string;

    /** Human-readable display name */
    name: string;

    /** Description of what this collection contains */
    description: string;

    /** Optional URL to collection icon */
    icon_url?: string;

    /** Item slugs that belong to this collection */
    items?: string[];

    /** Whether this collection is active and visible */
    isActive?: boolean;

    /** Creation timestamp */
    created_at?: string;

    /** Last update timestamp */
    updated_at?: string;
}
