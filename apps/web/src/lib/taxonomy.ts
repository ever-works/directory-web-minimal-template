import type { CategoryWithCount, ItemData, TagWithCount } from '@ever-works/core';

export function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function taxonomyKey(value: string): string {
    return slugify(value);
}

export function categoryValues(item: ItemData): string[] {
    return Array.isArray(item.category) ? item.category : [item.category];
}

export function resolveCategory(categories: CategoryWithCount[], raw: string): CategoryWithCount | null {
    const decoded = decodeURIComponent(raw);
    const key = taxonomyKey(decoded);
    return (
        categories.find((category) =>
            [category.id, category.name, slugify(category.id), slugify(category.name)].some(
                (value) => taxonomyKey(value) === key
            )
        ) ?? null
    );
}

export function resolveTag(tags: TagWithCount[], raw: string): TagWithCount | null {
    const decoded = decodeURIComponent(raw);
    const key = taxonomyKey(decoded);
    return (
        tags.find((tag) =>
            [tag.id, tag.name, slugify(tag.id), slugify(tag.name)].some((value) => taxonomyKey(value) === key)
        ) ?? null
    );
}

export function itemBelongsToCategory(item: ItemData, category: CategoryWithCount): boolean {
    const aliases = new Set(
        [category.id, category.name, slugify(category.id), slugify(category.name)].map(taxonomyKey)
    );
    return categoryValues(item).some((value) => value && aliases.has(taxonomyKey(value)));
}

export function itemHasTag(item: ItemData, tag: TagWithCount): boolean {
    const aliases = new Set([tag.id, tag.name, slugify(tag.id), slugify(tag.name)].map(taxonomyKey));
    return item.tags.some((value) => value && aliases.has(taxonomyKey(value)));
}

export function uniquePathAliases(id: string, name: string): string[] {
    const aliases = [id, slugify(id), slugify(name)];
    const seen = new Set<string>();
    return aliases.filter((alias) => {
        if (!alias || seen.has(alias)) return false;
        seen.add(alias);
        return true;
    });
}

export function itemBelongsToCollection(
    item: ItemData,
    collection: { id: string; name: string; slug?: string; items?: string[] }
): boolean {
    if (collection.items?.includes(item.slug)) {
        return true;
    }
    const aliases = new Set(
        [collection.id, collection.name, collection.slug, slugify(collection.id), slugify(collection.name)]
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
            .map(taxonomyKey)
    );
    const values = [item.collection, ...(item.collections ?? [])].filter(
        (value): value is string => typeof value === 'string' && value.length > 0
    );
    return values.some((value) => aliases.has(taxonomyKey(value)));
}
