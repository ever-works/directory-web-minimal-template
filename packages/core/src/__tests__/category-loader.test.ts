import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadCategories } from '../loaders/category-loader.js';
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

const validCategoriesYaml = `
- id: dev-tools
  name: Developer Tools
  icon_url: https://example.com/dev.png
  image_url: https://example.com/dev-bg.jpg
- id: productivity
  name: Productivity
`;

const categoriesWithInvalid = `
- id: valid
  name: Valid Category
- name: No ID Category
- id: no-name
- id: 123
  name: Numeric ID
- not-an-object
`;

describe('loadCategories', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load categories from categories.yml', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(validCategoriesYaml),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toHaveLength(2);
        expect(categories[0]).toEqual({
            id: 'dev-tools',
            name: 'Developer Tools',
            icon_url: 'https://example.com/dev.png',
            image_url: 'https://example.com/dev-bg.jpg',
        });
        expect(categories[1]).toEqual({
            id: 'productivity',
            name: 'Productivity',
        });
    });

    it('should try fallback path categories/categories.yml', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'categories.yml') return Promise.resolve(false);
                if (path === 'categories/categories.yml') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            readFile: vi.fn().mockResolvedValue(validCategoriesYaml),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toHaveLength(2);
        expect(adapter.exists).toHaveBeenCalledWith('categories.yml');
        expect(adapter.exists).toHaveBeenCalledWith('categories/categories.yml');
    });

    it('should return empty array when no categories file found', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toEqual([]);
    });

    it('should filter entries without id or name', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(categoriesWithInvalid),
        });

        const categories = await loadCategories(adapter);

        // Only "valid" has both string id and name
        // "123" is a number id, not a string — it actually IS a number in YAML
        expect(categories).toHaveLength(1);
        expect(categories[0]!.id).toBe('valid');
    });

    it('should skip non-array YAML content', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'categories.yml') return Promise.resolve(true);
                if (path === 'categories/categories.yml') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            readFile: vi.fn().mockResolvedValue('just a string'),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toEqual([]);
    });

    it('should return empty array when readFile throws', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockRejectedValue(new Error('Read error')),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toEqual([]);
    });

    it('should not include icon_url when not present', async () => {
        const yaml = `
- id: no-icon
  name: No Icon Category
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toHaveLength(1);
        expect(categories[0]).toEqual({ id: 'no-icon', name: 'No Icon Category' });
        expect('icon_url' in categories[0]!).toBe(false);
    });

    it('should handle empty YAML gracefully', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(''),
        });

        const categories = await loadCategories(adapter);

        expect(categories).toEqual([]);
    });
});
