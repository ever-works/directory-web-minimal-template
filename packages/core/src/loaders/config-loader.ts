/**
 * Config loader — reads and parses `.content/config.yml`.
 * Provides sensible defaults for missing fields.
 */

import { parse as parseYaml } from 'yaml';
import type { DataAdapter } from '@ever-works/adapters';
import type { SiteConfig } from '../types/index.js';
import { coreLogger } from '../logger.js';

/** Default site configuration used when fields are missing */
const DEFAULT_CONFIG: SiteConfig = {
    company_name: 'My Directory',
    item_name: 'Item',
    items_name: 'Items',
    copyright_year: new Date().getFullYear(),
};

/**
 * Load site configuration from the data adapter.
 * Reads `config.yml` from the content root and merges with defaults.
 *
 * @param adapter - Data adapter to read files from
 * @returns Parsed site configuration with defaults applied
 */
export async function loadConfig(adapter: DataAdapter): Promise<SiteConfig> {
    try {
        const raw = await adapter.readFile('config.yml');
        const parsed: unknown = parseYaml(raw);

        if (parsed === null || typeof parsed !== 'object') {
            coreLogger.warn('config.yml is empty or invalid, using defaults');
            return { ...DEFAULT_CONFIG };
        }

        const data = parsed as Record<string, unknown>;

        return {
            ...DEFAULT_CONFIG,
            ...data,
            company_name: typeof data['company_name'] === 'string'
                ? data['company_name']
                : DEFAULT_CONFIG.company_name,
            item_name: typeof data['item_name'] === 'string'
                ? data['item_name']
                : DEFAULT_CONFIG.item_name,
            items_name: typeof data['items_name'] === 'string'
                ? data['items_name']
                : DEFAULT_CONFIG.items_name,
            copyright_year: typeof data['copyright_year'] === 'number'
                ? data['copyright_year']
                : DEFAULT_CONFIG.copyright_year,
        };
    } catch (error) {
        coreLogger.warn('Failed to load config.yml, using defaults:', error);
        return { ...DEFAULT_CONFIG };
    }
}
