/**
 * Plugin logger factory.
 *
 * Creates structured loggers scoped to individual plugins.
 * All messages are prefixed with `[plugin:<id>]` for easy filtering.
 */

import type { PluginLogger } from './types';

/**
 * Create a {@link PluginLogger} scoped to a specific plugin.
 *
 * @param pluginId - Unique plugin identifier used in log prefixes.
 * @param verbose  - When `true`, `debug()` messages are emitted. Defaults to `false`.
 * @returns A logger instance that prefixes every message with `[plugin:<pluginId>]`.
 */
export function createPluginLogger(pluginId: string, verbose?: boolean): PluginLogger {
    const prefix = `[plugin:${pluginId}]`;

    return {
        info(message: string): void {
            // eslint-disable-next-line no-console -- info-level logger output is the entire purpose of this method
            console.log(`${prefix} ${message}`);
        },

        warn(message: string): void {
            console.warn(`${prefix} ${message}`);
        },

        error(message: string): void {
            console.error(`${prefix} ${message}`);
        },

        debug(message: string): void {
            if (verbose) {
                // eslint-disable-next-line no-console -- debug-level logger output is the entire purpose of this method
                console.log(`${prefix} [debug] ${message}`);
            }
        },
    };
}
