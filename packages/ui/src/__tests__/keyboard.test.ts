/**
 * Tests for the handleKeyActivation() keyboard utility.
 *
 * handleKeyActivation() creates an event handler for Enter/Space key
 * activation on non-button interactive elements.
 */
import { describe, it, expect, vi } from 'vitest';
import { handleKeyActivation } from '../lib/keyboard';

function createKeyboardEvent(key: string): KeyboardEvent {
    return new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
}

describe('handleKeyActivation()', () => {
    it('calls callback on Enter key', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);
        const event = createKeyboardEvent('Enter');

        handler(event);

        expect(callback).toHaveBeenCalledOnce();
    });

    it('calls callback on Space key', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);
        const event = createKeyboardEvent(' ');

        handler(event);

        expect(callback).toHaveBeenCalledOnce();
    });

    it('does not call callback on other keys', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);

        handler(createKeyboardEvent('Tab'));
        handler(createKeyboardEvent('Escape'));
        handler(createKeyboardEvent('a'));
        handler(createKeyboardEvent('ArrowDown'));

        expect(callback).not.toHaveBeenCalled();
    });

    it('prevents default on Enter', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);
        const event = createKeyboardEvent('Enter');
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        handler(event);

        expect(preventDefaultSpy).toHaveBeenCalledOnce();
    });

    it('prevents default on Space', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);
        const event = createKeyboardEvent(' ');
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        handler(event);

        expect(preventDefaultSpy).toHaveBeenCalledOnce();
    });

    it('does not prevent default on non-activation keys', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);
        const event = createKeyboardEvent('Tab');
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        handler(event);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('returns a reusable function', () => {
        const callback = vi.fn();
        const handler = handleKeyActivation(callback);

        handler(createKeyboardEvent('Enter'));
        handler(createKeyboardEvent('Enter'));
        handler(createKeyboardEvent(' '));

        expect(callback).toHaveBeenCalledTimes(3);
    });
});
