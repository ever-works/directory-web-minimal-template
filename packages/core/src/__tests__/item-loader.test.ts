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

    it('should default status to approved when status is invalid', async () => {
        const yaml = `
name: Bad Status Tool
description: Invalid status
status: unknown
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        // status defaults to 'approved' when missing or invalid
        // This ensures real-world data repos without explicit status work out-of-the-box
        const item = await loadItem(adapter, 'bad-status');

        expect(item).not.toBeNull();
        expect(item!.status).toBe('approved');
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

describe('item-loader edge cases', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('YAML parsing edge cases', () => {
        it('should return null for YAML that parses to a plain string', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue(['scalar-item']),
                readFile: vi.fn().mockResolvedValue('just a plain string'),
            });

            const items = await loadItems(adapter);
            expect(items).toHaveLength(0);
        });

        it('should return null for YAML that parses to a number', async () => {
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue('42'),
            });

            const item = await loadItem(adapter, 'number-yaml');
            expect(item).toBeNull();
        });

        it('should return null for YAML that parses to a boolean', async () => {
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue('true'),
            });

            const item = await loadItem(adapter, 'bool-yaml');
            expect(item).toBeNull();
        });

        it('should return null for YAML that parses to an array', async () => {
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue('- item1\n- item2'),
            });

            const item = await loadItem(adapter, 'array-yaml');
            // Arrays are objects in JS, so parsed !== null && typeof parsed === 'object' is true
            // But there's no 'name' field, so it returns null
            expect(item).toBeNull();
        });

        it('should return null for YAML that parses to null (empty content)', async () => {
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(''),
            });

            const item = await loadItem(adapter, 'null-yaml');
            expect(item).toBeNull();
        });

        it('should handle malformed YAML gracefully', async () => {
            const yaml = `
name: [broken
  - invalid: {yaml
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'malformed');
            // parseYaml throws on malformed YAML -> caught -> returns null
            expect(item).toBeNull();
        });
    });

    describe('name field edge cases', () => {
        it('should skip item with empty string name', async () => {
            const yaml = `
name: ""
description: Empty name item
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'empty-name');
            expect(item).toBeNull();
        });

        it('should skip item with non-string name (number)', async () => {
            const yaml = `
name: 123
description: Numeric name
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-name');
            expect(item).toBeNull();
        });

        it('should skip item with non-string name (boolean)', async () => {
            const yaml = `
name: true
description: Boolean name
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'bool-name');
            expect(item).toBeNull();
        });
    });

    describe('status field edge cases', () => {
        it('should filter out pending items from loadItems', async () => {
            const yaml = `
name: Pending Tool
description: A pending tool
status: pending
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue(['pending-tool']),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const items = await loadItems(adapter);
            expect(items).toHaveLength(0);
        });

        it('should filter out rejected items from loadItems', async () => {
            const yaml = `
name: Rejected Tool
description: A rejected tool
status: rejected
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue(['rejected-tool']),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const items = await loadItems(adapter);
            expect(items).toHaveLength(0);
        });

        it('should return null for pending item via loadItem', async () => {
            const yaml = `
name: Pending Tool
status: pending
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'pending-tool');
            expect(item).toBeNull();
        });

        it('should return null for rejected item via loadItem', async () => {
            const yaml = `
name: Rejected Tool
status: rejected
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'rejected-tool');
            expect(item).toBeNull();
        });

        it('should default to approved when status field is missing entirely', async () => {
            const yaml = `
name: No Status Tool
description: Missing status field
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'no-status');
            expect(item).not.toBeNull();
            expect(item!.status).toBe('approved');
        });

        it('should default to approved when status is a number', async () => {
            const yaml = `
name: Numeric Status
status: 1
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-status');
            expect(item).not.toBeNull();
            expect(item!.status).toBe('approved');
        });
    });

    describe('category field edge cases', () => {
        it('should handle category as a single string', async () => {
            const yaml = `
name: Single Cat
category: dev-tools
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'single-cat');
            expect(item!.category).toBe('dev-tools');
        });

        it('should handle category as an array of strings', async () => {
            const yaml = `
name: Multi Cat
category:
  - dev-tools
  - productivity
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'multi-cat');
            expect(item!.category).toEqual(['dev-tools', 'productivity']);
        });

        it('should filter non-string entries from category array', async () => {
            const yaml = `
name: Mixed Cat
category:
  - dev-tools
  - 123
  - true
  - productivity
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'mixed-cat');
            expect(item!.category).toEqual(['dev-tools', 'productivity']);
        });

        it('should default category to empty string when missing', async () => {
            const yaml = `
name: No Category
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'no-cat');
            expect(item!.category).toBe('');
        });

        it('should default category to empty string when category is a number', async () => {
            const yaml = `
name: Num Category
category: 42
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-cat');
            expect(item!.category).toBe('');
        });
    });

    describe('tags field edge cases', () => {
        it('should filter non-string entries from tags array', async () => {
            const yaml = `
name: Mixed Tags
tags:
  - typescript
  - 123
  - true
  - testing
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'mixed-tags');
            expect(item!.tags).toEqual(['typescript', 'testing']);
        });

        it('should default to empty array when tags is not an array', async () => {
            const yaml = `
name: String Tags
tags: just-a-string
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'string-tags');
            expect(item!.tags).toEqual([]);
        });

        it('should default to empty array when tags is missing', async () => {
            const yaml = `
name: No Tags
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'no-tags');
            expect(item!.tags).toEqual([]);
        });
    });

    describe('collections field edge cases', () => {
        it('should filter non-string entries from collections array', async () => {
            const yaml = `
name: Mixed Collections
collections:
  - popular
  - 42
  - true
  - trending
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'mixed-coll');
            expect(item!.collections).toEqual(['popular', 'trending']);
        });

        it('should keep raw value from spread when collections is not an array', async () => {
            const yaml = `
name: String Collections
collections: some-string
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'str-coll');
            // The ...data spread copies collections: "some-string" onto the item.
            // The conditional only adds typed collections for arrays, but the
            // spread value remains since it's not overwritten.
            expect(item!.collections).toBe('some-string');
        });

        it('should not set collections when field is absent', async () => {
            const yaml = `
name: No Collections
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'no-coll');
            expect(item!.collections).toBeUndefined();
        });
    });

    describe('optional fields edge cases', () => {
        it('should keep raw value from spread when featured is not a boolean', async () => {
            const yaml = `
name: Non-Bool Featured
featured: "yes"
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'str-featured');
            // The ...data spread copies featured: "yes" onto the item.
            // The conditional check only sets typed featured for booleans,
            // but the spread value remains.
            expect(item!.featured).toBe('yes');
        });

        it('should keep raw value from spread when icon_url is not a string', async () => {
            const yaml = `
name: Non-String Icon
icon_url: 123
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-icon');
            // The ...data spread copies icon_url: 123 onto the item.
            // The conditional check only sets typed icon_url for strings,
            // but the spread value remains.
            expect(item!.icon_url).toBe(123);
        });

        it('should keep raw value from spread when markdown is not a boolean', async () => {
            const yaml = `
name: Non-String Markdown
markdown: true
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'bool-md');
            // The ...data spread copies markdown: true onto the item.
            // The conditional check only sets typed markdown for strings,
            // but the spread value remains.
            expect(item!.markdown).toBe(true);
        });

        it('should handle non-string description gracefully', async () => {
            const yaml = `
name: Num Description
description: 42
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-desc');
            expect(item!.description).toBe('');
        });

        it('should handle non-string source_url gracefully', async () => {
            const yaml = `
name: Num URL
source_url: 123
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-url');
            expect(item!.source_url).toBe('');
        });

        it('should handle non-string updated_at gracefully', async () => {
            const yaml = `
name: Num Date
updated_at: 20250101
status: approved
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'num-date');
            expect(item!.updated_at).toBe('');
        });
    });

    describe('loadItems filtering and concurrency', () => {
        it('should correctly construct file path from slug', async () => {
            const yaml = `
name: Test Tool
status: approved
`;
            const readFile = vi.fn().mockResolvedValue(yaml);
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue(['my-tool']),
                readFile,
            });

            await loadItems(adapter);
            expect(readFile).toHaveBeenCalledWith('data/my-tool/my-tool.yml');
        });

        it('should handle mix of approved, draft, pending, rejected items', async () => {
            const makeYaml = (name: string, status: string) => `
name: ${name}
status: ${status}
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue(['a', 'b', 'c', 'd']),
                readFile: vi.fn().mockImplementation((path: string) => {
                    if (path.includes('/a/')) return Promise.resolve(makeYaml('Approved', 'approved'));
                    if (path.includes('/b/')) return Promise.resolve(makeYaml('Draft', 'draft'));
                    if (path.includes('/c/')) return Promise.resolve(makeYaml('Pending', 'pending'));
                    if (path.includes('/d/')) return Promise.resolve(makeYaml('Rejected', 'rejected'));
                    return Promise.reject(new Error('Not found'));
                }),
            });

            const items = await loadItems(adapter);
            expect(items).toHaveLength(1);
            expect(items[0]!.name).toBe('Approved');
        });

        it('should skip items that fail to read alongside valid items', async () => {
            const yaml = `
name: Valid Tool
status: approved
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue(['valid', 'broken', 'also-valid']),
                readFile: vi.fn().mockImplementation((path: string) => {
                    if (path.includes('broken')) return Promise.reject(new Error('Disk error'));
                    return Promise.resolve(yaml);
                }),
            });

            const items = await loadItems(adapter);
            expect(items).toHaveLength(2);
        });

        it('should return empty array when data directory has no subdirectories', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                listDirectories: vi.fn().mockResolvedValue([]),
            });

            const items = await loadItems(adapter);
            expect(items).toEqual([]);
        });

        it('should preserve extra fields from YAML in the item', async () => {
            const yaml = `
name: Extended Tool
status: approved
custom_field: custom_value
priority: 5
`;
            const adapter = createMockAdapter({
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const item = await loadItem(adapter, 'extended');
            expect(item).not.toBeNull();
            expect(item!.custom_field).toBe('custom_value');
            expect(item!.priority).toBe(5);
        });
    });
});
