import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, SITE_CONFIG_PATH } from '../loaders/config-loader.js';
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

describe('loadConfig', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should load config from YAML and merge with defaults', async () => {
        const yaml = `
company_name: Acme Directory
item_name: Widget
items_name: Widgets
copyright_year: 2025
app_url: https://acme.com
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const config = await loadConfig(adapter);

        expect(adapter.readFile).toHaveBeenCalledWith(SITE_CONFIG_PATH);
        expect(config.company_name).toBe('Acme Directory');
        expect(config.item_name).toBe('Widget');
        expect(config.items_name).toBe('Widgets');
        expect(config.copyright_year).toBe(2025);
        expect(config.app_url).toBe('https://acme.com');
    });

    it('should use defaults when .works/works.yml is empty', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(''),
        });

        const config = await loadConfig(adapter);

        expect(config.company_name).toBe('My Directory');
        expect(config.item_name).toBe('Item');
        expect(config.items_name).toBe('Items');
        expect(config.copyright_year).toBe(new Date().getFullYear());
    });

    it('should use defaults when readFile throws', async () => {
        const adapter = createMockAdapter({
            readFile: vi.fn().mockRejectedValue(new Error('File not found')),
        });

        const config = await loadConfig(adapter);

        expect(adapter.readFile).toHaveBeenCalledWith(SITE_CONFIG_PATH);
        expect(adapter.readFile).toHaveBeenCalledTimes(1);
        expect(config.company_name).toBe('My Directory');
        expect(config.item_name).toBe('Item');
        expect(config.items_name).toBe('Items');
        expect(config.copyright_year).toBe(new Date().getFullYear());
    });

    it('should fill in defaults for missing fields', async () => {
        const yaml = `
company_name: Partial Config
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const config = await loadConfig(adapter);

        expect(config.company_name).toBe('Partial Config');
        expect(config.item_name).toBe('Item');
        expect(config.items_name).toBe('Items');
        expect(config.copyright_year).toBe(new Date().getFullYear());
    });

    it('should ignore non-string company_name and use default', async () => {
        const yaml = `
company_name: 123
item_name: Tool
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const config = await loadConfig(adapter);

        // 123 is a number, not a string, so default is used
        expect(config.company_name).toBe('My Directory');
        expect(config.item_name).toBe('Tool');
    });

    it('should ignore non-number copyright_year and use default', async () => {
        const yaml = `
copyright_year: "not-a-year"
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const config = await loadConfig(adapter);

        expect(config.copyright_year).toBe(new Date().getFullYear());
    });

    it('should preserve additional fields from YAML', async () => {
        const yaml = `
company_name: Extra Fields
custom_field: custom_value
nested:
  key: value
`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const config = await loadConfig(adapter);

        expect(config.company_name).toBe('Extra Fields');
        expect(config['custom_field']).toBe('custom_value');
        expect(config['nested']).toEqual({ key: 'value' });
    });

    it('should handle YAML with only invalid content gracefully', async () => {
        // A plain string is not an object, so it's treated as invalid
        const yaml = `just a string`;
        const adapter = createMockAdapter({
            readFile: vi.fn().mockResolvedValue(yaml),
        });

        const config = await loadConfig(adapter);

        expect(config.company_name).toBe('My Directory');
        expect(config.item_name).toBe('Item');
    });
});
