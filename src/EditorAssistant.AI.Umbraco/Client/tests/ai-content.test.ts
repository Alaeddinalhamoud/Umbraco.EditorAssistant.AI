import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { insertAiContent, prepareAiContent } from '../src/rte/tiptap/ai-content.js';
import type { AiPromptDialogData } from '../src/rte/types/ai.types.js';

const editors: Editor[] = [];
function setup(from: number, to = from) {
  const editor = new Editor({ extensions: [StarterKit], content: '<p>Hello world</p>' });
  editors.push(editor);
  editor.commands.setTextSelection({ from, to });
  const data: AiPromptDialogData = {
    editor, from, to, document: editor.getJSON(),
    selectedText: editor.state.doc.textBetween(from, to),
  };
  return { editor, data };
}
afterEach(() => { editors.splice(0).forEach(editor => editor.destroy()); });

describe('AI rich text insertion', () => {
  it('inserts at the captured cursor, emits a document update and supports undo', () => {
    const { editor, data } = setup(6);
    let updates = 0;
    editor.on('update', () => updates++);
    // Moving focus/selection while the modal is open must not change the saved insertion position.
    editor.commands.setTextSelection(1);
    insertAiContent(data, ' wonderful', 'insert');
    expect(editor.getText()).toBe('Hello wonderful world');
    expect(updates).toBe(1);
    editor.commands.undo();
    expect(editor.getHTML()).toBe('<p>Hello world</p>');
  });

  it('replaces only the captured selection and preserves rich text formatting', () => {
    const { editor, data } = setup(7, 12);
    insertAiContent(data, '<p><strong>everyone</strong></p>', 'replace');
    expect(editor.getHTML()).toContain('Hello <strong>everyone</strong>');
    expect(editor.getText()).not.toContain('world');
  });

  it('inserts after selected text without deleting it', () => {
    const { editor, data } = setup(1, 6);
    insertAiContent(data, '<p> beautiful</p>', 'insert');
    expect(editor.getText()).toBe('Hello beautiful world');
  });

  it('preserves supported headings and lists', () => {
    const { editor, data } = setup(12);
    insertAiContent(data, '<h2>Title</h2><ul><li><p>Point</p></li></ul>', 'insert');
    expect(editor.getHTML()).toContain('<h2>Title</h2>');
    expect(editor.getHTML()).toContain('<ul><li><p>Point</p></li></ul>');
  });

  it('rejects a stale document and leaves its content intact', () => {
    const { editor, data } = setup(1, 6);
    editor.commands.insertContent('Updated');
    const current = editor.getHTML();
    expect(() => insertAiContent(data, '<p>Overwrite</p>', 'replace')).toThrow('changed');
    expect(editor.getHTML()).toBe(current);
  });

  it('rejects unavailable editors', () => {
    const { editor, data } = setup(1);
    editor.destroy();
    expect(() => insertAiContent(data, '<p>Text</p>', 'insert')).toThrow('no longer available');
  });

  it.each(['', '<p> </p>', '<p>Safe</p><script>alert(1)</script>', '<img src=x>', '<a href="javascript:alert(1)">Link</a>'])
    ('rejects empty, unsafe or unsupported output: %s', content => {
      const { editor } = setup(1);
      expect(() => prepareAiContent(content, editor)).toThrow();
    });

  it('strips AI-supplied attributes before preview and insertion', () => {
    const { editor } = setup(1);
    expect(prepareAiContent('<p onclick="alert(1)" style="color:red">Text</p>', editor)).toBe('<p>Text</p>');
  });

  it('rejects formatting unsupported by the configured schema', () => {
    const editor = new Editor({ extensions: [StarterKit.configure({ heading: false })], content: '<p>Text</p>' });
    editors.push(editor);
    expect(() => prepareAiContent('<h2>Heading</h2>', editor)).toThrow();
  });
});
