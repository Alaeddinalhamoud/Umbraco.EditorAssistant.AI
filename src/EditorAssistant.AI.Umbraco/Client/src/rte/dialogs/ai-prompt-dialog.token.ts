import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import type { AiPromptDialogData } from '../types/ai.types.js';

export const AI_PROMPT_MODAL_ALIAS = 'EditorAssistant.AI.Rte.PromptModal';
export const AI_PROMPT_MODAL = new UmbModalToken<AiPromptDialogData, undefined>(AI_PROMPT_MODAL_ALIAS, {
  modal: { type: 'dialog', size: 'large' },
});
