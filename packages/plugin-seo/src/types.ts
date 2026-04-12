/**
 * Type definitions for the SEO plugin.
 *
 * These types configure meta tag generation, Open Graph / Twitter Card output,
 * and JSON-LD structured data for directory pages.
 */

// ---------------------------------------------------------------------------
// Plugin options (passed to the factory function)
// ---------------------------------------------------------------------------

/** Configuration options for the SEO plugin factory. */
export interface SeoPluginOptions {
    /** Default page title used when no per-page title is provided. */
    defaultTitle?: string;

    /**
     * Template for the `<title>` element.
     * Use `%s` as a placeholder for the page title.
     *
     * @example "%s | My Directory"
     */
    titleTemplate?: string;

    /** Default meta description when none is provided per-page. */
    defaultDescription?: string;

    /** Canonical base URL of the site (e.g., "https://example.com"). */
    siteUrl?: string;

    /** Default Open Graph image URL used when a page has no image. */
    defaultOgImage?: string;

    /** Twitter handle for the site (e.g., "\@mysite"). */
    twitterHandle?: string;

    /** Default language / locale code (e.g., "en_US"). */
    locale?: string;

    /** Whether to generate JSON-LD structured data. Defaults to `true`. */
    jsonLd?: boolean;
}

// ---------------------------------------------------------------------------
// Per-page metadata (computed at render time)
// ---------------------------------------------------------------------------

/** Metadata describing a single page for SEO tag generation. */
export interface PageMeta {
    /** Page title (before template is applied). */
    title: string;

    /** Meta description for this page. */
    description: string;

    /** Canonical URL for this page. */
    url?: string;

    /** Open Graph image URL. */
    image?: string;

    /** Open Graph content type. Defaults to `"website"`. */
    type?: 'website' | 'article' | 'product';

    /** Article / item publish date in ISO-8601 format. */
    publishedAt?: string;

    /** Article / item last-modified date in ISO-8601 format. */
    modifiedAt?: string;
}

// ---------------------------------------------------------------------------
// Meta tag output
// ---------------------------------------------------------------------------

/** A single `<meta>` tag to render in the page `<head>`. */
export interface MetaTag {
    /** The tag attribute key: `"name"` for standard, `"property"` for OG. */
    key: 'name' | 'property';

    /** Attribute value (e.g., `"description"`, `"og:title"`). */
    value: string;

    /** The `content` attribute value. */
    content: string;
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

/** Supported JSON-LD schema types. */
export type JsonLdType = 'WebSite' | 'ItemList' | 'Product' | 'BreadcrumbList' | 'SoftwareApplication';

/** Input data for JSON-LD generation. Discriminated by {@link JsonLdType}. */
export type JsonLdInput =
    | WebSiteInput
    | ItemListInput
    | ProductInput
    | BreadcrumbListInput
    | SoftwareApplicationInput;

/** Data required to build a `WebSite` JSON-LD block. */
export interface WebSiteInput {
    type: 'WebSite';

    /** Site name. */
    name: string;

    /** Site root URL. */
    url: string;

    /** Short site description. */
    description?: string;

    /**
     * URL template for site search (enables sitelinks search box in Google).
     * Use `{search_term_string}` as the query placeholder.
     *
     * @example "https://example.com/search?q={search_term_string}"
     */
    searchAction?: string;
}

/** A single item entry inside an `ItemList` JSON-LD block. */
export interface ItemListEntry {
    /** Display name. */
    name: string;

    /** Absolute URL. */
    url: string;
}

/** Data required to build an `ItemList` JSON-LD block. */
export interface ItemListInput {
    type: 'ItemList';

    /** Ordered list of items. */
    items: ItemListEntry[];
}

/** Data required to build a `Product` JSON-LD block. */
export interface ProductInput {
    type: 'Product';

    /** Product / item name. */
    name: string;

    /** Absolute URL. */
    url: string;

    /** Short description. */
    description?: string;

    /** Image URL. */
    image?: string;
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

/** A single breadcrumb entry inside a `BreadcrumbList` JSON-LD block. */
export interface BreadcrumbEntry {
    /** Display name for this breadcrumb segment. */
    name: string;

    /** Absolute URL for this breadcrumb segment. */
    url: string;
}

/** Data required to build a `BreadcrumbList` JSON-LD block. */
export interface BreadcrumbListInput {
    type: 'BreadcrumbList';

    /** Ordered breadcrumb trail from root to current page. */
    items: BreadcrumbEntry[];
}

// ---------------------------------------------------------------------------
// SoftwareApplication
// ---------------------------------------------------------------------------

/** Data required to build a `SoftwareApplication` JSON-LD block. */
export interface SoftwareApplicationInput {
    type: 'SoftwareApplication';

    /** Application name. */
    name: string;

    /** Absolute URL to the application page. */
    url: string;

    /** Short description. */
    description?: string;

    /** Image / screenshot URL. */
    image?: string;

    /**
     * Application category (e.g., `"DeveloperApplication"`, `"BusinessApplication"`).
     * @see https://schema.org/applicationCategory
     */
    applicationCategory?: string;

    /** Operating system requirement (e.g., `"Windows"`, `"macOS"`, `"Web"`). */
    operatingSystem?: string;

    /** Price of the application. Use `"0"` for free. */
    price?: string;

    /** ISO 4217 currency code (e.g., `"USD"`). Required when {@link price} is set. */
    priceCurrency?: string;

    /** Aggregate rating value (1-5). */
    ratingValue?: number;

    /** Total number of ratings. */
    ratingCount?: number;
}

// ---------------------------------------------------------------------------
// Directory item convenience input
// ---------------------------------------------------------------------------

/**
 * Convenience input for {@link generateItemJsonLd}.
 *
 * Captures the fields common to directory items. The helper infers the
 * best Schema.org type (`SoftwareApplication` when `applicationCategory`
 * is present, `Product` otherwise) and builds the appropriate JSON-LD.
 */
export interface DirectoryItemInput {
    /** Item name. */
    name: string;

    /** Absolute URL. */
    url: string;

    /** Short description. */
    description?: string;

    /** Image URL. */
    image?: string;

    /**
     * Schema.org application category.
     * When provided, the item is rendered as `SoftwareApplication` instead
     * of `Product`.
     */
    applicationCategory?: string;

    /** Operating system (for software items). */
    operatingSystem?: string;

    /** Price string. Use `"0"` for free. */
    price?: string;

    /** ISO 4217 currency code. */
    priceCurrency?: string;

    /** Aggregate rating value (1-5). */
    ratingValue?: number;

    /** Total number of ratings. */
    ratingCount?: number;
}
