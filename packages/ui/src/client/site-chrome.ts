/**
 * Site chrome behaviour: theme toggle/selector, display preferences (layout, width, pagination, view), popovers,
 * and the back-to-top button.
 *
 * Preferences live on `<html>` as data attributes and in `localStorage`; `ThemeScript.astro` applies them before
 * first paint, this module only reacts to clicks. Every change dispatches `ew:prefchange` on `document`.
 */

/** Storage keys (shared with ThemeScript.astro — keep in sync). */
export const PREF_KEYS = {
    theme: 'theme-preference',
    layout: 'ew-layout',
    width: 'ew-width',
    pagination: 'ew-pagination',
    view: 'ew-view'
} as const;

type PrefKey = keyof typeof PREF_KEYS;

function store(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* private mode / storage disabled — preference lasts for this page only */
    }
}

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function systemDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Apply a theme choice (`light`, `dark`, `system`) to `<html>`. */
export function applyTheme(choice: string): void {
    const dark = choice === 'dark' || (choice === 'system' && systemDark());
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.dataset['theme'] = dark ? 'dark' : 'light';
    root.dataset['themeChoice'] = choice;
    root.style.colorScheme = dark ? 'dark' : 'light';
}

function currentThemeChoice(): string {
    return document.documentElement.dataset['themeChoice'] ?? read(PREF_KEYS.theme) ?? 'system';
}

function syncPressed(): void {
    const root = document.documentElement;
    document.querySelectorAll<HTMLElement>('[data-pref]').forEach((button) => {
        const key = button.dataset['pref'] as PrefKey;
        const value = key === 'theme' ? currentThemeChoice() : root.dataset[key];
        button.setAttribute('aria-pressed', String(value === button.dataset['value']));
    });
}

function setPref(key: PrefKey, value: string): void {
    if (key === 'theme') {
        applyTheme(value);
    } else {
        document.documentElement.dataset[key] = value;
    }
    store(PREF_KEYS[key], value);
    syncPressed();
    document.dispatchEvent(new CustomEvent('ew:prefchange', { detail: { key, value } }));
}

function initBackToTop(): void {
    const button = document.querySelector<HTMLElement>('[data-component="back-to-top"]');
    if (!button) return;
    let ticking = false;
    const update = () => {
        button.toggleAttribute('data-visible', window.scrollY > 600);
        ticking = false;
    };
    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        },
        { passive: true }
    );
    button.addEventListener('click', () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    update();
}

/** Wire up theme, preferences, popovers and back-to-top. Idempotent. */
export function initSiteChrome(): void {
    const root = document.documentElement;
    if (root.dataset['chromeReady']) return;
    root.dataset['chromeReady'] = 'true';

    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const toggle = target.closest('[data-component="theme-toggle"]');
        if (toggle) {
            setPref('theme', root.classList.contains('dark') ? 'light' : 'dark');
            return;
        }
        const pref = target.closest<HTMLElement>('[data-pref]');
        if (pref?.dataset['pref'] && pref.dataset['value']) {
            setPref(pref.dataset['pref'] as PrefKey, pref.dataset['value']);
            return;
        }
        // Close open popovers / mobile menu when clicking outside them.
        document.querySelectorAll<HTMLDetailsElement>('details[data-popover][open]').forEach((details) => {
            if (!details.contains(target)) details.open = false;
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        document.querySelectorAll<HTMLDetailsElement>('details[data-popover][open]').forEach((details) => {
            details.open = false;
            details.querySelector('summary')?.focus();
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentThemeChoice() === 'system') applyTheme('system');
    });

    syncPressed();
    initBackToTop();
}
