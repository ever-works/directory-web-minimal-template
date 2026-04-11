import { test, expect } from '@playwright/test';

/**
 * Item page E2E tests.
 * Verifies item detail pages render correctly.
 */

test.describe('Item Detail Page', () => {
    test('should render item detail page', async ({ page }) => {
        await page.goto('/item/sample-item/');
        await expect(page).toHaveTitle(/Sample Item/);
    });

    test('should display item name and description', async ({ page }) => {
        await page.goto('/item/sample-item/');
        const detail = page.locator('[data-component="item-detail"]');
        await expect(detail).toBeVisible();
        await expect(detail.locator('[data-part="header"] [data-part="name"]')).toContainText('Sample Item');
        await expect(detail.locator('[data-part="header"] [data-part="description"]')).toBeVisible();
    });

    test('should display breadcrumbs', async ({ page }) => {
        await page.goto('/item/sample-item/');
        const breadcrumbs = page.locator('[data-component="breadcrumbs"]');
        await expect(breadcrumbs).toBeVisible();
        await expect(breadcrumbs.locator('a[href="/"]')).toContainText('Home');
    });

    test('should have source link', async ({ page }) => {
        await page.goto('/item/sample-item/');
        const link = page.locator('[data-component="item-detail"] [data-part="source-link"]').first();
        await expect(link).toBeAttached();
        await expect(link).toHaveAttribute('target', '_blank');
    });

    test('should display tags', async ({ page }) => {
        await page.goto('/item/sample-item/');
        const tags = page.locator('[data-component="item-detail"] [data-part="tags"]').first();
        await expect(tags).toBeAttached();
    });
});
