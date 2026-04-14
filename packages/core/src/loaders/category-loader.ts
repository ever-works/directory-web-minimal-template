/**
 * Category loader — reads category definitions from YAML.
 * Tries `.content/categories.yml` first, then `.content/categories/categories.yml`.
 */

import { parse as parseYaml } from 'yaml';
import type { DataAdapter } from '@ever-works/adapters';
import type { CategoryData } from '../types/index.js';
import { coreLogger } from '../logger.js';

/**
 * Load category definitions from the data adapter.
 * Falls back to `categories/categories.yml` if `categories.yml` is not found.
 *
 * @param adapter - Data adapter to read files from
 * @returns Array of category definitions
 */
export async function loadCategories(adapter: DataAdapter): Promise<CategoryData[]> {
    const paths = ['categories.yml', 'categories/categories.yml'];

    for (const path of paths) {
        try {
            const exists = await adapter.exists(path);
            if (!exists) continue;

            const raw = await adapter.readFile(path);
            const parsed: unknown = parseYaml(raw);

            if (!Array.isArray(parsed)) {
                coreLogger.warn(`${path} is not an array, skipping`);
                continue;
            }

            return parsed
                .filter((entry): entry is Record<string, unknown> =>
                    entry !== null && typeof entry === 'object'
                )
                .filter((entry) => typeof entry['id'] === 'string' && typeof entry['name'] === 'string')
                .map((entry) => ({
                    id: entry['id'] as string,
                    name: entry['name'] as string,
                    ...(typeof entry['icon_url'] === 'string' ? { icon_url: entry['icon_url'] } : {}),
                    ...(typeof entry['image_url'] === 'string' ? { image_url: entry['image_url'] } : {}),
                }));
        } catch (error) {
            coreLogger.warn(`Failed to load ${path}:`, error);
        }
    }

    coreLogger.warn('No categories file found, returning empty array');
    return [];
}
