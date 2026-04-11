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

export type { Plugin, PluginHooks, PluginContext, PluginLogger } from './types';
export { definePlugins } from './define-plugins';
export { PluginRunner } from './runner';
export { createPluginLogger } from './logger';
