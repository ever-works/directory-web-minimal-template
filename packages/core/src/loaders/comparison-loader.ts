/**
 * Comparison loader — reads comparison data from `.content/comparisons/`.
 * Each comparison has a YAML metadata file and an optional Markdown content file.
 */

import { parse as parseYaml } from 'yaml';
import type { DataAdapter } from '@ever-works/adapters';
import type { ComparisonData, ComparisonDimension } from '../types/index.js';
import { coreLogger } from '../logger.js';

/**
 * Parse a single comparison from its YAML and optional Markdown files.
 *
 * @param adapter - Data adapter to read files from
 * @param slug - The comparison's directory/slug name
 * @returns Parsed comparison data, or null if invalid
 */
async function parseComparison(adapter: DataAdapter, slug: string): Promise<ComparisonData | null> {
    const ymlPath = `comparisons/${slug}/${slug}.yml`;

    try {
        const raw = await adapter.readFile(ymlPath);
        const parsed: unknown = parseYaml(raw);

        if (parsed === null || typeof parsed !== 'object') {
            coreLogger.warn(`${ymlPath} is empty or invalid, skipping`);
            return null;
        }

        const data = parsed as Record<string, unknown>;

        const title = typeof data['title'] === 'string' ? data['title'] : '';
        const itemASlug = typeof data['item_a_slug'] === 'string' ? data['item_a_slug'] : '';
        const itemBSlug = typeof data['item_b_slug'] === 'string' ? data['item_b_slug'] : '';

        if (!title || !itemASlug || !itemBSlug) {
            coreLogger.warn(`${ymlPath} missing required fields (title, item_a_slug, item_b_slug), skipping`);
            return null;
        }

        // Try to read companion markdown file
        let markdownContent: string | undefined;
        const mdPath = `comparisons/${slug}/${slug}.md`;
        try {
            const mdExists = await adapter.exists(mdPath);
            if (mdExists) {
                markdownContent = await adapter.readFile(mdPath);
            }
        } catch {
            // Markdown file is optional, silently ignore
        }

        const comparison: ComparisonData = {
            id: slug,
            slug,
            title,
            item_a_slug: itemASlug,
            item_b_slug: itemBSlug,
            item_a_name: typeof data['item_a_name'] === 'string' ? data['item_a_name'] : itemASlug,
            item_b_name: typeof data['item_b_name'] === 'string' ? data['item_b_name'] : itemBSlug,
        };

        if (typeof data['category'] === 'string') {
            comparison.category = data['category'];
        }
        if (typeof data['summary'] === 'string') {
            comparison.summary = data['summary'];
        }
        if (typeof data['verdict'] === 'string') {
            comparison.verdict = data['verdict'];
        }
        if (isVerdictWinner(data['verdict_winner'])) {
            comparison.verdict_winner = data['verdict_winner'];
        }
        if (Array.isArray(data['dimensions'])) {
            comparison.dimensions = parseDimensions(data['dimensions']);
        }
        if (typeof data['generated_at'] === 'string') {
            comparison.generated_at = data['generated_at'];
        }
        if (Array.isArray(data['sources'])) {
            comparison.sources = data['sources'].filter(
                (s): s is string => typeof s === 'string'
            );
        }
        if (markdownContent) {
            comparison.content = markdownContent;
        }

        return comparison;
    } catch (error) {
        coreLogger.warn(`Failed to load comparison ${slug}:`, error);
        return null;
    }
}

/**
 * Type guard for verdict_winner values.
 */
function isVerdictWinner(value: unknown): value is ComparisonData['verdict_winner'] {
    return value === 'item_a' || value === 'item_b' || value === 'tie';
}

/**
 * Parse dimension entries from raw YAML data.
 */
function parseDimensions(raw: unknown[]): ComparisonDimension[] {
    return raw
        .filter((d): d is Record<string, unknown> => d !== null && typeof d === 'object')
        .filter((d) => typeof d['name'] === 'string')
        .map((d) => {
            const dim: ComparisonDimension = {
                name: d['name'] as string,
            };
            if (typeof d['item_a_summary'] === 'string') dim.item_a_summary = d['item_a_summary'];
            if (typeof d['item_b_summary'] === 'string') dim.item_b_summary = d['item_b_summary'];
            if (typeof d['item_a_score'] === 'number') dim.item_a_score = d['item_a_score'];
            if (typeof d['item_b_score'] === 'number') dim.item_b_score = d['item_b_score'];
            if (isVerdictWinner(d['winner'])) dim.winner = d['winner'];
            return dim;
        });
}

/**
 * Load all comparisons from the data adapter.
 * Scans `.content/comparisons/` subdirectories and reads metadata + content.
 *
 * @param adapter - Data adapter to read files from
 * @returns Array of comparison data objects
 */
export async function loadComparisons(adapter: DataAdapter): Promise<ComparisonData[]> {
    try {
        const exists = await adapter.exists('comparisons');
        if (!exists) {
            return [];
        }

        const slugs = await adapter.listDirectories('comparisons');
        const results = await Promise.all(
            slugs.map((slug) => parseComparison(adapter, slug))
        );

        return results.filter((c): c is ComparisonData => c !== null);
    } catch (error) {
        coreLogger.warn('Failed to load comparisons:', error);
        return [];
    }
}

/**
 * Load a single comparison by slug.
 * Returns null if the comparison does not exist.
 *
 * @param adapter - Data adapter to read files from
 * @param slug - The comparison's slug/directory name
 * @returns The comparison data, or null if not found
 */
export async function loadComparison(adapter: DataAdapter, slug: string): Promise<ComparisonData | null> {
    return parseComparison(adapter, slug);
}
