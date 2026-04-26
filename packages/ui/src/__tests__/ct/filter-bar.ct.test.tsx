/**
 * Playwright Component Tests for `FilterBar`.
 *
 * Migrated from `packages/ui/src/__tests__/preact/filter-bar.test.tsx` per
 * Q22 / `docs/plans/q22-playwright-ct.md` Step 4. The Vitest+jsdom variant
 * crashed with `Worker exited unexpectedly` on Windows + Node 24 due to a
 * `@testing-library/preact` `fireEvent` × jsdom × Node 24 IPC interaction
 * (see `docs/questions.md` Q22 for the full diagnostic chain). Running the
 * same component inside a real Chromium browser via Playwright CT bypasses
 * the crash entirely and still exercises every behavior the original suite
 * covered.
 *
 * Translation conventions used here:
 *
 * - `render(<C />)` → `await mount(<C />)` (returns a `Locator`).
 * - `screen.getByText('X')` → `component.getByText('X')`.
 * - `expect(el).toBeTruthy()` → `await expect(locator).toBeVisible()`.
 * - `expect(screen.queryByText('X')).toBeNull()` →
 *   `await expect(component.getByText('X')).toHaveCount(0)`.
 * - `fireEvent.click(el)` → `await locator.click()`.
 * - `fireEvent.keyDown(el, { key: 'Enter' })` → `await locator.press('Enter')`.
 * - `vi.fn()` callbacks → inline `const calls: T[] = []; (v) => calls.push(v)`.
 *   Playwright CT serializes function props as RPC bridges; the closure
 *   executes in the test process so plain array assertions work.
 *
 * Read alongside `.specify/features/q22-playwright-ct.md` and
 * `docs/architecture/testing-runners.md` for the rationale.
 */
import { test, expect } from '@playwright/experimental-ct-react';
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

test.describe('FilterBar (Playwright CT)', () => {
    test('renders with data-component attribute', async ({ mount }) => {
        const component = await mount(<FilterBar />);
        await expect(component).toHaveAttribute('data-component', 'filter-bar');
    });

    test('renders category buttons', async ({ mount }) => {
        const component = await mount(<FilterBar categories={categories} />);
        await expect(component.getByText('Category A')).toBeVisible();
        await expect(component.getByText('Category B')).toBeVisible();
    });

    test('renders tag badges', async ({ mount }) => {
        const component = await mount(<FilterBar tags={tags} />);
        await expect(component.getByText('Tag X')).toBeVisible();
        await expect(component.getByText('Tag Y')).toBeVisible();
        await expect(component.getByText('Tag Z')).toBeVisible();
    });

    test('shows Categories legend when categories provided', async ({ mount }) => {
        const component = await mount(<FilterBar categories={categories} />);
        await expect(component.getByText('Categories')).toBeVisible();
    });

    test('shows Tags legend when tags provided', async ({ mount }) => {
        const component = await mount(<FilterBar tags={tags} />);
        await expect(component.getByText('Tags')).toBeVisible();
    });

    test('selects category on click', async ({ mount }) => {
        const calls: (string | null)[] = [];
        const component = await mount(
            <FilterBar
                categories={categories}
                onCategoryChange={(v) => calls.push(v)}
            />,
        );
        await component.getByText('Category A').click();
        expect(calls).toEqual(['cat-1']);
    });

    test('toggles category off on second click', async ({ mount }) => {
        const calls: (string | null)[] = [];
        const component = await mount(
            <FilterBar
                categories={categories}
                onCategoryChange={(v) => calls.push(v)}
            />,
        );
        await component.getByText('Category A').click();
        await component.getByText('Category A').click();
        expect(calls).toEqual(['cat-1', null]);
    });

    test('switches category selection', async ({ mount }) => {
        const calls: (string | null)[] = [];
        const component = await mount(
            <FilterBar
                categories={categories}
                onCategoryChange={(v) => calls.push(v)}
            />,
        );
        await component.getByText('Category A').click();
        await component.getByText('Category B').click();
        expect(calls).toEqual(['cat-1', 'cat-2']);
    });

    test('multi-selects tags', async ({ mount }) => {
        const calls: string[][] = [];
        const component = await mount(
            <FilterBar tags={tags} onTagsChange={(v) => calls.push(v)} />,
        );
        await component.getByText('Tag X').click();
        await component.getByText('Tag Y').click();
        expect(calls).toEqual([['tag-1'], ['tag-1', 'tag-2']]);
    });

    test('deselects tag on second click', async ({ mount }) => {
        const calls: string[][] = [];
        const component = await mount(
            <FilterBar tags={tags} onTagsChange={(v) => calls.push(v)} />,
        );
        await component.getByText('Tag X').click();
        await component.getByText('Tag X').click();
        expect(calls).toEqual([['tag-1'], []]);
    });

    test('shows clear button when filters active', async ({ mount }) => {
        const component = await mount(<FilterBar categories={categories} />);
        await expect(component.getByText('Clear filters')).toHaveCount(0);
        await component.getByText('Category A').click();
        await expect(component.getByText('Clear filters')).toBeVisible();
    });

    test('clears all filters on clear button click', async ({ mount }) => {
        const categoryCalls: (string | null)[] = [];
        const tagCalls: string[][] = [];
        const component = await mount(
            <FilterBar
                categories={categories}
                tags={tags}
                onCategoryChange={(v) => categoryCalls.push(v)}
                onTagsChange={(v) => tagCalls.push(v)}
            />,
        );
        await component.getByText('Category A').click();
        await component.getByText('Tag X').click();
        await component.getByText('Clear filters').click();
        expect(categoryCalls.at(-1)).toBeNull();
        expect(tagCalls.at(-1)).toEqual([]);
    });

    test('sets aria-pressed on selected category', async ({ mount }) => {
        const component = await mount(<FilterBar categories={categories} />);
        const catA = component.getByText('Category A');
        await expect(catA).toHaveAttribute('aria-pressed', 'false');
        await catA.click();
        await expect(catA).toHaveAttribute('aria-pressed', 'true');
    });

    test('sets aria-pressed on selected tags', async ({ mount }) => {
        const component = await mount(<FilterBar tags={tags} />);
        const tagX = component.getByText('Tag X');
        await expect(tagX).toHaveAttribute('aria-pressed', 'false');
        await tagX.click();
        await expect(tagX).toHaveAttribute('aria-pressed', 'true');
    });

    test('toggles tag via Enter key', async ({ mount }) => {
        const calls: string[][] = [];
        const component = await mount(
            <FilterBar tags={tags} onTagsChange={(v) => calls.push(v)} />,
        );
        await component.getByText('Tag X').press('Enter');
        expect(calls).toEqual([['tag-1']]);
    });

    test('toggles tag via Space key', async ({ mount }) => {
        const calls: string[][] = [];
        const component = await mount(
            <FilterBar tags={tags} onTagsChange={(v) => calls.push(v)} />,
        );
        await component.getByText('Tag X').press('Space');
        expect(calls).toEqual([['tag-1']]);
    });
});
