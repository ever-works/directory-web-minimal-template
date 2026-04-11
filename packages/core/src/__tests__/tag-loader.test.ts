import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadTags } from '../loaders/tag-loader.js';
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

const validTagsYaml = `
- id: typescript
  name: TypeScript
  isActive: true
- id: react
  name: React
- id: deprecated
  name: Deprecated Tag
  isActive: false
`;

describe('loadTags', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load active tags from tags.yml', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(validTagsYaml),
        });

        const tags = await loadTags(adapter);

        expect(tags).toHaveLength(2);
        expect(tags[0]!.id).toBe('typescript');
        expect(tags[0]!.name).toBe('TypeScript');
        expect(tags[1]!.id).toBe('react');
        expect(tags[1]!.name).toBe('React');
    });

    it('should filter out inactive tags (isActive: false)', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(validTagsYaml),
        });

        const tags = await loadTags(adapter);

        const ids = tags.map((t) => t.id);
        expect(ids).not.toContain('deprecated');
    });

    it('should return empty array when tags.yml not found', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
        });

        const tags = await loadTags(adapter);

        expect(tags).toEqual([]);
    });

    it('should return empty array for non-array YAML', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue('just a string'),
        });

        const tags = await loadTags(adapter);

        expect(tags).toEqual([]);
    });

    it('should return empty array when readFile throws', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockRejectedValue(new Error('Read error')),
        });

        const tags = await loadTags(adapter);

        expect(tags).toEqual([]);
    });

    it('should filter entries without id or name', async () => {
        const yaml = `
- id: valid
  name: Valid Tag
- name: No ID
- id: no-name
- random: data
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const tags = await loadTags(adapter);

        expect(tags).toHaveLength(1);
        expect(tags[0]!.id).toBe('valid');
    });

    it('should include isActive field only when explicitly set', async () => {
        const yaml = `
- id: with-active
  name: With Active
  isActive: true
- id: without-active
  name: Without Active
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const tags = await loadTags(adapter);

        expect(tags).toHaveLength(2);
        expect(tags[0]!.isActive).toBe(true);
        expect('isActive' in tags[1]!).toBe(false);
    });

    it('should handle empty YAML', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            readFile: vi.fn().mockResolvedValue(''),
        });

        const tags = await loadTags(adapter);

        expect(tags).toEqual([]);
    });

    it('should handle exists throwing an error', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockRejectedValue(new Error('Connection failed')),
        });

        const tags = await loadTags(adapter);

        expect(tags).toEqual([]);
    });
});
