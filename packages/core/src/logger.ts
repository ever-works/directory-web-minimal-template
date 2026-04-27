/**
 * Core logger — structured logging utility for @ever-works/core.
 *
 * Provides consistent, prefixed log messages across all core loaders.
 * All messages are prefixed with `[core]` for easy filtering.
 *
 * Mirrors the PluginLogger interface from @ever-works/plugins for
 * API consistency across the monorepo.
 *
 * @example
 * ```typescript
 * import { coreLogger } from './logger';
 *
 * coreLogger.warn('data/ directory not found, returning empty array');
 * // => [core] data/ directory not found, returning empty array
 *
 * coreLogger.error('Failed to load items:', error);
 * // => [core] Failed to load items: Error: ...
 * ```
 */

/** Structured logger interface for core modules. */
export interface CoreLogger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
}

const PREFIX = '[core]';

/**
 * Create a core logger instance.
 *
 * @param verbose - When `true`, `debug()` messages are emitted. Defaults to `false`.
 */
export function createCoreLogger(verbose = false): CoreLogger {
    return {
        info(message: string, ...args: unknown[]): void {
            // eslint-disable-next-line no-console -- info-level logger output is the entire purpose of this method
            console.log(`${PREFIX} ${message}`, ...args);
        },

        warn(message: string, ...args: unknown[]): void {
            console.warn(`${PREFIX} ${message}`, ...args);
        },

        error(message: string, ...args: unknown[]): void {
            console.error(`${PREFIX} ${message}`, ...args);
        },

        debug(message: string, ...args: unknown[]): void {
            if (verbose) {
                // eslint-disable-next-line no-console -- debug-level logger output is the entire purpose of this method
                console.log(`${PREFIX} [debug] ${message}`, ...args);
            }
        },
    };
}

/** Default core logger instance (non-verbose). */
export const coreLogger: CoreLogger = createCoreLogger();
