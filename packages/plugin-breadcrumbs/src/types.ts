/**
 * Breadcrumb plugin types.
 *
 * Provides automatic breadcrumb trail generation for directory pages.
 */

/** A single breadcrumb entry */
export interface BreadcrumbEntry {
    /** Display label */
    label: string;
    /** URL href — undefined for the current page (last item) */
    href?: string;
}

/** Configuration options for the breadcrumbs plugin */
export interface BreadcrumbsPluginOptions {
    /** Label for the home/root breadcrumb. Default: 'Home' */
    homeLabel?: string;
    /** Href for home breadcrumb. Default: '/' */
    homeHref?: string;
    /** Whether to include home in every trail. Default: true */
    includeHome?: boolean;
    /** Custom label overrides for specific paths */
    labelOverrides?: Record<string, string>;
}

/** Map of page paths to their breadcrumb trails */
export type BreadcrumbMap = Map<string, BreadcrumbEntry[]>;
