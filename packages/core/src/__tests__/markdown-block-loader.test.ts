import { describe, it, expect, vi } from 'vitest';
import type { DataAdapter } from '@ever-works/adapters';
import { loadMarkdownBlocks, firstMarkdownParagraph, MARKDOWN_BLOCK_PATHS } from '../loaders/markdown-block-loader.js';

function adapterWith(files: Record<string, string>): DataAdapter {
    return {
        id: 'mock',
        name: 'Mock',
        init: vi.fn(),
        readFile: vi.fn(async (path: string) => {
            if (path in files) return files[path] as string;
            throw new Error('ENOENT');
        }),
        listFiles: vi.fn(),
        listDirectories: vi.fn(),
        exists: vi.fn(async (path: string) => path in files),
        getContentPath: vi.fn().mockReturnValue('/mock'),
        refresh: vi.fn().mockResolvedValue(false),
        getHeadRef: vi.fn().mockResolvedValue(null)
    };
}

describe('loadMarkdownBlocks', () => {
    it('returns undefined when no block exists', async () => {
        expect(await loadMarkdownBlocks(adapterWith({}))).toBeUndefined();
    });

    it('loads header and footer blocks', async () => {
        const blocks = await loadMarkdownBlocks(
            adapterWith({ [MARKDOWN_BLOCK_PATHS.header]: '# Hi\n\nIntro', [MARKDOWN_BLOCK_PATHS.footer]: '## Legal' })
        );
        expect(blocks).toEqual({ header: '# Hi\n\nIntro', footer: '## Legal' });
    });

    it('skips empty or unreadable files', async () => {
        const adapter = adapterWith({ [MARKDOWN_BLOCK_PATHS.header]: '   ' });
        expect(await loadMarkdownBlocks(adapter)).toBeUndefined();
        const broken = adapterWith({});
        broken.exists = vi.fn(async () => true);
        expect(await loadMarkdownBlocks(broken)).toBeUndefined();
    });
});

describe('firstMarkdownParagraph', () => {
    it('returns the first prose paragraph as plain text', () => {
        expect(
            firstMarkdownParagraph(
                '# Awesome CRM\n\nA curated directory of **CRM** software: [sales](https://x.y) CRMs.\n\nMore.'
            )
        ).toBe('A curated directory of CRM software: sales CRMs.');
    });

    it('skips lists, images, quotes and handles CRLF', () => {
        expect(firstMarkdownParagraph('![logo](x.png)\r\n\r\n- a\r\n- b\r\n\r\n> quote\r\n\r\nReal text')).toBe(
            'Real text'
        );
    });

    it('returns undefined for empty input', () => {
        expect(firstMarkdownParagraph(undefined)).toBeUndefined();
        expect(firstMarkdownParagraph('# Only a heading')).toBeUndefined();
    });
});
