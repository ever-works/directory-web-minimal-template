/**
 * Category data types.
 * Parsed from `.content/categories.yml` or `.content/categories/categories.yml`.
 */

/** A category definition */
export interface CategoryData {
    /** Unique identifier (lowercase, kebab-case) */
    id: string;

    /** Human-readable display name */
    name: string;

    /** Optional URL to category icon */
    icon_url?: string;

    /** Optional URL to category image (used in some themes for card backgrounds) */
    image_url?: string;
}

/** Category with computed item count */
export interface CategoryWithCount extends CategoryData {
    /** Number of approved items in this category */
    count: number;
}
