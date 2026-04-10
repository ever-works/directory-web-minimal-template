/**
 * Plugin configuration helper.
 * Used in plugins.config.ts to register plugins.
 */

import type { Plugin } from './types.js';

/**
 * Define the plugins to use in the build pipeline.
 * Validates uniqueness, resolves dependency order.
 *
 * @example
 * ```typescript
 * // plugins.config.ts
 * import { definePlugins } from '@ever-works/plugins';
 * import { searchPlugin } from '@ever-works/plugin-search';
 *
 * export default definePlugins([
 *     searchPlugin({ indexFields: ['name', 'description'] }),
 * ]);
 * ```
 */
export function definePlugins(plugins: Plugin[]): Plugin[] {
    // Validate unique IDs
    const seen = new Set<string>();
    for (const plugin of plugins) {
        if (seen.has(plugin.id)) {
            throw new Error(`Duplicate plugin ID: "${plugin.id}". Each plugin must have a unique ID.`);
        }
        seen.add(plugin.id);
    }

    // Resolve dependency order (topological sort)
    return resolveDependencyOrder(plugins);
}

/**
 * Topological sort of plugins based on their declared dependencies.
 * Plugins with no dependencies come first. Circular dependencies throw an error.
 */
function resolveDependencyOrder(plugins: Plugin[]): Plugin[] {
    const pluginMap = new Map<string, Plugin>();
    for (const p of plugins) {
        pluginMap.set(p.id, p);
    }

    const sorted: Plugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>(); // For cycle detection

    function visit(id: string): void {
        if (visited.has(id)) return;
        if (visiting.has(id)) {
            throw new Error(`Circular plugin dependency detected involving "${id}".`);
        }

        const plugin = pluginMap.get(id);
        if (!plugin) {
            // Dependency not in the registered plugins — warn but don't crash
            console.warn(`[plugins] Warning: dependency "${id}" is not registered. Skipping.`);
            return;
        }

        visiting.add(id);

        for (const dep of plugin.dependencies ?? []) {
            visit(dep);
        }

        visiting.delete(id);
        visited.add(id);
        sorted.push(plugin);
    }

    for (const plugin of plugins) {
        visit(plugin.id);
    }

    return sorted;
}
