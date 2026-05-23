/**
 * Collection loader — reads collection definitions from `.content/collections.yml`.
 * Filters to only active collections by default.
 */

import { parse as parseYaml } from 'yaml';
import type { DataAdapter } from '@ever-works/adapters';
import type { CollectionData } from '../types/index.js';
import { coreLogger } from '../logger.js';

/**
 * Load collection definitions from the data adapter.
 * Only returns active collections (where `isActive` is not explicitly `false`).
 *
 * @param adapter - Data adapter to read files from
 * @returns Array of active collection definitions
 */
export async function loadCollections(adapter: DataAdapter): Promise<CollectionData[]> {
    try {
        const exists = await adapter.exists('collections.yml');
        if (!exists) {
            coreLogger.warn('collections.yml not found, returning empty array');
            return [];
        }

        const raw = await adapter.readFile('collections.yml');
        const parsed: unknown = parseYaml(raw);

        if (!Array.isArray(parsed)) {
            coreLogger.warn('collections.yml is not an array, returning empty array');
            return [];
        }

        return parsed
            .filter((entry): entry is Record<string, unknown> => entry !== null && typeof entry === 'object')
            .filter((entry) => typeof entry['id'] === 'string' && typeof entry['name'] === 'string')
            .filter((entry) => entry['isActive'] !== false)
            .map((entry) => ({
                id: entry['id'] as string,
                slug: typeof entry['slug'] === 'string' ? entry['slug'] : (entry['id'] as string),
                name: entry['name'] as string,
                description: typeof entry['description'] === 'string' ? entry['description'] : '',
                ...(typeof entry['icon_url'] === 'string' ? { icon_url: entry['icon_url'] } : {}),
                ...(typeof entry['icon_svg'] === 'string' ? { icon_svg: entry['icon_svg'] } : {}),
                ...(typeof entry['priority'] === 'number' ? { priority: entry['priority'] } : {}),
                ...(Array.isArray(entry['items'])
                    ? { items: entry['items'].filter((s): s is string => typeof s === 'string') }
                    : {}),
                ...(typeof entry['isActive'] === 'boolean' ? { isActive: entry['isActive'] } : {}),
                ...(typeof entry['created_at'] === 'string' ? { created_at: entry['created_at'] } : {}),
                ...(typeof entry['updated_at'] === 'string' ? { updated_at: entry['updated_at'] } : {})
            }));
    } catch (error) {
        coreLogger.warn('Failed to load collections.yml:', error);
        return [];
    }
}
