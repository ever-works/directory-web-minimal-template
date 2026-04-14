import { test, expect } from '@playwright/test';

/**
 * Git sample — static pages E2E tests.
 * Verifies pages/[slug] route for sample-git data:
 * - .content/pages/about.en.md → /pages/about.en/ (title: "About Time Tracking Directory")
 * - .content/pages/cookies.en.md → /pages/cookies.en/ (title: "Cookie Policy")
 * - .content/pages/privacy-policy.en.md → /pages/privacy-policy.en/ (title: "Privacy Policy")
 * - .content/pages/terms-of-service.en.md → /pages/terms-of-service.en/ (title: "Terms of Service")
 */

test.describe('Git Static Pages', () => {
	test('should render about page', async ({ page }) => {
		await page.goto('/pages/about.en/');
		await expect(page).toHaveTitle(/About Time Tracking Directory/);
		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
	});

	test('should render privacy policy page', async ({ page }) => {
		await page.goto('/pages/privacy-policy.en/');
		await expect(page).toHaveTitle(/Privacy Policy/);
		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
	});

	test('should render terms of service page', async ({ page }) => {
		await page.goto('/pages/terms-of-service.en/');
		await expect(page).toHaveTitle(/Terms of Service/);
		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
	});

	test('should render cookies page', async ({ page }) => {
		await page.goto('/pages/cookies.en/');
		await expect(page).toHaveTitle(/Cookie Policy/);
		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
	});

	test('should display breadcrumbs on static pages', async ({ page }) => {
		await page.goto('/pages/about.en/');
		const mainContent = page.locator('main');
		const breadcrumbNav = mainContent.locator('nav').first();
		await expect(breadcrumbNav).toBeVisible();
		await expect(breadcrumbNav.getByText('Home')).toBeVisible();
	});

	test('should have header and footer on static pages', async ({ page }) => {
		await page.goto('/pages/about.en/');
		await expect(page.locator('header')).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
	});

	test('should render markdown content as HTML with headings', async ({ page }) => {
		await page.goto('/pages/about.en/');
		const article = page.locator('article');
		await expect(article).toBeVisible();
		// The about page has h2 subheadings rendered from markdown
		const subheadings = article.locator('h2');
		const count = await subheadings.count();
		expect(count).toBeGreaterThan(0);
	});
});
