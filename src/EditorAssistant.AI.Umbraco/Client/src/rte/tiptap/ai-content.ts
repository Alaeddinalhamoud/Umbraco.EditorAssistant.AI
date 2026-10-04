import { createNodeFromContent } from '@umbraco-cms/backoffice/tiptap';
import type { Editor } from '@umbraco-cms/backoffice/tiptap';
import type { AiInsertAction, AiPromptDialogData } from '../types/ai.types.js';

const allowedTags = new Set(['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'blockquote', 'br', 'a']);

/** Parse detached HTML, constrain AI output, then validate against this editor's schema. */
export function prepareAiContent(raw: string, editor: Editor): string {
  if (editor.isDestroyed) throw new Error('The editor is no longer available. Reopen the field.');
  if (raw.length > 100000) throw new Error('The generated content is too large. Ask for a shorter response.');
  const fenced = /^```(?:html)?\s*\n?([\s\S]*?)\n?```$/i.exec(raw.trim());
  const source = fenced ? fenced[1] : raw;
  const document = new DOMParser().parseFromString(`<body>${source}</body>`, 'text/html');
  if (!document.body.textContent?.trim()) throw new Error('The AI returned empty or unsupported content.');
  for (const element of Array.from(document.body.querySelectorAll('*'))) {
    if (!allowedTags.has(element.localName))
      throw new Error(`The AI returned unsupported <${element.localName}> content. Regenerate using simple rich text formatting.`);
    const href = element.localName === 'a' ? element.getAttribute('href') : null;
    for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name);
    if (href) {
      if (!/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href.trim()))
        throw new Error('The AI returned an unsupported link. Regenerate the content.');
      element.setAttribute('href', href.trim());
    }
  }
  // Plain text is wrapped as paragraphs without treating it as an HTML assignment.
  if (!document.body.children.length) {
    const text = document.body.textContent ?? '';
    document.body.replaceChildren();
    for (const line of text.split(/\n\s*\n/)) {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      document.body.append(paragraph);
    }
  }
  const html = document.body.innerHTML; // Detached serialization only; never the editor DOM.
  const parsed = createNodeFromContent(html, editor.schema, { errorOnInvalidContent: true, parseOptions: { preserveWhitespace: 'full' } });
  parsed.forEach(node => node.check());
  return html;
}

export function insertAiContent(data: AiPromptDialogData, content: string, action: AiInsertAction) {
  const { editor, from, to } = data;
  if (editor.isDestroyed || !editor.isEditable)
    throw new Error('The editor is no longer available for editing. Reopen the field.');
  // Do not overwrite a stale selection if another update changed the document while the modal was open.
  if (JSON.stringify(editor.getJSON()) !== JSON.stringify(data.document))
    throw new Error('The rich text changed while the dialog was open. Cancel and reopen AI Assistant.');
  const html = prepareAiContent(content, editor);
  const range = action === 'replace' ? { from, to } : to;
  const parsed = createNodeFromContent(html, editor.schema, { errorOnInvalidContent: true, parseOptions: { preserveWhitespace: 'full' } });
  const start = editor.state.doc.resolve(action === 'replace' ? from : to);
  const end = editor.state.doc.resolve(to);
  // A one-paragraph rewrite should stay inline within the current text block.
  // Headings, lists, and multiple paragraphs retain their block structure.
  const singleParagraph = parsed.childCount === 1 && parsed.firstChild?.type.name === 'paragraph';
  const insertion = singleParagraph && start.sameParent(end) && start.parent.isTextblock
    ? parsed.firstChild!.toJSON().content
    : html;
  const before = editor.state.doc;
  // The document-changing transaction fires Umbraco's onUpdate and UmbChangeEvent.
  // Do not manually assign the property value or dispatch a second change event.
  const inserted = editor.chain().focus().insertContentAt(range, insertion, { errorOnInvalidContent: true }).run();
  if (!inserted || editor.state.doc.eq(before))
    throw new Error('This content cannot be inserted at this position. Try a different selection or prompt.');
}
