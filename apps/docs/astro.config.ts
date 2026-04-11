import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

/**
 * Starlight documentation site configuration.
 * Serves the docs/ folder content as a browsable documentation site.
 */
export default defineConfig({
    site: 'https://ever-works.github.io/directory-web-minimal-template',
    integrations: [
        starlight({
            title: 'Ever Works Minimal Template',
            description: 'Documentation for the Ever Works minimal directory web template.',
            social: {
                github: 'https://github.com/ever-works/directory-web-minimal-template',
            },
            sidebar: [
                {
                    label: 'Getting Started',
                    items: [
                        { label: 'Overview', link: '/overview/' },
                    ],
                },
                {
                    label: 'Architecture',
                    items: [
                        { label: 'Overview', link: '/architecture/overview/' },
                        { label: 'Data Layer', link: '/architecture/data-layer/' },
                        { label: 'Plugin System', link: '/architecture/plugin-system/' },
                        { label: 'Adapter System', link: '/architecture/adapter-system/' },
                        { label: 'Component System', link: '/architecture/component-system/' },
                    ],
                },
                {
                    label: 'Guides',
                    items: [
                        { label: 'Building from Template', link: '/guides/building-from-template/' },
                        { label: 'Creating a Plugin', link: '/guides/creating-a-plugin/' },
                        { label: 'Creating an Adapter', link: '/guides/creating-an-adapter/' },
                    ],
                },
                {
                    label: 'Specifications',
                    items: [
                        { label: 'Data Schema', link: '/specs/data-schema/' },
                        { label: 'Plugin Interface', link: '/specs/plugin-interface/' },
                        { label: 'Adapter Interface', link: '/specs/adapter-interface/' },
                        { label: 'Component Catalog', link: '/specs/component-catalog/' },
                    ],
                },
            ],
        }),
    ],
});
