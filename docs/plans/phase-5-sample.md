---
title: "Phase 5: Samples"
sidebar_label: "Phase 5: Samples"
---

# Phase 5: Sample Implementations

> Reference implementations showing how AI builds from the template

## Goal

Create `apps/sample-basic/` — a complete, working directory website built by AI from the template. This demonstrates the full workflow and serves as a reference for users.

## Tasks

### 5.1 Sample: Basic React Components Directory
- [ ] Copy `apps/web/` structure as starting point
- [ ] Connect to an existing Ever Works data repo (e.g., React components directory)
- [ ] Apply Tailwind CSS styling to all headless components
- [ ] Configure plugins (search, filters, pagination, SEO)
- [ ] Custom home page layout with hero and featured items
- [ ] Custom item detail page with full information
- [ ] Category and tag pages styled consistently
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark/light mode support
- [ ] Build and verify all pages generate correctly

### 5.2 AI Generation Process Documentation
- [ ] Document the exact prompt used to generate the sample
- [ ] Document the AI's decision process
- [ ] Document what was customized vs. what was template default
- [ ] Create a step-by-step tutorial from template to finished site

### 5.3 SKILLS.md
- [ ] Create `SKILLS.md` with step-by-step guides for AI agents
- [ ] Skill: "Build a directory website from scratch"
- [ ] Skill: "Add a new page type"
- [ ] Skill: "Customize the item card design"
- [ ] Skill: "Configure search and filters"
- [ ] Skill: "Deploy to Vercel"

## Sample Prompt (for AI generation)

```
Implement a basic directory website for React UI Components using the
ever-works minimal template from the 'web' app. The directory should:

1. Show all React component libraries with name, description, and link
2. Have category pages (e.g., "Form Components", "Data Display", etc.)
3. Have tag pages (e.g., "TypeScript", "Accessible", "Headless")
4. Include a search bar on the home page
5. Use a clean, modern design with Tailwind CSS
6. Support dark and light modes
7. Be fully static and deployable to Vercel

Use the SKILLS.md and AGENTS.md for guidance.
```

## Future Samples (not in this phase)

- `sample-jobs` — Job board directory
- `sample-events` — Events directory
- `sample-real-estate` — Real estate listings
- `sample-saas` — SaaS tools directory

## Success Criteria

1. `sample-basic` builds successfully with `pnpm build`
2. All pages render correctly with real data
3. Search, filters, and pagination work
4. Responsive on all screen sizes
5. Lighthouse score > 95 on all metrics
6. The AI generation process is documented and reproducible
