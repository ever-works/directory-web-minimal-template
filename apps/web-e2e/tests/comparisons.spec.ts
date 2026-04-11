import { test, expect } from '@playwright/test';

/**
 * Comparisons page E2E tests.
 * Verifies comparison listing and detail pages using sample-basic data:
 * - "Radix UI vs Headless UI" (slug: radix-ui-vs-headless-ui)
 * - "shadcn/ui vs Chakra UI" (slug: shadcn-ui-vs-chakra-ui)
 */

test.describe('Comparisons Index', () => {
    test('should render comparisons index page', async ({ page }) => {
        await page.goto('/comparisons/');
        await expect(page).toHaveTitle(/Comparisons/);
    });

    test('should display page heading', async ({ page }) => {
        await page.goto('/comparisons/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Comparisons');
    });

    test('should list comparison entries', async ({ page }) => {
        await page.goto('/comparisons/');
        const cards = page.locator('a[href^="/comparison/"]');
        await expect(cards).toHaveCount(2);
    });

    test('should display comparison titles', async ({ page }) => {
        await page.goto('/comparisons/');
        await expect(page.getByText('Radix UI vs Headless UI').first()).toBeVisible();
        await expect(page.getByText('shadcn/ui vs Chakra UI').first()).toBeVisible();
    });

    test('should show item names on comparison cards', async ({ page }) => {
        await page.goto('/comparisons/');
        // Each comparison card shows item_a_name and item_b_name as badges
        await expect(page.getByText('Radix UI').first()).toBeVisible();
        await expect(page.getByText('Headless UI').first()).toBeVisible();
        await expect(page.getByText('shadcn/ui').first()).toBeVisible();
        await expect(page.getByText('Chakra UI').first()).toBeVisible();
    });

    test('should link each comparison to /comparison/{slug}', async ({ page }) => {
        await page.goto('/comparisons/');
        const radixVsHeadlessLink = page.locator(
            'a[href="/comparison/radix-ui-vs-headless-ui"]'
        );
        await expect(radixVsHeadlessLink).toBeVisible();

        const shadcnVsChakraLink = page.locator(
            'a[href="/comparison/shadcn-ui-vs-chakra-ui"]'
        );
        await expect(shadcnVsChakraLink).toBeVisible();
    });

    test('should navigate from comparisons index to comparison detail', async ({ page }) => {
        await page.goto('/comparisons/');
        const link = page.locator('a[href="/comparison/radix-ui-vs-headless-ui"]').first();
        await link.click();
        await expect(page).toHaveURL(/\/comparison\/radix-ui-vs-headless-ui/);
    });
});

test.describe('Comparison Detail', () => {
    test('should render comparison detail page', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        await expect(page).toHaveTitle(/Radix UI vs Headless UI/);
    });

    test('should display comparison title as heading', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Radix UI vs Headless UI');
    });

    test('should display comparison summary', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        await expect(
            page.getByText(/comparison of two leading headless component libraries/i)
        ).toBeVisible();
    });

    test('should show both contestant names', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        // Contestants are shown as h2 headings inside linked cards
        const contestants = page.locator('h2');
        await expect(contestants.filter({ hasText: 'Radix UI' })).toBeVisible();
        await expect(contestants.filter({ hasText: 'Headless UI' })).toBeVisible();
    });

    test('should display the dimensions comparison table', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // Table headers should include dimension name and both item names
        const headers = table.locator('th');
        await expect(headers.filter({ hasText: 'Dimension' })).toBeVisible();
        await expect(headers.filter({ hasText: 'Radix UI' })).toBeVisible();
        await expect(headers.filter({ hasText: 'Headless UI' })).toBeVisible();
    });

    test('should render all dimension rows', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        const table = page.locator('table');
        // radix-ui-vs-headless-ui has 5 dimensions
        const rows = table.locator('tbody tr');
        await expect(rows).toHaveCount(5);

        // Verify dimension names are present
        await expect(table.getByText('Component Variety').first()).toBeVisible();
        await expect(table.getByText('Accessibility').first()).toBeVisible();
        await expect(table.getByText('Ease of Integration').first()).toBeVisible();
        await expect(table.getByText('TypeScript Support').first()).toBeVisible();
        await expect(table.getByText('Community & Ecosystem').first()).toBeVisible();
    });

    test('should display scores in dimension rows', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        // Scores are rendered as "N/10" text
        const scores = page.getByText(/\d+\/10/);
        // 5 dimensions x 2 items = 10 score labels
        await expect(scores).toHaveCount(10);
    });

    test('should display breadcrumb navigation', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        const breadcrumbNav = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbNav).toBeVisible();
        await expect(breadcrumbNav.getByText('Comparisons')).toBeVisible();
        await expect(
            breadcrumbNav.getByText('Radix UI vs Headless UI')
        ).toBeVisible();
    });

    test('should display verdict section', async ({ page }) => {
        await page.goto('/comparison/radix-ui-vs-headless-ui/');
        await expect(page.getByText('Verdict')).toBeVisible();
        // Verdict winner for this comparison is "tie"
        await expect(page.getByText('Result: Tie')).toBeVisible();
    });

    test('should render shadcn-ui-vs-chakra-ui comparison', async ({ page }) => {
        await page.goto('/comparison/shadcn-ui-vs-chakra-ui/');
        await expect(page).toHaveTitle(/shadcn\/ui vs Chakra UI/);

        const heading = page.locator('h1');
        await expect(heading).toHaveText('shadcn/ui vs Chakra UI');

        // This comparison has 5 dimensions too
        const table = page.locator('table');
        await expect(table).toBeVisible();
        const rows = table.locator('tbody tr');
        await expect(rows).toHaveCount(5);

        // Verdict winner is item_a (shadcn/ui)
        await expect(page.getByText('Winner: shadcn/ui')).toBeVisible();
    });
});
