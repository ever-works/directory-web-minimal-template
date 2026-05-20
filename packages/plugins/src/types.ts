/**
 * Plugin system type definitions.
 *
 * All plugins must implement the {@link Plugin} interface.
 * See docs/specs/plugin-interface.md for the full specification.
 */

import type { ContentData, SiteConfig } from '@ever-works/core';

/**
 * Base interface that all plugins must implement.
 * Plugins are the primary extension mechanism for the template.
 */
export interface Plugin {
    /** Unique identifier (lowercase, kebab-case, e.g., 'search', 'filters') */
    readonly id: string;

    /** Human-readable name (e.g., 'Search Plugin') */
    readonly name: string;

    /** Semantic version (e.g., '0.1.0') */
    readonly version: string;

    /** One-line description — shown in docs and used by AI agents to understand purpose */
    readonly description: string;

    /** IDs of other plugins this one depends on. Resolved before init. */
    readonly dependencies?: string[];

    /** Lifecycle hooks for build pipeline integration */
    hooks?: PluginHooks;
}

/** Lifecycle hooks a plugin can implement */
export interface PluginHooks {
    /**
     * Called once during build initialization, after all plugins are registered.
     * Runs in dependency order (dependencies init first).
     *
     * Use for: setting up plugin state, validating config, logging startup info.
     */
    onInit?: (context: PluginContext) => Promise<void>;

    /**
     * Called after all content is loaded from the data source.
     * Runs in dependency order. Output of one plugin feeds into the next.
     *
     * Use for: transforming data, computing derived fields, filtering items.
     *
     * @returns The (possibly modified) content data. MUST return the data object.
     */
    onDataLoaded?: (data: ContentData, context: PluginContext) => Promise<ContentData>;

    /**
     * Called just before Astro page generation begins.
     *
     * Use for: injecting additional routes, modifying build configuration.
     */
    onBeforeBuild?: (context: PluginContext) => Promise<void>;

    /**
     * Called after Astro build completes and static files are generated.
     *
     * Use for: post-processing (search indexing, sitemap generation, etc.).
     */
    onAfterBuild?: (context: PluginContext) => Promise<void>;
}

/** Context object passed to all plugin hooks */
export interface PluginContext {
    /** Loaded site configuration from .works/works.yml */
    config: SiteConfig;

    /** Absolute path to the content directory (.content/) */
    contentPath: string;

    /** Absolute path to the build output directory (dist/) */
    outDir: string;

    /** Map of all registered plugins (id -> plugin). Read-only. */
    plugins: ReadonlyMap<string, Plugin>;

    /** Structured logger scoped to this plugin */
    log: PluginLogger;
}

/** Logger interface for plugin output */
export interface PluginLogger {
    /** Informational message */
    info(message: string): void;

    /** Warning message (non-fatal) */
    warn(message: string): void;

    /** Error message (may indicate failure) */
    error(message: string): void;

    /** Debug message (only shown in verbose mode) */
    debug(message: string): void;
}
