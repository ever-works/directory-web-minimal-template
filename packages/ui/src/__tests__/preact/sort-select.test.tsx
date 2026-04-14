/** @jsxImportSource preact */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import SortSelect from '../../preact/SortSelect';

describe('SortSelect', () => {
    it('renders with default options', () => {
        render(<SortSelect />);
        expect(screen.getByLabelText('Sort by')).toBeTruthy();
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('featured');
    });

    it('renders all 5 default sort options', () => {
        render(<SortSelect />);
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(5);
        expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual([
            'featured',
            'name-asc',
            'name-desc',
            'date-asc',
            'date-desc',
        ]);
    });

    it('renders custom option subset', () => {
        render(<SortSelect options={['name-asc', 'name-desc']} />);
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(2);
    });

    it('renders with selected value', () => {
        render(<SortSelect selected="name-desc" />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('name-desc');
    });

    it('calls onChange when selection changes', () => {
        const onChange = vi.fn();
        render(<SortSelect onChange={onChange} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'date-desc' } });
        expect(onChange).toHaveBeenCalledWith('date-desc');
    });

    it('has correct data-component attribute', () => {
        const { container } = render(<SortSelect />);
        expect(container.querySelector('[data-component="sort-select"]')).toBeTruthy();
    });

    it('displays human-readable labels', () => {
        render(<SortSelect />);
        expect(screen.getByText('Name (A-Z)')).toBeTruthy();
        expect(screen.getByText('Newest first')).toBeTruthy();
        expect(screen.getByText('Featured')).toBeTruthy();
    });
});
