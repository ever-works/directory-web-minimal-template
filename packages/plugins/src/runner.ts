/**
 * Plugin runner — executes lifecycle hooks across registered plugins.
 *
 * The runner iterates plugins in dependency-resolved order (as provided by
 * {@link definePlugins}) and calls the matching hook on each plugin.
 * Errors in individual plugins are caught and logged so that a single
 * broken plugin does not crash the entire build pipeline.
 */

import type { ContentData } from '@ever-works/core';
import type { Plugin, PluginContext } from './types.js';
import { createPluginLogger } from './logger.js';

/**
 * Subset of {@link PluginContext} that callers provide.
 * The runner fills in `log` and `plugins` automatically.
 */
type BaseContext = Omit<PluginContext, 'log' | 'plugins'>;

/**
 * Executes plugin lifecycle hooks in dependency order.
 *
 * @example
 * ```typescript
 * const plugins = definePlugins([myPlugin, otherPlugin]);
 * const runner = new PluginRunner(plugins);
 * await runner.runInit({ config, contentPath, outDir });
 * ```
 */
export class PluginRunner {
    /** Plugins in dependency-resolved order. */
    private readonly plugins: readonly Plugin[];

    /** Lookup map: plugin id -> Plugin. Shared with every PluginContext. */
    private readonly pluginMap: ReadonlyMap<string, Plugin>;

    /**
     * @param plugins - Plugins **already sorted** by {@link definePlugins}.
     */
    constructor(plugins: Plugin[]) {
        this.plugins = plugins;

        const map = new Map<string, Plugin>();
        for (const p of plugins) {
            map.set(p.id, p);
        }
        this.pluginMap = map;
    }

    /**
     * Run the `onInit` hook on every plugin (in order).
     *
     * Called once during build initialisation after all plugins are registered.
     */
    async runInit(context: BaseContext): Promise<void> {
        for (const plugin of this.plugins) {
            if (!plugin.hooks?.onInit) continue;

            const ctx = this.buildContext(plugin.id, context);
            try {
                await plugin.hooks.onInit(ctx);
            } catch (err: unknown) {
                ctx.log.error(`onInit failed: ${errorMessage(err)}`);
            }
        }
    }

    /**
     * Run the `onDataLoaded` hook on every plugin (in order).
     *
     * Each plugin receives the output of the previous one, forming a
     * transform pipeline. If a plugin throws, the data is passed through
     * unchanged to the next plugin.
     *
     * @returns The final transformed {@link ContentData}.
     */
    async runDataLoaded(data: ContentData, context: BaseContext): Promise<ContentData> {
        let current = data;

        for (const plugin of this.plugins) {
            if (!plugin.hooks?.onDataLoaded) continue;

            const ctx = this.buildContext(plugin.id, context);
            try {
                current = await plugin.hooks.onDataLoaded(current, ctx);
            } catch (err: unknown) {
                ctx.log.error(`onDataLoaded failed: ${errorMessage(err)}`);
            }
        }

        return current;
    }

    /**
     * Run the `onBeforeBuild` hook on every plugin (in order).
     *
     * Called just before Astro page generation begins.
     */
    async runBeforeBuild(context: BaseContext): Promise<void> {
        for (const plugin of this.plugins) {
            if (!plugin.hooks?.onBeforeBuild) continue;

            const ctx = this.buildContext(plugin.id, context);
            try {
                await plugin.hooks.onBeforeBuild(ctx);
            } catch (err: unknown) {
                ctx.log.error(`onBeforeBuild failed: ${errorMessage(err)}`);
            }
        }
    }

    /**
     * Run the `onAfterBuild` hook on every plugin (in order).
     *
     * Called after Astro build completes and static files are generated.
     */
    async runAfterBuild(context: BaseContext): Promise<void> {
        for (const plugin of this.plugins) {
            if (!plugin.hooks?.onAfterBuild) continue;

            const ctx = this.buildContext(plugin.id, context);
            try {
                await plugin.hooks.onAfterBuild(ctx);
            } catch (err: unknown) {
                ctx.log.error(`onAfterBuild failed: ${errorMessage(err)}`);
            }
        }
    }

    /**
     * Build a full {@link PluginContext} for a specific plugin by injecting
     * the scoped logger and shared plugin map into the caller-provided base.
     */
    private buildContext(pluginId: string, base: BaseContext): PluginContext {
        return {
            ...base,
            log: createPluginLogger(pluginId),
            plugins: this.pluginMap,
        };
    }
}

/** Safely extract a message string from an unknown thrown value. */
function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
}
