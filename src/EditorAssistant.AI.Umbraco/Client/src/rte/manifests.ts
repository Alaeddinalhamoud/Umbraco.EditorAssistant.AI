import type { ManifestTiptapToolbarExtensionButtonKind } from '@umbraco-cms/backoffice/tiptap';
import type { ManifestModal } from '@umbraco-cms/backoffice/modal';
import type { ManifestIcons } from '@umbraco-cms/backoffice/icon';
import { AI_PROMPT_MODAL_ALIAS } from './dialogs/ai-prompt-dialog.token.js';

// Like Umbraco's Character Map, this adds an action to the existing editor schema.
// No tiptapExtension (node/mark extension) is needed for a toolbar-only command.
export const manifests: Array<ManifestTiptapToolbarExtensionButtonKind | ManifestModal | ManifestIcons> = [
  {
    type: 'icons',
    alias: 'EditorAssistant.AI.Rte.Icons',
    name: 'AI Assistant Icons',
    js: () => import('./icons/icons.js'),
  },
  {
    type: 'tiptapToolbarExtension',
    kind: 'button',
    alias: 'EditorAssistant.AI.Rte.Toolbar',
    name: 'AI Assistant Rich Text Toolbar',
    api: () => import('./tiptap/ai-toolbar.api.js'),
    meta: { alias: 'editorAssistantAi', icon: 'icon-editor-assistant-ai', label: 'AI Assistant' },
  },
  {
    type: 'modal',
    alias: AI_PROMPT_MODAL_ALIAS,
    name: 'AI Assistant Prompt Dialog',
    element: () => import('./dialogs/ai-prompt-dialog.element.js'),
  },
];
