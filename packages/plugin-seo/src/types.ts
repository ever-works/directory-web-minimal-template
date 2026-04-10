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
export type JsonLdType = 'WebSite' | 'ItemList' | 'Product';

/** Input data for JSON-LD generation. Discriminated by {@link JsonLdType}. */
export type JsonLdInput = WebSiteInput | ItemListInput | ProductInput;

/** Data required to build a `WebSite` JSON-LD block. */
export interface WebSiteInput {
    type: 'WebSite';

    /** Site name. */
    name: string;

    /** Site root URL. */
    url: string;

    /** Short site description. */
    description?: string;
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
