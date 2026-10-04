import type { Editor } from '@umbraco-cms/backoffice/tiptap';

export interface AiPromptRequest {
  prompt: string;
  selectedText?: string;
  context?: string;
}

export interface AiService {
  executePrompt(request: AiPromptRequest, signal: AbortSignal): Promise<string>;
}

export interface AiPromptDialogData {
  editor: Editor;
  from: number;
  to: number;
  selectedText: string;
  document: ReturnType<Editor['getJSON']>;
}

export type AiInsertAction = 'insert' | 'replace';
