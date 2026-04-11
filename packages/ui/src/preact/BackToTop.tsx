/**
 * BackToTop — Client-side scroll-to-top button.
 *
 * Built on shadcn/ui Button component.
 * Appears after scrolling past a configurable threshold.
 *
 * @example
 * ```astro
 * <BackToTop client:load showAfterPx={400} />
 * ```
 */
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { BackToTopProps } from '../types.js';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export default function BackToTop({
  showAfterPx = 300,
  class: className,
}: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > showAfterPx);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfterPx]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full shadow-lg',
        className,
      )}
      data-component="back-to-top"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    </Button>
  );
}
