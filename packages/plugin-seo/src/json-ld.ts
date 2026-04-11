/**
 * JSON-LD structured data generation.
 *
 * Produces Schema.org JSON-LD strings for embedding in `<script type="application/ld+json">`.
 * Supports {@link JsonLdType} values: `WebSite`, `ItemList`, and `Product`.
 */

import type { JsonLdInput, JsonLdType, ItemListInput, ProductInput, WebSiteInput } from './types';

/**
 * Generate a JSON-LD string for the given schema type and input data.
 *
 * The returned string is ready to be placed inside a
 * `<script type="application/ld+json">` element.
 *
 * @param type - The Schema.org type to generate.
 * @param data - Input data matching the requested type.
 * @returns A JSON string containing the structured data.
 *
 * @example
 * ```typescript
 * const ld = generateJsonLd('WebSite', {
 *     type: 'WebSite',
 *     name: 'My Directory',
 *     url: 'https://example.com',
 * });
 * // => '{"@context":"https://schema.org", ...}'
 * ```
 */
export function generateJsonLd(type: JsonLdType, data: JsonLdInput): string {
    switch (type) {
        case 'WebSite':
            return JSON.stringify(buildWebSite(data as WebSiteInput));
        case 'ItemList':
            return JSON.stringify(buildItemList(data as ItemListInput));
        case 'Product':
            return JSON.stringify(buildProduct(data as ProductInput));
    }
}

// ---------------------------------------------------------------------------
// Schema builders
// ---------------------------------------------------------------------------

/** Build a Schema.org `WebSite` object. */
function buildWebSite(data: WebSiteInput): Record<string, unknown> {
    const ld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
    };

    if (data.description) {
        ld['description'] = data.description;
    }

    return ld;
}

/** Build a Schema.org `ItemList` object. */
function buildItemList(data: ItemListInput): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: data.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: item.url,
        })),
    };
}

/** Build a Schema.org `Product` object. */
function buildProduct(data: ProductInput): Record<string, unknown> {
    const ld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        url: data.url,
    };

    if (data.description) {
        ld['description'] = data.description;
    }

    if (data.image) {
        ld['image'] = data.image;
    }

    return ld;
}
