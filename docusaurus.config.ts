import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Coven',
  tagline: 'Multi-agent DAG pipeline framework',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url: 'https://coven-ai-docs.vercel.app',
  baseUrl: '/',

  organizationName: 'sujal-maheshwari2004',
  projectName: 'coven',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/sujal-maheshwari2004/coven/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/coven-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Coven',
      logo: {
        alt: 'Coven Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/api/coven-class',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: 'https://pypi.org/project/coven-ai/',
          label: 'PyPI',
          position: 'right',
        },
        {
          href: 'https://github.com/sujal-maheshwari2004/coven',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started'},
            {label: 'How It Works', to: '/docs/how-it-works'},
            {label: 'Configuration', to: '/docs/configuration'},
            {label: 'API Reference', to: '/docs/api/coven-class'},
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {label: 'toolstorepy', href: 'https://pypi.org/project/toolstorepy/'},
            {label: 'sentinel-mlops', href: 'https://pypi.org/project/sentinel-mlops/'},
            {label: 'driftguard-ai', href: 'https://pypi.org/project/driftguard-ai/'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/sujal-maheshwari2004/coven'},
            {label: 'PyPI', href: 'https://pypi.org/project/coven-ai/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sujal Maheshwari. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
