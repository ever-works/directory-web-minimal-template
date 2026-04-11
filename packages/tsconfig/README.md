# @ever-works/tsconfig

Shared TypeScript configuration for the Ever Works minimal directory template monorepo. Provides two base configs that all packages extend to maintain consistent compiler settings.

## Configs

### `base.json` — For pure TypeScript packages

Used by `core`, `adapters`, `plugins`, and all `plugin-*` packages.

```json
// packages/my-package/tsconfig.json
{
    "extends": "@ever-works/tsconfig/base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*.ts"]
}
```

Key settings:
- **`strict: true`** — Full strict mode (strictNullChecks, noImplicitAny, etc.)
- **`target: ES2022`** — Modern JavaScript output
- **`module: ESNext`** / **`moduleResolution: bundler`** — ESM with bundler-compatible resolution
- **`noUncheckedIndexedAccess: true`** — Index signatures return `T | undefined`
- **`noUnusedLocals: true`** / **`noUnusedParameters: true`** — No dead code
- **`noImplicitReturns: true`** — Every code path must return
- **`noFallthroughCasesInSwitch: true`** — Switch cases must break or return
- **`isolatedModules: true`** — Compatible with single-file transpilation (Vite, esbuild)

### `astro.json` — For Astro apps and UI package

Extends `base.json` and adds JSX support for Preact:

```json
// apps/web/tsconfig.json
{
    "extends": "@ever-works/tsconfig/astro.json"
}
```

Additional settings:
- **`jsx: react-jsx`** — JSX transform (no React import needed)
- **`jsxImportSource: preact`** — JSX elements compile to Preact `h()` calls

## Why These Settings

| Setting | Why |
|---------|-----|
| `strict: true` | Catches bugs early, aligns with project rule R1 (TypeScript Only) |
| `noUncheckedIndexedAccess` | Prevents undefined access on objects/maps without explicit checks |
| `bundler` module resolution | Works with Vite/Astro without needing `.js` extensions everywhere |
| `isolatedModules` | Required for Vite's esbuild-based transpilation |
| `declaration` + `declarationMap` | Enables IDE jump-to-definition across workspace packages |
| `skipLibCheck` | Speeds up type-checking by not re-checking `node_modules` types |

## Usage

All packages in this monorepo extend one of these configs. The package itself has no runtime code — it only ships JSON files.
