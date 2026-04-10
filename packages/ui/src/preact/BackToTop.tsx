/**
 * BackToTop — Client-side scroll-to-top button.
 * Headless — no styling applied. Use class prop or data-* selectors.
 * Appears after scrolling past a configurable threshold.
 *
 * @example
 * ```astro
 * <BackToTop client:load showAfterPx={400} />
 * ```
 */
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { BackToTopProps } from '../types.js';

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
    <button
      type="button"
      class={className}
      data-component="back-to-top"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <span data-part="label">Back to top</span>
    </button>
  );
}
