# Feature: Plugin System

## Description

The plugin system enables extensible functionality through a well-defined interface. Plugins can transform data, provide UI components, add pages, and run build hooks.

## User Stories

- As a **developer**, I want to add search functionality by enabling a plugin.
- As a **developer**, I want to disable a plugin without breaking the site.
- As a **plugin author**, I want clear lifecycle hooks to integrate with the build pipeline.
- As an **AI agent**, I want to understand what plugins are available and what they do.

## Acceptance Criteria

1. Plugins are registered in `plugins.config.ts` via `definePlugins()`
2. Plugin IDs must be unique
3. Dependencies are resolved in topological order
4. Missing dependencies produce a warning, not a crash
5. `onInit` is called in dependency order
6. `onDataLoaded` pipeline passes data through each plugin
7. `onBeforeBuild` and `onAfterBuild` are called at correct lifecycle points
8. A disabled plugin (removed from config) doesn't affect the build
9. Plugin factory functions accept typed options objects

## Technical Design

See:
- `docs/architecture/plugin-system.md` — Architecture
- `docs/specs/plugin-interface.md` — Interface specification

## Package: `@ever-works/plugins`

```
packages/plugins/
├── src/
│   ├── types.ts          — Plugin, PluginHooks, PluginContext
│   ├── registry.ts       — Plugin registration + dependency resolution
│   ├── runner.ts         — Lifecycle hook execution
│   ├── define-plugins.ts — Config helper function
│   ├── logger.ts         — Plugin logger implementation
│   └── index.ts          — Public API
├── package.json
├── tsconfig.json
└── README.md
```
