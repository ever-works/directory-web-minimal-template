import { describe, expect, it } from 'vitest';
import { isSafeMarkdownUrl, renderMarkdown } from '../markdown';

describe('renderMarkdown', () => {
    it('renders headings, lists and paragraphs to HTML', () => {
        const html = renderMarkdown('## Overview\n\nA CRM.\n\n- one\n- two\n');
        expect(html).toContain('<h2>Overview</h2>');
        expect(html).toContain('<p>A CRM.</p>');
        expect(html).toContain('<li>one</li>');
    });

    it('returns an empty string for empty or non-string input', () => {
        expect(renderMarkdown('')).toBe('');
        expect(renderMarkdown('   ')).toBe('');
        expect(renderMarkdown(undefined)).toBe('');
        expect(renderMarkdown(null)).toBe('');
    });

    it('escapes raw HTML instead of passing it through', () => {
        const html = renderMarkdown('<script>alert(1)</script>\n\nText <b onclick="x()">bold</b>');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('<b onclick');
        expect(html).toContain('&lt;script&gt;');
    });

    it('drops javascript: and data: links but keeps their text', () => {
        const html = renderMarkdown('[click](javascript:alert(1)) and [img](data:text/html,hi)');
        expect(html).not.toContain('javascript:');
        expect(html).not.toContain('data:text');
        expect(html).toContain('click');
    });

    it('marks external links noopener and keeps relative links plain', () => {
        const html = renderMarkdown('[site](https://example.com) and [cat](/category/crm)');
        expect(html).toContain('<a href="https://example.com" rel="noopener noreferrer nofollow" target="_blank">site</a>');
        expect(html).toContain('<a href="/category/crm">cat</a>');
    });

    it('renders autolinks such as <https://example.com>', () => {
        expect(renderMarkdown('- Website: <https://example.com>')).toContain('href="https://example.com"');
    });
});

describe('isSafeMarkdownUrl', () => {
    it('accepts http(s), mailto, fragments and same-site paths', () => {
        for (const url of ['https://a.b', 'http://a.b', 'mailto:x@y.z', '#top', '/item/x']) {
            expect(isSafeMarkdownUrl(url)).toBe(true);
        }
    });

    it('rejects script, data, protocol-relative and empty URLs', () => {
        for (const url of ['javascript:alert(1)', 'data:text/html,x', '//evil.example', '', null, undefined]) {
            expect(isSafeMarkdownUrl(url)).toBe(false);
        }
    });
});

describe('prepareItemMarkdown', () => {
    it('drops a leading title that repeats the item name and demotes other H1s', async () => {
        const { prepareItemMarkdown } = await import('../markdown');
        expect(prepareItemMarkdown('\n# Attio\n\n## Overview\n\nText\n\n# Pricing\n', 'Attio')).toBe('## Overview\n\nText\n\n## Pricing');
    });

    it('keeps a leading H1 that is not the item name (demoted) and ignores code fences', async () => {
        const { prepareItemMarkdown } = await import('../markdown');
        expect(prepareItemMarkdown('# Intro\n```\n# not a heading\n```', 'Attio')).toBe('## Intro\n```\n# not a heading\n```');
        expect(prepareItemMarkdown(undefined, 'x')).toBe('');
    });
});

describe('isSafeMarkdownUrl — protocol-relative tricks', () => {
    it('rejects /\host and //host', async () => {
        const { isSafeMarkdownUrl } = await import('../markdown');
        expect(isSafeMarkdownUrl(`/${String.fromCharCode(92)}evil.example`)).toBe(false);
        expect(isSafeMarkdownUrl('//evil.example')).toBe(false);
        expect(isSafeMarkdownUrl('/item/ok')).toBe(true);
    });
});
