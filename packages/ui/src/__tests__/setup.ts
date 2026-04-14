/**
 * Vitest setup for Preact component rendering tests.
 * Configures jsdom environment with required browser API mocks.
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/preact';

// Cleanup Preact component tree after each test
afterEach(() => {
    cleanup();
});

// Mock localStorage for components that persist state
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
    };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock matchMedia for ThemeToggle
Object.defineProperty(globalThis, 'matchMedia', {
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// Mock scrollTo for BackToTop
Object.defineProperty(globalThis, 'scrollTo', {
    value: () => {},
    writable: true,
});
