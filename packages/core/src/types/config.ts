 /**
 * Site configuration types.
 * Parsed from `.works/works.yml` inside the content root.
 *
 * This is a subset of the full template's config. Fields related to
 * auth, payments, mail, and advanced features are excluded since
 * this minimal template doesn't support them.
 */

/** Navigation link item for custom header/footer */
export interface NavLinkItem {
    /** Display text */
    label: string;

    /** URL or path */
    href: string;

    /** Whether to open in new tab */
    external?: boolean;
}

/** Homepage display configuration */
export interface HomepageConfig {
    /** Hero section title override */
    hero_title?: string;

    /** Hero section description override */
    hero_description?: string;

    /** Whether search is shown on homepage */
    search_enabled?: boolean;

    /** Default listing view mode */
    default_view?: 'grid' | 'list';

    /** Default sort order */
    default_sort?: 'name-asc' | 'name-desc' | 'date-desc' | 'featured';
}

/** Site-wide configuration */
export interface SiteConfig {
    /** Company or site name */
    company_name: string;

    /** Singular name for items (e.g., "Tool", "Component") */
    item_name: string;

    /** Plural name for items (e.g., "Tools", "Components") */
    items_name: string;

    /** Copyright year for footer */
    copyright_year: number;

    /** Base URL of the deployed site */
    app_url?: string;

    /** Logo configuration */
    logo?: LogoConfig;

    /** Pagination settings */
    pagination?: PaginationConfig;

    /** Feature toggles */
    settings?: SettingsConfig;

    /** Custom navigation items for the header */
    custom_header?: NavLinkItem[];

    /** Custom navigation items for the footer */
    custom_footer?: NavLinkItem[];

    /** Homepage display settings */
    homepage?: HomepageConfig;

    /**
     * Pass-through for additional config fields.
     * The full template has auth, mail, pricing, payment, etc.
     * These are preserved but not used by this minimal template.
     */
    [key: string]: unknown;
}

/** Logo file paths */
export interface LogoConfig {
    /** Path to logo image (light mode) */
    logo_image?: string;

    /** Path to logo image (dark mode) */
    logo_image_dark?: string;

    /** Path to favicon */
    favicon?: string;
}

/** Pagination configuration */
export interface PaginationConfig {
    /** Pagination style */
    type: 'standard' | 'infinite';

    /** Number of items per page */
    itemsPerPage: number;
}

/** Feature flag settings */
export interface SettingsConfig {
    /** Whether category navigation is enabled */
    categories_enabled?: boolean;

    /** Whether tag navigation is enabled */
    tags_enabled?: boolean;

    /** Whether collections are enabled */
    collections_enabled?: boolean;

    /** Whether comparisons are enabled */
    comparisons_enabled?: boolean;

    /** Whether featured items section is shown */
    featured_enabled?: boolean;

    /**
     * Pass-through for additional settings.
     * The full template has many more feature flags.
     */
    [key: string]: unknown;
}
