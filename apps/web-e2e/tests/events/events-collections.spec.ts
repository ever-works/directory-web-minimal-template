import { test, expect } from '@playwright/test';

/**
 * Collections page E2E tests for sample-events.
 * Verifies collection listing and detail pages:
 *   - "Must-Attend 2026" (slug: must-attend-2026, 5 items)
 *   - "Free Events" (slug: free-events, 3 items)
 * Tests run against sample-events on port 4325.
 */

test.describe('Events Collections Index', () => {
    test('should render collections index page', async ({ page }) => {
        await page.goto('/collections/');
        await expect(page).toHaveTitle(/Collections/);
    });

    test('should display page heading', async ({ page }) => {
        await page.goto('/collections/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Collections');
    });

    test('should list both collection cards', async ({ page }) => {
        await page.goto('/collections/');
        const cards = page.locator('a[href^="/collection/"]');
        await expect(cards).toHaveCount(2);
    });

    test('should display collection names', async ({ page }) => {
        await page.goto('/collections/');
        await expect(page.getByText('Must-Attend 2026')).toBeVisible();
        await expect(page.getByText('Free Events')).toBeVisible();
    });

    test('should show collection descriptions', async ({ page }) => {
        await page.goto('/collections/');
        await expect(
            page.getByText('The most anticipated tech events of 2026')
        ).toBeVisible();
        await expect(
            page.getByText('High-quality tech events that are completely free')
        ).toBeVisible();
    });

    test('should show item counts on collection cards', async ({ page }) => {
        await page.goto('/collections/');
        await expect(page.getByText('5 events')).toBeVisible();
        await expect(page.getByText('3 events')).toBeVisible();
    });

    test('should link each collection to /collection/{slug}', async ({ page }) => {
        await page.goto('/collections/');
        await expect(
            page.locator('a[href="/collection/must-attend-2026"]')
        ).toBeVisible();
        await expect(
            page.locator('a[href="/collection/free-events"]')
        ).toBeVisible();
    });

    test('should navigate from collections index to collection detail', async ({ page }) => {
        await page.goto('/collections/');
        const link = page.locator('a[href="/collection/must-attend-2026"]').first();
        await link.click();
        await expect(page).toHaveURL(/\/collection\/must-attend-2026/);
    });
});

test.describe('Events Collection Detail — Must-Attend 2026', () => {
    test('should render collection detail page', async ({ page }) => {
        await page.goto('/collection/must-attend-2026/');
        await expect(page).toHaveTitle(/Must-Attend 2026/);
    });

    test('should display collection name as heading', async ({ page }) => {
        await page.goto('/collection/must-attend-2026/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Must-Attend 2026');
    });

    test('should display collection description', async ({ page }) => {
        await page.goto('/collection/must-attend-2026/');
        await expect(
            page.getByText('The most anticipated tech events of 2026')
        ).toBeVisible();
    });

    test('should render all 5 items in the collection', async ({ page }) => {
        await page.goto('/collection/must-attend-2026/');
        // Items: react-summit, next-conf, ai-dev-summit, kubecon-europe, github-universe
        const itemLinks = page.locator('a[href^="/item/"]');
        await expect(itemLinks).toHaveCount(5);
    });

    test('should display breadcrumb navigation', async ({ page }) => {
        await page.goto('/collection/must-attend-2026/');
        const breadcrumbNav = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbNav).toBeVisible();
        await expect(breadcrumbNav.getByText('Collections')).toBeVisible();
        await expect(breadcrumbNav.getByText('Must-Attend 2026')).toBeVisible();
    });
});

test.describe('Events Collection Detail — Free Events', () => {
    test('should render free events collection', async ({ page }) => {
        await page.goto('/collection/free-events/');
        await expect(page).toHaveTitle(/Free Events/);

        const heading = page.locator('h1');
        await expect(heading).toHaveText('Free Events');
    });

    test('should render all 3 items in the collection', async ({ page }) => {
        await page.goto('/collection/free-events/');
        // Items: next-conf, react-meetup-sf, open-source-hackathon
        const itemLinks = page.locator('a[href^="/item/"]');
        await expect(itemLinks).toHaveCount(3);
    });
});
