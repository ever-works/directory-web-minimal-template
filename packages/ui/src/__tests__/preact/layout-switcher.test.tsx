/** @jsxImportSource preact */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import LayoutSwitcher from '../../preact/LayoutSwitcher';

describe('LayoutSwitcher', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders with default grid/list modes', () => {
        render(<LayoutSwitcher />);
        const buttons = screen.getAllByRole('radio');
        expect(buttons).toHaveLength(2);
    });

    it('renders with custom modes', () => {
        render(<LayoutSwitcher modes={['grid', 'list', 'compact']} />);
        const buttons = screen.getAllByRole('radio');
        expect(buttons).toHaveLength(3);
    });

    it('has data-component attribute', () => {
        const { container } = render(<LayoutSwitcher />);
        expect(container.querySelector('[data-component="layout-switcher"]')).toBeTruthy();
    });

    it('has radiogroup role with accessible label', () => {
        render(<LayoutSwitcher />);
        const group = screen.getByRole('radiogroup');
        expect(group.getAttribute('aria-label')).toBe('Layout view');
    });

    it('marks default mode as checked', () => {
        render(<LayoutSwitcher />);
        const gridButton = screen.getByLabelText('Grid view');
        expect(gridButton.getAttribute('aria-checked')).toBe('true');
    });

    it('switches active mode on click', () => {
        const onChange = vi.fn();
        render(<LayoutSwitcher onChange={onChange} />);
        const listButton = screen.getByLabelText('List view');
        fireEvent.click(listButton);
        expect(listButton.getAttribute('aria-checked')).toBe('true');
        expect(onChange).toHaveBeenCalledWith('list');
    });

    it('persists mode to localStorage', () => {
        render(<LayoutSwitcher persistKey="test-layout" />);
        const listButton = screen.getByLabelText('List view');
        fireEvent.click(listButton);
        expect(localStorage.getItem('test-layout')).toBe('list');
    });

    it('restores persisted mode from localStorage', () => {
        localStorage.setItem('ew-layout-mode', 'list');
        render(<LayoutSwitcher />);
        const listButton = screen.getByLabelText('List view');
        expect(listButton.getAttribute('aria-checked')).toBe('true');
    });

    it('ignores invalid persisted values', () => {
        localStorage.setItem('ew-layout-mode', 'invalid');
        render(<LayoutSwitcher />);
        const gridButton = screen.getByLabelText('Grid view');
        expect(gridButton.getAttribute('aria-checked')).toBe('true');
    });

    it('uses custom persistKey', () => {
        render(<LayoutSwitcher persistKey="custom-key" />);
        const listButton = screen.getByLabelText('List view');
        fireEvent.click(listButton);
        expect(localStorage.getItem('custom-key')).toBe('list');
        expect(localStorage.getItem('ew-layout-mode')).toBeNull();
    });

    it('does not persist when persistKey is empty', () => {
        render(<LayoutSwitcher persistKey="" />);
        const listButton = screen.getByLabelText('List view');
        fireEvent.click(listButton);
        expect(localStorage.getItem('ew-layout-mode')).toBeNull();
    });

    it('does not restore from localStorage when persistKey is empty', () => {
        localStorage.setItem('ew-layout-mode', 'list');
        render(<LayoutSwitcher persistKey="" />);
        const gridButton = screen.getByLabelText('Grid view');
        expect(gridButton.getAttribute('aria-checked')).toBe('true');
    });
});
