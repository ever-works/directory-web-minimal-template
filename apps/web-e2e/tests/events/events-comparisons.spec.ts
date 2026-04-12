import { test, expect } from '@playwright/test';

/**
 * Comparisons page E2E tests for sample-events.
 * Verifies comparison listing and detail pages:
 *   - "React Summit vs Next.js Conf" (slug: react-summit-vs-next-conf)
 *   - "AI Dev Summit vs MLOps Workshop" (slug: ai-dev-summit-vs-mlops-workshop)
 * Tests run against sample-events on port 4325.
 */

test.describe('Events Comparisons Index', () => {
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

    test('should list both comparison entries', async ({ page }) => {
        await page.goto('/comparisons/');
        const cards = page.locator('a[href^="/comparison/"]');
        await expect(cards).toHaveCount(2);
    });

    test('should display comparison titles', async ({ page }) => {
        await page.goto('/comparisons/');
        await expect(
            page.getByText('React Summit vs Next.js Conf').first()
        ).toBeVisible();
        await expect(
            page.getByText('AI Dev Summit vs MLOps Workshop').first()
        ).toBeVisible();
    });

    test('should show event names on comparison cards', async ({ page }) => {
        await page.goto('/comparisons/');
        await expect(page.getByText('React Summit').first()).toBeVisible();
        await expect(page.getByText('Next.js Conf').first()).toBeVisible();
        await expect(page.getByText('AI Dev Summit').first()).toBeVisible();
        await expect(page.getByText('MLOps Workshop').first()).toBeVisible();
    });

    test('should link each comparison to /comparison/{slug}', async ({ page }) => {
        await page.goto('/comparisons/');
        await expect(
            page.locator('a[href="/comparison/react-summit-vs-next-conf"]')
        ).toBeVisible();
        await expect(
            page.locator('a[href="/comparison/ai-dev-summit-vs-mlops-workshop"]')
        ).toBeVisible();
    });

    test('should navigate from comparisons index to comparison detail', async ({ page }) => {
        await page.goto('/comparisons/');
        const link = page
            .locator('a[href="/comparison/react-summit-vs-next-conf"]')
            .first();
        await link.click();
        await expect(page).toHaveURL(/\/comparison\/react-summit-vs-next-conf/);
    });
});

test.describe('Events Comparison Detail — React Summit vs Next.js Conf', () => {
    test('should render comparison detail page', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        await expect(page).toHaveTitle(/React Summit vs Next\.js Conf/);
    });

    test('should display comparison title as heading', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('React Summit vs Next.js Conf');
    });

    test('should display comparison summary', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        await expect(
            page.getByText(/two premier React ecosystem conferences/i)
        ).toBeVisible();
    });

    test('should show both contestant names', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        const contestants = page.locator('h2');
        await expect(contestants.filter({ hasText: 'React Summit' })).toBeVisible();
        await expect(contestants.filter({ hasText: 'Next.js Conf' })).toBeVisible();
    });

    test('should display the dimensions comparison table', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // Table headers
        const headers = table.locator('th');
        await expect(headers.filter({ hasText: 'Dimension' })).toBeVisible();
        await expect(headers.filter({ hasText: 'React Summit' })).toBeVisible();
        await expect(headers.filter({ hasText: 'Next.js Conf' })).toBeVisible();
    });

    test('should render all dimension rows', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        const table = page.locator('table');
        // react-summit-vs-next-conf has 4 dimensions
        const rows = table.locator('tbody tr');
        await expect(rows).toHaveCount(4);

        // Verify dimension names are present
        await expect(table.getByText('Audience Size').first()).toBeVisible();
        await expect(table.getByText('Cost').first()).toBeVisible();
        await expect(table.getByText('Networking').first()).toBeVisible();
        await expect(table.getByText('Content Depth').first()).toBeVisible();
    });

    test('should display breadcrumb navigation', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        const breadcrumbNav = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbNav).toBeVisible();
        await expect(breadcrumbNav.getByText('Comparisons')).toBeVisible();
        await expect(
            breadcrumbNav.getByText('React Summit vs Next.js Conf')
        ).toBeVisible();
    });

    test('should display verdict section', async ({ page }) => {
        await page.goto('/comparison/react-summit-vs-next-conf/');
        await expect(page.getByText('Verdict')).toBeVisible();
    });
});

test.describe('Events Comparison Detail — AI Dev Summit vs MLOps Workshop', () => {
    test('should render comparison detail page', async ({ page }) => {
        await page.goto('/comparison/ai-dev-summit-vs-mlops-workshop/');
        await expect(page).toHaveTitle(/AI Dev Summit vs MLOps Workshop/);
    });

    test('should display comparison title as heading', async ({ page }) => {
        await page.goto('/comparison/ai-dev-summit-vs-mlops-workshop/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('AI Dev Summit vs MLOps Workshop');
    });

    test('should display the dimensions comparison table', async ({ page }) => {
        await page.goto('/comparison/ai-dev-summit-vs-mlops-workshop/');
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // ai-dev-summit-vs-mlops-workshop has 4 dimensions
        const rows = table.locator('tbody tr');
        await expect(rows).toHaveCount(4);

        // Verify dimension names
        await expect(table.getByText('Hands-On Learning').first()).toBeVisible();
        await expect(table.getByText('Topic Breadth').first()).toBeVisible();
        await expect(table.getByText('Networking').first()).toBeVisible();
        await expect(table.getByText('Cost Effectiveness').first()).toBeVisible();
    });

    test('should display verdict section', async ({ page }) => {
        await page.goto('/comparison/ai-dev-summit-vs-mlops-workshop/');
        await expect(page.getByText('Verdict')).toBeVisible();
    });
});
