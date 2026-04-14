import { test, expect } from '@playwright/test';

/**
 * Events sample — static pages E2E tests.
 * Verifies pages/[slug] route for sample-events data:
 * - .content/pages/about.md
 * - .content/pages/submit.md
 */

test.describe('Events Static Pages', () => {
	test('should render about page', async ({ page }) => {
		await page.goto('/pages/about/');
		await expect(page).toHaveTitle(/About/);
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('should render submit page', async ({ page }) => {
		await page.goto('/pages/submit/');
		await expect(page).toHaveTitle(/Submit/i);
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('should display breadcrumbs on static pages', async ({ page }) => {
		await page.goto('/pages/about/');
		const breadcrumbNav = page.locator('[data-component="breadcrumb-nav"]');
		await expect(breadcrumbNav).toBeVisible();
		await expect(breadcrumbNav.getByText('Home')).toBeVisible();
	});

	test('should have header and footer on static pages', async ({ page }) => {
		await page.goto('/pages/about/');
		await expect(page.locator('header')).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
	});

	test('should render markdown content on about page', async ({ page }) => {
		await page.goto('/pages/about/');
		const article = page.locator('article');
		await expect(article).toBeVisible();
		const text = await article.textContent();
		expect(text?.length).toBeGreaterThan(50);
	});
});
