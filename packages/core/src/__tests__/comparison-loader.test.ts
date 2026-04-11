import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadComparisons, loadComparison } from '../loaders/comparison-loader.js';
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
        ...overrides,
    };
}

const fullComparisonYaml = `
title: Tool A vs Tool B
item_a_slug: tool-a
item_b_slug: tool-b
item_a_name: Tool A
item_b_name: Tool B
category: dev-tools
summary: A comprehensive comparison
verdict: Tool A wins overall
verdict_winner: item_a
generated_at: "2025-06-01"
sources:
  - https://example.com/source1
  - https://example.com/source2
dimensions:
  - name: Performance
    item_a_summary: Very fast
    item_b_summary: Moderate speed
    item_a_score: 9
    item_b_score: 7
    winner: item_a
  - name: Documentation
    item_a_summary: Good docs
    item_b_summary: Excellent docs
    item_a_score: 7
    item_b_score: 9
    winner: item_b
`;

const minimalComparisonYaml = `
title: X vs Y
item_a_slug: x
item_b_slug: y
`;

describe('loadComparisons', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load comparisons from directory structure', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['tool-a-vs-tool-b']),
            readFile: vi.fn().mockResolvedValue(fullComparisonYaml),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toHaveLength(1);
        expect(comparisons[0]!.title).toBe('Tool A vs Tool B');
        expect(comparisons[0]!.slug).toBe('tool-a-vs-tool-b');
        expect(comparisons[0]!.item_a_slug).toBe('tool-a');
        expect(comparisons[0]!.item_b_slug).toBe('tool-b');
        expect(comparisons[0]!.item_a_name).toBe('Tool A');
        expect(comparisons[0]!.item_b_name).toBe('Tool B');
        expect(comparisons[0]!.category).toBe('dev-tools');
        expect(comparisons[0]!.summary).toBe('A comprehensive comparison');
        expect(comparisons[0]!.verdict).toBe('Tool A wins overall');
        expect(comparisons[0]!.verdict_winner).toBe('item_a');
        expect(comparisons[0]!.generated_at).toBe('2025-06-01');
        expect(comparisons[0]!.sources).toEqual([
            'https://example.com/source1',
            'https://example.com/source2',
        ]);
    });

    it('should parse dimensions correctly', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['test']),
            readFile: vi.fn().mockResolvedValue(fullComparisonYaml),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons[0]!.dimensions).toHaveLength(2);
        expect(comparisons[0]!.dimensions![0]).toEqual({
            name: 'Performance',
            item_a_summary: 'Very fast',
            item_b_summary: 'Moderate speed',
            item_a_score: 9,
            item_b_score: 7,
            winner: 'item_a',
        });
        expect(comparisons[0]!.dimensions![1]!.winner).toBe('item_b');
    });

    it('should return empty array when comparisons directory does not exist', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toEqual([]);
    });

    it('should skip comparisons with missing required fields', async () => {
        const incompleteYaml = `
title: Missing Slugs
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['incomplete']),
            readFile: vi.fn().mockResolvedValue(incompleteYaml),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toEqual([]);
    });

    it('should handle readFile errors gracefully', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['bad-comparison']),
            readFile: vi.fn().mockRejectedValue(new Error('Read error')),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toEqual([]);
    });

    it('should handle listDirectories throwing', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(true),
            listDirectories: vi.fn().mockRejectedValue(new Error('List error')),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toEqual([]);
    });

    it('should default item names to slugs when names not provided', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['minimal']),
            readFile: vi.fn().mockResolvedValue(minimalComparisonYaml),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toHaveLength(1);
        expect(comparisons[0]!.item_a_name).toBe('x');
        expect(comparisons[0]!.item_b_name).toBe('y');
    });

    it('should load markdown content when .md file exists', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                if (path === 'comparisons/test/test.md') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['test']),
            readFile: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons/test/test.yml')
                    return Promise.resolve(minimalComparisonYaml);
                if (path === 'comparisons/test/test.md')
                    return Promise.resolve('# Comparison Details\n\nSome markdown content.');
                return Promise.reject(new Error('Not found'));
            }),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toHaveLength(1);
        expect(comparisons[0]!.content).toBe('# Comparison Details\n\nSome markdown content.');
    });

    it('should load multiple comparisons', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockImplementation((path: string) => {
                if (path === 'comparisons') return Promise.resolve(true);
                return Promise.resolve(false);
            }),
            listDirectories: vi.fn().mockResolvedValue(['comp-a', 'comp-b']),
            readFile: vi.fn().mockResolvedValue(minimalComparisonYaml),
        });

        const comparisons = await loadComparisons(adapter);

        expect(comparisons).toHaveLength(2);
    });
});

describe('loadComparison', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load a single comparison by slug', async () => {
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
            readFile: vi.fn().mockResolvedValue(fullComparisonYaml),
        });

        const comparison = await loadComparison(adapter, 'tool-a-vs-tool-b');

        expect(comparison).not.toBeNull();
        expect(comparison!.slug).toBe('tool-a-vs-tool-b');
        expect(comparison!.title).toBe('Tool A vs Tool B');
    });

    it('should return null when readFile throws', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockRejectedValue(new Error('Not found')),
        });

        const comparison = await loadComparison(adapter, 'missing');

        expect(comparison).toBeNull();
    });

    it('should return null for empty/invalid YAML', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(''),
        });

        const comparison = await loadComparison(adapter, 'empty');

        expect(comparison).toBeNull();
    });

    it('should handle verdict_winner values correctly', async () => {
        const tieYaml = `
title: Tie Match
item_a_slug: a
item_b_slug: b
verdict_winner: tie
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
            readFile: vi.fn().mockResolvedValue(tieYaml),
        });

        const comparison = await loadComparison(adapter, 'tie-match');

        expect(comparison!.verdict_winner).toBe('tie');
    });

    it('should ignore invalid verdict_winner values', async () => {
        const badWinnerYaml = `
title: Bad Winner
item_a_slug: a
item_b_slug: b
verdict_winner: invalid
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
            readFile: vi.fn().mockResolvedValue(badWinnerYaml),
        });

        const comparison = await loadComparison(adapter, 'bad-winner');

        expect(comparison!.verdict_winner).toBeUndefined();
    });

    it('should filter non-string sources', async () => {
        const mixedSourcesYaml = `
title: Mixed Sources
item_a_slug: a
item_b_slug: b
sources:
  - https://example.com
  - 123
  - true
  - https://other.com
`;
        const adapter = createMockAdapter({
            exists: vi.fn().mockResolvedValue(false),
            readFile: vi.fn().mockResolvedValue(mixedSourcesYaml),
        });

        const comparison = await loadComparison(adapter, 'mixed');

        expect(comparison!.sources).toEqual([
            'https://example.com',
            'https://other.com',
        ]);
    });
});
