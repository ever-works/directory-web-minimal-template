/**
 * Adapter factory.
 * Determines which data adapter to use based on configuration and environment.
 */

import { FilesystemAdapter } from './filesystem-adapter.js';
import { GitAdapter } from './git-adapter.js';
import type { DataAdapter, AdapterConfig } from './types.js';

/** Default content directory when no configuration is provided. */
const DEFAULT_CONTENT_DIR = '.content';

/**
 * Create a data adapter based on the provided configuration.
 *
 * Resolution order:
 * 1. If `config.localPath` is set, returns a {@link FilesystemAdapter}.
 * 2. If `config.repository` is set, returns a {@link GitAdapter}.
 * 3. If the `CONTENT_PATH` env var is set, returns a {@link FilesystemAdapter} with that path.
 * 4. If the `DATA_REPOSITORY` env var is set, returns a {@link GitAdapter} with that URL
 *    (also reads `GH_TOKEN` and `GITHUB_BRANCH` from env).
 * 5. Fallback: returns a {@link FilesystemAdapter} pointing at `.content/`.
 *
 * @param config - Optional adapter configuration. When omitted, environment
 *   variables and defaults are used.
 * @returns A {@link DataAdapter} instance (not yet initialized -- call `init()` before use).
 */
export function createAdapter(config?: AdapterConfig): DataAdapter {
    const resolved = config ?? {};

    // 1. Explicit localPath in config
    if (resolved.localPath) {
        return new FilesystemAdapter();
    }

    // 2. Explicit repository in config
    if (resolved.repository) {
        return new GitAdapter();
    }

    // 3. CONTENT_PATH environment variable
    const envContentPath = process.env['CONTENT_PATH'];
    if (envContentPath) {
        return new FilesystemAdapter();
    }

    // 4. DATA_REPOSITORY environment variable
    const envRepository = process.env['DATA_REPOSITORY'];
    if (envRepository) {
        return new GitAdapter();
    }

    // 5. Fallback: filesystem adapter with default .content/ directory
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
