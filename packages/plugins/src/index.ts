/**
 * @ever-works/plugins
 *
 * Plugin system for the Ever Works minimal directory template.
 * Provides interfaces, registration, lifecycle management, and runner for plugins.
 *
 * @example
 * ```typescript
 * import { definePlugins, PluginRunner, createPluginLogger, type Plugin } from '@ever-works/plugins';
 * ```
 */

export type { Plugin, PluginHooks, PluginContext, PluginLogger } from './types.js';
export { definePlugins } from './define-plugins.js';
export { PluginRunner } from './runner.js';
export { createPluginLogger } from './logger.js';
