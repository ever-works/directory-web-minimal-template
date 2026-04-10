# Phase 6: Deployment, CI/CD, Documentation

> Production deployment pipeline, CI workflows, and documentation site

## Goal

Complete the template with deployment automation, CI/CD workflows, E2E tests, and a documentation website.

## Tasks

### 6.1 GitHub Actions Workflows
- [ ] `.github/workflows/ci.yml` — Lint, typecheck, build on PR/push
- [ ] `.github/workflows/deploy.yml` — Deploy to Vercel on main branch
- [ ] `.github/workflows/e2e.yml` — Run Playwright tests after deploy

### 6.2 Vercel Configuration
- [ ] `apps/web/vercel.json` — Vercel project settings
- [ ] Build command: `pnpm run build` (with content clone)
- [ ] Output directory: `apps/web/dist`
- [ ] Environment variables documentation

### 6.3 E2E Tests (`apps/web-e2e`)
- [ ] Playwright setup: `playwright.config.ts`
- [ ] Test: Home page renders
- [ ] Test: Item listing page shows items
- [ ] Test: Item detail page renders
- [ ] Test: Category page filters items
- [ ] Test: Tag page filters items
- [ ] Test: Search returns results
- [ ] Test: Pagination navigates correctly
- [ ] Test: 404 page renders for unknown routes

### 6.4 Documentation Site (`apps/docs`)
- [ ] Starlight (Astro) documentation site setup
- [ ] Import docs from `docs/` folder
- [ ] Getting started guide
- [ ] Architecture documentation
- [ ] Plugin development guide
- [ ] Component catalog with examples
- [ ] Deployment guide
- [ ] FAQ and troubleshooting

### 6.5 Template Selection (Platform Integration)
- [ ] Document how to add this template as an option in the deploy flow
- [ ] Template metadata: name, description, features, preview URL
- [ ] Distinguish from full Next.js template in UI

### 6.6 README.md
- [ ] Project overview and philosophy
- [ ] Quick start guide
- [ ] Feature list
- [ ] Tech stack
- [ ] Contributing guidelines
- [ ] License

## Success Criteria

1. CI passes on all PRs
2. Deployment to Vercel works via GitHub Actions
3. E2E tests pass against deployed site
4. Documentation site is live and comprehensive
5. Template can be selected and deployed by new users
