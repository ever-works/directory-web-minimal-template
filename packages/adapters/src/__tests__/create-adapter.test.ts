import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAdapter, resolveAdapterConfig } from '../create-adapter.js';
import { FilesystemAdapter } from '../filesystem-adapter.js';
import { GitAdapter } from '../git-adapter.js';

describe('resolveAdapterConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env = { ...originalEnv };
        delete process.env['CONTENT_PATH'];
        delete process.env['DATA_REPOSITORY'];
        delete process.env['GH_TOKEN'];
        delete process.env['GITHUB_BRANCH'];
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should use explicit localPath when provided', () => {
        const config = resolveAdapterConfig({ localPath: '/custom/path' });

        expect(config.localPath).toBe('/custom/path');
        expect(config.repository).toBeUndefined();
    });

    it('should use explicit repository when provided', () => {
        const config = resolveAdapterConfig({
            repository: 'https://github.com/test/repo',
            token: 'my-token',
            branch: 'develop',
        });

        expect(config.repository).toBe('https://github.com/test/repo');
        expect(config.token).toBe('my-token');
        expect(config.branch).toBe('develop');
    });

    it('should read CONTENT_PATH from environment', () => {
        process.env['CONTENT_PATH'] = '/env/content';

        const config = resolveAdapterConfig();

        expect(config.localPath).toBe('/env/content');
    });

    it('should read DATA_REPOSITORY from environment', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';

        const config = resolveAdapterConfig();

        expect(config.repository).toBe('https://github.com/env/repo');
    });

    it('should read GH_TOKEN from environment for git adapter', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';
        process.env['GH_TOKEN'] = 'env-token';

        const config = resolveAdapterConfig();

        expect(config.token).toBe('env-token');
    });

    it('should read GITHUB_BRANCH from environment with main as default', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';

        const config = resolveAdapterConfig();

        expect(config.branch).toBe('main');
    });

    it('should use GITHUB_BRANCH env var when set', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';
        process.env['GITHUB_BRANCH'] = 'develop';

        const config = resolveAdapterConfig();

        expect(config.branch).toBe('develop');
    });

    it('should default to .content when no config or env vars', () => {
        const config = resolveAdapterConfig();

        expect(config.localPath).toBe('.content');
    });

    it('should prefer CONTENT_PATH over DATA_REPOSITORY', () => {
        process.env['CONTENT_PATH'] = '/local/content';
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';

        const config = resolveAdapterConfig();

        expect(config.localPath).toBe('/local/content');
        expect(config.repository).toBeUndefined();
    });

    it('should not override explicit token with env var', () => {
        process.env['GH_TOKEN'] = 'env-token';

        const config = resolveAdapterConfig({
            repository: 'https://github.com/test/repo',
            token: 'explicit-token',
        });

        expect(config.token).toBe('explicit-token');
    });
});

describe('createAdapter', () => {
    it('should return FilesystemAdapter when localPath is set', () => {
        const adapter = createAdapter({ localPath: '/some/path' });

        expect(adapter).toBeInstanceOf(FilesystemAdapter);
    });

    it('should return GitAdapter when repository is set', () => {
        const adapter = createAdapter({ repository: 'https://github.com/test/repo' });

        expect(adapter).toBeInstanceOf(GitAdapter);
    });

    it('should return FilesystemAdapter as fallback', () => {
        const adapter = createAdapter({});

        expect(adapter).toBeInstanceOf(FilesystemAdapter);
    });

    it('should prefer localPath over repository', () => {
        const adapter = createAdapter({
            localPath: '/path',
            repository: 'https://github.com/test/repo',
        });

        expect(adapter).toBeInstanceOf(FilesystemAdapter);
    });
});

describe('createAdapter — env resolution', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env['CONTENT_PATH'];
        delete process.env['DATA_REPOSITORY'];
        delete process.env['GH_TOKEN'];
        delete process.env['GITHUB_BRANCH'];
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should resolve config from env when called without arguments', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';
        process.env['GH_TOKEN'] = 'env-token';

        const adapter = createAdapter();

        expect(adapter).toBeInstanceOf(GitAdapter);
    });

    it('should return FilesystemAdapter when called without arguments and no env vars', () => {
        const adapter = createAdapter();

        expect(adapter).toBeInstanceOf(FilesystemAdapter);
    });
});

describe('resolveAdapterConfig — branch edge cases', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env = { ...originalEnv };
        delete process.env['CONTENT_PATH'];
        delete process.env['DATA_REPOSITORY'];
        delete process.env['GH_TOKEN'];
        delete process.env['GITHUB_BRANCH'];
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should not fill env vars when localPath is already set', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';

        const config = resolveAdapterConfig({ localPath: '/explicit' });

        expect(config.localPath).toBe('/explicit');
        expect(config.repository).toBeUndefined();
    });

    it('should not fill env vars when repository is already set', () => {
        process.env['CONTENT_PATH'] = '/env/path';

        const config = resolveAdapterConfig({ repository: 'https://github.com/explicit/repo' });

        expect(config.repository).toBe('https://github.com/explicit/repo');
        expect(config.localPath).toBeUndefined();
    });

    it('should set branch from env when token is already provided', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';
        process.env['GITHUB_BRANCH'] = 'staging';

        const config = resolveAdapterConfig({ token: 'already-set' });

        expect(config.token).toBe('already-set');
        expect(config.branch).toBe('staging');
    });

    it('should not override explicit branch with env var', () => {
        process.env['DATA_REPOSITORY'] = 'https://github.com/env/repo';
        process.env['GITHUB_BRANCH'] = 'staging';

        const config = resolveAdapterConfig({ branch: 'my-branch' });

        expect(config.branch).toBe('my-branch');
    });
});
