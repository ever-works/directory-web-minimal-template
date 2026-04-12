import { test, expect } from '@playwright/test';

/**
 * Item detail page E2E tests for sample-events.
 * Verifies event detail pages render correctly with event-specific metadata.
 * Tests run against sample-events with item: react-summit (Conference category).
 */

test.describe('Event Detail Page', () => {
    test('should render event detail page with title', async ({ page }) => {
        await page.goto('/item/react-summit/');
        await expect(page).toHaveTitle(/React Summit/);
    });

    test('should display event name as heading', async ({ page }) => {
        await page.goto('/item/react-summit/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('React Summit');
    });

    test('should display breadcrumbs', async ({ page }) => {
        await page.goto('/item/react-summit/');
        const breadcrumbs = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbs).toBeVisible();
        await expect(breadcrumbs.locator('a[href="/"]')).toContainText('Home');
    });

    test('should have source link', async ({ page }) => {
        await page.goto('/item/react-summit/');
        const link = page.locator('a[target="_blank"]').first();
        await expect(link).toBeAttached();
    });

    test('should display tags', async ({ page }) => {
        await page.goto('/item/react-summit/');
        // React Summit has tags: web, keynote, networking
        const tagLinks = page.locator('a[href^="/tag/"]');
        const count = await tagLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should display event location metadata', async ({ page }) => {
        await page.goto('/item/react-summit/');
        await expect(page.locator('dd').getByText('Amsterdam, Netherlands')).toBeVisible();
    });

    test('should display event format metadata', async ({ page }) => {
        await page.goto('/item/react-summit/');
        await expect(page.locator('dd').getByText('Hybrid')).toBeVisible();
    });

    test('should display event price metadata', async ({ page }) => {
        await page.goto('/item/react-summit/');
        await expect(page.getByText('$599')).toBeVisible();
    });

    test('should display event speakers metadata', async ({ page }) => {
        await page.goto('/item/react-summit/');
        await expect(page.getByText('Kent C. Dodds')).toBeVisible();
    });

    test('should display event attendees metadata', async ({ page }) => {
        await page.goto('/item/react-summit/');
        await expect(page.getByText('2000+')).toBeVisible();
    });
});

test.describe('Event Detail Page — Free Virtual Event', () => {
    test('should render Next.js Conf detail page', async ({ page }) => {
        await page.goto('/item/next-conf/');
        await expect(page).toHaveTitle(/Next\.js Conf/);

        const heading = page.locator('h1');
        await expect(heading).toContainText('Next.js Conf');
    });

    test('should show free pricing', async ({ page }) => {
        await page.goto('/item/next-conf/');
        await expect(page.locator('dd').getByText('Free')).toBeVisible();
    });

    test('should show online format', async ({ page }) => {
        await page.goto('/item/next-conf/');
        await expect(page.locator('dd').getByText('Online')).toBeVisible();
    });

    test('should show virtual location', async ({ page }) => {
        await page.goto('/item/next-conf/');
        await expect(page.locator('dd').getByText('Virtual')).toBeVisible();
    });
});

test.describe('Event Detail Page — Workshop', () => {
    test('should render MLOps Workshop detail page', async ({ page }) => {
        await page.goto('/item/mlops-workshop/');
        await expect(page).toHaveTitle(/MLOps Workshop/);

        const heading = page.locator('h1');
        await expect(heading).toContainText('MLOps Workshop');
    });

    test('should show in-person format', async ({ page }) => {
        await page.goto('/item/mlops-workshop/');
        await expect(page.getByText('In-Person')).toBeVisible();
    });

    test('should show workshop price', async ({ page }) => {
        await page.goto('/item/mlops-workshop/');
        await expect(page.getByText('$450')).toBeVisible();
    });

    test('should show workshop location', async ({ page }) => {
        await page.goto('/item/mlops-workshop/');
        await expect(page.getByText('New York')).toBeVisible();
    });
});
