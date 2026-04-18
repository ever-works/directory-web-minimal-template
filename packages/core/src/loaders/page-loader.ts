/**
 * Page loader — reads static pages from `.content/pages/` directory.
 * Each `.md` file is parsed as a page with YAML frontmatter and markdown body.
 */

import { parse as parseYaml } from 'yaml';
import { Marked } from 'marked';
import type { DataAdapter } from '@ever-works/adapters';
import type { PageData } from '../types/index.js';
import { coreLogger } from '../logger.js';

// Sanitized marked instance — escapes raw HTML in markdown content
const sanitizedMarked = new Marked({
    renderer: {
        html(token) {
            return token.text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },
    },
});

/**
 * Split a markdown file into frontmatter and body content.
 * Expects the format: `---\nfrontmatter\n---\nbody`
 */
function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
    const trimmed = raw.trim();

    if (!trimmed.startsWith('---')) {
        return { frontmatter: {}, body: trimmed };
    }

    const endIndex = trimmed.indexOf('---', 3);
    if (endIndex === -1) {
        return { frontmatter: {}, body: trimmed };
    }

    const frontmatterStr = trimmed.slice(3, endIndex).trim();
    const body = trimmed.slice(endIndex + 3).trim();

    try {
        const parsed: unknown = parseYaml(frontmatterStr);
        const frontmatter = (parsed !== null && typeof parsed === 'object')
            ? parsed as Record<string, unknown>
            : {};
        return { frontmatter, body };
    } catch {
        return { frontmatter: {}, body: trimmed };
    }
}

/**
 * Parse a single markdown page file into a PageData object.
 *
 * @param adapter - Data adapter to read files from
 * @param filename - The page filename (e.g., "about.md")
 * @returns Parsed page data, or null if invalid
 */
async function parsePage(adapter: DataAdapter, filename: string): Promise<PageData | null> {
    const filePath = `pages/${filename}`;
    const slug = filename.replace(/\.md$/, '');

    try {
        const raw = await adapter.readFile(filePath);
        const { frontmatter, body } = parseFrontmatter(raw);

        const title = typeof frontmatter['title'] === 'string'
            ? frontmatter['title']
            : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        // Convert markdown body to HTML for rendering via set:html
        const htmlContent = await sanitizedMarked.parse(body);

        const page: PageData = {
            ...frontmatter,
            slug,
            title,
            content: htmlContent,
        };

        if (typeof frontmatter['description'] === 'string') {
            page.description = frontmatter['description'];
        }

        return page;
    } catch (error) {
        coreLogger.warn(`Failed to load page ${filePath}:`, error);
        return null;
    }
}

/**
 * Load all static pages from the data adapter.
 * Scans `.content/pages/` for `.md` files.
 *
 * @param adapter - Data adapter to read files from
 * @returns Array of parsed pages
 */
export async function loadPages(adapter: DataAdapter): Promise<PageData[]> {
    try {
        const exists = await adapter.exists('pages');
        if (!exists) {
            coreLogger.warn('pages/ directory not found, returning empty array');
            return [];
        }

        const files = await adapter.listFiles('pages');
        const mdFiles = files.filter((f) => f.endsWith('.md'));

        const results = await Promise.all(
            mdFiles.map((filename) => parsePage(adapter, filename))
        );

        return results.filter((page): page is PageData => page !== null);
    } catch (error) {
        coreLogger.warn('Failed to load pages:', error);
        return [];
    }
}

/**
 * Load a single page by slug.
 * Returns null if the page does not exist.
 *
 * @param adapter - Data adapter to read files from
 * @param slug - The page slug (filename without .md extension)
 * @returns The page data, or null if not found
 */
export async function loadPage(adapter: DataAdapter, slug: string): Promise<PageData | null> {
    return parsePage(adapter, `${slug}.md`);
}
