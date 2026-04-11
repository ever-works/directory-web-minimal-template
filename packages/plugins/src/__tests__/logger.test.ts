import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPluginLogger } from '../logger.js';

describe('createPluginLogger', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // ------------------------------------------------------------------
    // basic creation
    // ------------------------------------------------------------------
    describe('creation', () => {
        it('returns an object with info, warn, error, and debug methods', () => {
            const logger = createPluginLogger('test-plugin');

            expect(typeof logger.info).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.debug).toBe('function');
        });
    });

    // ------------------------------------------------------------------
    // info
    // ------------------------------------------------------------------
    describe('info', () => {
        it('logs with the correct plugin prefix', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const logger = createPluginLogger('my-plugin');

            logger.info('hello world');

            expect(spy).toHaveBeenCalledOnce();
            expect(spy).toHaveBeenCalledWith('[plugin:my-plugin] hello world');
        });

        it('uses the pluginId in the prefix', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const logger = createPluginLogger('search');

            logger.info('indexing started');

            expect(spy).toHaveBeenCalledWith('[plugin:search] indexing started');
        });
    });

    // ------------------------------------------------------------------
    // warn
    // ------------------------------------------------------------------
    describe('warn', () => {
        it('logs a warning with the correct plugin prefix', () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const logger = createPluginLogger('filters');

            logger.warn('deprecated option used');

            expect(spy).toHaveBeenCalledOnce();
            expect(spy).toHaveBeenCalledWith('[plugin:filters] deprecated option used');
        });
    });

    // ------------------------------------------------------------------
    // error
    // ------------------------------------------------------------------
    describe('error', () => {
        it('logs an error with the correct plugin prefix', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const logger = createPluginLogger('seo');

            logger.error('missing meta description');

            expect(spy).toHaveBeenCalledOnce();
            expect(spy).toHaveBeenCalledWith('[plugin:seo] missing meta description');
        });
    });

    // ------------------------------------------------------------------
    // debug
    // ------------------------------------------------------------------
    describe('debug', () => {
        it('does not emit debug messages when verbose is false', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const logger = createPluginLogger('test-plugin', false);

            logger.debug('detailed trace');

            expect(spy).not.toHaveBeenCalled();
        });

        it('does not emit debug messages when verbose is undefined (default)', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const logger = createPluginLogger('test-plugin');

            logger.debug('detailed trace');

            expect(spy).not.toHaveBeenCalled();
        });

        it('emits debug messages when verbose is true', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const logger = createPluginLogger('test-plugin', true);

            logger.debug('detailed trace');

            expect(spy).toHaveBeenCalledOnce();
            expect(spy).toHaveBeenCalledWith('[plugin:test-plugin] [debug] detailed trace');
        });
    });

    // ------------------------------------------------------------------
    // different plugin IDs produce different prefixes
    // ------------------------------------------------------------------
    describe('prefix isolation', () => {
        it('different loggers use different prefixes', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const loggerA = createPluginLogger('alpha');
            const loggerB = createPluginLogger('beta');

            loggerA.info('msg from alpha');
            loggerB.info('msg from beta');

            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenNthCalledWith(1, '[plugin:alpha] msg from alpha');
            expect(spy).toHaveBeenNthCalledWith(2, '[plugin:beta] msg from beta');
        });
    });
});
