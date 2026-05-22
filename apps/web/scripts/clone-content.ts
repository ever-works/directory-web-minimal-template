/**
 * Prebuild script: Clone the data repository into .content/
 *
 * Runs before `astro dev` and `astro build`.
 * Skips if .content/ already exists (idempotent).
 * Skips if CONTENT_PATH is set (using local filesystem adapter).
 *
 * Environment variables:
 * - DATA_REPOSITORY: Git HTTPS URL (required unless CONTENT_PATH is set)
 * - GH_TOKEN: GitHub PAT for private repos (optional)
 * - CONTENT_PATH: Skip clone, use local path instead
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CONTENT_DIR = resolve(process.cwd(), '.content');

function main(): void {
    // Skip if using local filesystem adapter
    if (process.env.CONTENT_PATH) {
        console.log('[clone-content] CONTENT_PATH is set, skipping git clone.');
        return;
    }

    const repo = process.env.DATA_REPOSITORY;

    // Keep existing sample content when no repo is configured. When a real
    // data repo is configured, replace non-git seed content with the clone.
    if (existsSync(CONTENT_DIR)) {
        if (!repo || existsSync(join(CONTENT_DIR, '.git'))) {
            console.log('[clone-content] .content/ already exists, skipping clone.');
            return;
        }
        console.log('[clone-content] Removing non-git .content/ before cloning DATA_REPOSITORY.');
        rmSync(CONTENT_DIR, { recursive: true, force: true });
    }

    if (!repo) {
        console.warn('[clone-content] DATA_REPOSITORY not set. Creating empty .content/ directory.');
        mkdirSync(CONTENT_DIR, { recursive: true });
        return;
    }

    const token = process.env.GH_TOKEN;

    // Build the clone URL with auth token if provided
    let cloneUrl = repo;
    if (token && repo.startsWith('https://')) {
        cloneUrl = repo.replace('https://', `https://x-access-token:${token}@`);
    }

    console.log(`[clone-content] Cloning ${repo} (default branch)...`);

    try {
        execSync(
            `git clone --depth 1 "${cloneUrl}" "${CONTENT_DIR}"`,
            { stdio: 'inherit' },
        );
        console.log('[clone-content] Clone complete.');
    } catch {
        console.error('[clone-content] Failed to clone data repository.');
        console.error('[clone-content] Check DATA_REPOSITORY and GH_TOKEN environment variables.');
        process.exit(1);
    }
}

main();
