import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
        },
    },
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        jsxImportSource: 'preact',
    },
    test: {
        include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
        setupFiles: [resolve(__dirname, 'src/__tests__/setup.ts')],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
        },
    },
});
