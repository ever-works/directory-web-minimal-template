/**
 * Item loader — reads item data from `.content/data/<slug>/<slug>.yml`.
 * Only returns items with status `approved`.
 */

import { parse as parseYaml } from 'yaml';
import type { DataAdapter } from '@ever-works/adapters';
import type { ItemData } from '../types/index.js';

/**
 * Parse a single item YAML file into an ItemData object.
 *
 * @param adapter - Data adapter to read files from
 * @param slug - The item's directory/slug name
 * @returns Parsed item data, or null if invalid or not approved
 */
async function parseItem(adapter: DataAdapter, slug: string): Promise<ItemData | null> {
    const filePath = `data/${slug}/${slug}.yml`;

    try {
        const raw = await adapter.readFile(filePath);
        const parsed: unknown = parseYaml(raw);

        if (parsed === null || typeof parsed !== 'object') {
            console.warn(`[core] ${filePath} is empty or invalid, skipping`);
            return null;
        }

        const data = parsed as Record<string, unknown>;

        const name = typeof data['name'] === 'string' ? data['name'] : '';
        if (!name) {
            console.warn(`[core] ${filePath} has no name, skipping`);
            return null;
        }

        const item: ItemData = {
            ...data,
            id: slug,
            slug,
            name,
            description: typeof data['description'] === 'string' ? data['description'] : '',
            source_url: typeof data['source_url'] === 'string' ? data['source_url'] : '',
            category: Array.isArray(data['category'])
                ? data['category'].filter((c): c is string => typeof c === 'string')
                : typeof data['category'] === 'string'
                    ? data['category']
                    : '',
            tags: Array.isArray(data['tags'])
                ? data['tags'].filter((t): t is string => typeof t === 'string')
                : [],
            updated_at: typeof data['updated_at'] === 'string' ? data['updated_at'] : '',
            status: isValidStatus(data['status']) ? data['status'] : 'draft',
        };

        if (Array.isArray(data['collections'])) {
            item.collections = data['collections'].filter((c): c is string => typeof c === 'string');
        }
        if (typeof data['featured'] === 'boolean') {
            item.featured = data['featured'];
        }
        if (typeof data['icon_url'] === 'string') {
            item.icon_url = data['icon_url'];
        }
        if (typeof data['markdown'] === 'string') {
            item.markdown = data['markdown'];
        }

        return item;
    } catch (error) {
        console.warn(`[core] Failed to load ${filePath}:`, error);
        return null;
    }
}

/**
 * Type guard for valid item status values.
 */
function isValidStatus(value: unknown): value is ItemData['status'] {
    return value === 'draft' || value === 'pending' || value === 'approved' || value === 'rejected';
}

/**
 * Load all approved items from the data adapter.
 * Scans `.content/data/` subdirectories and reads each item's YAML file.
 *
 * @param adapter - Data adapter to read files from
 * @returns Array of approved items
 */
export async function loadItems(adapter: DataAdapter): Promise<ItemData[]> {
    try {
        const exists = await adapter.exists('data');
        if (!exists) {
            console.warn('[core] data/ directory not found, returning empty array');
            return [];
        }

        const slugs = await adapter.listDirectories('data');
        const results = await Promise.all(
            slugs.map((slug) => parseItem(adapter, slug))
        );

        return results.filter(
            (item): item is ItemData => item !== null && item.status === 'approved'
        );
    } catch (error) {
        console.warn('[core] Failed to load items:', error);
        return [];
    }
}

/**
 * Load a single item by slug.
 * Returns null if the item does not exist or is not approved.
 *
 * @param adapter - Data adapter to read files from
 * @param slug - The item's slug/directory name
 * @returns The item data, or null if not found or not approved
 */
export async function loadItem(adapter: DataAdapter, slug: string): Promise<ItemData | null> {
    const item = await parseItem(adapter, slug);
    if (item === null || item.status !== 'approved') {
        return null;
    }
    return item;
}
