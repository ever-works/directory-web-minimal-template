# @ever-works/eslint-config

Shared ESLint configuration for the Ever Works minimal directory template monorepo. Provides a single, consistent set of linting rules across all TypeScript packages.

## What This Package Does

Exports a flat ESLint config (ESLint 9+ format) that enforces TypeScript-strict and general code quality rules across the monorepo. All packages reference this config to avoid duplicating lint rules.

## Rules

### TypeScript

| Rule | Setting | Rationale |
|------|---------|-----------|
| `@typescript-eslint/no-explicit-any` | Error | Use `unknown` and narrow — no `any` types (per R1) |
| `@typescript-eslint/no-unused-vars` | Error (ignores `_` prefix) | Clean code, unused params prefixed with `_` are OK |

### General Quality

| Rule | Setting | Rationale |
|------|---------|-----------|
| `no-console` | Warn (`console.warn`/`error` allowed) | Prevent stray `console.log`; warnings and errors are fine |
| `prefer-const` | Error | Use `const` by default |
| `no-var` | Error | Use `let`/`const`, never `var` |
| `eqeqeq` | Error (always) | Strict equality only |

### Ignored Paths

- `**/dist/**`
- `**/node_modules/**`
- `**/.astro/**`
- `**/.turbo/**`

## Usage

Reference from any package's ESLint config:

```javascript
// eslint.config.mjs
import config from '@ever-works/eslint-config';
export default config;
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@typescript-eslint/eslint-plugin` | TypeScript-specific lint rules |
| `@typescript-eslint/parser` | TypeScript parser for ESLint |
| `eslint` (peer) | ESLint 9+ |
