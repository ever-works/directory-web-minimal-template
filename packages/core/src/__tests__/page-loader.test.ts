import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DataAdapter } from '@ever-works/adapters';
import { loadPages, loadPage } from '../loaders/page-loader';

/** Helper to create a mock DataAdapter */
function createMockAdapter(overrides: Partial<Omit<DataAdapter, 'id' | 'name'>> = {}): DataAdapter {
    return {
        id: 'mock',
        name: 'Mock Adapter',
        init: vi.fn().mockResolvedValue(undefined),
        readFile: vi.fn().mockRejectedValue(new Error('Not found')),
        listFiles: vi.fn().mockResolvedValue([]),
        listDirectories: vi.fn().mockResolvedValue([]),
        exists: vi.fn().mockResolvedValue(false),
        getContentPath: vi.fn().mockReturnValue('/mock/content'),
        refresh: vi.fn().mockResolvedValue(false),
        getHeadRef: vi.fn().mockResolvedValue(null),
        ...overrides,
    };
}

describe('loadPages', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return empty array when pages/ directory does not exist', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
        });

        const pages = await loadPages(adapter);
        expect(pages).toEqual([]);
    });

    it('should return empty array when pages/ has no .md files', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['readme.txt', 'notes.json']),
        });

        const pages = await loadPages(adapter);
        expect(pages).toEqual([]);
    });

    it('should parse a markdown page with frontmatter', async () => {
        const md = `---
title: About Us
description: Learn about our company
---

# About Us

We are a great company.`;

        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['about.md']),
            readFile: vi.fn().mockResolvedValue(md),
        });

        const pages = await loadPages(adapter);
        expect(pages).toHaveLength(1);
        expect(pages[0]!.slug).toBe('about');
        expect(pages[0]!.title).toBe('About Us');
        expect(pages[0]!.description).toBe('Learn about our company');
        expect(pages[0]!.content).toContain('# About Us');
        expect(pages[0]!.content).toContain('We are a great company.');
    });

    it('should derive title from slug when frontmatter has no title', async () => {
        const md = `---
description: A privacy page
---

Privacy content here.`;

        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['privacy-policy.md']),
            readFile: vi.fn().mockResolvedValue(md),
        });

        const pages = await loadPages(adapter);
        expect(pages).toHaveLength(1);
        expect(pages[0]!.slug).toBe('privacy-policy');
        expect(pages[0]!.title).toBe('Privacy Policy');
    });

    it('should handle markdown without frontmatter', async () => {
        const md = `# Just Content

No frontmatter here.`;

        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['simple.md']),
            readFile: vi.fn().mockResolvedValue(md),
        });

        const pages = await loadPages(adapter);
        expect(pages).toHaveLength(1);
        expect(pages[0]!.slug).toBe('simple');
        expect(pages[0]!.title).toBe('Simple');
        expect(pages[0]!.content).toContain('# Just Content');
    });

    it('should load multiple pages', async () => {
        const aboutMd = `---
title: About
---
About content`;

        const termsMd = `---
title: Terms of Service
---
Terms content`;

        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['about.md', 'terms-of-service.md']),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === 'pages/about.md') return Promise.resolve(aboutMd);
                if (path === 'pages/terms-of-service.md') return Promise.resolve(termsMd);
                return Promise.reject(new Error('Not found'));
            }),
        });

        const pages = await loadPages(adapter);
        expect(pages).toHaveLength(2);
        expect(pages.map((p) => p.slug)).toEqual(['about', 'terms-of-service']);
    });

    it('should skip files that fail to load', async () => {
        const aboutMd = `---
title: About
---
About content`;

        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['about.md', 'broken.md']),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === 'pages/about.md') return Promise.resolve(aboutMd);
                return Promise.reject(new Error('File read error'));
            }),
        });

        const pages = await loadPages(adapter);
        expect(pages).toHaveLength(1);
        expect(pages[0]!.slug).toBe('about');
    });

    it('should preserve extra frontmatter fields', async () => {
        const md = `---
title: About
author: John
order: 1
---
Content`;

        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listFiles: vi.fn().mockResolvedValue(['about.md']),
            readFile: vi.fn().mockResolvedValue(md),
        });

        const pages = await loadPages(adapter);
        expect(pages[0]!.author).toBe('John');
        expect(pages[0]!.order).toBe(1);
    });

    it('should return empty array on adapter error', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockRejectedValue(new Error('Connection failed')),
        });

        const pages = await loadPages(adapter);
        expect(pages).toEqual([]);
    });
});

describe('loadPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load a single page by slug', async () => {
        const md = `---
title: About
---
About content`;

        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(md),
        });

        const page = await loadPage(adapter, 'about');
        expect(page).not.toBeNull();
        expect(page!.slug).toBe('about');
        expect(page!.title).toBe('About');
    });

    it('should return null when page does not exist', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockRejectedValue(new Error('Not found')),
        });

        const page = await loadPage(adapter, 'nonexistent');
        expect(page).toBeNull();
    });
});
