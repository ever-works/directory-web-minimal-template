/**
 * Breadcrumb trail generator.
 *
 * Given content data, generates breadcrumb trails for all known page types:
 * - Home: [Home]
 * - Categories index: [Home, Categories]
 * - Category page: [Home, Categories, {category.name}]
 * - Tags index: [Home, Tags]
 * - Tag page: [Home, Tags, {tag.name}]
 * - Item page: [Home, {category.name}, {item.name}]
 * - Collections index: [Home, Collections]
 * - Collection page: [Home, Collections, {collection.name}]
 * - Comparisons index: [Home, Comparisons]
 */

import type { ContentData } from '@ever-works/core';
import type { BreadcrumbEntry, BreadcrumbMap, BreadcrumbsPluginOptions } from './types';

export function generateBreadcrumbs(
    data: ContentData,
    options: BreadcrumbsPluginOptions = {}
): BreadcrumbMap {
    const {
        homeLabel = 'Home',
        homeHref = '/',
        includeHome = true,
        labelOverrides = {},
    } = options;

    const map: BreadcrumbMap = new Map();
    const home: BreadcrumbEntry = { label: homeLabel, href: homeHref };
    const prefix = includeHome ? [home] : [];

    const getLabel = (path: string, fallback: string): string =>
        labelOverrides[path] ?? fallback;

    // Home
    map.set('/', [{ label: homeLabel }]);

    // Categories index
    map.set('/categories', [
        ...prefix,
        { label: getLabel('/categories', 'Categories') },
    ]);

    // Individual categories (CategoryWithCount uses `id` as slug identifier)
    for (const cat of data.categories) {
        map.set(`/category/${cat.id}`, [
            ...prefix,
            { label: getLabel('/categories', 'Categories'), href: '/categories' },
            { label: cat.name },
        ]);
    }

    // Tags index
    map.set('/tags', [
        ...prefix,
        { label: getLabel('/tags', 'Tags') },
    ]);

    // Individual tags (TagWithCount uses `id` as slug identifier)
    for (const tag of data.tags) {
        map.set(`/tag/${tag.id}`, [
            ...prefix,
            { label: getLabel('/tags', 'Tags'), href: '/tags' },
            { label: tag.name },
        ]);
    }

    // Items — breadcrumb through their primary category
    for (const item of data.items) {
        const categoryField = item.category;
        const primaryCatId = Array.isArray(categoryField)
            ? categoryField[0]
            : categoryField;
        const primaryCat = primaryCatId
            ? data.categories.find(c => c.id === primaryCatId)
            : undefined;

        const trail: BreadcrumbEntry[] = [...prefix];
        if (primaryCat) {
            trail.push({ label: primaryCat.name, href: `/category/${primaryCat.id}` });
        }
        trail.push({ label: item.name });
        map.set(`/item/${item.slug}`, trail);
    }

    // Collections index
    map.set('/collections', [
        ...prefix,
        { label: getLabel('/collections', 'Collections') },
    ]);

    // Individual collections
    for (const col of data.collections) {
        map.set(`/collection/${col.slug}`, [
            ...prefix,
            { label: getLabel('/collections', 'Collections'), href: '/collections' },
            { label: col.name },
        ]);
    }

    // Comparisons index
    map.set('/comparisons', [
        ...prefix,
        { label: getLabel('/comparisons', 'Comparisons') },
    ]);

    // Individual comparisons
    for (const comp of data.comparisons) {
        map.set(`/comparison/${comp.slug}`, [
            ...prefix,
            { label: getLabel('/comparisons', 'Comparisons'), href: '/comparisons' },
            { label: comp.title },
        ]);
    }

    return map;
}
