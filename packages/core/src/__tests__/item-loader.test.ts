import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadItems, loadItem } from '../loaders/item-loader.js';
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

/** Minimal approved item YAML */
const approvedItemYaml = `
name: Test Tool
description: A test tool
source_url: https://example.com
category: dev-tools
tags:
  - typescript
  - testing
updated_at: "2025-01-01 12:00"
status: approved
`;

/** Draft item YAML */
const draftItemYaml = `
name: Draft Tool
description: A draft tool
source_url: https://example.com
category: drafts
tags: []
updated_at: "2025-01-01 12:00"
status: draft
`;

/** Item with no name */
const noNameItemYaml = `
description: No name tool
status: approved
`;

/** Item with multiple categories */
const multiCategoryYaml = `
name: Multi Category Tool
description: Has multiple categories
source_url: https://example.com
category:
  - dev-tools
  - productivity
tags:
  - multi
updated_at: "2025-06-01 10:00"
status: approved
featured: true
icon_url: https://example.com/icon.png
collections:
  - popular
  - new
markdown: "# Hello"
`;

describe('loadItems', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return approved items only', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listDirectories: vi.fn().mockResolvedValue(['approved-tool', 'draft-tool']),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path.includes('approved-tool')) return Promise.resolve(approvedItemYaml);
                if (path.includes('draft-tool')) return Promise.resolve(draftItemYaml);
                return Promise.reject(new Error('File not found'));
            }),
        });

        const items = await loadItems(adapter);

        expect(items).toHaveLength(1);
        expect(items[0]!.name).toBe('Test Tool');
        expect(items[0]!.status).toBe('approved');
    });

    it('should return empty array when data directory does not exist', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
        });

        const items = await loadItems(adapter);

        expect(items).toEqual([]);
    });

    it('should return empty array when adapter throws', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockRejectedValue(new Error('Connection failed')),
        });

        const items = await loadItems(adapter);

        expect(items).toEqual([]);
    });

    it('should skip items with no name', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listDirectories: vi.fn().mockResolvedValue(['no-name-item']),
            readFile: vi.fn().mockResolvedValue(noNameItemYaml),
        });

        const items = await loadItems(adapter);

        expect(items).toHaveLength(0);
    });

    it('should skip items with invalid/empty YAML', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listDirectories: vi.fn().mockResolvedValue(['empty-item']),
            readFile: vi.fn().mockResolvedValue(''),
        });

        const items = await loadItems(adapter);

        expect(items).toHaveLength(0);
    });

    it('should handle readFile errors gracefully', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listDirectories: vi.fn().mockResolvedValue(['bad-item']),
            readFile: vi.fn().mockRejectedValue(new Error('Read error')),
        });

        const items = await loadItems(adapter);

        expect(items).toHaveLength(0);
    });
});

describe('loadItem', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return a single approved item by slug', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(approvedItemYaml),
        });

        const item = await loadItem(adapter, 'test-tool');

        expect(item).not.toBeNull();
        expect(item!.slug).toBe('test-tool');
        expect(item!.id).toBe('test-tool');
        expect(item!.name).toBe('Test Tool');
        expect(item!.description).toBe('A test tool');
        expect(item!.source_url).toBe('https://example.com');
        expect(item!.category).toBe('dev-tools');
        expect(item!.tags).toEqual(['typescript', 'testing']);
        expect(item!.status).toBe('approved');
    });

    it('should return null for non-approved items', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(draftItemYaml),
        });

        const item = await loadItem(adapter, 'draft-tool');

        expect(item).toBeNull();
    });

    it('should return null when readFile throws', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockRejectedValue(new Error('Not found')),
        });

        const item = await loadItem(adapter, 'missing-tool');

        expect(item).toBeNull();
    });

    it('should use slug as id and slug fields', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(approvedItemYaml),
        });

        const item = await loadItem(adapter, 'my-custom-slug');

        expect(item!.id).toBe('my-custom-slug');
        expect(item!.slug).toBe('my-custom-slug');
    });

    it('should default status to draft when status is invalid', async () => {
        const yaml = `
name: Bad Status Tool
description: Invalid status
status: unknown
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        // status defaults to 'draft', which is not 'approved', so loadItem returns null
        const item = await loadItem(adapter, 'bad-status');

        expect(item).toBeNull();
    });

    it('should parse optional fields (featured, icon_url, collections, markdown)', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(multiCategoryYaml),
        });

        const item = await loadItem(adapter, 'multi-cat');

        expect(item).not.toBeNull();
        expect(item!.category).toEqual(['dev-tools', 'productivity']);
        expect(item!.featured).toBe(true);
        expect(item!.icon_url).toBe('https://example.com/icon.png');
        expect(item!.collections).toEqual(['popular', 'new']);
        expect(item!.markdown).toBe('# Hello');
    });

    it('should default description and source_url to empty string when missing', async () => {
        const yaml = `
name: Minimal Item
status: approved
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const item = await loadItem(adapter, 'minimal');

        expect(item).not.toBeNull();
        expect(item!.description).toBe('');
        expect(item!.source_url).toBe('');
        expect(item!.tags).toEqual([]);
        expect(item!.updated_at).toBe('');
    });
});
