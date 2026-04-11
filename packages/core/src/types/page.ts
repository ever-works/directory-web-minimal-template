/**
 * Static page data type.
 * Parsed from `.content/pages/<slug>.md` files.
 *
 * Pages are standalone markdown content like "About", "Privacy Policy", etc.
 */
export interface PageData {
    /** URL-safe slug derived from filename (e.g., "about", "privacy-policy") */
    slug: string;

    /** Page title from frontmatter */
    title: string;

    /** Page description from frontmatter */
    description?: string;

    /** Raw markdown content (body after frontmatter) */
    content: string;

    /** Pass-through for additional frontmatter fields */
    [key: string]: unknown;
}
