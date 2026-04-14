/** @jsxImportSource preact */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import ThemeToggle from '../../preact/ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
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
});
