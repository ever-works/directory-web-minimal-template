import { test, expect } from '@playwright/test';

/**
 * Category page E2E tests for sample-events.
 * Verifies category listing and detail pages for event categories:
 *   Conference, Meetup, Workshop, Hackathon
 * Tests run against sample-events on port 4325.
 */

test.describe('Events Categories Index', () => {
    test('should render categories index page', async ({ page }) => {
        await page.goto('/categories/');
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should display page heading', async ({ page }) => {
        await page.goto('/categories/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
    });

    test('should list all 4 event categories', async ({ page }) => {
        await page.goto('/categories/');
        await expect(page.getByText('Conference')).toBeVisible();
        await expect(page.getByText('Meetup')).toBeVisible();
        await expect(page.getByText('Workshop')).toBeVisible();
        await expect(page.getByText('Hackathon')).toBeVisible();
    });

    test('should link each category to /category/{slug}', async ({ page }) => {
        await page.goto('/categories/');
        await expect(page.locator('a[href="/category/conference"]')).toBeVisible();
        await expect(page.locator('a[href="/category/meetup"]')).toBeVisible();
        await expect(page.locator('a[href="/category/workshop"]')).toBeVisible();
        await expect(page.locator('a[href="/category/hackathon"]')).toBeVisible();
    });

    test('should navigate from categories index to category page', async ({ page }) => {
        await page.goto('/categories/');
        const link = page.locator('a[href="/category/conference"]').first();
        await link.click();
        await expect(page).toHaveURL(/\/category\/conference/);
    });
});

test.describe('Events Category Detail — Conference', () => {
    test('should render conference category page', async ({ page }) => {
        await page.goto('/category/conference/');
        await expect(page).toHaveTitle(/Conference/);
    });

    test('should display items in conference category', async ({ page }) => {
        await page.goto('/category/conference/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        // Conferences: react-summit, ai-dev-summit, next-conf, kubecon-europe, github-universe
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Events Category Detail — Meetup', () => {
    test('should render meetup category page', async ({ page }) => {
        await page.goto('/category/meetup/');
        await expect(page).toHaveTitle(/Meetup/);
    });

    test('should display items in meetup category', async ({ page }) => {
        await page.goto('/category/meetup/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Events Category Detail — Workshop', () => {
    test('should render workshop category page', async ({ page }) => {
        await page.goto('/category/workshop/');
        await expect(page).toHaveTitle(/Workshop/);
    });

    test('should display items in workshop category', async ({ page }) => {
        await page.goto('/category/workshop/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Events Category Detail — Hackathon', () => {
    test('should render hackathon category page', async ({ page }) => {
        await page.goto('/category/hackathon/');
        await expect(page).toHaveTitle(/Hackathon/);
    });

    test('should display items in hackathon category', async ({ page }) => {
        await page.goto('/category/hackathon/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Events Tags', () => {
    test('should render tags index page', async ({ page }) => {
        await page.goto('/tags/');
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should render individual tag page', async ({ page }) => {
        await page.goto('/tag/ai/');
        await expect(page).toHaveTitle(/AI/);
    });
});
