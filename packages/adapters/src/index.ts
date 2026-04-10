/**
 * @ever-works/adapters
 *
 * Data source adapters for the Ever Works minimal directory template.
 * Abstracts file access to support different storage backends.
 *
 * @example
 * ```typescript
 * import { createAdapter, type DataAdapter } from '@ever-works/adapters';
 *
 * const adapter = createAdapter();
 * await adapter.init({ repository: 'https://github.com/...' });
 * const content = await adapter.readFile('config.yml');
 * ```
 */

export type { DataAdapter, AdapterConfig } from './types.js';

export { FilesystemAdapter } from './filesystem-adapter.js';
export { GitAdapter } from './git-adapter.js';
export { createAdapter, resolveAdapterConfig } from './create-adapter.js';
