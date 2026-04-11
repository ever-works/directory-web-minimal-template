/**
 * Adapter factory.
 * Determines which data adapter to use based on configuration and environment.
 */

import { FilesystemAdapter } from './filesystem-adapter';
import { GitAdapter } from './git-adapter';
import type { DataAdapter, AdapterConfig } from './types';

/** Default content directory when no configuration is provided. */
const DEFAULT_CONTENT_DIR = '.content';

/**
 * Create a data adapter based on the provided configuration.
 *
 * **Important**: Pass a resolved config from {@link resolveAdapterConfig} to ensure
 * environment variables and defaults are already merged. This function only inspects
 * `localPath` and `repository` on the provided config — it does NOT re-read env vars.
 *
 * Resolution order:
 * 1. If `config.localPath` is set, returns a {@link FilesystemAdapter}.
 * 2. If `config.repository` is set, returns a {@link GitAdapter}.
 * 3. Fallback: returns a {@link FilesystemAdapter} (caller must pass config with `localPath`
 *    to `init()` for this to work — use `resolveAdapterConfig()` first).
 *
 * @param config - Adapter configuration (use {@link resolveAdapterConfig} to resolve env vars first).
 * @returns A {@link DataAdapter} instance (not yet initialized — call `init(config)` before use).
 */
export function createAdapter(config?: AdapterConfig): DataAdapter {
    const resolved = config ?? resolveAdapterConfig();

    // 1. localPath present → filesystem
    if (resolved.localPath) {
        return new FilesystemAdapter();
    }

    // 2. repository present → git
    if (resolved.repository) {
        return new GitAdapter();
    }

    // 3. Fallback: filesystem (resolveAdapterConfig will have set localPath to DEFAULT_CONTENT_DIR)
    return new FilesystemAdapter();
}

/**
 * Resolve a complete {@link AdapterConfig} by merging explicit config
 * with environment variable defaults.
 *
 * This is a convenience for callers who want to inspect the resolved
 * configuration before passing it to `adapter.init()`.
 *
 * @param config - Optional partial configuration.
 * @returns A fully resolved configuration object.
 */
export function resolveAdapterConfig(config?: AdapterConfig): AdapterConfig {
    const resolved: AdapterConfig = { ...config };

    // Fill from environment variables if not explicitly set
    if (!resolved.localPath && !resolved.repository) {
        const envContentPath = process.env['CONTENT_PATH'];
        const envRepository = process.env['DATA_REPOSITORY'];

        if (envContentPath) {
            resolved.localPath = envContentPath;
        } else if (envRepository) {
            resolved.repository = envRepository;
            if (!resolved.token) {
                resolved.token = process.env['GH_TOKEN'];
            }
            if (!resolved.branch) {
                resolved.branch = process.env['GITHUB_BRANCH'] ?? 'main';
            }
        } else {
            resolved.localPath = DEFAULT_CONTENT_DIR;
        }
    }

    return resolved;
}
