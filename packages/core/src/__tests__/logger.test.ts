import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { coreLogger, createCoreLogger } from '../logger';
import type { CoreLogger } from '../logger';

describe('coreLogger', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let logSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be a CoreLogger instance', () => {
        expect(coreLogger).toBeDefined();
        expect(typeof coreLogger.info).toBe('function');
        expect(typeof coreLogger.warn).toBe('function');
        expect(typeof coreLogger.error).toBe('function');
        expect(typeof coreLogger.debug).toBe('function');
    });

    it('should prefix warn messages with [core]', () => {
        coreLogger.warn('test warning');
        expect(warnSpy).toHaveBeenCalledWith('[core] test warning');
    });

    it('should prefix info messages with [core]', () => {
        coreLogger.info('test info');
        expect(logSpy).toHaveBeenCalledWith('[core] test info');
    });

    it('should prefix error messages with [core]', () => {
        coreLogger.error('test error');
        expect(errorSpy).toHaveBeenCalledWith('[core] test error');
    });

    it('should pass extra arguments to warn', () => {
        const err = new Error('fail');
        coreLogger.warn('something failed:', err);
        expect(warnSpy).toHaveBeenCalledWith('[core] something failed:', err);
    });

    it('should pass extra arguments to error', () => {
        const err = new Error('crash');
        coreLogger.error('fatal:', err);
        expect(errorSpy).toHaveBeenCalledWith('[core] fatal:', err);
    });

    it('should not emit debug messages by default', () => {
        coreLogger.debug('debug info');
        expect(logSpy).not.toHaveBeenCalled();
    });
});

describe('createCoreLogger', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create a CoreLogger', () => {
        const logger: CoreLogger = createCoreLogger();
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.debug).toBe('function');
    });

    it('should emit debug messages when verbose is true', () => {
        const logger = createCoreLogger(true);
        logger.debug('verbose debug');
        expect(logSpy).toHaveBeenCalledWith('[core] [debug] verbose debug');
    });

    it('should not emit debug messages when verbose is false', () => {
        const logger = createCoreLogger(false);
        logger.debug('quiet debug');
        expect(logSpy).not.toHaveBeenCalled();
    });

    it('should not emit debug messages with default options', () => {
        const logger = createCoreLogger();
        logger.debug('default debug');
        expect(logSpy).not.toHaveBeenCalled();
    });
});
