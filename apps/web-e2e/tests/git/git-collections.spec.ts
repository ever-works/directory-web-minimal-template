import { test, expect } from '@playwright/test';

/**
 * Collections E2E tests for sample-git.
 * Tests run against sample-git (Time Tracking directory) on port 4327.
 * Note: sample-git has empty collections data ([]), so tests verify empty-state rendering.
 */

test.describe('Git Collections Index', () => {
	test('should render collections index page', async ({ page }) => {
		await page.goto('/collections');
		await expect(page).toHaveTitle(/Collections/);
	});

	test('should display empty state when no collections exist', async ({ page }) => {
		await page.goto('/collections');
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
		await expect(heading).toContainText('Collections');
		// Verify empty state message is shown
		await expect(page.getByText('No collections available yet.')).toBeVisible();
	});

	test('should have navigation back to home', async ({ page }) => {
		await page.goto('/collections');
		const homeLink = page.locator('a[href="/"]').first();
		await expect(homeLink).toBeVisible();
	});
});
