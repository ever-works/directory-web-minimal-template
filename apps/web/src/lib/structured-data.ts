/**
 * Schema.org JSON-LD builders for the directory pages. All URLs are absolute; nothing is fabricated (no ratings,
 * prices or reviews that the data does not contain).
 *
 * Item pages use `SoftwareApplication` by default because most Ever Works directories list software; set
 * `seo.item_type` in works.yml (e.g. `Product`, `Organization`, `Event`, `Place`, `Thing`) for other verticals.
 */

import type { ItemData } from '@ever-works/core';
import { serializeJsonLd } from '@ever-works/plugin-seo';
import type { DirectoryCardData } from '@ever-works/ui/lib/directory-format';
import type { SiteContext } from './site';

type Json = Record<string, unknown>;

const stringify = (value: Json) => serializeJsonLd(value);

function organization(site: SiteContext): Json {
    const { config } = site.content;
    const logo = config.logo?.logo_image;
    const sameAs = Object.entries(site.settings.social)
        .filter(([key]) => key !== 'email')
        .map(([, url]) => url);
    return {
        '@type': 'Organization',
        '@id': `${site.siteUrl}/#organization`,
        name: config.company_name,
        url: `${site.siteUrl}/`,
        ...(logo && /^https?:\/\//.test(logo) ? { logo } : {}),
        ...(sameAs.length ? { sameAs } : {})
    };
}

/** `WebSite` (+ `SearchAction` for the `?q=` listing search) and `Organization`, for the homepage. */
export function websiteJsonLd(site: SiteContext): string {
    const { config } = site.content;
    return stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${site.siteUrl}/#website`,
                name: config.company_name,
                url: `${site.siteUrl}/`,
                description: site.description,
                inLanguage: 'en',
                publisher: { '@id': `${site.siteUrl}/#organization` },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: `${site.siteUrl}/?q={search_term_string}` },
                    'query-input': 'required name=search_term_string'
                }
            },
            organization(site)
        ]
    });
}

/** `BreadcrumbList` from `[name, path]` pairs. */
export function breadcrumbJsonLd(site: SiteContext, crumbs: Array<{ name: string; path: string }>): string {
    return stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: site.absolute(crumb.path)
        }))
    });
}

/**
 * `CollectionPage` with an `ItemList` of items (listing pages: home, categories, tags, collections).
 *
 * @param offset - Position offset for paginated lists
 */
export function collectionPageJsonLd(
    site: SiteContext,
    page: { name: string; description: string; path: string },
    items: DirectoryCardData[],
    offset = 0
): string {
    return stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${site.absolute(page.path)}#page`,
        name: page.name,
        description: page.description,
        url: site.absolute(page.path),
        isPartOf: { '@type': 'WebSite', '@id': `${site.siteUrl}/#website`, name: site.content.config.company_name, url: `${site.siteUrl}/` },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: items.length,
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: offset + index + 1,
                url: site.absolute(`/item/${item.slug}`),
                name: item.name
            }))
        }
    });
}

/** Item page: `WebPage` whose `mainEntity` is the item (type from `seo.item_type`, default `SoftwareApplication`). */
export function itemJsonLd(site: SiteContext, item: ItemData, card: DirectoryCardData, images: string[]): string {
    const seo = (site.content.config['seo'] ?? {}) as { item_type?: unknown };
    const itemType = typeof seo.item_type === 'string' && /^[A-Z][A-Za-z]+$/.test(seo.item_type) ? seo.item_type : 'SoftwareApplication';
    const pageUrl = site.absolute(`/item/${item.slug}`);
    const image = card.logo ?? images[0];
    const modified = typeof item.updated_at === 'string' ? toIsoDate(item.updated_at) : undefined;
    const entity: Json = {
        '@type': itemType,
        '@id': `${pageUrl}#item`,
        name: item.name,
        description: item.description,
        ...(card.website ? { url: card.website, sameAs: [card.website] } : {}),
        ...(image ? { image } : {}),
        ...(card.categories[0]
            ? itemType === 'SoftwareApplication'
                ? { applicationCategory: card.categories[0].name }
                : { category: card.categories[0].name }
            : {}),
        ...(card.tags.length ? { keywords: card.tags.map((tag) => tag.name).join(', ') } : {}),
        ...(typeof item.brand === 'string' && item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}),
        ...(typeof item.publisher === 'string' && item.publisher ? { publisher: { '@type': 'Organization', name: item.publisher } } : {})
    };
    if (itemType !== 'SoftwareApplication' && itemType !== 'Product') delete entity['brand'];
    return stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `${item.name} — ${site.content.config.company_name}`,
        description: item.description,
        ...(modified ? { dateModified: modified } : {}),
        isPartOf: { '@type': 'WebSite', '@id': `${site.siteUrl}/#website`, name: site.content.config.company_name, url: `${site.siteUrl}/` },
        mainEntity: entity
    });
}

/** Convert `YYYY-MM-DD[ HH:mm]` to an ISO-8601 timestamp (UTC), or undefined. */
export function toIsoDate(value: string): string | undefined {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!match) return undefined;
    return `${match[1]}-${match[2]}-${match[3]}T${match[4] ?? '00'}:${match[5] ?? '00'}:00Z`;
}
