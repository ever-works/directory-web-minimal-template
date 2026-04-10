/**
 * ThemeToggle — Client-side dark/light theme toggle.
 * Headless — no styling applied. Use class prop or data-* selectors.
 * Persists preference in localStorage and applies via data-theme attribute on <html>.
 *
 * @example
 * ```astro
 * <ThemeToggle client:load />
 * ```
 */
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { ThemeToggleProps } from '../types.js';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export default function ThemeToggle({ class: className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    return getStoredTheme() ?? getSystemTheme();
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!getStoredTheme()) {
        const next = getSystemTheme();
        setTheme(next);
        applyTheme(next);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, [theme]);

  return (
    <button
      type="button"
      class={className}
      data-component="theme-toggle"
      data-theme={theme}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span data-part="label">{theme === 'light' ? 'Dark' : 'Light'} mode</span>
    </button>
  );
}
