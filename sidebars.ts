import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'how-it-works',
      label: 'How It Works',
    },
    {
      type: 'doc',
      id: 'configuration',
      label: 'Configuration',
    },
    {
      type: 'category',
      label: 'Pipeline Stages',
      collapsed: false,
      items: [
        'pipeline/decomposer',
        'pipeline/graph-builder',
        'pipeline/sorter',
        'pipeline/executor',
        'pipeline/compiler',
        'pipeline/synthesizer',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'concepts/dag',
        'concepts/artifacts',
        'concepts/nodes',
        'concepts/tool-use',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/coven-class',
        'api/models',
      ],
    },
    {
      type: 'doc',
      id: 'examples',
      label: 'Examples',
    },
  ],
};

export default sidebars;
