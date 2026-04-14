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
        // Content is now converted from markdown to HTML
        expect(pages[0]!.content).toContain('<h1>About Us</h1>');
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
        // Content is converted from markdown to HTML
        expect(pages[0]!.content).toContain('<h1>Just Content</h1>');
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

describe('page-loader edge cases', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('frontmatter parsing edge cases', () => {
        it('should handle malformed YAML in frontmatter gracefully', async () => {
            const md = `---
title: [invalid yaml
  - broken: {unclosed
---

Body content here.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['broken-yaml.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            // Malformed YAML falls back to empty frontmatter, title from slug
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('broken-yaml');
            expect(pages[0]!.title).toBe('Broken Yaml');
        });

        it('should handle frontmatter without closing delimiter', async () => {
            // The parseFrontmatter function looks for the second '---'.
            // In this test, there IS a '---' inside the description text, so
            // the parser finds it and treats everything before it as frontmatter.
            // Let's test with truly no second '---'.
            const md = `---
title: Unclosed Frontmatter
description: This has no closing delimiter

Some body content`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['unclosed.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            // Without closing ---, parseFrontmatter returns {} frontmatter and entire text as body
            expect(pages[0]!.slug).toBe('unclosed');
            expect(pages[0]!.title).toBe('Unclosed');
        });

        it('should handle empty frontmatter block', async () => {
            const md = `---
---

Body after empty frontmatter.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['empty-fm.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('empty-fm');
            expect(pages[0]!.title).toBe('Empty Fm');
            expect(pages[0]!.content).toContain('Body after empty frontmatter.');
        });

        it('should handle frontmatter where YAML parses to a non-object (e.g. a string)', async () => {
            const md = `---
just a plain string
---

Body content.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['string-fm.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            // YAML parses to a string, not an object -> frontmatter defaults to {}
            expect(pages[0]!.slug).toBe('string-fm');
            expect(pages[0]!.title).toBe('String Fm');
        });

        it('should handle frontmatter where YAML parses to null', async () => {
            const md = `---
null
---

Body content.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['null-fm.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('null-fm');
            expect(pages[0]!.title).toBe('Null Fm');
        });

        it('should handle non-string title in frontmatter (number)', async () => {
            const md = `---
title: 42
description: A numbered page
---

Page content.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['numbered.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            // Non-string title should fall back to slug-derived title
            expect(pages[0]!.title).toBe('Numbered');
        });

        it('should handle non-string title in frontmatter (boolean)', async () => {
            const md = `---
title: true
---

Content.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['bool-title.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.title).toBe('Bool Title');
        });

        it('should not override description with string when frontmatter description is non-string', async () => {
            const md = `---
title: Test
description: 123
---

Body.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['num-desc.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            // The spread ...frontmatter copies description: 123 (number) onto the page
            // The type guard only sets page.description for string values, so the
            // numeric value from the spread remains. This tests the actual behavior.
            expect(pages[0]!.description).toBe(123);
        });
    });

    describe('content edge cases', () => {
        it('should handle completely empty file content', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['empty.md']),
                readFile: vi.fn().mockResolvedValue(''),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('empty');
            expect(pages[0]!.title).toBe('Empty');
            expect(pages[0]!.content).toBe('');
        });

        it('should handle whitespace-only file content', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['whitespace.md']),
                readFile: vi.fn().mockResolvedValue('   \n\n  \n  '),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('whitespace');
            expect(pages[0]!.title).toBe('Whitespace');
        });

        it('should handle frontmatter with no body content', async () => {
            const md = `---
title: Metadata Only
description: No body
---`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['metadata-only.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.title).toBe('Metadata Only');
            expect(pages[0]!.content).toBe('');
        });

        it('should handle body with multiple --- delimiters after frontmatter', async () => {
            const md = `---
title: Dashes Test
---

Content with --- horizontal rules --- in the body.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['dashes.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.title).toBe('Dashes Test');
            // Body should contain the horizontal rules
            expect(pages[0]!.content).toContain('---');
        });

        it('should convert markdown body to HTML', async () => {
            const md = `---
title: HTML Test
---

**Bold text** and *italic text*

- list item 1
- list item 2`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['html-test.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.content).toContain('<strong>Bold text</strong>');
            expect(pages[0]!.content).toContain('<em>italic text</em>');
            expect(pages[0]!.content).toContain('<li>list item 1</li>');
        });
    });

    describe('slug derivation edge cases', () => {
        it('should derive multi-word title from hyphenated slug', async () => {
            const md = `No frontmatter.`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['terms-and-conditions.md']),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('terms-and-conditions');
            expect(pages[0]!.title).toBe('Terms And Conditions');
        });

        it('should strip .md extension correctly for slug', async () => {
            const md = `---
title: About
---
Content`;

            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(md),
            });

            const page = await loadPage(adapter, 'about');
            expect(page).not.toBeNull();
            expect(page!.slug).toBe('about');
        });
    });

    describe('loadPages file filtering', () => {
        it('should ignore non-.md files in the pages directory', async () => {
            const md = `---
title: Real Page
---
Content`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue([
                    'real-page.md',
                    'image.png',
                    'data.json',
                    '.gitkeep',
                    'notes.txt',
                    'draft.md.bak',
                ]),
                readFile: vi.fn().mockResolvedValue(md),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(1);
            expect(pages[0]!.slug).toBe('real-page');
        });

        it('should handle listFiles throwing an error', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockRejectedValue(new Error('Permission denied')),
            });

            const pages = await loadPages(adapter);
            expect(pages).toEqual([]);
        });

        it('should handle concurrent page loading with mixed success/failure', async () => {
            const goodMd = `---
title: Good Page
---
Content`;

            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listFiles: vi.fn().mockResolvedValue(['good.md', 'bad.md', 'also-good.md']),
                readFile: vi.fn().mockImplementation((path: string) => {
                    if (path === 'pages/good.md') return Promise.resolve(goodMd);
                    if (path === 'pages/also-good.md') return Promise.resolve(goodMd);
                    return Promise.reject(new Error('Corrupt file'));
                }),
            });

            const pages = await loadPages(adapter);
            expect(pages).toHaveLength(2);
        });
    });

    describe('loadPage edge cases', () => {
        it('should pass correct file path to adapter', async () => {
            const md = `---
title: Test
---
Content`;

            const readFile = vi.fn().mockResolvedValue(md);
            const adapter = createMockAdapter({ readFile });

            await loadPage(adapter, 'my-page');
            expect(readFile).toHaveBeenCalledWith('pages/my-page.md');
        });

        it('should handle slug with special characters', async () => {
            const md = `---
title: FAQ
---
FAQ content`;

            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(md),
            });

            const page = await loadPage(adapter, 'faq-2024');
            expect(page).not.toBeNull();
            expect(page!.slug).toBe('faq-2024');
        });
    });
});
