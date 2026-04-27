/**
 * MobileMenu — Responsive hamburger menu for mobile navigation.
 *
 * Shows a hamburger button that toggles a slide-down nav panel.
 * Traps focus when open, closes on Escape, and handles body scroll lock.
 *
 * @example
 * ```astro
 * <MobileMenu client:load items={[{ label: 'Home', href: '/' }]} />
 * ```
 */
import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import type { MobileMenuProps } from '../types.js';
import { buttonVariants } from '../primitives/button/button-variants';
import { cn } from '../lib/utils';

export default function MobileMenu({
  items = [],
  class: className,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Preact doesn't forward ref through function components without forwardRef.
  // Use a callback ref to capture the actual DOM button element.
  const setButtonRef = useCallback((el: HTMLButtonElement | null) => {
    (buttonRef as { current: HTMLButtonElement | null }).current = el;
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Trap focus inside menu when open
  useEffect(() => {
    if (!isOpen) return;
    const menuEl = menuRef.current;
    /* v8 ignore next */
    if (!menuEl) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = menuEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const menuEl = menuRef.current;
      const buttonEl = buttonRef.current;
      if (
        menuEl &&
        !menuEl.contains(target) &&
        (!buttonEl || !buttonEl.contains(target))
      ) {
        close();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen, close]);

  return (
    <div
      className={cn('md:hidden', className)}
      data-component="mobile-menu"
    >
      <button
        ref={setButtonRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        data-part="toggle"
        data-slot="button"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="mobile-nav-panel"
          role="navigation"
          aria-label="Mobile navigation"
          data-part="panel"
          className="absolute left-0 right-0 top-full z-40 border-b border-border bg-background shadow-lg"
        >
          <nav className="mx-auto max-w-7xl px-4 py-4">
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={close}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    data-part="nav-link"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
