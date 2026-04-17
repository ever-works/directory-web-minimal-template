/** @jsxImportSource preact */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import FilterBar from '../../preact/FilterBar';

const categories = [
    { id: 'cat-1', name: 'Category A', slug: 'cat-a' },
    { id: 'cat-2', name: 'Category B', slug: 'cat-b' },
];

const tags = [
    { id: 'tag-1', name: 'Tag X', slug: 'tag-x' },
    { id: 'tag-2', name: 'Tag Y', slug: 'tag-y' },
    { id: 'tag-3', name: 'Tag Z', slug: 'tag-z' },
];

describe('FilterBar', () => {
    it('renders with data-component attribute', () => {
        const { container } = render(<FilterBar />);
        expect(container.querySelector('[data-component="filter-bar"]')).toBeTruthy();
    });

    it('renders category buttons', () => {
        render(<FilterBar categories={categories} />);
        expect(screen.getByText('Category A')).toBeTruthy();
        expect(screen.getByText('Category B')).toBeTruthy();
    });

    it('renders tag badges', () => {
        render(<FilterBar tags={tags} />);
        expect(screen.getByText('Tag X')).toBeTruthy();
        expect(screen.getByText('Tag Y')).toBeTruthy();
        expect(screen.getByText('Tag Z')).toBeTruthy();
    });

    it('shows Categories legend when categories provided', () => {
        render(<FilterBar categories={categories} />);
        expect(screen.getByText('Categories')).toBeTruthy();
    });

    it('shows Tags legend when tags provided', () => {
        render(<FilterBar tags={tags} />);
        expect(screen.getByText('Tags')).toBeTruthy();
    });

    it('selects category on click', () => {
        const onCategoryChange = vi.fn();
        render(<FilterBar categories={categories} onCategoryChange={onCategoryChange} />);
        fireEvent.click(screen.getByText('Category A'));
        expect(onCategoryChange).toHaveBeenCalledWith('cat-1');
    });

    it('toggles category off on second click', () => {
        const onCategoryChange = vi.fn();
        render(<FilterBar categories={categories} onCategoryChange={onCategoryChange} />);
        fireEvent.click(screen.getByText('Category A'));
        fireEvent.click(screen.getByText('Category A'));
        expect(onCategoryChange).toHaveBeenLastCalledWith(null);
    });

    it('switches category selection', () => {
        const onCategoryChange = vi.fn();
        render(<FilterBar categories={categories} onCategoryChange={onCategoryChange} />);
        fireEvent.click(screen.getByText('Category A'));
        fireEvent.click(screen.getByText('Category B'));
        expect(onCategoryChange).toHaveBeenLastCalledWith('cat-2');
    });

    it('multi-selects tags', () => {
        const onTagsChange = vi.fn();
        render(<FilterBar tags={tags} onTagsChange={onTagsChange} />);
        fireEvent.click(screen.getByText('Tag X'));
        expect(onTagsChange).toHaveBeenCalledWith(['tag-1']);
        fireEvent.click(screen.getByText('Tag Y'));
        expect(onTagsChange).toHaveBeenCalledWith(['tag-1', 'tag-2']);
    });

    it('deselects tag on second click', () => {
        const onTagsChange = vi.fn();
        render(<FilterBar tags={tags} onTagsChange={onTagsChange} />);
        fireEvent.click(screen.getByText('Tag X'));
        fireEvent.click(screen.getByText('Tag X'));
        expect(onTagsChange).toHaveBeenLastCalledWith([]);
    });

    it('shows clear button when filters active', () => {
        render(<FilterBar categories={categories} />);
        expect(screen.queryByText('Clear filters')).toBeNull();
        fireEvent.click(screen.getByText('Category A'));
        expect(screen.getByText('Clear filters')).toBeTruthy();
    });

    it('clears all filters on clear button click', () => {
        const onCategoryChange = vi.fn();
        const onTagsChange = vi.fn();
        render(
            <FilterBar
                categories={categories}
                tags={tags}
                onCategoryChange={onCategoryChange}
                onTagsChange={onTagsChange}
            />,
        );
        fireEvent.click(screen.getByText('Category A'));
        fireEvent.click(screen.getByText('Tag X'));
        fireEvent.click(screen.getByText('Clear filters'));
        expect(onCategoryChange).toHaveBeenLastCalledWith(null);
        expect(onTagsChange).toHaveBeenLastCalledWith([]);
    });

    it('sets aria-pressed on selected category', () => {
        render(<FilterBar categories={categories} />);
        const catA = screen.getByText('Category A');
        expect(catA.getAttribute('aria-pressed')).toBe('false');
        fireEvent.click(catA);
        expect(catA.getAttribute('aria-pressed')).toBe('true');
    });

    it('sets aria-pressed on selected tags', () => {
        render(<FilterBar tags={tags} />);
        const tagX = screen.getByText('Tag X');
        expect(tagX.getAttribute('aria-pressed')).toBe('false');
        fireEvent.click(tagX);
        expect(tagX.getAttribute('aria-pressed')).toBe('true');
    });

    it('toggles tag via Enter key', () => {
        const onTagsChange = vi.fn();
        render(<FilterBar tags={tags} onTagsChange={onTagsChange} />);
        const tagX = screen.getByText('Tag X');
        fireEvent.keyDown(tagX, { key: 'Enter' });
        expect(onTagsChange).toHaveBeenCalledWith(['tag-1']);
    });

    it('toggles tag via Space key', () => {
        const onTagsChange = vi.fn();
        render(<FilterBar tags={tags} onTagsChange={onTagsChange} />);
        const tagX = screen.getByText('Tag X');
        fireEvent.keyDown(tagX, { key: ' ' });
        expect(onTagsChange).toHaveBeenCalledWith(['tag-1']);
    });
});
