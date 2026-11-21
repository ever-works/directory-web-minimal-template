/**
 * Markdown block loader — reads the optional inline Markdown blocks a data repository ships under `markdown/`.
 *
 * The Ever Works platform writes two blocks into every generated data repository:
 *
 * - `markdown/header.md` — a short introduction (H1 + one paragraph describing the directory). The minimal template
 *   uses its first paragraph as the site description (hero subtitle, meta description, footer blurb).
 * - `markdown/footer.md` — legal notice and license text. The minimal template renders it on the `/legal` page.
 *
 * Both are optional. Missing or unreadable files are skipped silently.
 */

import type { DataAdapter } from '@ever-works/adapters';
import type { MarkdownBlocks } from '../types/index.js';

/** Paths (relative to the content root) of the supported Markdown blocks. */
export const MARKDOWN_BLOCK_PATHS: Readonly<Record<keyof MarkdownBlocks, string>> = {
    header: 'markdown/header.md',
    footer: 'markdown/footer.md'
};

async function readOptional(adapter: DataAdapter, path: string): Promise<string | undefined> {
    try {
        if (!(await adapter.exists(path))) return undefined;
        const raw: unknown = await adapter.readFile(path);
        if (typeof raw !== 'string' || raw.trim() === '') return undefined;
        return raw;
    } catch {
        return undefined;
    }
}

/**
 * Load the optional `markdown/header.md` and `markdown/footer.md` blocks.
 *
 * @param adapter - Initialized data adapter
 * @returns The blocks that exist, or `undefined` when neither exists (keeps `ContentData` unchanged for repos
 *          without blocks)
 */
export async function loadMarkdownBlocks(adapter: DataAdapter): Promise<MarkdownBlocks | undefined> {
    const [header, footer] = await Promise.all([
        readOptional(adapter, MARKDOWN_BLOCK_PATHS.header),
        readOptional(adapter, MARKDOWN_BLOCK_PATHS.footer)
    ]);
    if (header === undefined && footer === undefined) return undefined;
    const blocks: MarkdownBlocks = {};
    if (header !== undefined) blocks.header = header;
    if (footer !== undefined) blocks.footer = footer;
    return blocks;
}

/**
 * Extract the first prose paragraph of a Markdown block (skipping headings, images, lists, quotes and blank lines),
 * flattened to plain text. Used to derive a site description from `markdown/header.md`.
 *
 * @param markdown - Markdown source
 * @returns Plain-text first paragraph, or `undefined` when there is none
 */
export function firstMarkdownParagraph(markdown: string | undefined | null): string | undefined {
    if (typeof markdown !== 'string') return undefined;
    const paragraphs = markdown.replace(/\r\n/g, '\n').split(/\n{2,}/);
    for (const block of paragraphs) {
        const text = block.trim();
        if (!text) continue;
        if (/^(#|!\[|[-*+] |\d+\. |>|\||```|<)/.test(text)) continue;
        const plain = text
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/[*_`~]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (plain) return plain;
    }
    return undefined;
}
