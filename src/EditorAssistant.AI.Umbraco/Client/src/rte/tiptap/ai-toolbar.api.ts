import { UmbTiptapToolbarElementApiBase } from '@umbraco-cms/backoffice/tiptap';
import type { Editor } from '@umbraco-cms/backoffice/tiptap';
import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import { AI_PROMPT_MODAL } from '../dialogs/ai-prompt-dialog.token.js';

export default class AiToolbarApi extends UmbTiptapToolbarElementApiBase {
  private _open = false;

  override isDisabled(editor?: Editor) {
    return this._open || !editor || editor.isDestroyed || !editor.isEditable || super.isDisabled(editor);
  }

  override async execute(editor?: Editor) {
    if (this.isDisabled(editor) || !editor) return;
    this._open = true;
    // Capture before opening the modal moves focus away from the editor.
    const { from, to } = editor.state.selection;
    const data = {
      editor, from, to,
      selectedText: editor.state.doc.textBetween(from, to, '\n'),
      document: editor.getJSON(),
    };
    try {
      const manager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
      if (!manager) throw new Error('The dialog could not be opened. Reload the backoffice.');
      const modal = manager.open(this, AI_PROMPT_MODAL, { data });
      await modal.onSubmit().catch(() => undefined); // Cancel leaves the RTE untouched.
    } catch (error) {
      const notifications = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      notifications?.peek('danger', { data: {
        headline: 'AI Assistant',
        message: error instanceof Error ? error.message : 'The dialog could not be opened.',
      } });
    } finally {
      this._open = false;
    }
  }
}
