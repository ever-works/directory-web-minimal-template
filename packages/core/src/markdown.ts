/**
 * Markdown → HTML for item bodies.
 *
 * Data repositories written by the Ever Works platform store an item's long-form body as **Markdown** (the `markdown`
 * field of `data/<slug>/<slug>.yml`, mirrored in `data/<slug>/<slug>.md`). The item page used to inject that field
 * with `set:html` as if it were HTML, so visitors saw raw `## Overview …` text. This renders it instead.
 *
 * Safety: item content can arrive through community pull requests, so it is treated as untrusted:
 * - raw HTML blocks and inline HTML are escaped, never passed through (same policy as the page loader);
 * - link and image URLs are limited to http(s), mailto and same-site relative paths (no `javascript:`/`data:`);
 * - external links open with `rel="noopener noreferrer nofollow"`.
 */

import { Marked, type Tokens } from 'marked';

const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** True when `href` is safe to emit: http(s), mailto, a fragment, or a same-site relative path. */
export function isSafeMarkdownUrl(href: string | null | undefined): boolean {
    if (!href) return false;
    const value = href.trim();
    // Same-site paths only: `//host` and `/\host` (browsers treat `\` as `/`) leave the site.
    if (value.startsWith('#') || /^\/(?![\\/])/.test(value)) return true;
    return /^(https?:|mailto:)/i.test(value);
}

const itemMarked = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
        html(token: Tokens.HTML | Tokens.Tag): string {
            return escapeHtml(token.text);
        },
        link(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, token: Tokens.Link): string {
            const text = this.parser.parseInline(token.tokens as Tokens.Generic[]);
            if (!isSafeMarkdownUrl(token.href)) return text;
            const href = escapeHtml(token.href.trim());
            const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
            const external = /^https?:/i.test(token.href.trim());
            return `<a href="${href}"${title}${external ? ' rel="noopener noreferrer nofollow" target="_blank"' : ''}>${text}</a>`;
        },
        image(token: Tokens.Image): string {
            if (!isSafeMarkdownUrl(token.href)) return escapeHtml(token.text ?? '');
            const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
            return `<img src="${escapeHtml(token.href.trim())}" alt="${escapeHtml(token.text ?? '')}"${title} loading="lazy" decoding="async">`;
        }
    }
});

/**
 * Render an item's Markdown body to sanitized HTML (synchronous).
 *
 * @param markdown - Markdown source (the item's `markdown` field)
 * @returns HTML safe to inject with `set:html`, or an empty string for empty input
 */
export function renderMarkdown(markdown: string | null | undefined): string {
    if (typeof markdown !== 'string' || markdown.trim() === '') return '';
    return itemMarked.parse(markdown, { async: false }) as string;
}

/**
 * Prepare an item's Markdown body for rendering under the page's own `<h1>`:
 * drops a leading `# Title` that repeats the item name and demotes any other level-1 heading to level 2 (outside
 * fenced code blocks), so item pages keep exactly one `<h1>` (an SEO and accessibility requirement).
 *
 * @param markdown - Item Markdown body
 * @param itemName - The item's display name
 * @returns Markdown ready for {@link renderMarkdown}
 */
export function prepareItemMarkdown(markdown: string | null | undefined, itemName: string): string {
    if (typeof markdown !== 'string') return '';
    const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const first = lines.findIndex((line) => line.trim() !== '');
    if (first >= 0) {
        const title = lines[first]?.match(/^#\s+(.+?)\s*#*\s*$/);
        if (title?.[1] && normalize(title[1]) === normalize(itemName)) lines.splice(first, 1);
    }
    let fenced = false;
    return lines
        .map((line) => {
            if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
            return !fenced && /^#\s/.test(line) ? `#${line}` : line;
        })
        .join('\n')
        .trim();
}
