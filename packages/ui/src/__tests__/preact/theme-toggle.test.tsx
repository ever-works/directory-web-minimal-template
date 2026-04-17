/** @jsxImportSource preact */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/preact';
import ThemeToggle from '../../preact/ThemeToggle';

describe('ThemeToggle', () => {
    let listeners: Map<string, Set<(...args: unknown[]) => void>>;
    let matchesDark: boolean;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
        matchesDark = false;
        listeners = new Map();

        vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
            const mql = {
                matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
                media: query,
                onchange: null,
                addEventListener: (_event: string, cb: (...args: unknown[]) => void) => {
                    if (!listeners.has(query)) listeners.set(query, new Set());
                    listeners.get(query)!.add(cb);
                },
                removeEventListener: (_event: string, cb: (...args: unknown[]) => void) => {
                    listeners.get(query)?.delete(cb);
                },
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
            } as unknown as MediaQueryList;
            return mql;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders a button with aria-label', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-label')).toMatch(/switch to (dark|light) mode/i);
    });

    it('has data-component attribute', () => {
        const { container } = render(<ThemeToggle />);
        expect(container.querySelector('[data-component="theme-toggle"]')).toBeTruthy();
    });

    it('defaults to light theme when no stored preference', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('data-theme')).toBe('light');
    });

    it('toggles from light to dark on click', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(button.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('theme-preference')).toBe('dark');
    });

    it('toggles back from dark to light', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button); // → dark
        fireEvent.click(button); // → light
        expect(button.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('theme-preference')).toBe('light');
    });

    it('restores stored theme preference', () => {
        localStorage.setItem('theme-preference', 'dark');
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('data-theme')).toBe('dark');
    });

    it('applies dark class to documentElement', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when toggling to light', () => {
        localStorage.setItem('theme-preference', 'dark');
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button); // → light
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('sets data-theme attribute on documentElement', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    /* ── System theme change listener ── */

    it('follows system theme change when no stored preference', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('data-theme')).toBe('light');

        matchesDark = true;
        const cbs = listeners.get('(prefers-color-scheme: dark)');
        expect(cbs).toBeTruthy();
        act(() => {
            for (const cb of cbs!) cb();
        });

        expect(button.getAttribute('data-theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('ignores system theme change when user has stored preference', () => {
        localStorage.setItem('theme-preference', 'light');
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('data-theme')).toBe('light');

        matchesDark = true;
        const cbs = listeners.get('(prefers-color-scheme: dark)');
        act(() => {
            for (const cb of cbs!) cb();
        });

        expect(button.getAttribute('data-theme')).toBe('light');
    });

    it('cleans up media query listener on unmount', () => {
        const { unmount } = render(<ThemeToggle />);
        const cbs = listeners.get('(prefers-color-scheme: dark)');
        expect(cbs?.size).toBe(1);

        unmount();
        expect(cbs?.size).toBe(0);
    });

    it('uses system dark preference on initial render', () => {
        matchesDark = true;
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('data-theme')).toBe('dark');
    });

    it('ignores invalid stored theme value', () => {
        localStorage.setItem('theme-preference', 'invalid');
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        expect(button.getAttribute('data-theme')).toBe('light');
    });

    it('passes custom className via class prop', () => {
        const { container } = render(<ThemeToggle class="custom-class" />);
        const button = container.querySelector('[data-component="theme-toggle"]');
        expect(button?.className).toContain('custom-class');
    });
});
