---
title: Troubleshooting
description: Common issues and solutions when working with the minimal template.
---

## Build Fails with "DATA_REPOSITORY not set"

The build requires the `DATA_REPOSITORY` environment variable to know where to fetch content from.

**Solution**: Set the required environment variables before building:

```bash
# Local development — create a .env file in apps/web/
DATA_REPOSITORY=https://github.com/your-org/your-content-repo
GH_TOKEN=ghp_your_token_here
GITHUB_BRANCH=main
SITE_URL=https://my-directory.com
```

For Vercel deployments, add these in the dashboard under **Settings > Environment Variables**. For GitHub Actions, add them as repository secrets under **Settings > Secrets and variables > Actions**.

## TypeScript Errors After Adding New Components

When you add or modify components, TypeScript may report errors that were not present before.

**Solution**: Run the type checker to see all errors at once:

```bash
pnpm typecheck
```

Common causes:
- Missing type imports — ensure you import types from `@ever-works/core`
- Props mismatch — check the component interface for required vs optional props
- Astro component types — use `astro check` for Astro-specific type issues

```bash
# Run Astro's own checker for .astro file issues
pnpm --filter @ever-works/web-minimal astro check
```

## pnpm Install Fails

Installation issues are typically caused by Node.js version mismatches or a corrupted store.

**Solution**:

1. Verify your Node.js version:
   ```bash
   node --version
   # Should be 20+ (24 LTS recommended)
   ```

2. Clear the pnpm store and reinstall:
   ```bash
   pnpm store prune
   rm -rf node_modules
   rm -rf apps/*/node_modules packages/*/node_modules
   pnpm install
   ```

3. If using `nvm` or `fnm`, make sure you are on the correct Node version:
   ```bash
   nvm use 24
   pnpm install
   ```

## Content Not Loading

Items, categories, or pages are missing or empty at runtime.

**Solution**:

1. Check that the `.content/` directory exists in `apps/web/`:
   ```bash
   ls apps/web/.content/
   ```

2. Verify YAML format — YAML is whitespace-sensitive. Common mistakes include:
   - Using tabs instead of spaces for indentation
   - Missing quotes around values with special characters
   - Incorrect nesting levels

3. Validate your YAML files:
   ```bash
   # Install a YAML linter
   npx yaml-lint apps/web/.content/config.yml
   ```

4. Check that required fields exist in each item file:
   ```yaml
   name: "Item Name"
   slug: "item-name"
   description: "A description."
   status: "approved"
   updated_at: "2026-01-01 00:00"
   ```

5. If using `DATA_REPOSITORY`, confirm the repo URL and branch are correct and the token has read access.

## Plugin Not Working

A plugin is enabled but its feature does not appear on the site.

**Solution**:

1. Check `apps/web/plugins.config.ts` — verify the plugin is listed in the `definePlugins` array:
   ```typescript
   import { definePlugins } from '@ever-works/plugins';
   import { searchPlugin } from '@ever-works/plugin-search';

   export default definePlugins([
       searchPlugin(),
       // Other plugins...
   ]);
   ```

2. Verify the plugin package is in your dependencies:
   ```bash
   pnpm --filter @ever-works/web-minimal list | grep plugin
   ```

3. Check for missing peer dependencies — plugins may depend on other packages:
   ```bash
   pnpm install
   ```

4. Restart the dev server after changing `plugins.config.ts`:
   ```bash
   # Stop the current server (Ctrl+C), then:
   pnpm dev:web
   ```

## E2E Tests Failing

Playwright tests fail or cannot start.

**Solution**:

1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. Make sure the dev server is running (some test configurations expect it):
   ```bash
   pnpm dev:web
   ```

3. Run the tests with verbose output to see what is failing:
   ```bash
   pnpm --filter @ever-works/web-e2e test:e2e --reporter=list
   ```

4. If tests time out, increase the timeout or check that the dev server starts on the expected port (default `4321`).

5. Run a single test file to isolate issues:
   ```bash
   npx playwright test tests/home.spec.ts
   ```

## Dark Mode Flicker

A flash of the wrong color scheme appears on page load before dark mode kicks in.

**Solution**: Add a flash-prevention script in the `<head>` of your layout, before any stylesheets:

```astro
---
// src/layouts/BaseLayout.astro
---
<html>
  <head>
    <script is:inline>
      // Prevent dark mode flash — runs synchronously before paint
      (function () {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      })();
    </script>
    <!-- stylesheets go here -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

The `is:inline` directive tells Astro to keep the script inline (not bundled), so it executes before the page paints.

## Interactive Components Not Working

Search bars, filter dropdowns, dark mode toggles, or other interactive elements render but do not respond to user input.

**Solution**: Astro components are static by default. Interactive components need a client directive to hydrate on the client side:

```astro
---
import SearchBar from '../components/SearchBar.tsx';
import DarkModeToggle from '../components/DarkModeToggle.tsx';
---

<!-- Hydrate on page load -->
<SearchBar client:load />

<!-- Hydrate when visible in viewport -->
<DarkModeToggle client:visible />
```

Available directives:
| Directive | When it hydrates |
|-----------|-----------------|
| `client:load` | Immediately on page load |
| `client:idle` | After page has finished initial load |
| `client:visible` | When the component scrolls into view |
| `client:media` | When a CSS media query is met |
| `client:only` | Skips server rendering entirely |

If you forget the `client:` directive, the component renders as static HTML with no JavaScript — event handlers will not fire.

## Port Already in Use

The dev server fails to start because port 4321 is already taken.

**Solution**:

```bash
# Find what is using the port
lsof -i :4321

# Kill the process or use a different port
pnpm --filter @ever-works/web-minimal dev -- --port 4322
```

## Build Succeeds but Pages Are Empty

The build completes without errors, but the deployed site shows blank pages.

**Solution**:

1. Check the build output:
   ```bash
   ls apps/web/dist/
   ```
   You should see `index.html` and other HTML files.

2. Verify that content was fetched at build time — look for warnings in the build log about missing content or empty data arrays.

3. Ensure the output directory in your hosting config points to `apps/web/dist`, not the monorepo root.

## Next Steps

- [Quickstart](/guides/quickstart/) — Initial project setup
- [Deployment](/guides/deployment/) — Deploy to Vercel and other hosts
- [Interactive Components](/guides/interactive-components/) — Add search, filters, dark mode
