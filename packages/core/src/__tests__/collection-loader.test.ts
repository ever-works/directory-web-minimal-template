import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadCollections } from '../loaders/collection-loader.js';
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

const validCollectionsYaml = `
- id: popular
  name: Popular Tools
  slug: popular-tools
  description: The most popular tools
  icon_url: https://example.com/popular.png
  items:
    - item-a
    - item-b
  isActive: true
  created_at: "2025-01-01"
  updated_at: "2025-06-01"
- id: hidden
  name: Hidden Collection
  isActive: false
  items:
    - item-c
`;

describe('loadCollections', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load active collections from collections.yml', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(validCollectionsYaml),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toHaveLength(1);
        expect(collections[0]!.id).toBe('popular');
        expect(collections[0]!.name).toBe('Popular Tools');
        expect(collections[0]!.slug).toBe('popular-tools');
        expect(collections[0]!.description).toBe('The most popular tools');
        expect(collections[0]!.icon_url).toBe('https://example.com/popular.png');
        expect(collections[0]!.items).toEqual(['item-a', 'item-b']);
        expect(collections[0]!.isActive).toBe(true);
        expect(collections[0]!.created_at).toBe('2025-01-01');
        expect(collections[0]!.updated_at).toBe('2025-06-01');
    });

    it('should filter out inactive collections', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(validCollectionsYaml),
        });

        const collections = await loadCollections(adapter);

        const ids = collections.map((c) => c.id);
        expect(ids).not.toContain('hidden');
    });

    it('should use id as slug when slug not provided', async () => {
        const yaml = `
- id: no-slug
  name: No Slug Collection
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toHaveLength(1);
        expect(collections[0]!.slug).toBe('no-slug');
    });

    it('should default description to empty string when missing', async () => {
        const yaml = `
- id: minimal
  name: Minimal Collection
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const collections = await loadCollections(adapter);

        expect(collections[0]!.description).toBe('');
    });

    it('should return empty array when collections.yml not found', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toEqual([]);
    });

    it('should return empty array for non-array YAML', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue('just a string'),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toEqual([]);
    });

    it('should return empty array when readFile throws', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockRejectedValue(new Error('Read error')),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toEqual([]);
    });

    it('should filter entries without id or name', async () => {
        const yaml = `
- id: valid
  name: Valid
- name: No ID
- id: no-name
- random: data
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toHaveLength(1);
        expect(collections[0]!.id).toBe('valid');
    });

    it('should filter non-string items from items array', async () => {
        const yaml = `
- id: mixed-items
  name: Mixed Items
  items:
    - valid-item
    - 123
    - true
    - another-item
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const collections = await loadCollections(adapter);

        expect(collections[0]!.items).toEqual(['valid-item', 'another-item']);
    });

    it('should not include optional fields when absent', async () => {
        const yaml = `
- id: bare
  name: Bare Collection
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toHaveLength(1);
        expect('icon_url' in collections[0]!).toBe(false);
        expect('items' in collections[0]!).toBe(false);
        expect('isActive' in collections[0]!).toBe(false);
        expect('created_at' in collections[0]!).toBe(false);
        expect('updated_at' in collections[0]!).toBe(false);
    });

    it('should handle empty YAML', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(''),
        });

        const collections = await loadCollections(adapter);

        expect(collections).toEqual([]);
    });
});

describe('collection-loader edge cases', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('YAML parsing edge cases', () => {
        it('should handle YAML that parses to a number', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue('42'),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toEqual([]);
        });

        it('should handle YAML that parses to a boolean', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue('true'),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toEqual([]);
        });

        it('should handle YAML that parses to an object (not array)', async () => {
            const yaml = `
id: single
name: Single Collection
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toEqual([]);
        });

        it('should handle malformed YAML gracefully', async () => {
            const yaml = `
- id: [broken
  name: {invalid yaml
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            // Malformed YAML throws -> caught -> returns []
            expect(collections).toEqual([]);
        });

        it('should handle whitespace-only YAML', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue('   \n\n  '),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toEqual([]);
        });
    });

    describe('entry validation edge cases', () => {
        it('should filter out null entries in the array', async () => {
            // YAML arrays can have null entries with `- ~` or `- null`
            const yaml = `
- ~
- id: valid
  name: Valid
- null
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            expect(collections[0]!.id).toBe('valid');
        });

        it('should filter out entries where id is a number', async () => {
            const yaml = `
- id: 123
  name: Numeric ID
- id: valid-id
  name: Valid
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            expect(collections[0]!.id).toBe('valid-id');
        });

        it('should filter out entries where name is a number', async () => {
            const yaml = `
- id: num-name
  name: 42
- id: valid
  name: Valid Collection
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            expect(collections[0]!.id).toBe('valid');
        });

        it('should filter out primitive entries in the array (strings)', async () => {
            const yaml = `
- just a string
- id: valid
  name: Valid
- another string
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            expect(collections[0]!.id).toBe('valid');
        });

        it('should filter out entries that are arrays (nested)', async () => {
            // This is an unusual YAML edge case
            const yaml = `
-
  - nested
  - array
- id: valid
  name: Valid
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            // Nested arrays won't have id/name so they get filtered
            expect(collections).toHaveLength(1);
            expect(collections[0]!.id).toBe('valid');
        });
    });

    describe('isActive filtering edge cases', () => {
        it('should include collections where isActive is explicitly true', async () => {
            const yaml = `
- id: active
  name: Active Collection
  isActive: true
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            expect(collections[0]!.isActive).toBe(true);
        });

        it('should include collections where isActive is not set (undefined)', async () => {
            const yaml = `
- id: no-active-field
  name: No Active Field
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            // isActive not in result since it's not a boolean in YAML
            expect('isActive' in collections[0]!).toBe(false);
        });

        it('should include collections where isActive is a truthy non-boolean', async () => {
            const yaml = `
- id: truthy-active
  name: Truthy Active
  isActive: "yes"
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            // "yes" !== false, so it passes the filter
            expect(collections).toHaveLength(1);
            // But "yes" is not a boolean, so isActive won't be in output
            expect('isActive' in collections[0]!).toBe(false);
        });

        it('should exclude only collections where isActive is exactly false', async () => {
            const yaml = `
- id: active-true
  name: Active True
  isActive: true
- id: active-false
  name: Active False
  isActive: false
- id: active-null
  name: Active Null
  isActive: null
- id: active-zero
  name: Active Zero
  isActive: 0
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            const ids = collections.map((c) => c.id);
            // Only isActive: false is excluded
            expect(ids).toContain('active-true');
            expect(ids).not.toContain('active-false');
            expect(ids).toContain('active-null');
            expect(ids).toContain('active-zero');
        });
    });

    describe('optional field handling edge cases', () => {
        it('should use id as slug when slug is a non-string value', async () => {
            const yaml = `
- id: non-string-slug
  name: Non-String Slug
  slug: 123
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            expect(collections[0]!.slug).toBe('non-string-slug');
        });

        it('should default description to empty string when description is non-string', async () => {
            const yaml = `
- id: num-desc
  name: Numeric Description
  description: 42
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections[0]!.description).toBe('');
        });

        it('should not include icon_url when value is non-string', async () => {
            const yaml = `
- id: num-icon
  name: Numeric Icon
  icon_url: 123
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect('icon_url' in collections[0]!).toBe(false);
        });

        it('should not include items when value is not an array', async () => {
            const yaml = `
- id: string-items
  name: String Items
  items: just-a-string
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect('items' in collections[0]!).toBe(false);
        });

        it('should handle empty items array', async () => {
            const yaml = `
- id: empty-items
  name: Empty Items
  items: []
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections[0]!.items).toEqual([]);
        });

        it('should not include created_at when value is non-string', async () => {
            const yaml = `
- id: num-date
  name: Numeric Date
  created_at: 20250101
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect('created_at' in collections[0]!).toBe(false);
        });

        it('should not include updated_at when value is non-string', async () => {
            const yaml = `
- id: num-updated
  name: Numeric Updated
  updated_at: 20250601
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect('updated_at' in collections[0]!).toBe(false);
        });
    });

    describe('multiple collections edge cases', () => {
        it('should load all valid collections from a mixed array', async () => {
            const yaml = `
- id: first
  name: First Collection
  description: First
  slug: first-collection
  isActive: true
- id: second
  name: Second Collection
  isActive: false
- id: third
  name: Third Collection
  description: Third
  items:
    - item-a
    - item-b
- name: Missing ID
- id: missing-name
- ~
- just a string
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            // first (active), third (no isActive, defaults to included)
            // second is isActive: false -> excluded
            // rest are missing id or name or are not objects
            expect(collections).toHaveLength(2);
            expect(collections[0]!.id).toBe('first');
            expect(collections[1]!.id).toBe('third');
        });

        it('should preserve all fields for a fully specified collection', async () => {
            const yaml = `
- id: full
  name: Full Collection
  slug: full-collection
  description: A fully specified collection
  icon_url: https://example.com/icon.png
  items:
    - item-a
    - item-b
    - item-c
  isActive: true
  created_at: "2025-01-01"
  updated_at: "2025-06-15"
`;
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile: vi.fn().mockResolvedValue(yaml),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toHaveLength(1);
            const c = collections[0]!;
            expect(c.id).toBe('full');
            expect(c.name).toBe('Full Collection');
            expect(c.slug).toBe('full-collection');
            expect(c.description).toBe('A fully specified collection');
            expect(c.icon_url).toBe('https://example.com/icon.png');
            expect(c.items).toEqual(['item-a', 'item-b', 'item-c']);
            expect(c.isActive).toBe(true);
            expect(c.created_at).toBe('2025-01-01');
            expect(c.updated_at).toBe('2025-06-15');
        });
    });

    describe('adapter interaction edge cases', () => {
        it('should call exists with correct path', async () => {
            const exists = vi.fn().mockResolvedValue(false);
            const adapter = createMockAdapter({ exists });

            await loadCollections(adapter);
            expect(exists).toHaveBeenCalledWith('collections.yml');
        });

        it('should call readFile with correct path when file exists', async () => {
            const readFile = vi.fn().mockResolvedValue('[]');
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(true),
                readFile,
            });

            await loadCollections(adapter);
            expect(readFile).toHaveBeenCalledWith('collections.yml');
        });

        it('should not call readFile when file does not exist', async () => {
            const readFile = vi.fn();
            const adapter = createMockAdapter({
                exists: vi.fn().mockResolvedValue(false),
                readFile,
            });

            await loadCollections(adapter);
            expect(readFile).not.toHaveBeenCalled();
        });

        it('should handle exists throwing an error', async () => {
            const adapter = createMockAdapter({
                exists: vi.fn().mockRejectedValue(new Error('Connection refused')),
            });

            const collections = await loadCollections(adapter);
            expect(collections).toEqual([]);
        });
    });
});
