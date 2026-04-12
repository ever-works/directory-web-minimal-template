/**
 * JSON-LD structured data generation.
 *
 * Produces Schema.org JSON-LD strings for embedding in `<script type="application/ld+json">`.
 * Supports {@link JsonLdType} values: `WebSite`, `ItemList`, `Product`,
 * `BreadcrumbList`, and `SoftwareApplication`.
 *
 * For directory item pages, prefer {@link generateItemJsonLd} which automatically
 * selects the best schema type based on the provided data.
 */

import type {
    JsonLdInput,
    JsonLdType,
    ItemListInput,
    ProductInput,
    WebSiteInput,
    BreadcrumbListInput,
    SoftwareApplicationInput,
    DirectoryItemInput,
} from './types';

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
        case 'BreadcrumbList':
            return JSON.stringify(buildBreadcrumbList(data as BreadcrumbListInput));
        case 'SoftwareApplication':
            return JSON.stringify(buildSoftwareApplication(data as SoftwareApplicationInput));
    }
}

/**
 * Generate JSON-LD for a single directory item, automatically selecting the
 * best Schema.org type.
 *
 * When {@link DirectoryItemInput.applicationCategory} is provided the output
 * uses `SoftwareApplication`; otherwise it falls back to `Product`.
 *
 * This is the recommended helper for individual item pages in a directory.
 *
 * @param item - Directory item data.
 * @returns A JSON string containing the structured data.
 *
 * @example
 * ```typescript
 * const ld = generateItemJsonLd({
 *     name: 'VS Code',
 *     url: 'https://example.com/items/vscode',
 *     description: 'A code editor by Microsoft',
 *     applicationCategory: 'DeveloperApplication',
 *     price: '0',
 *     priceCurrency: 'USD',
 * });
 * ```
 */
export function generateItemJsonLd(item: DirectoryItemInput): string {
    if (item.applicationCategory) {
        return generateJsonLd('SoftwareApplication', {
            type: 'SoftwareApplication',
            name: item.name,
            url: item.url,
            description: item.description,
            image: item.image,
            applicationCategory: item.applicationCategory,
            operatingSystem: item.operatingSystem,
            price: item.price,
            priceCurrency: item.priceCurrency,
            ratingValue: item.ratingValue,
            ratingCount: item.ratingCount,
        });
    }

    return generateJsonLd('Product', {
        type: 'Product',
        name: item.name,
        url: item.url,
        description: item.description,
        image: item.image,
    });
}

// ---------------------------------------------------------------------------
// Schema builders
// ---------------------------------------------------------------------------

/** Build a Schema.org `WebSite` object with optional SearchAction. */
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

    if (data.searchAction) {
        ld['potentialAction'] = {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: data.searchAction,
            },
            'query-input': 'required name=search_term_string',
        };
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

/** Build a Schema.org `BreadcrumbList` object. */
function buildBreadcrumbList(data: BreadcrumbListInput): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/** Build a Schema.org `SoftwareApplication` object. */
function buildSoftwareApplication(data: SoftwareApplicationInput): Record<string, unknown> {
    const ld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: data.name,
        url: data.url,
    };

    if (data.description) {
        ld['description'] = data.description;
    }

    if (data.image) {
        ld['image'] = data.image;
    }

    if (data.applicationCategory) {
        ld['applicationCategory'] = data.applicationCategory;
    }

    if (data.operatingSystem) {
        ld['operatingSystem'] = data.operatingSystem;
    }

    if (data.price !== undefined || data.priceCurrency) {
        const offers: Record<string, unknown> = {
            '@type': 'Offer',
        };
        if (data.price !== undefined) {
            offers['price'] = data.price;
        }
        if (data.priceCurrency) {
            offers['priceCurrency'] = data.priceCurrency;
        }
        ld['offers'] = offers;
    }

    if (data.ratingValue !== undefined && data.ratingCount !== undefined) {
        ld['aggregateRating'] = {
            '@type': 'AggregateRating',
            ratingValue: data.ratingValue,
            ratingCount: data.ratingCount,
        };
    }

    return ld;
}
