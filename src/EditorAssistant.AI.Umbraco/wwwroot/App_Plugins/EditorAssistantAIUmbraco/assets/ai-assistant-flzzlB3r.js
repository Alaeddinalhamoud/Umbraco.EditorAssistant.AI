import{UmbLitElement as g}from"@umbraco-cms/backoffice/lit-element";import{UMB_AUTH_CONTEXT as m}from"@umbraco-cms/backoffice/auth";import{html as l,css as h}from"@umbraco-cms/backoffice/external/lit";import{c as p,j as f}from"./client.gen-2SvRqEG3.js";import{r as s,t as v}from"./state-G4_ANB4m.js";var x=Object.defineProperty,b=Object.getOwnPropertyDescriptor,o=(e,i,r,a)=>{for(var n=a>1?void 0:a?b(i,r):i,c=e.length-1,d;c>=0;c--)(d=e[c])&&(n=(a?d(i,r,n):d(n))||n);return a&&n&&x(i,r,n),n};const u={Microsoft:"gpt-4o-mini",OpenAI:"gpt-4o-mini",Claude:"claude-3-5-sonnet-latest",Gemini:"gemini-3.5-flash",DeepSeek:"deepseek-chat",Ollama:"llama3.2"},y={Microsoft:"https://learn.microsoft.com/azure/ai-services/openai/concepts/models",OpenAI:"https://platform.openai.com/docs/models",Claude:"https://docs.anthropic.com/en/docs/about-claude/models",Gemini:"https://ai.google.dev/gemini-api/docs/models",DeepSeek:"https://api-docs.deepseek.com/quick_start/models",Ollama:"https://ollama.com/library"};let t=class extends g{constructor(){super(...arguments),this._provider="Microsoft",this._model=u.Microsoft,this._endpoint="",this._apiKey="",this._message="",this._error="",this._saving=!1,this._testing=!1,this._summariesEnabled=!0}connectedCallback(){super.connectedCallback(),this._configureAndLoad()}async _configureAndLoad(){(await this.getContext(m))?.configureClient(p),await this._load()}async _load(){const e=await p.get({url:"/umbraco/editorassistantaiumbraco/api/v1/Settings",security:[{scheme:"bearer",type:"http"}]});if(!e.response?.ok||!e.data)return;const i=e.data;this._provider=i.provider,this._model=i.model,this._endpoint=i.endpoint??"",this._summariesEnabled=i.enabled}async _save(e){e.preventDefault(),this._saving=!0,this._message="",this._error="";const i=await this._request("/TestConnection");if(!i.ok){this._error=await this._readError(i,"The API key or model could not be verified."),this._saving=!1;return}const r=await this._request("/Settings");r.ok?this._message=this._summariesEnabled?"Connection verified and settings saved. Page summaries are enabled.":"Connection verified and settings saved. Page summaries are disabled.":this._error=await this._readError(r,"Settings could not be saved."),this._saving=!1}async _testConnection(){this._testing=!0,this._message="",this._error="";const e=await this._request("/TestConnection");e.ok?this._message="Connection verified successfully.":this._error=await this._readError(e,"The API key or model could not be verified."),this._testing=!1}_request(e){return p.post({url:`/umbraco/editorassistantaiumbraco/api/v1${e}`,security:[{scheme:"bearer",type:"http"}],bodySerializer:f.bodySerializer,headers:{"Content-Type":"application/json"},body:{provider:this._provider,model:this._model,endpoint:this._provider==="Microsoft"||this._provider==="Ollama"?this._endpoint:void 0,apiKey:this._apiKey||void 0,enabled:this._summariesEnabled}}).then(i=>i.response)}async _readError(e,i){const r=await e.text().catch(()=>"");if(r)try{const a=JSON.parse(r);if(a.detail||a.error||a.title)return a.detail??a.error??a.title}catch{return`${i}: ${r} (HTTP ${e.status})`}return`${i} (HTTP ${e.status})`}render(){return l`
      <div class="page">
        <header><div class="hero-icon"><umb-icon name="icon-editor-assistant-ai"></umb-icon></div><div class="hero-copy">
          <div class="eyebrow">EDITOR ASSISTANT</div>
          <h1>AI Assistant</h1>
          <p>A little help for your next great page. Give editors a writing companion and visitors a clearer overview of your content.</p>
        </div><div class="hero-tags"><span class="hero-tag"><umb-icon name="icon-edit"></umb-icon> Rich text editing</span><span class="hero-tag"><umb-icon name="icon-document"></umb-icon> Page summaries</span></div></header>
        <div class="workspace"><main class="configuration" aria-label="Provider configuration"><div class="section-heading"><span class="step-number">1</span><div><h2 class="configuration-heading">Connect your AI provider</h2><p class="section-subtitle">One connection. Two ways to help.</p></div></div>
        <p class="configuration-copy">Choose your provider, test the connection, and save. These settings are shared by the Rich Text Editor assistant and page summaries.</p>
        <div class="settings-card">
          <div class="card-intro"><div class="card-icon"><umb-icon name="icon-cloud"></umb-icon></div><div><h3>Provider settings</h3><p>Your connection powers both AI features.</p></div></div>
          <form @submit=${this._save}>
            <uui-form-layout-item>
              <div slot="label" class="field-label"><uui-icon name="icon-cloud"></uui-icon><uui-label for="ai-provider">Provider</uui-label></div>
              <select id="ai-provider" aria-label="AI provider" .value=${this._provider} @change=${e=>{this._provider=e.target.value,this._model=u[this._provider]}}>
                <option value="Microsoft">Microsoft Azure OpenAI</option>
                <option value="OpenAI">OpenAI</option>
                <option value="Claude">Anthropic Claude</option>
                <option value="Gemini">Google Gemini</option>
                <option value="DeepSeek">DeepSeek</option>
                <option value="Ollama">Ollama (local)</option>
              </select>
            </uui-form-layout-item>
            <uui-form-layout-item>
              <div slot="label" class="label-row">
                <span class="field-label"><uui-icon name="icon-brick"></uui-icon><uui-label>Model / deployment</uui-label></span>
                <a href=${y[this._provider]} target="_blank" rel="noopener noreferrer">
                  <uui-icon name="icon-link"></uui-icon> View available models
                </a>
              </div>
              <uui-input aria-label="Model or deployment" required .value=${this._model} placeholder=${u[this._provider]}
                @input=${e=>this._model=e.target.value}></uui-input>
              <small>Enter the exact model or deployment name from your provider.</small>
            </uui-form-layout-item>
            ${this._provider==="Microsoft"||this._provider==="Ollama"?l`
              <uui-form-layout-item>
                <div slot="label" class="field-label"><uui-icon name="icon-globe"></uui-icon><uui-label>${this._provider==="Ollama"?"Ollama endpoint":"Azure OpenAI endpoint"}</uui-label></div>
                <uui-input aria-label="Provider endpoint" required .value=${this._endpoint} placeholder=${this._provider==="Ollama"?"http://localhost:11434":"https://your-resource.openai.azure.com"}
                  @input=${e=>this._endpoint=e.target.value}></uui-input>
              </uui-form-layout-item>
            `:""}
            ${this._provider!=="Ollama"?l`<uui-form-layout-item>
              <div slot="label" class="field-label"><uui-icon name="icon-lock"></uui-icon><uui-label>API key</uui-label></div>
              <uui-input aria-label="API key" type="password" placeholder="Leave blank to keep the saved key" .value=${this._apiKey}
                @input=${e=>this._apiKey=e.target.value}></uui-input>
              <small>Your key is encrypted and never returned to the browser.</small>
            </uui-form-layout-item>`:l`
              <div class="ollama-note">
                <uui-icon name="icon-check"></uui-icon>
                Ollama runs locally and does not require an API key.
              </div>
            `}
            <div class="actions">
              <uui-button type="button" look="secondary" .disabled=${this._testing||this._saving}
                @click=${this._testConnection}><uui-icon name="icon-wifi"></uui-icon>${this._testing?"Testing...":"Test connection"}</uui-button>
              <uui-button type="submit" look="primary" color="positive" .disabled=${this._saving||this._testing}>
                <uui-icon name="icon-check"></uui-icon>${this._saving?"Saving...":"Verify & save"}
              </uui-button>
            </div>
            ${this._message?l`<p class="success" role="status">${this._message}</p>`:""}
            ${this._error?l`<p class="error" role="alert">${this._error}</p>`:""}
          </form>
        </div>
        </main><aside class="guide" aria-label="Setup guide"><div class="section-heading"><span class="step-number">2</span><div><h2 class="configuration-heading">Make it yours</h2><p class="section-subtitle">Choose where your assistant can help.</p></div></div>
        <section class="features" aria-label="AI Assistant features">
          <article class="feature-card feature-editor">
            <div class="feature-heading"><umb-icon name="icon-editor-assistant-ai"></umb-icon><span class="feature-audience">FOR EDITORS</span></div>
            <h2>Rich Text Editor assistant</h2>
            <p>Write new content or improve selected text directly from the rich text toolbar. Give AI an instruction and optionally include the field's existing text as context.</p>
            <ul>
              <li>Preview generated content before changing the field.</li>
              <li>Insert at the cursor, replace a selection, or insert after it.</li>
              <li>Regenerate results and keep supported rich text formatting.</li>
            </ul>
            <div class="feature-setup"><strong>Get started</strong><p>In <strong>Settings &rarr; Data Types</strong>, open your Rich Text Editor data type, add <strong>AI Assistant</strong> to its toolbar, and save. Open a content item to use the button.</p></div>
          </article>
          <article class="feature-card feature-visitor">
            <div class="feature-heading"><umb-icon name="icon-document"></umb-icon><span class="feature-audience">FOR WEBSITE VISITORS</span></div>
            <h2>Page summaries</h2>
            <div class="feature-toggle summaries-toggle">
              <div class="toggle-copy">
                <span class="field-label"><uui-icon name="icon-power"></uui-icon><strong>Enable page summaries</strong></span>
                <small>Let website visitors summarize pages. Save provider settings to apply.</small>
              </div>
              <label class="switch">
                <input type="checkbox" role="switch" aria-label="Enable page summaries" .checked=${this._summariesEnabled} @change=${e=>this._summariesEnabled=e.target.checked} />
                <span class="slider"></span>
              </label>
            </div>

            <p>Let visitors get the key points of the page they are reading with a floating <strong>Summarize page</strong> button on your public website.</p>
            <ul>
              <li>Summarize the current page on demand.</li>
              <li>Read concise points in a floating dialog.</li>
              <li>Reuse identical responses through a five-minute cache.</li>
            </ul>
            <div class="feature-setup"><strong>Get started</strong><p>Add the frontend script to your public Razor layout before <code>&lt;/body&gt;</code>. Use the script tag below.</p></div>
          </article>
        </section>
        <details class="script-help">
          <summary>Frontend script for page summaries</summary>
          <p>Add this once to each public layout where you want the summarize button to appear:</p>
          <pre><code>${'<script type="module" src="@Url.Content("~/App_Plugins/EditorAssistantAIUmbraco/editor-assistant-frontend.js")"><\/script>'}</code></pre>
        </details>
        </aside></div><div class="plan-note" role="note">
          <uui-icon name="icon-info"></uui-icon>
          <p><strong>What is sent to AI?</strong> Page summaries send the current page text when a visitor requests a summary. The Rich Text Editor assistant sends the editor's prompt, selected text, and any field context they choose to include. Editors review generated content before inserting it.</p>
        </div>
        <footer class="package-footer">
          <a href=${"https://github.com/Alaeddinalhamoud/Umbraco.EditorAssistant.AI"} target="_blank" rel="noopener noreferrer">
            <umb-icon name="icon-link"></umb-icon> GitHub repository
          </a>
          <span>Editor Assistant AI &middot; Version ${"1.2.0"}</span>
        </footer>
      </div>
    `}};t.styles=h`
    :host { --assistant-accent: var(--uui-color-interactive, #3544b1); --assistant-tint: color-mix(in srgb, var(--assistant-accent) 7%, var(--uui-color-surface, white)); }
    * { box-sizing: border-box; }
    :host { display: block; min-height: 100%; padding: 32px; background: var(--uui-color-surface-alt, #f7f8fa); color: var(--uui-color-text, #1f2937); }
    .page { max-width: 1320px; margin: 0 auto; }
    header { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding: 32px; border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 18px; background: linear-gradient(115deg, var(--uui-color-surface, #fff), var(--assistant-tint)); }
    .hero-icon { display: grid; place-items: center; flex: 0 0 64px; height: 64px; border-radius: 18px; background: var(--assistant-tint); border: 1px solid color-mix(in srgb, var(--assistant-accent) 15%, transparent); color: var(--assistant-accent); font-size: 32px; }
    .hero-copy { flex: 1; }
    header p { max-width: 650px; line-height: 1.6; font-size: 14px; }
    .hero-tags { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .hero-tag { border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 999px; padding: 7px 12px; background: var(--uui-color-surface, white); color: var(--uui-color-text-alt, #667085); font-size: 12px; white-space: nowrap; }
    .workspace { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); align-items: start; gap: 28px; margin-bottom: 28px; }
    .configuration, .guide { min-width: 0; }
    .section-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .step-number { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 10px; background: var(--assistant-tint); color: var(--assistant-accent); font-size: 13px; font-weight: 700; }
    .section-subtitle { margin: 4px 0 0; color: var(--uui-color-text-alt, #667085); font-size: 13px; }
    .settings-card { padding: 24px; border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 14px; background: var(--uui-color-surface, #fff); box-shadow: 0 4px 16px #18234405; }
    .card-intro { display: flex; align-items: center; gap: 12px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--uui-color-border, #e4e7ec); }
    .card-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--assistant-tint); color: var(--assistant-accent); font-size: 20px; }
    .card-intro h3 { margin: 0 0 4px; font-size: 16px; }
    .card-intro p { margin: 0; font-size: 13px; color: var(--uui-color-text-alt, #667085); }
    .eyebrow { color: var(--assistant-accent); font-size: 11px; font-weight: 700; letter-spacing: .14em; }
    h1 { margin: 8px 0; font-size: clamp(26px, 3vw, 36px); letter-spacing: -.02em; }
    header p { margin: 0; color: var(--uui-color-text-alt, #667085); }
    h1 umb-icon { vertical-align: -3px; color: var(--assistant-accent); }
    .features { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
    .feature-card { display: flex; flex-direction: column; padding: 24px; border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 14px; background: var(--uui-color-surface, white); }
    .feature-heading { display: flex; align-items: center; gap: 10px; color: var(--assistant-accent); }
    .feature-heading umb-icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--assistant-tint); font-size: 20px; }
    .feature-audience { font-size: 11px; font-weight: 700; letter-spacing: .08em; }
    .feature-card h2 { margin: 12px 0 8px; font-size: 18px; }
    .feature-card p, .feature-card li { font-size: 14px; line-height: 1.6; color: var(--uui-color-text-alt, #475467); }
    .feature-card p { margin: 0; }
    .feature-card ul { padding-left: 20px; margin: 16px 0 20px; }
    .feature-card li::marker { color: var(--assistant-accent); }
    .feature-card li + li { margin-top: 6px; }
    .feature-setup { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--uui-color-border, #e4e7ec); }
    .feature-setup > strong { display: block; margin-bottom: 6px; font-size: 13px; }
    .script-help { padding: 16px 20px; background: var(--uui-color-surface, white); border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 10px; margin-bottom: 0; }
    .script-help summary { cursor: pointer; font-size: 14px; font-weight: 600; }
    .script-help p { font-size: 13px; color: var(--uui-color-text-alt, #475467); }
    pre { overflow-x: auto; padding: 14px; border-radius: 6px; background: var(--uui-color-surface-alt, #f7f8fa); font-size: 12px; }
    .configuration-heading { margin: 0; font-size: 19px; letter-spacing: -.02em; }
    .configuration-copy { margin: 0 0 20px; color: var(--uui-color-text-alt, #667085); font-size: 14px; line-height: 1.6; }
    .plan-note { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; padding: 18px 20px; border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 12px; background: var(--uui-color-surface, white); color: var(--uui-color-text-alt, #667085); font-size: 13px; line-height: 1.65; }
    .plan-note uui-icon { flex: 0 0 auto; margin-top: 2px; color: var(--assistant-accent); font-size: 20px; }
    .plan-note p { margin: 0; }
    uui-box { display: block; padding: 28px; }
    .feature-toggle { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 16px; margin-bottom: 28px; border: 1px solid var(--uui-color-border, #e4e7ec); border-radius: 10px; background: var(--assistant-tint); }
    .toggle-copy { min-width: 0; }
    .summaries-toggle { margin: 8px 0 16px; padding: 14px; background: var(--feature-tint); }
    .summaries-toggle .field-label uui-icon { color: var(--feature-accent); }
    .summaries-toggle .switch input:checked + .slider { background: var(--feature-accent); }
    .switch { position: relative; flex: 0 0 auto; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; inset: 0; border-radius: 999px; background: var(--uui-color-border-emphasis, #cfd4dc); cursor: pointer; transition: .2s; }
    .slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 50%; background: white; box-shadow: 0 1px 3px #0003; transition: .2s; }
    .switch input:checked + .slider { background: var(--assistant-accent); }
    .switch input:checked + .slider::before { transform: translateX(20px); }
    .switch input:focus-visible + .slider { outline: 2px solid var(--assistant-accent); outline-offset: 3px; }
    select, uui-input { width: 100%; box-sizing: border-box; }
    select { min-height: 42px; padding: 10px 12px; border: 1px solid var(--uui-color-border, #cdd3dc); border-radius: 6px; background: var(--uui-color-surface, #fff); color: inherit; font: inherit; cursor: pointer; }
    select:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid var(--assistant-accent); outline-offset: 3px; }
    uui-form-layout-item { margin-bottom: 20px; }
    small { line-height: 1.5; }
    .label-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; }
    .field-label { display: inline-flex; align-items: center; gap: 7px; }
    .field-label uui-icon { color: var(--assistant-accent); font-size: 16px; }
    .label-row a { color: var(--assistant-accent); font-size: 12px; font-weight: 600; text-decoration: none; }
    .label-row a:hover { text-decoration: underline; }
    .label-row a uui-icon { vertical-align: -2px; margin-right: 3px; }
    small { display: block; margin-top: 6px; color: var(--uui-color-text-alt, #667085); font-size: 12px; }
    .actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--uui-color-border, #eaecf0); }
    .success, .error { padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
    .success { color: var(--uui-color-text); background: color-mix(in srgb, var(--uui-color-positive) 10%, var(--uui-color-surface)); border: 1px solid var(--uui-color-positive); border-left-width: 4px; }
    .error { color: var(--uui-color-text); background: color-mix(in srgb, var(--uui-color-danger) 10%, var(--uui-color-surface)); border: 1px solid var(--uui-color-danger); border-left-width: 4px; }
    .ollama-note { padding: 12px; border-radius: 8px; background: var(--assistant-tint); color: var(--assistant-accent); font-size: 13px; }
    @media (max-width: 1000px) { .workspace { grid-template-columns: 1fr; } .features { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .package-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--uui-color-border, #e4e7ec); color: var(--uui-color-text-alt, #667085); font-size: 12px; }
    .package-footer a { display: inline-flex; align-items: center; gap: 6px; color: var(--assistant-accent); text-decoration: none; }
    .package-footer a:hover { text-decoration: underline; }
    @media (max-width: 700px) {
      :host { padding: 16px; }
      header { flex-wrap: wrap; padding: 20px; gap: 12px; }
      .hero-copy { flex-basis: calc(100% - 80px); }
      .hero-tags { flex-direction: row; flex-wrap: wrap; align-items: center; margin-left: 0; }
      .settings-card { padding: 18px; }
      .features { grid-template-columns: 1fr; }
      .label-row { flex-wrap: wrap; }
      uui-box { padding: 16px; }
    }

    /* Blend accents with the active Umbraco theme, including dark surfaces. */
    :host {
      --assistant-positive: var(--uui-color-positive, #16836b);
      --assistant-violet: var(--uui-color-selected, #6750a4);
      padding: clamp(16px, 3vw, 40px);
    }
    header {
      border-top: 3px solid var(--assistant-accent);
      background: linear-gradient(115deg, var(--uui-color-surface) 20%, var(--assistant-tint) 75%, color-mix(in srgb, var(--assistant-violet) 12%, var(--uui-color-surface)));
    }
    .hero-icon { background: var(--uui-color-surface); box-shadow: 0 4px 16px color-mix(in srgb, var(--assistant-accent) 10%, transparent); }
    .hero-tag { display: inline-flex; align-items: center; gap: 7px; }
    .hero-tag:first-child { color: var(--assistant-violet); }
    .hero-tag:last-child { color: var(--assistant-positive); }
    .settings-card { border-top: 3px solid var(--assistant-accent); box-shadow: 0 4px 20px color-mix(in srgb, var(--uui-color-text) 4%, transparent); }
    .guide .step-number { color: var(--assistant-positive); background: color-mix(in srgb, var(--assistant-positive) 10%, var(--uui-color-surface)); }
    .feature-card {
      --feature-accent: var(--assistant-violet);
      --feature-tint: color-mix(in srgb, var(--feature-accent) 8%, var(--uui-color-surface));
      border-top: 3px solid var(--feature-accent);
      background: linear-gradient(135deg, var(--feature-tint), var(--uui-color-surface) 65%);
    }
    .feature-visitor { --feature-accent: var(--assistant-positive); }
    .feature-heading { color: var(--feature-accent); }
    .feature-heading umb-icon { background: var(--feature-tint); }
    .feature-card li::marker { color: var(--feature-accent); }
    .feature-setup {
      padding: 14px 16px;
      border: 1px solid color-mix(in srgb, var(--feature-accent) 20%, var(--uui-color-border));
      border-radius: 8px;
      background: var(--uui-color-surface);
    }
    .plan-note { border-left: 3px solid var(--assistant-accent); }
    .actions uui-icon { margin-right: 6px; }
    @media (max-width: 700px) {
      .actions { flex-direction: column-reverse; }
      .actions uui-button { width: 100%; }
      .feature-card { padding: 18px; }
    }
    @media (prefers-reduced-motion: reduce) { .slider, .slider::before { transition: none; } }
  `;o([s()],t.prototype,"_provider",2);o([s()],t.prototype,"_model",2);o([s()],t.prototype,"_endpoint",2);o([s()],t.prototype,"_apiKey",2);o([s()],t.prototype,"_message",2);o([s()],t.prototype,"_error",2);o([s()],t.prototype,"_saving",2);o([s()],t.prototype,"_testing",2);o([s()],t.prototype,"_summariesEnabled",2);t=o([v("editor-assistant-settings")],t);const $=t;export{t as AIAssistantSettings,$ as default};
//# sourceMappingURL=ai-assistant-flzzlB3r.js.map
