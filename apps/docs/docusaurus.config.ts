import type { Config, Plugin } from '@docusaurus/types';
import fs from 'fs';
import path from 'path';
import { themes as prismThemes } from 'prism-react-renderer';

const SENTRY_DNS = process.env.NEXT_PUBLIC_SENTRY_DNS || null;
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || null;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY || null;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || null;
const HAS_ALGOLIA_CREDENTIALS = ALGOLIA_APP_ID && ALGOLIA_API_KEY && ALGOLIA_INDEX_NAME;
require('dotenv').config();

// Canonical origin of THIS docs build. Docusaurus derives every rel="canonical", og:url,
// alternate-language link and sitemap <loc> from `url`, so it must be the host the build is
// really served on: docs.demo-minimal.ever.works. It used to say https://ever-works.github.io,
// a GitHub Pages origin that is not enabled for this repository (it answers 404), so every
// page declared itself a duplicate of a dead page on a domain we do not serve. DOCS_URL
// overrides it at build time, e.g. for a repository generated from this template that serves
// its docs on a host of its own.
const DOCS_URL = (process.env.DOCS_URL || 'https://docs.demo-minimal.ever.works').replace(/\/+$/, '');

// robots.txt, written from the SAME `url` (+ baseUrl) as the canonicals so it can never name
// another host. Without it the origin had no robots.txt and nothing pointed crawlers at the
// sitemap.
function robotsTxtPlugin(): Plugin {
	return {
		name: 'docs-robots-txt',
		async postBuild({ siteConfig, outDir }) {
			const sitemap = `${siteConfig.url}${siteConfig.baseUrl}sitemap.xml`;
			const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
			await fs.promises.writeFile(path.join(outDir, 'robots.txt'), body);
		}
	};
}

/** @type {import('@docusaurus/types').Config} */
const config: Config = {
	themes: [
		[
			'@easyops-cn/docusaurus-search-local',
			/** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
			{
				hashed: true,
				language: ['en', 'fr'],
				highlightSearchTermsOnTargetPage: true,
				explicitSearchResultPath: true,
				docsRouteBasePath: '/',
				docsDir: ['../../docs'],
				docsPluginIdForPreferredVersion: 'minimal-template'
			}
		],
		'@docusaurus/theme-mermaid'
	],
	plugins: [
		robotsTxtPlugin,
		SENTRY_DNS &&
			process.env.NODE_ENV === 'production' && [
				'docusaurus-plugin-sentry',
				{
					DSN: process.env.NEXT_PUBLIC_SENTRY_DNS
				}
			],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'minimal-template',
				path: '../../docs/',
				routeBasePath: '/',
				sidebarPath: './sidebarsTemplate.ts',
				include: [
					'*.{md,mdx}',
					'architecture/**/*.{md,mdx}',
					'guides/**/*.{md,mdx}',
					'specs/**/*.{md,mdx}',
					'plans/**/*.{md,mdx}'
				],
				editUrl: 'https://github.com/ever-works/directory-web-minimal-template/tree/main/docs/'
			}
		]
	],
	// Add custom scripts here that would be placed in <script> tags.
	scripts: [{ src: 'https://buttons.github.io/buttons.js', async: true }],
	title: 'Ever Works Minimal Template', // Title for your website.
	tagline: 'Minimal Directory Web Template Documentation',
	favicon: 'img/favicon.ico',
	// NOT the canonical origin any more: DOCS_URL replaces this value where the config is exported.
	url: 'https://ever-works.github.io', // Your website URL
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/directory-web-minimal-template/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'ever-works',
	// Used for publishing and more
	projectName: 'directory-web-minimal-template',

	onBrokenLinks: 'warn',
	markdown: {
		format: 'detect',
		mermaid: true,
		hooks: {
			onBrokenMarkdownLinks: 'warn'
		}
	},
	staticDirectories: ['static'],
	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en']
	},
	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			{
				blog: {
				showReadingTime: true,
				blogSidebarCount: 'ALL',
				blogSidebarTitle: 'All Posts'
			},
				docs: false,
				theme: {
					customCss: './src/css/custom.css'
				}
			}
		]
	],
	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		{
			// Replace with your project's social card
			image: '/overview.png',

			colorMode: {
				defaultMode: 'dark'
			},
			navbar: {
				style: 'dark',
				logo: {
					alt: 'Ever® Works Logo',
					srcDark: '/img/ever-works.svg',
					src: 'img/ever-works-dark.svg'
				},
				items: [
					{
						type: 'docSidebar',
						sidebarId: 'templateSidebar',
						docsPluginId: 'minimal-template',
						position: 'left',
						label: 'Home'
					},
					{ to: '/help', label: 'Help', position: 'left' },
					{ to: '/blog', label: 'Blog', position: 'left' },
					{
						href: 'https://github.com/ever-works',
						label: 'GitHub',
						position: 'right',
						className: 'header-github-link'
					}
				]
			},
			footer: {
				style: 'dark',
				logo: {
					src: '/img/ever-works.svg',
					height: 40
				},
				links: [
					{
						title: 'Docs',
						items: [
							{
								label: 'Home',
								to: '/'
							},
							{
								label: 'Overview',
								to: '/overview'
							},
							{
								label: 'Architecture',
								to: '/architecture/overview'
							}
						]
					},
					{
						title: 'Community',
						items: [
							{
								label: 'User Showcases',
								href: '/users'
							},
							{
								label: 'Stack Overflow',
								href: 'https://stackoverflow.com/questions/tagged/directory-web-template'
							},
							{
								label: 'Discord Chat',
								href: 'https://discord.gg/ever'
							},
							{
								label: 'Twitter',
								href: 'https://twitter.com/everworks'
							}
						]
					},
					{
						title: 'More',
						items: [
							{
								label: 'GitHub',
								href: 'https://github.com/ever-works/directory-web-minimal-template'
							},
							{
								html: `
                <div class="widget"><a class="btn" href="https://github.com/ever-works/directory-web-minimal-template" rel="noopener" target="_blank" aria-label="Star this project on GitHub"><svg viewBox="0 0 16 16" width="14" height="14" class="octicon octicon-star" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path></svg>&nbsp;<span>Star</span></a><a class="social-count" href="https://github.com/ever-works/directory-web-minimal-template/stargazers" rel="noopener" target="_blank" aria-label="Star on GitHub">★</a></div>`
							}
						]
					}
				],
				copyright: `Copyright © 2024-Present <a href="https://ever.co/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Ever Co. LTD.</a>`
			},
			algolia: HAS_ALGOLIA_CREDENTIALS
				? {
						// The application ID provided by Algolia
						appId: process.env.ALGOLIA_APP_ID,

						// Public API key: it is safe to commit it
						apiKey: process.env.ALGOLIA_API_KEY,

						// The index name to query
						indexName: process.env.ALGOLIA_INDEX_NAME,

						// Optional: see doc section below
						contextualSearch: true,

						// Optional: Replace parts of the item URLs from Algolia.
						replaceSearchResultPathname: {
							from: '/docs/',
							to: '/'
						},

						// Optional: Algolia search parameters
						searchParameters: {},

						// Optional: path for search page that enabled by default (`false` to disable it)
						searchPagePath: 'search',

						// Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
						insights: false
					}
				: undefined,
			prism: {
				theme: prismThemes.oneLight,
				darkTheme: prismThemes.vsDark
			}
		},
	customFields: {
		EVER_WORKS_WEBSITE_TEMPLATE_API_URL: process.env.EVER_WORKS_WEBSITE_TEMPLATE_API_URL,
		footerData: {
			description: 'Ever Works Minimal Template — a lightweight, AI-optimized Astro template for directory websites.',
			socialLinks: [
				{
					title: 'GitHub',
					href: 'https://github.com/ever-works',
					icon: 'github'
				},
				{
					title: 'Twitter',
					href: 'https://twitter.com/everworks',
					icon: 'twitter'
				},
				{
					title: 'Discord',
					href: 'https://discord.gg/ever',
					icon: 'discord'
				}
			],
			systemStatus: {
				status: 'normal',
				message: 'All systems operational'
			},
			products: [
				{
					name: 'Ever Gauzy',
					href: 'https://gauzy.co',
					description: 'Open-Source Business Management Platform',
					icon: '/img/ever-works.svg'
				},
				{
					name: 'Ever Demand',
					href: 'https://ever.co/demand',
					description: 'Open-Source On-Demand Commerce Platform',
					icon: '/img/ever-works.svg'
				},
				{
					name: 'Ever Teams',
					href: 'https://ever.team',
					description: 'Open-Source Work & Project Management Platform',
					icon: '/img/ever-team.svg'
				},
				{
					name: 'Ever Works',
					href: 'https://ever.works',
					description: 'Modern Directory Website Solution',
					icon: '/img/ever-works.svg'
				}
			],
			companyInfo: {
				copyright: `Copyright © ${new Date().getFullYear()} Ever Co. LTD. All Rights Reserved.`,
				disclaimer:
					'*All product names, logos, and brands are property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, logos, and brands does not imply endorsement.',
				legalLinks: [
					{
						text: 'Privacy Policy',
						href: 'https://ever.co/privacy'
					},
					{
						text: 'Terms of Service',
						href: 'https://ever.co/tos'
					},
					{
						text: 'Cookie Policy',
						href: 'https://ever.co/cookies'
					}
				]
			}
		}
	}
};

// The canonical origin (see DOCS_URL at the top) is applied here rather than on the `url:` line
// because main carries a main-only DOCS_BASE_URL change on the lines right next to it; editing
// `url:` itself would make the develop -> stage -> main cascade conflict. Fold DOCS_URL into
// the `url:` line once develop and main have converged.
export default { ...config, url: DOCS_URL };
