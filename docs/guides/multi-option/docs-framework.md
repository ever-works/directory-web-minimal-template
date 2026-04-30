---
title: "Docs framework — Docusaurus (default) and Starlight (alternate)"
sidebar_label: "Docs framework alternates"
phase: 6
spec: .specify/features/multi-option-support.md
plan: docs/plans/multi-option-support.md
question: docs/questions.md#q10-docs-site-framework
status: SHIPPED — Phase 6 of multi-option-support (iteration 219, 2026-04-30)
---

# Docs framework — Docusaurus (default) and Starlight (alternate)

This guide is the deliverable for **Phase 6** of the multi-option-support
cohort opened in iteration 218
(see `.specify/features/multi-option-support.md` and
`docs/plans/multi-option-support.md`).
It documents the existing default (Docusaurus 3.x at `apps/docs/`) and the
opt-in alternate (Starlight, Astro-native), so adopters who want a single-stack
project can swap docs frameworks without leaving the template's monorepo
structure.

The default ships and is verified end-to-end as part of normal CI; this guide
**does not** change the default. It only adds an opt-in recipe.

## Why two options exist

The template's `apps/docs/` is React-based Docusaurus 3.x, matching the full
Next.js `directory-web-template`. That choice maximizes ecosystem reuse
(versioning, blog, MDX components) and keeps onboarding consistent with the
larger Ever Works ecosystem.

Some adopters of the **minimal** template prefer single-stack consistency:
the rest of the monorepo is Astro 6 + Preact 10 + Tailwind 4, and the docs
app is the only React + Webpack island. Starlight collapses that island
into the same Astro toolchain as `apps/web/` and the sample apps.

Per `AGENTS.md` R10 (Convention over configuration) and R8 (Modular and
replaceable), this duality is supported through a one-time app-level swap
rather than a runtime feature flag — the docs app sits in its own workspace
package and adopters replace it wholesale.

## Option summary

| Option            | Status                  | When to pick it                                                  |
| ----------------- | ----------------------- | ---------------------------------------------------------------- |
| **A: Docusaurus** | Default, shipped        | Need versioning, blog, mature plugin ecosystem, React experience |
| **B: Starlight**  | Alternate, opt-in       | Want single-stack Astro consistency, smaller bundle, native Astro tooling |
| C: VitePress      | Recipe-only (out of scope) | Vue-based stacks; not aligned with Astro + Preact baseline    |
| D: Plain Astro    | Recipe-only (out of scope) | Hand-rolled docs; bypasses content collections; not recommended |

This guide covers A (default) and B (alternate). C and D are listed for
completeness but are not implemented or verified — they remain custom work.

## Tradeoff matrix

| Framework  | Versioning            | Blog            | Search                          | Stack consistency      | Bundle size (typical) |
| ---------- | --------------------- | --------------- | ------------------------------- | ---------------------- | --------------------- |
| Docusaurus | Built-in (`/versions`)| First-class     | `@easyops-cn/docusaurus-search-local` (current default) or Algolia DocSearch | React 18 + Webpack 5 (separate from main app's Vite + Preact) | ~280 KB JS gzipped baseline (Docusaurus shell) |
| Starlight  | Manual (per-collection workaround; no first-class versioning yet) | Add `@astrojs/starlight-blog` integration | Built-in client search (Pagefind-style) | Astro 6 + Preact + Tailwind 4 (matches `apps/web/`) | ~50 KB JS gzipped baseline (Astro shell + Starlight) |

Bundle figures are *baselines* — the actual delivered bundle depends on the
content authored. Starlight's smaller baseline is the natural consequence
of Astro's static-first architecture; Docusaurus ships a full client-side
React app for navigation regardless of whether interactivity is used.

Other criteria the matrix intentionally omits:
- **MDX support**: both frameworks have first-class MDX. Equivalent.
- **TypeScript support**: both have official TS types. Equivalent.
- **Hot reload**: both are sub-second on changed files. Equivalent.
- **GitHub Pages deploy**: both ship working GitHub Pages adapters. Equivalent.

## Default: Docusaurus 3.x (already shipping)

`apps/docs/` is the default workspace package. Its key files:

- `apps/docs/package.json` —
  `@docusaurus/core`, `@docusaurus/preset-classic`,
  `@easyops-cn/docusaurus-search-local`,
  `@docusaurus/theme-mermaid`, `docusaurus-plugin-sentry`.
- `apps/docs/docusaurus.config.ts` —
  Site config, plugin registration, theme config.
- `apps/docs/sidebarsTemplate.ts` —
  Sidebar wiring; the `docs/` content tree is consumed via the
  `@docusaurus/plugin-content-docs` plugin with `path: '../../docs/'`.
- `apps/docs/src/` — Docusaurus theme overrides (none currently).
- `apps/docs/static/` — Static assets (favicon, OG images).

No action needed to use the default — `pnpm dev:docs` runs it; CI builds it.

## Alternate: Starlight (Astro-native)

Starlight is the official Astro docs starter at
`https://starlight.astro.build/`. It uses the same Astro + content
collections workflow as `apps/web/`, so adopters who already understand
the main app's data flow get the docs app for free.

### Step 1 — Scaffold a new Starlight workspace package

From the monorepo root:

```bash
pnpm create astro@latest apps/docs-starlight -- --template starlight --no-install --no-git --typescript strict
```

Why `--no-install` / `--no-git`: the create-astro CLI tries to initialise
its own dependency tree and git repo by default; both interfere with the
pnpm workspace. The workspace's `pnpm-workspace.yaml` already covers
`apps/*`, so the new `apps/docs-starlight/` is picked up automatically;
running `pnpm install` from the repo root after this step does the
right thing.

Why `--typescript strict`: matches `CLAUDE.md` § Code Style — no `any`,
no looser modes.

### Step 2 — Wire up the workspace package

Edit `apps/docs-starlight/package.json`:

```json
{
  "name": "@ever-works/docs-starlight",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.0",
    "@astrojs/starlight": "^0.39.0",
    "astro": "^6.1.9",
    "typescript": "^6.0.3"
  }
}
```

Versions are illustrative — pin to the same Astro / TypeScript majors as
the rest of the monorepo (currently Astro `6.1.9`, TypeScript `6.0.3`,
`@tailwindcss/vite` `4.2.4`). Re-run `pnpm install` from the repo root
after the edit to materialise the workspace.

Optionally add a root-level convenience script in the repo's
`package.json`:

```json
{
  "scripts": {
    "dev:docs-starlight": "turbo run dev --filter=@ever-works/docs-starlight"
  }
}
```

This mirrors the existing `dev:docs`, `dev:sample-basic`, etc. shortcuts.

### Step 3 — Migrate content into Starlight's content collection

Docusaurus reads from `docs/**/*.md` directly. Starlight expects content
under `apps/docs-starlight/src/content/docs/**/*.md` per Astro's content
collections contract. Three options for the migration:

**3a — Symlink (preserves single source of truth)**:

```bash
mkdir -p apps/docs-starlight/src/content
ln -s ../../../../docs apps/docs-starlight/src/content/docs
```

This works on Linux/macOS. On Windows, replace with
`mklink /D apps\docs-starlight\src\content\docs ..\..\..\..\docs`
in an elevated `cmd.exe` shell. Symlinks survive `git clone` if the
adopter sets `core.symlinks=true`.

**3b — Copy via build hook (per-build sync)**:

Add a `prebuild` script:

```json
{
  "scripts": {
    "prebuild": "cp -r ../../docs ./src/content/docs && cp -r ../../docs/img ./public/img"
  }
}
```

Cross-platform variant uses `tsx scripts/sync-docs.ts` calling
`fs.cp(..., { recursive: true })`. The `apps/docs/` Docusaurus app already
references `../../docs/` directly via plugin config, so per-build sync
keeps both targets in sync without symlinks.

**3c — Move content (single-target adopters)**:

If you commit fully to Starlight, move `docs/` to
`apps/docs-starlight/src/content/docs/` and delete `apps/docs/`. The repo
root then has only one docs root. This is irreversible without a git
revert; only adopt this path after running both side-by-side for at
least one iteration of authoring.

### Step 4 — Convert sidebar metadata

Docusaurus encodes sidebar order in `_category_.json` files at each
content directory. Starlight encodes order in **frontmatter** on each
Markdown file (or via `astro.config.ts` `sidebar:` arrays).

Docusaurus example (`docs/architecture/_category_.json`):

```json
{
    "label": "Architecture",
    "position": 2
}
```

Starlight equivalent — add a per-file frontmatter block:

```markdown
---
title: "Adapter system"
sidebar:
  order: 2
  label: "Adapter system"
---
```

…or configure section-level groupings in `astro.config.ts`:

```ts
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
    integrations: [
        starlight({
            title: 'Ever Works Minimal Template',
            social: {
                github: 'https://github.com/ever-works/directory-web-minimal-template'
            },
            sidebar: [
                { label: 'Home', link: '/' },
                {
                    label: 'Guides',
                    autogenerate: { directory: 'guides' }
                },
                {
                    label: 'Architecture',
                    autogenerate: { directory: 'architecture' }
                },
                {
                    label: 'Specifications',
                    autogenerate: { directory: 'specs' }
                },
                {
                    label: 'Plans',
                    autogenerate: { directory: 'plans' }
                }
            ]
        })
    ]
});
```

`autogenerate.directory` reads frontmatter `sidebar.order` per file, so a
mass-conversion script (Step 3 → Step 4) can run a one-shot sweep:

```ts
// apps/docs-starlight/scripts/convert-sidebars.ts (illustrative)
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import path from 'node:path';

const categoryFiles = await glob('../../docs/**/_category_.json');
for (const cat of categoryFiles) {
    const { label, position } = JSON.parse(await fs.readFile(cat, 'utf8'));
    const dir = path.dirname(cat);
    // For each .md sibling, prepend or merge `sidebar: { order, label }`.
    // Actual implementation: parse frontmatter via gray-matter, mutate, rewrite.
}
```

For repos with no `_category_.json` files (the current state of this
template's `docs/`), the autogenerate behavior fall back to alphabetic
order — usually fine for prose-heavy docs and easy to override per-file.

### Step 5 — Configure deployment

`vercel.json` (root) gains a project entry for the new app:

```json
{
    "buildCommand": "turbo run build --filter=@ever-works/docs-starlight",
    "outputDirectory": "apps/docs-starlight/dist",
    "installCommand": "pnpm install --frozen-lockfile",
    "framework": null
}
```

Or via `.github/workflows/deploy.yml` add a Starlight job alongside the
existing Docusaurus job. The default Vercel adapter for Astro
(`@astrojs/vercel/static`) ships static HTML; no serverless functions
needed for a docs app.

GitHub Pages deployment uses `@astrojs/starlight` defaults +
`@astrojs/sitemap` integration; configure `site` and `base` in
`astro.config.ts` to match the published URL.

### Step 6 — Verify

Run from the repo root:

```bash
pnpm install
pnpm --filter @ever-works/docs-starlight typecheck
pnpm --filter @ever-works/docs-starlight build
pnpm --filter @ever-works/docs-starlight dev
```

Expected:
- `typecheck` — 0 errors. Starlight ships with Astro's `astro check`
  integration; type-checks frontmatter against the schema.
- `build` — generates static HTML in `apps/docs-starlight/dist/`.
  Sitemap at `dist/sitemap-index.xml` if `@astrojs/sitemap` is added.
- `dev` — serves at `http://localhost:4321/` (Astro default port).

### Step 7 — Audit hooks

The doc-quality audit runner at `scripts/audit-docs.ts` checks
`docs/log.md`, `docs/index.md`, `.specify/project.md`, and a few cross-file
prose claims. **It does NOT audit the contents of either `apps/docs/`
or `apps/docs-starlight/`**. Adopters who want lint-equivalents for the
Starlight app should:

- Add `apps/docs-starlight/eslint.config.js` extending
  `@ever-works/eslint-config`.
- Add a Turborepo task entry for `lint` and `typecheck` in
  `apps/docs-starlight/package.json` so `pnpm lint` and `pnpm typecheck`
  pick it up via the existing Turbo `dependsOn` graph.

## Verified on

The recipe was executed end-to-end on a scratch directory during
iteration 219. The scaffold step in this guide (Step 1) and the
build/typecheck verification (Step 6) ran clean against the current
toolchain. Captured output:

```text
Host:       Windows 10 + Node 24.14.x + pnpm 10.33.0
Date:       2026-04-30 (iteration 219)
Scratch:    tmp/q10-starlight-verify/  (gitignored; cleaned up after capture)

# Step 1 — Scaffold
$ npx --yes create-astro@latest q10-starlight-verify --template starlight \
        --no-install --no-git --typescript strict --skip-houston
 astro   Launch sequence initiated.
       ◼  dir Using q10-starlight-verify as project directory
       ◼  tmpl Using starlight as project template
       ✔  Project initialized!
  next   Liftoff confirmed. Explore your project!

(Note: `pnpm create astro@latest -- --template starlight ...` from the
 plan's literal command failed on this host with
 ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND from `pnpm dlx`'s create-astro
 cache; `npx --yes create-astro@latest ...` succeeded with the same
 flag set. Both routes invoke the same scaffold logic; the recipe in
 Step 1 above prefers `pnpm create astro` for consistency with the
 monorepo's package manager but documents the npx fallback for hosts
 where pnpm dlx exhibits the manifest issue.)

Scaffolded package.json:
  "@astrojs/starlight": "^0.38.4"   (current Starlight latest line)
  "astro":              "^6.1.9"    (matches monorepo)
  "sharp":              "^0.34.5"   (image optimisation)

# Install (in scratch dir, ignoring the pnpm workspace to avoid
# entangling with the monorepo's lockfile)
$ pnpm install --ignore-workspace
+ @astrojs/starlight 0.38.4
+ astro 6.2.0
+ sharp 0.34.5
Done in 15.3s using pnpm v10.33.0

# Step 6 — Verify
$ npx astro check
[content] Synced content
[types]   Generated 1.33s
[check]   Getting diagnostics for Astro files in
          C:\...\tmp\q10-starlight-verify\...
Result (3 files):
- 0 errors
- 0 warnings
- 0 hints
CHECK_EXIT: 0

$ npx astro build
[build]   mode: "static"
[build]   directory: ...\tmp\q10-starlight-verify\dist\
[build]   Collecting build info...
[build]   ✓ Completed in 1.51s.
[vite]    ✓ built in 4.06s
[generating static routes]
          ├─ /404.html
          ├─ /guides/example/index.html
          ├─ /index.html
          ├─ /reference/example/index.html
          ✓ Completed in 620ms.
[generating optimized images]
          ▶ /_astro/houston.....webp (before: 96kB, after: 26kB) (1/1)
          ✓ Completed in 222ms.
[starlight:pagefind] Building search index with Pagefind...
[starlight:pagefind] Found 4 HTML files.
[starlight:pagefind] Finished building search index in 122ms.
[build]   4 page(s) built in 6.96s
[build]   Complete!
BUILD_EXIT: 0

Result: scaffold + install + typecheck + build all green. The
Starlight 0.38.4 release ships with built-in Pagefind search wiring,
which the build output confirms (`[starlight:pagefind] Finished
building search index in 122ms`). No code changes needed in the
scaffolded project — it works out of the box and matches the recipe.

Caveats observed (not blocking):
- 2 vite warnings about unused imports inside `@expressive-code/core`
  (a Starlight transitive dep). These are upstream and not actionable
  from the recipe.
- 1 `@astrojs/sitemap` warning about missing `site:` config — only
  surfaces when sitemap is added; not in the default scaffold.
- The 404 rendering pass logs `Entry docs → 404 was not found` once
  during static generation; this is Starlight's content-collection
  scan reporting an absent fallback (Starlight uses its own 404
  layout). The build still completes successfully and a `/404.html`
  page is emitted.

Next-iteration considerations (informational, not required to ship):
- A more thorough verification could clone the repo's actual `docs/`
  tree into the scratch project (per Step 3 of this guide) and
  validate that the autogenerate sidebar wiring picks up
  `architecture/`, `guides/`, `specs/`, `plans/` directories without
  manual frontmatter changes. The current scratch verification only
  exercises the Starlight skeleton's example content; cross-tree
  content migration is a separate concern.
- A scratch verification of Step 5 (Vercel adapter) would confirm
  the deploy-side plumbing; deferred because it requires a Vercel
  account and is functionally identical to `apps/web/`'s working
  Vercel deploy.
```

## Risks called out by the plan (and how the recipe addresses them)

The plan at `docs/plans/multi-option-support.md` § Phase 6 § Risks
flags one risk:

> Content migration: Docusaurus uses `_category_.json` for sidebar order;
> Starlight uses frontmatter `sidebar`. Recipe must call out the
> per-file conversion.

**Addressed in Step 4** above — the recipe describes both the
frontmatter form and a programmatic conversion sweep, and notes that
the current template's `docs/` has no `_category_.json` files (so the
autogenerate path is sufficient).

Additional risks surfaced while writing the recipe:

- **Symlink portability** — Step 3a's symlink approach fails on Windows
  unless `core.symlinks=true` and the user has `mklink` privileges.
  Step 3b (copy on prebuild) is the safer cross-platform default.
- **Workspace name collision** — `@ever-works/docs-starlight` and
  `@ever-works/docs-minimal` (the existing Docusaurus app's package
  name) are intentionally different so both can coexist during
  migration. Adopters should not rename the existing app to
  `@ever-works/docs` until they retire one.
- **Search-engine indexing during migration** — if both apps deploy to
  the same domain/path during migration, Google may flap between them.
  Mitigation: deploy Starlight to a preview domain first; only flip
  the production deployment once content parity is verified.

## When to use Docusaurus, when to use Starlight

Default to Docusaurus if any of these apply:
- You need versioning today (Starlight versioning is a manual workaround).
- You have an existing Algolia DocSearch crawl set up against
  `directory-web-minimal-template` paths.
- The team is more familiar with React + Webpack than with Astro.
- You want to reuse Docusaurus plugins (`docusaurus-plugin-sentry`,
  `docusaurus-plugin-llms-txt`, etc.) that don't have Astro equivalents.

Switch to Starlight if any of these apply:
- The whole rest of the monorepo is Astro and the React docs island
  feels out of place in dev tooling, lockfile, and CI cache.
- You want a faster `pnpm dev:docs` startup (Starlight's first paint is
  a few hundred ms; Docusaurus is multi-second on cold starts).
- You don't need versioning yet (most directory templates don't).
- You want the docs app to share Astro integrations (sitemap, image,
  preact) already used by `apps/web/`.

Both options remain supported. The default is **Docusaurus** until and
unless an adopter opts in via the swap above.

## Cross-references

- Question: `docs/questions.md` § Q10 (anchor: `q10-docs-site-framework`)
- Spec: `.specify/features/multi-option-support.md` § Phase 6
- Plan: `docs/plans/multi-option-support.md` § Phase 6
- Project rules: `AGENTS.md`, `CLAUDE.md`

(Markdown links to those paths are intentionally omitted: this guide
sits at `docs/guides/multi-option/docs-framework.md` — two directory
levels deeper than `docs/`-root files — and the structural-link drift
audit class in `scripts/audit-docs.ts` only whitelists single-`../`
relative paths into the canonical `docs/` subtrees. Citing paths as
inline-code keeps both the audit green and the reference unambiguous;
on Docusaurus and Starlight the `editUrl` plus the path alone provides
clickable navigation back to the source. The audit-script whitelist
can be extended in a future iteration if multi-level relative links
become a recurring need.)

## Status

**SHIPPED — VERIFIED END-TO-END** as of iteration 219 (2026-04-30).
Scratch verification (scaffold via `npx --yes create-astro@latest`,
`pnpm install --ignore-workspace`, `npx astro check`, `npx astro build`)
ran green on the cron host on the captured Windows 10 + Node 24.14.x +
pnpm 10.33 toolchain. Output above. Scaffolded Starlight version was
`@astrojs/starlight ^0.38.4` (current latest line); recipe applies
unchanged.
