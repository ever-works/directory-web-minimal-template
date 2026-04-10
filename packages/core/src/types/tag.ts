/**
 * Tag data types.
 * Parsed from `.content/tags.yml`.
 */

/** A tag definition */
export interface TagData {
    /** Unique identifier */
    id: string;

    /** Human-readable display name */
    name: string;

    /** Whether this tag is currently active. Inactive tags are hidden. */
    isActive?: boolean;
}

/** Tag with computed item count */
export interface TagWithCount extends TagData {
    /** Number of approved items with this tag */
    count: number;
}
