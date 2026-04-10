/**
 * Tag loader — reads tag definitions from `.content/tags.yml`.
 * Filters to only active tags by default.
 */

import { parse as parseYaml } from 'yaml';
import type { DataAdapter } from '@ever-works/adapters';
import type { TagData } from '../types/index.js';

/**
 * Load tag definitions from the data adapter.
 * Only returns active tags (where `isActive` is not explicitly `false`).
 *
 * @param adapter - Data adapter to read files from
 * @returns Array of active tag definitions
 */
export async function loadTags(adapter: DataAdapter): Promise<TagData[]> {
    try {
        const exists = await adapter.exists('tags.yml');
        if (!exists) {
            console.warn('[core] tags.yml not found, returning empty array');
            return [];
        }

        const raw = await adapter.readFile('tags.yml');
        const parsed: unknown = parseYaml(raw);

        if (!Array.isArray(parsed)) {
            console.warn('[core] tags.yml is not an array, returning empty array');
            return [];
        }

        return parsed
            .filter((entry): entry is Record<string, unknown> =>
                entry !== null && typeof entry === 'object'
            )
            .filter((entry) => typeof entry['id'] === 'string' && typeof entry['name'] === 'string')
            .filter((entry) => entry['isActive'] !== false)
            .map((entry) => ({
                id: entry['id'] as string,
                name: entry['name'] as string,
                ...(typeof entry['isActive'] === 'boolean' ? { isActive: entry['isActive'] } : {}),
            }));
    } catch (error) {
        console.warn('[core] Failed to load tags.yml:', error);
        return [];
    }
}
