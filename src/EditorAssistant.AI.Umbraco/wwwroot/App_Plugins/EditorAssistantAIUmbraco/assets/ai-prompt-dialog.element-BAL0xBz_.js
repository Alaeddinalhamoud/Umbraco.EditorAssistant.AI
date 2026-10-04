import{UmbModalBaseElement as y}from"@umbraco-cms/backoffice/modal";import{UMB_AUTH_CONTEXT as w}from"@umbraco-cms/backoffice/auth";import{html as l,css as _}from"@umbraco-cms/backoffice/external/lit";import{r as h,t as k}from"./state-G4_ANB4m.js";import{c as m,j as C}from"./client.gen-2SvRqEG3.js";import{createNodeFromContent as x}from"@umbraco-cms/backoffice/tiptap";const $={async executePrompt(t,e){const r=await m.post({url:"/umbraco/editorassistantaiumbraco/api/v1/ExecutePrompt",security:[{scheme:"bearer",type:"http"}],headers:{"Content-Type":"application/json"},bodySerializer:C.bodySerializer,body:t,signal:e});if(e.aborted)throw new DOMException("Request cancelled","AbortError");if(!r.response?.ok){const i=r.error?.detail;throw new Error(i??"AI generation failed. Check the connection and try again.")}if(!r.data?.content?.trim())throw new Error("The AI provider returned no content.");return r.data.content}},A=new Set(["p","h2","h3","h4","h5","h6","ul","ol","li","strong","b","em","i","blockquote","br","a"]);function b(t,e){if(e.isDestroyed)throw new Error("The editor is no longer available. Reopen the field.");if(t.length>1e5)throw new Error("The generated content is too large. Ask for a shorter response.");const r=/^```(?:html)?\s*\n?([\s\S]*?)\n?```$/i.exec(t.trim()),i=r?r[1]:t,o=new DOMParser().parseFromString(`<body>${i}</body>`,"text/html");if(!o.body.textContent?.trim())throw new Error("The AI returned empty or unsupported content.");for(const n of Array.from(o.body.querySelectorAll("*"))){if(!A.has(n.localName))throw new Error(`The AI returned unsupported <${n.localName}> content. Regenerate using simple rich text formatting.`);const s=n.localName==="a"?n.getAttribute("href"):null;for(const d of Array.from(n.attributes))n.removeAttribute(d.name);if(s){if(!/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(s.trim()))throw new Error("The AI returned an unsupported link. Regenerate the content.");n.setAttribute("href",s.trim())}}if(!o.body.children.length){const n=o.body.textContent??"";o.body.replaceChildren();for(const s of n.split(/\n\s*\n/)){const d=o.createElement("p");d.textContent=s,o.body.append(d)}}const a=o.body.innerHTML;return x(a,e.schema,{errorOnInvalidContent:!0,parseOptions:{preserveWhitespace:"full"}}).forEach(n=>n.check()),a}function T(t,e,r){const{editor:i,from:o,to:a}=t;if(i.isDestroyed||!i.isEditable)throw new Error("The editor is no longer available for editing. Reopen the field.");if(JSON.stringify(i.getJSON())!==JSON.stringify(t.document))throw new Error("The rich text changed while the dialog was open. Cancel and reopen AI Assistant.");const p=b(e,i),n=r==="replace"?{from:o,to:a}:a,s=x(p,i.schema,{errorOnInvalidContent:!0,parseOptions:{preserveWhitespace:"full"}}),d=i.state.doc.resolve(r==="replace"?o:a),g=i.state.doc.resolve(a),f=s.childCount===1&&s.firstChild?.type.name==="paragraph"&&d.sameParent(g)&&d.parent.isTextblock?s.firstChild.toJSON().content:p,v=i.state.doc;if(!i.chain().focus().insertContentAt(n,f,{errorOnInvalidContent:!0}).run()||i.state.doc.eq(v))throw new Error("This content cannot be inserted at this position. Try a different selection or prompt.")}var z=Object.defineProperty,E=Object.getOwnPropertyDescriptor,u=(t,e,r,i)=>{for(var o=i>1?void 0:i?E(e,r):e,a=t.length-1,p;a>=0;a--)(p=t[a])&&(o=(i?p(e,r,o):p(o))||o);return i&&o&&z(e,r,o),o};let c=class extends y{constructor(){super(...arguments),this._prompt="",this._busy=!1,this._content="",this._error="",this._includeContext=!1,this._contextHintDismissed=!1}disconnectedCallback(){this._request?.abort(),super.disconnectedCallback()}async _generate(){if(this._busy)return;if(this._error="",!this._prompt.trim()){this._error="Enter a prompt before generating content.";return}if(!this.data||this.data.editor.isDestroyed){this._error="The editor is no longer available.";return}this._busy=!0,this._content="";const t=this._request=new AbortController,e=window.setTimeout(()=>t.abort("timeout"),95e3);try{const r=await this.getContext(w);if(!r)throw new Error("Your backoffice session is unavailable. Sign in again.");r.configureClient(m);const i=await $.executePrompt({prompt:this._prompt.trim(),selectedText:this.data.selectedText,context:this._includeContext?this.data.editor.getText():void 0},t.signal);if(t.signal.aborted)throw new Error("The request was cancelled.");this._content=b(i,this.data.editor)}catch(r){this.isConnected&&(this._error=t.signal.aborted?"AI generation timed out or was cancelled. Try again.":r instanceof Error?r.message:"AI generation failed. Try again.")}finally{window.clearTimeout(e),this._busy=!1}}_insert(t){if(!(this._busy||!this.data||!this._content))try{T(this.data,this._content,t),this._submitModal()}catch(e){this._error=e instanceof Error?e.message:"The content could not be inserted."}}_cancel(){this._request?.abort(),this._rejectModal()}render(){const t=(this.data?.from??0)!==(this.data?.to??0);return l`
      <umb-body-layout headline="AI Assistant">
        <div class="body">
          <div class="intro">
            <span class="intro-icon"><umb-icon name="icon-editor-assistant-ai" aria-hidden="true"></umb-icon></span>
            <div><h2>A little inspiration for your next draft</h2><p>Tell your assistant what you need, then review the result before adding it.</p></div>
          </div>
          <div class="workspace">
            <section class="composer" aria-labelledby="instruction-heading">
              <div class="section-heading"><span class="step">1</span><h3 id="instruction-heading">Your instruction</h3></div>
              <label for="ai-prompt" class="prompt-label">What would you like AI to write or change?</label>
              <textarea id="ai-prompt" rows="6" maxlength="8000" aria-describedby="prompt-help"
                placeholder="For example: Rewrite this introduction in a friendly, concise tone."
                .value=${this._prompt} ?disabled=${this._busy}
                @input=${e=>{this._prompt=e.target.value,this._content=""}}></textarea>
              <p id="prompt-help" class="prompt-help">Include the topic, tone, and length you have in mind.</p>
              ${this.data?.selectedText?l`<details class="selection-card"><summary><umb-icon name="icon-document" aria-hidden="true"></umb-icon>Selected text</summary><p class="selection">${this.data.selectedText}</p></details>`:""}
              <div class="context-card">
                <label class="context"><input type="checkbox" aria-describedby="ai-context-hint" ?checked=${this._includeContext} ?disabled=${this._busy}
                  @change=${e=>{this._includeContext=e.target.checked,this._content=""}} />
                  <span>Include the field's existing text as context</span></label>
                <span class="context-help" @mouseenter=${()=>{this._contextHintDismissed=!1}}>
                  <button type="button" class="context-help-button" aria-label="About field context" aria-describedby="ai-context-hint"
                    @focus=${()=>{this._contextHintDismissed=!1}}
                    @keydown=${e=>{e.key==="Escape"&&(this._contextHintDismissed=!0,e.stopPropagation())}}>
                    <umb-icon name="icon-info" aria-hidden="true"></umb-icon>
                  </button>
                  <span id="ai-context-hint" class="context-tooltip" role="tooltip" ?hidden=${this._contextHintDismissed}>Sends this field's text to AI to help match its topic and tone.</span>
                </span>
              </div>
              <p class="hint"><umb-icon name="icon-info" aria-hidden="true"></umb-icon><span>Your prompt, selected text, and any context you include are sent to your AI provider.</span></p>
              ${this._error?l`<p class="error" role="alert"><umb-icon name="icon-alert" aria-hidden="true"></umb-icon><span>${this._error}</span></p>`:""}
            </section>
            <section class="preview" aria-labelledby="preview-heading">
              <div class="section-heading"><span class="step">2</span><h3 id="preview-heading">Review your draft</h3></div>
              ${this._content?l`
                <p class="preview-caption">Check the wording and formatting before inserting.</p>
                <iframe title="Generated content preview" sandbox="" .srcdoc=${`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font:16px system-ui;line-height:1.6;padding:12px;color:#222;overflow-wrap:anywhere}a{pointer-events:none}</style></head><body>${this._content}</body></html>`}></iframe>
              `:this._busy?l`
                <div class="preview-empty loading" role="status"><uui-loader></uui-loader><strong>Creating your draft...</strong><p>Your suggestion will appear here.</p></div>
              `:l`
                <div class="preview-empty"><span class="preview-icon"><umb-icon name="icon-document" aria-hidden="true"></umb-icon></span><strong>A fresh draft starts here</strong><p>Add an instruction and select Generate.<br />Your existing content stays as it is until you insert a result.</p></div>
              `}
            </section>
          </div>
        </div>
        <div slot="actions">
          <uui-button class="cancel-action" label="Cancel" @click=${this._cancel}><umb-icon name="icon-wrong" aria-hidden="true"></umb-icon>Cancel</uui-button>
          <uui-button look=${this._content?"secondary":"primary"} label=${this._content?"Regenerate":"Generate"}
            ?disabled=${this._busy} @click=${this._generate}><umb-icon name=${this._content?"icon-refresh":"icon-editor-assistant-ai"} aria-hidden="true"></umb-icon>${this._content?"Regenerate":"Generate"}</uui-button>
          ${this._content?l`
            <uui-button look="primary" color="positive" ?disabled=${this._busy}
              label=${t?"Insert after selected text":"Insert"} @click=${()=>this._insert("insert")}>
              <umb-icon name="icon-add" aria-hidden="true"></umb-icon>${t?"Insert after selected text":"Insert"}
            </uui-button>
            ${t?l`<uui-button look="primary" ?disabled=${this._busy} label="Replace selected text"
              @click=${()=>this._insert("replace")}><umb-icon name="icon-edit" aria-hidden="true"></umb-icon>Replace selected text</uui-button>`:""}`:""}
        </div>
      </umb-body-layout>`}};c.styles=_`
    :host { display: block; --accent: var(--uui-color-interactive); --tint: color-mix(in srgb, var(--accent) 7%, var(--uui-color-surface)); }
    * { box-sizing: border-box; }
    .body { padding: 24px; background: var(--uui-color-surface-alt); }
    .intro { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .intro-icon { display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--uui-color-border)); border-radius: 14px; background: var(--tint); color: var(--accent); flex-shrink: 0; }
    .intro-icon umb-icon { font-size: 25px; }
    h2 { margin: 0 0 6px; font-size: 19px; letter-spacing: -.02em; }
    .intro p { margin: 0; color: var(--uui-color-text-alt); font-size: 13px; line-height: 1.6; }
    .workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; align-items: stretch; }
    .composer, .preview { min-width: 0; padding: 20px; border: 1px solid var(--uui-color-border); border-radius: 12px; background: var(--uui-color-surface); }
    .preview { display: flex; flex-direction: column; }
    .section-heading { display: flex; align-items: center; gap: 9px; margin-bottom: 20px; }
    .step { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; background: var(--tint); color: var(--accent); font-size: 11px; font-weight: 700; }
    .preview .step { color: var(--uui-color-positive); background: color-mix(in srgb, var(--uui-color-positive) 9%, var(--uui-color-surface)); }
    h3 { margin: 0; font-size: 15px; }
    .prompt-label { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 600; line-height: 1.5; }
    textarea { display: block; width: 100%; min-height: 150px; resize: vertical; padding: 14px; font: inherit; font-size: 14px; line-height: 1.6; color: var(--uui-color-text); background: var(--uui-color-surface); border: 1px solid var(--uui-color-border-emphasis, var(--uui-color-border)); border-radius: 8px; }
    textarea::placeholder { color: var(--uui-color-text-alt); opacity: .8; }
    textarea:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid var(--uui-color-focus); outline-offset: 3px; }
    textarea:disabled { opacity: .65; }
    .prompt-help { margin: 8px 0 18px; color: var(--uui-color-text-alt); font-size: 11px; line-height: 1.5; }
    umb-icon { flex-shrink: 0; font-size: 16px; }
    .selection-card { margin-bottom: 14px; padding: 12px; border: 1px solid var(--uui-color-border); border-radius: 8px; }
    summary { cursor: pointer; font-size: 12px; font-weight: 600; }
    summary umb-icon, uui-button umb-icon { vertical-align: -3px; margin-right: 6px; }
    .selection { white-space: pre-wrap; max-height: 120px; overflow: auto; margin: 12px 0 0; font-size: 12px; line-height: 1.6; color: var(--uui-color-text-alt); }
    .context-card { position: relative; display: flex; align-items: flex-start; gap: 8px; padding: 14px; background: var(--uui-color-surface-alt); border: 1px solid var(--uui-color-border); border-radius: 8px; }
    .context { flex: 1; min-width: 0; display: grid; grid-template-columns: 16px minmax(0, 1fr); align-items: start; gap: 8px; cursor: pointer; font-size: 12px; line-height: 1.6; }
    .context input { width: 16px; height: 16px; margin: 2px 0 0; accent-color: var(--accent); }
    .context-help { flex-shrink: 0; }
    .context-help-button { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; margin-top: -2px; border: 0; border-radius: 4px; background: transparent; color: var(--uui-color-text-alt); cursor: help; }
    .context-help-button:hover { color: var(--accent); background: var(--tint); }
    .context-help-button:focus-visible { outline: 2px solid var(--uui-color-focus); outline-offset: 2px; }
    .context-tooltip { position: absolute; z-index: 10; top: calc(100% - 4px); right: 8px; width: min(280px, calc(100vw - 80px)); padding: 12px; border: 1px solid var(--uui-color-border); border-radius: 8px; background: var(--uui-color-surface); color: var(--uui-color-text); font-size: 12px; line-height: 1.6; box-shadow: 0 4px 16px #0002; visibility: hidden; }
    .context-help:hover .context-tooltip, .context-help:focus-within .context-tooltip { visibility: visible; }
    .context-tooltip[hidden] { display: none; }
    .hint { display: flex; align-items: flex-start; gap: 8px; color: var(--uui-color-text-alt); font-size: 11px; line-height: 1.6; margin: 16px 0 0; }
    .hint umb-icon { margin-top: 2px; }
    .error { display: flex; align-items: flex-start; gap: 8px; margin: 16px 0 0; padding: 12px; border-radius: 8px; border: 1px solid var(--uui-color-danger); background: color-mix(in srgb, var(--uui-color-danger) 7%, var(--uui-color-surface)); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
    .error umb-icon { color: var(--uui-color-danger); margin-top: 2px; }
    .preview-caption { margin: -8px 0 14px; color: var(--uui-color-text-alt); font-size: 12px; line-height: 1.6; }
    iframe { display: block; width: 100%; height: 340px; flex: 1; min-height: 280px; border: 1px solid var(--uui-color-border); border-radius: 8px; background: white; }
    .preview-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 24px; border: 1px dashed var(--uui-color-border); border-radius: 8px; text-align: center; background: var(--uui-color-surface-alt); }
    .preview-icon { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 16px; background: var(--tint); color: var(--accent); margin-bottom: 16px; }
    .preview-icon umb-icon { font-size: 26px; }
    .preview-empty strong { font-size: 14px; } .preview-empty p { margin: 10px 0 0; color: var(--uui-color-text-alt); font-size: 12px; line-height: 1.8; }
    .loading uui-loader { font-size: 28px; margin-bottom: 18px; }
    [slot=actions] { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; width: 100%; }
    .cancel-action { margin-right: auto; }
    @media (max-width: 800px) { .workspace { grid-template-columns: 1fr; } .preview-empty { min-height: 180px; } }
    @media (max-width: 500px) { .body { padding: 16px; } .composer, .preview { padding: 16px; } .intro { align-items: flex-start; } h2 { font-size: 17px; } [slot=actions] { display: grid; grid-template-columns: 1fr; } .cancel-action { margin-right: 0; } }
  `;u([h()],c.prototype,"_prompt",2);u([h()],c.prototype,"_busy",2);u([h()],c.prototype,"_content",2);u([h()],c.prototype,"_error",2);u([h()],c.prototype,"_includeContext",2);u([h()],c.prototype,"_contextHintDismissed",2);c=u([k("editor-assistant-ai-prompt-dialog")],c);export{c as default};
//# sourceMappingURL=ai-prompt-dialog.element-BAL0xBz_.js.map
