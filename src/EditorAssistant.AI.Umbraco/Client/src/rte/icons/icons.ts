import type { UmbIconDictionary } from '@umbraco-cms/backoffice/icon';

const icons: UmbIconDictionary = [
  {
    name: 'icon-editor-assistant-ai',
    keywords: ['ai', 'assistant', 'generate', 'write', 'sparkles'],
    path: () => import('./ai-assistant.icon.js'),
  },
];

export default icons;
