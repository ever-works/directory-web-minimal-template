/** @jsxImportSource preact */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import MobileMenu from '../../preact/MobileMenu';

const items = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Tags', href: '/tags' },
];

describe('MobileMenu', () => {
    beforeEach(() => {
        document.body.style.overflow = '';
    });

    it('renders with data-component attribute', () => {
        const { container } = render(<MobileMenu items={items} />);
        expect(container.querySelector('[data-component="mobile-menu"]')).toBeTruthy();
    });

    it('renders toggle button', () => {
        render(<MobileMenu items={items} />);
        expect(screen.getByLabelText('Open menu')).toBeTruthy();
    });

    it('menu is closed by default', () => {
        const { container } = render(<MobileMenu items={items} />);
        expect(container.querySelector('[data-part="panel"]')).toBeNull();
    });

    it('opens menu on button click', () => {
        const { container } = render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        expect(container.querySelector('[data-part="panel"]')).toBeTruthy();
        expect(screen.getByLabelText('Close menu')).toBeTruthy();
    });

    it('renders all nav links when open', () => {
        render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        expect(screen.getByText('Home')).toBeTruthy();
        expect(screen.getByText('Categories')).toBeTruthy();
        expect(screen.getByText('Tags')).toBeTruthy();
    });

    it('closes menu on second toggle click', () => {
        const { container } = render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        expect(container.querySelector('[data-part="panel"]')).toBeTruthy();
        fireEvent.click(screen.getByLabelText('Close menu'));
        expect(container.querySelector('[data-part="panel"]')).toBeNull();
    });

    it('closes menu on Escape key', () => {
        const { container } = render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        expect(container.querySelector('[data-part="panel"]')).toBeTruthy();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(container.querySelector('[data-part="panel"]')).toBeNull();
    });

    it('locks body scroll when open', () => {
        render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when closed', () => {
        render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        fireEvent.click(screen.getByLabelText('Close menu'));
        expect(document.body.style.overflow).toBe('');
    });

    it('sets aria-expanded on toggle button', () => {
        render(<MobileMenu items={items} />);
        const button = screen.getByLabelText('Open menu');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(button);
        const closeButton = screen.getByLabelText('Close menu');
        expect(closeButton.getAttribute('aria-expanded')).toBe('true');
    });

    it('has correct nav link hrefs', () => {
        render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        const homeLink = screen.getByText('Home');
        expect(homeLink.getAttribute('href')).toBe('/');
        const catLink = screen.getByText('Categories');
        expect(catLink.getAttribute('href')).toBe('/categories');
    });

    it('has mobile navigation aria-label on panel', () => {
        const { container } = render(<MobileMenu items={items} />);
        fireEvent.click(screen.getByLabelText('Open menu'));
        const panel = container.querySelector('[data-part="panel"]');
        expect(panel?.getAttribute('aria-label')).toBe('Mobile navigation');
    });
});
