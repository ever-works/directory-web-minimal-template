/** @jsxImportSource preact */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/preact';
import BackToTop from '../../preact/BackToTop';

describe('BackToTop', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
        window.scrollTo = vi.fn();
    });

    it('is hidden when scroll is at top', () => {
        const { container } = render(<BackToTop />);
        expect(container.querySelector('[data-component="back-to-top"]')).toBeNull();
    });

    it('becomes visible after scrolling past threshold', () => {
        Object.defineProperty(window, 'scrollY', { value: 400 });
        const { container } = render(<BackToTop showAfterPx={300} />);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(container.querySelector('[data-component="back-to-top"]')).toBeTruthy();
    });

    it('respects custom showAfterPx threshold', () => {
        Object.defineProperty(window, 'scrollY', { value: 400 });
        const { container } = render(<BackToTop showAfterPx={500} />);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(container.querySelector('[data-component="back-to-top"]')).toBeNull();
    });

    it('calls scrollTo on click', () => {
        Object.defineProperty(window, 'scrollY', { value: 400 });
        render(<BackToTop showAfterPx={300} />);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('has accessible aria-label', () => {
        Object.defineProperty(window, 'scrollY', { value: 400 });
        render(<BackToTop showAfterPx={300} />);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(screen.getByLabelText('Scroll to top')).toBeTruthy();
    });

    it('hides when scrolling back to top', () => {
        Object.defineProperty(window, 'scrollY', { value: 400 });
        const { container } = render(<BackToTop showAfterPx={300} />);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(container.querySelector('[data-component="back-to-top"]')).toBeTruthy();
        Object.defineProperty(window, 'scrollY', { value: 0 });
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(container.querySelector('[data-component="back-to-top"]')).toBeNull();
    });
});
