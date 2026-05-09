import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadContent } from '../content-reader.js';
import { SITE_CONFIG_PATH } from '../loaders/config-loader.js';
import type { DataAdapter } from '@ever-works/adapters';

/** Helper to create a mock DataAdapter */
function createMockAdapter(overrides: Partial<DataAdapter> = {}): DataAdapter {
    return {
        id: 'mock',
        name: 'Mock Adapter',
        init: vi.fn(),
        readFile: vi.fn(),
        listFiles: vi.fn(),
        listDirectories: vi.fn(),
        exists: vi.fn(),
        getContentPath: vi.fn().mockReturnValue('/mock/content'),
        refresh: vi.fn().mockResolvedValue(false),
        getHeadRef: vi.fn().mockResolvedValue(null),
        ...overrides,
    };
}

/** Standard config YAML */
const configYaml = `
company_name: Test Directory
item_name: Tool
items_name: Tools
copyright_year: 2025
`;

/** Categories YAML */
const categoriesYaml = `
- id: dev-tools
  name: Developer Tools
- id: productivity
  name: Productivity
`;

/** Tags YAML */
const tagsYaml = `
- id: typescript
  name: TypeScript
- id: react
  name: React
`;

/** Item A YAML (dev-tools category, typescript + react tags) */
const itemAYaml = `
name: Item A
description: First item
source_url: https://example.com/a
category: dev-tools
tags:
  - typescript
  - react
updated_at: "2025-01-01"
status: approved
`;

/** Item B YAML (productivity category, typescript tag) */
const itemBYaml = `
name: Item B
description: Second item
source_url: https://example.com/b
category: productivity
tags:
  - typescript
updated_at: "2025-02-01"
status: approved
`;

/** Collections YAML */
const collectionsYaml = `
- id: popular
  name: Popular
  items:
    - item-a
    - item-b
`;

describe('loadContent', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should orchestrate all loaders and return complete ContentData', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'categories.yml') return Promise.resolve(true);
                if (path === 'tags.yml') return Promise.resolve(true);
                if (path === 'collections.yml') return Promise.resolve(true);
                if (path === 'comparisons') return Promise.resolve(false);
                if (path === 'data') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === SITE_CONFIG_PATH) return Promise.resolve(configYaml);
                if (path === 'categories.yml') return Promise.resolve(categoriesYaml);
                if (path === 'tags.yml') return Promise.resolve(tagsYaml);
                if (path === 'collections.yml') return Promise.resolve(collectionsYaml);
                if (path.includes('item-a/item-a.yml')) return Promise.resolve(itemAYaml);
                if (path.includes('item-b/item-b.yml')) return Promise.resolve(itemBYaml);
                return Promise.reject(new Error(`Not found: ${path}`));
            }),
            listDirectories: vi.fn().mockImplementation((path: string) => {
                if (path === 'data') return Promise.resolve(['item-a', 'item-b']);
                return Promise.resolve([]);
            }),
        });

        const content = await loadContent(adapter);

        // Config
        expect(content.config.company_name).toBe('Test Directory');
        expect(content.config.item_name).toBe('Tool');

        // Items
        expect(content.items).toHaveLength(2);
        expect(content.total).toBe(2);

        // Categories with counts
        expect(content.categories).toHaveLength(2);
        const devTools = content.categories.find((c) => c.id === 'dev-tools');
        const productivity = content.categories.find((c) => c.id === 'productivity');
        expect(devTools!.count).toBe(1);
        expect(productivity!.count).toBe(1);

        // Tags with counts
        expect(content.tags).toHaveLength(2);
        const tsTag = content.tags.find((t) => t.id === 'typescript');
        const reactTag = content.tags.find((t) => t.id === 'react');
        expect(tsTag!.count).toBe(2); // both items have typescript
        expect(reactTag!.count).toBe(1); // only item-a has react

        // Collections
        expect(content.collections).toHaveLength(1);

        // Comparisons (empty in this test)
        expect(content.comparisons).toEqual([]);

        // Pages (no pages/ directory in this mock)
        expect(content.pages).toEqual([]);
    });

    it('should return empty content when all loaders fail', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
            readFile: vi.fn().mockRejectedValue(new Error('Not found')),
            listDirectories: vi.fn().mockResolvedValue([]),
        });

        const content = await loadContent(adapter);

        expect(content.config).toBeDefined();
        expect(content.items).toEqual([]);
        expect(content.categories).toEqual([]);
        expect(content.tags).toEqual([]);
        expect(content.collections).toEqual([]);
        expect(content.comparisons).toEqual([]);
        expect(content.pages).toEqual([]);
        expect(content.total).toBe(0);
    });

    it('should handle items with falsy category values', async () => {
        const falsyCatItemYaml = `
name: Falsy Cat
description: Item with empty category
category: ""
tags:
  - typescript
status: approved
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'categories.yml') return Promise.resolve(true);
                if (path === 'data') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === SITE_CONFIG_PATH) return Promise.resolve(configYaml);
                if (path === 'categories.yml') return Promise.resolve(categoriesYaml);
                if (path.includes('falsy/falsy.yml')) return Promise.resolve(falsyCatItemYaml);
                return Promise.reject(new Error('Not found'));
            }),
            listDirectories: vi.fn().mockImplementation((path: string) => {
                if (path === 'data') return Promise.resolve(['falsy']);
                return Promise.resolve([]);
            }),
        });

        const content = await loadContent(adapter);

        expect(content.items).toHaveLength(1);
        const devTools = content.categories.find((c) => c.id === 'dev-tools');
        expect(devTools!.count).toBe(0);
    });

    it('should handle items with falsy tag values', async () => {
        const falsyTagItemYaml = `
name: Falsy Tag
description: Item with empty tag
category: dev-tools
tags:
  - ""
  - typescript
status: approved
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'categories.yml') return Promise.resolve(true);
                if (path === 'tags.yml') return Promise.resolve(true);
                if (path === 'data') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === SITE_CONFIG_PATH) return Promise.resolve(configYaml);
                if (path === 'categories.yml') return Promise.resolve(categoriesYaml);
                if (path === 'tags.yml') return Promise.resolve(tagsYaml);
                if (path.includes('falsy/falsy.yml')) return Promise.resolve(falsyTagItemYaml);
                return Promise.reject(new Error('Not found'));
            }),
            listDirectories: vi.fn().mockImplementation((path: string) => {
                if (path === 'data') return Promise.resolve(['falsy']);
                return Promise.resolve([]);
            }),
        });

        const content = await loadContent(adapter);

        expect(content.items).toHaveLength(1);
        const tsTag = content.tags.find((t) => t.id === 'typescript');
        expect(tsTag!.count).toBe(1);
    });

    it('should compute category counts for multi-category items', async () => {
        const multiCatItemYaml = `
name: Multi Cat
description: Multi category item
category:
  - dev-tools
  - productivity
tags: []
status: approved
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'categories.yml') return Promise.resolve(true);
                if (path === 'data') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === SITE_CONFIG_PATH) return Promise.reject(new Error('Not found'));
                if (path === 'categories.yml') return Promise.resolve(categoriesYaml);
                if (path.includes('multi/multi.yml')) return Promise.resolve(multiCatItemYaml);
                return Promise.reject(new Error('Not found'));
            }),
            listDirectories: vi.fn().mockImplementation((path: string) => {
                if (path === 'data') return Promise.resolve(['multi']);
                return Promise.resolve([]);
            }),
        });

        const content = await loadContent(adapter);

        const devTools = content.categories.find((c) => c.id === 'dev-tools');
        const productivity = content.categories.find((c) => c.id === 'productivity');
        expect(devTools!.count).toBe(1);
        expect(productivity!.count).toBe(1);
    });
});
