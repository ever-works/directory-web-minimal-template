/** @jsxImportSource preact */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/preact';
import ItemBrowser from '../../preact/ItemBrowser';
import type { ItemData, CategoryWithCount, TagWithCount } from '@ever-works/core';

/* ── Test fixtures ── */

function makeItem(overrides: Partial<ItemData> = {}): ItemData {
    return {
        slug: 'test-item',
        name: 'Test Item',
        description: 'A test item description',
        category: 'cat-1',
        tags: ['tag-1'],
        featured: false,
        url: '',
        content: '',
        ...overrides,
    } as ItemData;
}

const items: ItemData[] = [
    makeItem({ slug: 'item-1', name: 'Alpha Tool', description: 'Alpha description', category: 'cat-1', tags: ['tag-1'], featured: true }),
    makeItem({ slug: 'item-2', name: 'Beta Widget', description: 'Beta description', category: 'cat-2', tags: ['tag-2'] }),
    makeItem({ slug: 'item-3', name: 'Gamma App', description: 'Gamma description', category: 'cat-1', tags: ['tag-1', 'tag-2'] }),
];

const categories: CategoryWithCount[] = [
    { id: 'cat-1', name: 'Category A', count: 2 },
    { id: 'cat-2', name: 'Category B', count: 1 },
];

const tags: TagWithCount[] = [
    { id: 'tag-1', name: 'Tag X', count: 2 },
    { id: 'tag-2', name: 'Tag Y', count: 2 },
];

describe('ItemBrowser', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /* ── Rendering ── */

    it('renders with data-component attribute', () => {
        const { container } = render(<ItemBrowser items={items} />);
        expect(container.querySelector('[data-component="item-browser"]')).toBeTruthy();
    });

    it('renders all items by default', () => {
        const { container } = render(<ItemBrowser items={items} />);
        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(3);
    });

    it('shows item count in results info', () => {
        render(<ItemBrowser items={items} itemsName="Tools" />);
        expect(screen.getByText(/3 tools/i)).toBeTruthy();
    });

    it('renders category filter when categories provided', () => {
        render(<ItemBrowser items={items} categories={categories} />);
        expect(screen.getByText('Category A')).toBeTruthy();
        expect(screen.getByText('Category B')).toBeTruthy();
    });

    it('renders tag filter when tags provided', () => {
        render(<ItemBrowser items={items} tags={tags} />);
        expect(screen.getByText('Tag X')).toBeTruthy();
        expect(screen.getByText('Tag Y')).toBeTruthy();
    });

    it('does not render category filter when no categories', () => {
        const { container } = render(<ItemBrowser items={items} />);
        expect(container.querySelector('[data-part="categories"]')).toBeNull();
    });

    it('does not render tag filter when no tags', () => {
        const { container } = render(<ItemBrowser items={items} />);
        expect(container.querySelector('[data-part="tags"]')).toBeNull();
    });

    /* ── Category filtering ── */

    it('filters items by category when category button clicked', () => {
        const { container } = render(
            <ItemBrowser items={items} categories={categories} />,
        );
        const catButton = screen.getByText('Category B');
        fireEvent.click(catButton);

        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(1);
    });

    it('toggles category filter off when clicked again', () => {
        const { container } = render(
            <ItemBrowser items={items} categories={categories} />,
        );
        const catButton = screen.getByText('Category A');
        fireEvent.click(catButton);
        // Now 2 items (cat-1)
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);

        fireEvent.click(catButton);
        // Back to all 3
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(3);
    });

    /* ── Tag filtering ── */

    it('filters items by tag when tag badge clicked', () => {
        const { container } = render(
            <ItemBrowser items={items} tags={tags} />,
        );
        // Click "Tag Y" (tag-2) — items 2 and 3 have tag-2
        const tagBadge = screen.getByText('Tag Y');
        fireEvent.click(tagBadge);

        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(2);
    });

    /* ── Search ── */

    it('filters items by search query', () => {
        const { container } = render(<ItemBrowser items={items} />);
        const searchInput = screen.getByRole('searchbox');

        fireEvent.input(searchInput, { target: { value: 'alpha' } });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(1);
    });

    /* ── Empty state ── */

    it('shows empty state when no items match filters', () => {
        const { container } = render(<ItemBrowser items={items} />);
        const searchInput = screen.getByRole('searchbox');

        fireEvent.input(searchInput, { target: { value: 'zzz-no-match' } });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(container.querySelector('[data-part="empty-state"]')).toBeTruthy();
    });

    /* ── Clear all ── */

    it('clears all filters when Clear all button clicked', () => {
        const { container } = render(
            <ItemBrowser items={items} categories={categories} />,
        );

        // Apply a category filter first
        fireEvent.click(screen.getByText('Category B'));
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(1);

        // Clear all
        const clearBtn = screen.getByText('Clear all');
        fireEvent.click(clearBtn);
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(3);
    });

    /* ── Pagination ── */

    it('paginates items when more than perPage', () => {
        // Create 5 items with perPage=2
        const manyItems = Array.from({ length: 5 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        const { container } = render(
            <ItemBrowser items={manyItems} perPage={2} />,
        );

        // Should show 2 items on page 1
        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(2);

        // Should show pagination nav
        const nav = container.querySelector('[data-part="pagination"]');
        expect(nav).toBeTruthy();
    });

    it('does not show pagination when items fit on one page', () => {
        const { container } = render(<ItemBrowser items={items} perPage={10} />);
        expect(container.querySelector('[data-part="pagination"]')).toBeNull();
    });

    /* ── Default item card ── */

    it('renders default item card with name and description', () => {
        const firstItem = items[0]!;
        render(<ItemBrowser items={[firstItem]} />);
        expect(screen.getByText('Alpha Tool')).toBeTruthy();
        expect(screen.getByText('Alpha description')).toBeTruthy();
    });

    it('shows Featured badge on featured items', () => {
        const firstItem = items[0]!;
        const { container } = render(<ItemBrowser items={[firstItem]} />);
        const card = container.querySelector('[data-part="item-card"][data-featured]');
        expect(card).toBeTruthy();
    });

    /* ── Custom render function ── */

    it('uses renderItem when provided', () => {
        const renderItem = vi.fn((item: ItemData) => (
            <div data-testid="custom-card">{item.name}</div>
        ));
        const { container } = render(
            <ItemBrowser items={items} renderItem={renderItem} />,
        );

        expect(renderItem).toHaveBeenCalledTimes(3);
        expect(container.querySelectorAll('[data-testid="custom-card"]')).toHaveLength(3);
    });

    /* ── Pagination navigation ── */

    it('navigates to next page when Next button clicked', () => {
        const manyItems = Array.from({ length: 5 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        const { container } = render(
            <ItemBrowser items={manyItems} perPage={2} />,
        );

        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);

        const nextBtn = screen.getByText('Next');
        fireEvent.click(nextBtn);
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);
        expect(screen.getByText(/page 2/i)).toBeTruthy();
    });

    it('navigates to previous page when Previous button clicked', () => {
        const manyItems = Array.from({ length: 5 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        const { container } = render(
            <ItemBrowser items={manyItems} perPage={2} />,
        );

        fireEvent.click(screen.getByText('Next'));
        expect(screen.getByText(/page 2/i)).toBeTruthy();

        fireEvent.click(screen.getByText('Previous'));
        expect(screen.getByText(/page 1/i)).toBeTruthy();
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);
    });

    it('navigates to specific page when page number clicked', () => {
        const manyItems = Array.from({ length: 7 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        const { container } = render(
            <ItemBrowser items={manyItems} perPage={2} />,
        );

        const page3Btn = screen.getByRole('button', { name: '3' });
        fireEvent.click(page3Btn);
        expect(screen.getByText(/page 3/i)).toBeTruthy();
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);
    });

    it('marks current page button with aria-current', () => {
        const manyItems = Array.from({ length: 5 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        render(<ItemBrowser items={manyItems} perPage={2} />);

        const page1Btn = screen.getByRole('button', { name: '1' });
        expect(page1Btn.getAttribute('aria-current')).toBe('page');

        const page2Btn = screen.getByRole('button', { name: '2' });
        expect(page2Btn.getAttribute('aria-current')).toBeNull();
    });

    it('disables Previous on first page and Next on last page', () => {
        const manyItems = Array.from({ length: 4 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        render(<ItemBrowser items={manyItems} perPage={2} />);

        const prevBtn = screen.getByText('Previous');
        expect(prevBtn.hasAttribute('disabled')).toBe(true);

        fireEvent.click(screen.getByText('Next'));
        const nextBtn = screen.getByText('Next');
        expect(nextBtn.hasAttribute('disabled')).toBe(true);
    });

    it('shows ellipsis in pagination when many pages', () => {
        const manyItems = Array.from({ length: 20 }, (_, i) =>
            makeItem({ slug: `item-${i}`, name: `Item ${i}` }),
        );
        const { container } = render(
            <ItemBrowser items={manyItems} perPage={2} />,
        );

        const ellipsis = container.querySelectorAll('span');
        const ellipsisTexts = Array.from(ellipsis).map(el => el.textContent);
        expect(ellipsisTexts).toContain('...');
    });

    /* ── Search by description ── */

    it('filters items by description match', () => {
        const { container } = render(<ItemBrowser items={items} />);
        const searchInput = screen.getByRole('searchbox');

        fireEvent.input(searchInput, { target: { value: 'beta description' } });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(1);
    });

    /* ── Tag toggling ── */

    it('toggles tag off when clicked again', () => {
        const { container } = render(
            <ItemBrowser items={items} tags={tags} />,
        );
        const tagBadge = screen.getByText('Tag Y');
        fireEvent.click(tagBadge);
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);

        fireEvent.click(tagBadge);
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(3);
    });

    /* ── Empty state clear filters button ── */

    it('shows clear filters button in empty state', () => {
        const { container } = render(
            <ItemBrowser items={items} categories={categories} />,
        );

        fireEvent.click(screen.getByText('Category B'));
        const searchInput = screen.getByRole('searchbox');
        fireEvent.input(searchInput, { target: { value: 'zzz-no-match' } });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        const clearFilterBtn = container.querySelector('[data-part="clear-filters"]');
        expect(clearFilterBtn).toBeTruthy();

        fireEvent.click(clearFilterBtn!);
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(3);
    });

    /* ── Layout modes ── */

    it('renders compact layout class when layout set to compact', () => {
        const { container } = render(
            <ItemBrowser
                items={items}
                layoutModes={['grid', 'list', 'compact']}
                initialLayout="compact"
            />,
        );
        const itemList = container.querySelector('[data-part="item-list"]');
        expect(itemList?.getAttribute('data-layout')).toBe('compact');
    });

    it('renders list layout class when layout set to list', () => {
        const { container } = render(
            <ItemBrowser items={items} initialLayout="list" />,
        );
        const itemList = container.querySelector('[data-part="item-list"]');
        expect(itemList?.getAttribute('data-layout')).toBe('list');
    });

    /* ── Multi-category items ── */

    it('filters items with array category correctly', () => {
        const multiCatItems = [
            makeItem({ slug: 'multi', name: 'Multi Cat', category: ['cat-1', 'cat-2'] as unknown as string }),
            makeItem({ slug: 'single', name: 'Single Cat', category: 'cat-1' }),
        ];
        const { container } = render(
            <ItemBrowser items={multiCatItems} categories={categories} />,
        );

        fireEvent.click(screen.getByText('Category B'));
        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(1);
    });

    /* ── Default item card edge cases ── */

    it('renders item card without description', () => {
        const noDescItem = makeItem({ slug: 'no-desc', name: 'No Desc', description: '' });
        render(<ItemBrowser items={[noDescItem]} />);
        expect(screen.getByText('No Desc')).toBeTruthy();
    });

    it('renders item card without tags', () => {
        const noTagItem = makeItem({ slug: 'no-tags', name: 'No Tags', tags: [] });
        const { container } = render(<ItemBrowser items={[noTagItem]} />);
        expect(container.querySelector('[data-part="item-card"]')).toBeTruthy();
    });

    /* ── Category count display ── */

    it('renders category count when provided', () => {
        render(<ItemBrowser items={items} categories={categories} />);
        expect(screen.getByText('(2)')).toBeTruthy();
        expect(screen.getByText('(1)')).toBeTruthy();
    });

    it('renders category without count when count is null', () => {
        const noCounts: CategoryWithCount[] = [
            { id: 'cat-1', name: 'No Count Cat', count: null as unknown as number },
        ];
        render(<ItemBrowser items={items} categories={noCounts} />);
        expect(screen.getByText('No Count Cat')).toBeTruthy();
    });

    /* ── Sort change ── */

    it('changes sort order when sort select changed', () => {
        const { container } = render(<ItemBrowser items={items} />);
        const sortSelect = container.querySelector('[data-component="sort-select"] select') as HTMLSelectElement;
        expect(sortSelect).toBeTruthy();

        fireEvent.change(sortSelect, { target: { value: 'name-asc' } });
        const cards = container.querySelectorAll('[data-part="item-card"]');
        expect(cards).toHaveLength(3);
    });

    /* ── Layout switch interaction ── */

    it('switches layout when layout switcher button clicked', () => {
        const { container } = render(
            <ItemBrowser items={items} layoutModes={['grid', 'list']} initialLayout="grid" />,
        );

        const listBtn = container.querySelector('[data-component="layout-switcher"] button[aria-label*="list" i]')
            ?? container.querySelector('[data-component="layout-switcher"] button:last-child');
        expect(listBtn).toBeTruthy();
        fireEvent.click(listBtn!);

        const itemList = container.querySelector('[data-part="item-list"]');
        expect(itemList?.getAttribute('data-layout')).toBe('list');
    });

    /* ── Tag count display ── */

    it('renders tag count when provided', () => {
        render(<ItemBrowser items={items} tags={tags} />);
        expect(screen.getAllByText('(2)')).toHaveLength(2);
    });

    it('renders tag without count when count is null', () => {
        const noCounts: TagWithCount[] = [
            { id: 'tag-1', name: 'No Count Tag', count: null as unknown as number },
        ];
        render(<ItemBrowser items={items} tags={noCounts} />);
        expect(screen.getByText('No Count Tag')).toBeTruthy();
    });

    /* ── Tag keyboard activation ── */

    it('toggles tag via keyboard Enter key', () => {
        const { container } = render(
            <ItemBrowser items={items} tags={tags} />,
        );
        const tagBadge = screen.getByText('Tag Y');
        fireEvent.keyDown(tagBadge, { key: 'Enter' });
        expect(container.querySelectorAll('[data-part="item-card"]')).toHaveLength(2);
    });
});
