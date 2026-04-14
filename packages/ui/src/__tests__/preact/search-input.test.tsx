/** @jsxImportSource preact */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/preact';
import SearchInput from '../../preact/SearchInput';

describe('SearchInput', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders with default placeholder', () => {
        render(<SearchInput />);
        expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
        render(<SearchInput placeholder="Find items..." />);
        expect(screen.getByPlaceholderText('Find items...')).toBeTruthy();
    });

    it('has data-component attribute', () => {
        const { container } = render(<SearchInput />);
        expect(container.querySelector('[data-component="search-input"]')).toBeTruthy();
    });

    it('calls onSearch after debounce', () => {
        const onSearch = vi.fn();
        render(<SearchInput onSearch={onSearch} debounceMs={300} />);
        const input = screen.getByRole('searchbox');
        fireEvent.input(input, { target: { value: 'test' } });
        expect(onSearch).not.toHaveBeenCalled();
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(onSearch).toHaveBeenCalledWith('test');
    });

    it('debounces multiple rapid inputs', () => {
        const onSearch = vi.fn();
        render(<SearchInput onSearch={onSearch} debounceMs={300} />);
        const input = screen.getByRole('searchbox');
        fireEvent.input(input, { target: { value: 't' } });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        fireEvent.input(input, { target: { value: 'te' } });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        fireEvent.input(input, { target: { value: 'tes' } });
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith('tes');
    });

    it('shows clear button when input has value', () => {
        render(<SearchInput />);
        const input = screen.getByRole('searchbox');
        expect(screen.queryByLabelText('Clear search')).toBeNull();
        fireEvent.input(input, { target: { value: 'text' } });
        expect(screen.getByLabelText('Clear search')).toBeTruthy();
    });

    it('clears input on clear button click', () => {
        const onSearch = vi.fn();
        render(<SearchInput onSearch={onSearch} />);
        const input = screen.getByRole('searchbox') as HTMLInputElement;
        fireEvent.input(input, { target: { value: 'text' } });
        const clearBtn = screen.getByLabelText('Clear search');
        fireEvent.click(clearBtn);
        expect(input.value).toBe('');
        expect(onSearch).toHaveBeenCalledWith('');
    });

    it('clears input on Escape key', () => {
        const onSearch = vi.fn();
        render(<SearchInput onSearch={onSearch} />);
        const input = screen.getByRole('searchbox') as HTMLInputElement;
        fireEvent.input(input, { target: { value: 'text' } });
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(input.value).toBe('');
        expect(onSearch).toHaveBeenCalledWith('');
    });

    it('has accessible label matching placeholder', () => {
        render(<SearchInput placeholder="Find tools..." />);
        const input = screen.getByRole('searchbox');
        expect(input.getAttribute('aria-label')).toBe('Find tools...');
    });
});
