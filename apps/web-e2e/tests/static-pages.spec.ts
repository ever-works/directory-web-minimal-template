import { test, expect } from '@playwright/test';

/**
 * Static pages E2E tests.
 * Verifies the pages/[slug] route renders static content pages.
 * Uses sample-basic data: .content/pages/about.md
 */

test.describe('Static Pages', () => {
	test('should render about page at /pages/about', async ({ page }) => {
		await page.goto('/pages/about/');
		await expect(page).toHaveTitle(/About/);
	});

	test('should display page heading', async ({ page }) => {
		await page.goto('/pages/about/');
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
		await expect(heading).toHaveText('About React UI Components');
	});

	test('should render markdown body content', async ({ page }) => {
		await page.goto('/pages/about/');
		// The about page contains sections rendered from markdown
		await expect(page.getByText('What We Cover')).toBeVisible();
		await expect(page.getByText('How We Curate')).toBeVisible();
	});

	test('should display breadcrumb-style navigation', async ({ page }) => {
		await page.goto('/pages/about/');
		// Static pages have breadcrumb navigation in main content area
		// The breadcrumb nav is inside <main> and links back to Home
		const mainContent = page.locator('main');
		const breadcrumbNav = mainContent.locator('nav').first();
		await expect(breadcrumbNav).toBeVisible();
		await expect(breadcrumbNav.getByText('Home')).toBeVisible();
	});

	test('should have proper meta tags', async ({ page }) => {
		await page.goto('/pages/about/');
		// Title should include page title
		const title = await page.title();
		expect(title).toContain('About');
	});

	test('should have consistent header and footer', async ({ page }) => {
		await page.goto('/pages/about/');
		const header = page.locator('header');
		await expect(header).toBeVisible();

		const footer = page.locator('footer');
		await expect(footer).toBeVisible();
	});

	test('should render markdown body as proper HTML', async ({ page }) => {
		await page.goto('/pages/about/');
		const article = page.locator('article');
		await expect(article).toBeVisible();

		// Markdown headings should be rendered as <h2> elements
		const h2s = article.locator('h2');
		await expect(h2s.filter({ hasText: 'What We Cover' })).toBeVisible();
		await expect(h2s.filter({ hasText: 'How We Curate' })).toBeVisible();

		// Markdown lists should be rendered as <li> elements
		const listItems = article.locator('li');
		const count = await listItems.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should 404 for non-existent static page', async ({ page }) => {
		const response = await page.goto('/pages/does-not-exist/');
		expect(response?.status()).toBe(404);
	});
});
