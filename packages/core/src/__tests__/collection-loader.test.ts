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
