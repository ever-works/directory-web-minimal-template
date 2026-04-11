/**
 * Item data type — represents a single directory item.
 * Parsed from `.content/data/<slug>/<slug>.yml`.
 *
 * Matches the full Next.js template's data format for compatibility.
 */
export interface ItemData {
    /** Unique identifier, derived from directory name */
    id: string;

    /** Display name of the item */
    name: string;

    /** URL-safe slug, same as directory name */
    slug: string;

    /** Short description of the item */
    description: string;

    /** External URL for the item (e.g., project homepage) */
    source_url: string;

    /** Category ID(s) this item belongs to. Single string or array. */
    category: string | string[];

    /** Tag IDs associated with this item */
    tags: string[];

    /** Collection IDs this item belongs to */
    collections?: string[];

    /** Whether this item is featured/promoted */
    featured?: boolean;

    /** URL to the item's icon or logo image */
    icon_url?: string;

    /** Brand name associated with the item */
    brand?: string;

    /** URL to the brand's logo image */
    brand_logo_url?: string;

    /** Array of screenshot/image URLs for the item */
    images?: string[];

    /** Publisher name for display */
    publisher?: string;

    /** Last update timestamp in 'yyyy-MM-dd HH:mm' format */
    updated_at: string;

    /** Approval status. Only 'approved' items are shown publicly. */
    status: 'draft' | 'pending' | 'approved' | 'rejected';

    /** Optional markdown content body */
    markdown?: string;

    /**
     * Pass-through for any additional fields in the YAML.
     * The full template has fields like location, submitted_by, etc.
     * These are preserved but not used by built-in components.
     */
    [key: string]: unknown;
}
