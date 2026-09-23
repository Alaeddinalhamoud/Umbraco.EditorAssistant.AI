import{UmbLitElement as h}from"@umbraco-cms/backoffice/lit-element";import{UMB_AUTH_CONTEXT as m}from"@umbraco-cms/backoffice/auth";import{html as l,css as f}from"@umbraco-cms/backoffice/external/lit";import{c as d,j as b}from"./client.gen-2SvRqEG3.js";import{r,t as g}from"./state-G4_ANB4m.js";var _=Object.defineProperty,v=Object.getOwnPropertyDescriptor,a=(e,i,s,o)=>{for(var n=o>1?void 0:o?v(i,s):i,p=e.length-1,u;p>=0;p--)(u=e[p])&&(n=(o?u(i,s,n):u(n))||n);return o&&n&&_(i,s,n),n};const c={Microsoft:"gpt-4o-mini",OpenAI:"gpt-4o-mini",Claude:"claude-3-5-sonnet-latest",Gemini:"gemini-3.5-flash",DeepSeek:"deepseek-chat",Ollama:"llama3.2"},y={Microsoft:"https://learn.microsoft.com/azure/ai-services/openai/concepts/models",OpenAI:"https://platform.openai.com/docs/models",Claude:"https://docs.anthropic.com/en/docs/about-claude/models",Gemini:"https://ai.google.dev/gemini-api/docs/models",DeepSeek:"https://api-docs.deepseek.com/quick_start/models",Ollama:"https://ollama.com/library"};let t=class extends h{constructor(){super(...arguments),this._provider="Microsoft",this._model=c.Microsoft,this._endpoint="",this._apiKey="",this._message="",this._error="",this._saving=!1,this._testing=!1,this._enabled=!0}connectedCallback(){super.connectedCallback(),this._configureAndLoad()}async _configureAndLoad(){(await this.getContext(m))?.configureClient(d),await this._load()}async _load(){const e=await d.get({url:"/umbraco/editorassistantaiumbraco/api/v1/Settings",security:[{scheme:"bearer",type:"http"}]});if(!e.response?.ok||!e.data)return;const i=e.data;this._provider=i.provider,this._model=i.model,this._endpoint=i.endpoint??"",this._enabled=i.enabled}async _save(e){if(e.preventDefault(),this._saving=!0,this._message="",this._error="",this._enabled){const s=await this._request("/TestConnection");if(!s.ok){this._error=await this._readError(s,"The API key or model could not be verified."),this._saving=!1;return}}const i=await this._request("/Settings");i.ok?this._message="Connection verified and settings saved.":this._error=await this._readError(i,"Settings could not be saved."),this._saving=!1}async _testConnection(){this._testing=!0,this._message="",this._error="";const e=await this._request("/TestConnection");e.ok?this._message="Connection verified successfully.":this._error=await this._readError(e,"The API key or model could not be verified."),this._testing=!1}_request(e){return d.post({url:`/umbraco/editorassistantaiumbraco/api/v1${e}`,security:[{scheme:"bearer",type:"http"}],bodySerializer:b.bodySerializer,headers:{"Content-Type":"application/json"},body:{provider:this._provider,model:this._model,endpoint:this._provider==="Microsoft"||this._provider==="Ollama"?this._endpoint:void 0,apiKey:this._apiKey||void 0,enabled:this._enabled}}).then(i=>i.response)}async _readError(e,i){const s=await e.text().catch(()=>"");if(s)try{const o=JSON.parse(s);if(o.detail||o.error||o.title)return o.detail??o.error??o.title}catch{return`${i}: ${s} (HTTP ${e.status})`}return`${i} (HTTP ${e.status})`}render(){return l`
      <div class="page">
        <header>
          <div class="eyebrow">EDITOR ASSISTANT</div>
          <h1><uui-icon name="icon-sparkles"></uui-icon> AI Assistant setup</h1>
          <p>Connect your preferred AI provider to enable page summaries on the public website.</p>
        </header>
        <uui-box>
          <form @submit=${this._save}>
            <div class="feature-toggle">
              <div class="toggle-copy">
                <span class="field-label"><uui-icon name="icon-power"></uui-icon><strong>Enable AI Assistant</strong></span>
                <small>The public summarize button is shown only while this is enabled and a valid API key is configured.</small>
              </div>
              <label class="switch">
                <input type="checkbox" .checked=${this._enabled} @change=${e=>this._enabled=e.target.checked} />
                <span class="slider"></span>
              </label>
            </div>
            <uui-form-layout-item>
              <div slot="label" class="field-label"><uui-icon name="icon-cloud"></uui-icon><uui-label>Provider</uui-label></div>
              <select .value=${this._provider} @change=${e=>{this._provider=e.target.value,this._model=c[this._provider]}}>
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
              <uui-input required .value=${this._model} placeholder=${c[this._provider]}
                @input=${e=>this._model=e.target.value}></uui-input>
              <small>Enter the exact model or deployment name from your provider.</small>
            </uui-form-layout-item>
            ${this._provider==="Microsoft"||this._provider==="Ollama"?l`
              <uui-form-layout-item>
                <div slot="label" class="field-label"><uui-icon name="icon-globe"></uui-icon><uui-label>${this._provider==="Ollama"?"Ollama endpoint":"Azure OpenAI endpoint"}</uui-label></div>
                <uui-input required .value=${this._endpoint} placeholder=${this._provider==="Ollama"?"http://localhost:11434":"https://your-resource.openai.azure.com"}
                  @input=${e=>this._endpoint=e.target.value}></uui-input>
              </uui-form-layout-item>
            `:""}
            ${this._provider!=="Ollama"?l`<uui-form-layout-item>
              <div slot="label" class="field-label"><uui-icon name="icon-lock"></uui-icon><uui-label>API key</uui-label></div>
              <uui-input type="password" placeholder="Leave blank to keep the saved key" .value=${this._apiKey}
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
              <uui-button type="submit" look="primary" .disabled=${this._saving||this._testing}>
                <uui-icon name="icon-check"></uui-icon>${this._saving?"Verifying...":"Verify & save"}
              </uui-button>
            </div>
            ${this._message?l`<p class="success" role="status">${this._message}</p>`:""}
            ${this._error?l`<p class="error" role="alert">${this._error}</p>`:""}
          </form>
        </uui-box>
        <div class="plan-note" role="note">
          <uui-icon name="icon-info"></uui-icon>
          <p><strong>A friendly tip:</strong> Free AI plans are useful for trying things out, but they may have slower responses, usage limits, or less consistent results. For the best experience on a live website, a paid plan is recommended.</p>
        </div>
      </div>
    `}};t.styles=f`
    :host { display: block; min-height: 100%; padding: 32px; background: #f7f8fa; color: #1f2937; }
    .page { max-width: 760px; margin: 0 auto; }
    header { margin-bottom: 24px; }
    .eyebrow { color: #635bff; font-size: 11px; font-weight: 700; letter-spacing: .14em; }
    h1 { margin: 8px 0; font-size: 30px; letter-spacing: -.02em; }
    header p { margin: 0; color: #667085; }
    .plan-note { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; padding: 12px 14px; border: 1px solid #c7d7fe; border-radius: 10px; background: #eff4ff; color: #344054; font-size: 13px; line-height: 1.45; }
    .plan-note uui-icon { flex: 0 0 auto; margin-top: 1px; color: #4f46e5; font-size: 18px; }
    .plan-note p { margin: 0; }
    uui-box { display: block; padding: 28px; }
    .feature-toggle { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 16px; margin-bottom: 28px; border: 1px solid #e4e7ec; border-radius: 10px; background: #fafaff; }
    .toggle-copy { min-width: 0; }
    .switch { position: relative; flex: 0 0 auto; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; inset: 0; border-radius: 999px; background: #cfd4dc; cursor: pointer; transition: .2s; }
    .slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 50%; background: white; box-shadow: 0 1px 3px #0003; transition: .2s; }
    .switch input:checked + .slider { background: #635bff; }
    .switch input:checked + .slider::before { transform: translateX(20px); }
    select, uui-input { width: 100%; box-sizing: border-box; }
    select { padding: 10px; }
    .label-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; }
    .field-label { display: inline-flex; align-items: center; gap: 7px; }
    .field-label uui-icon { color: #635bff; font-size: 16px; }
    .label-row a { color: #635bff; font-size: 12px; font-weight: 600; text-decoration: none; }
    .label-row a:hover { text-decoration: underline; }
    .label-row a uui-icon { vertical-align: -2px; margin-right: 3px; }
    small { display: block; margin-top: 6px; color: #667085; font-size: 12px; }
    .actions { display: flex; gap: 12px; margin-top: 24px; }
    .success { color: #087443; }
    .error { color: #b42318; }
  `;a([r()],t.prototype,"_provider",2);a([r()],t.prototype,"_model",2);a([r()],t.prototype,"_endpoint",2);a([r()],t.prototype,"_apiKey",2);a([r()],t.prototype,"_message",2);a([r()],t.prototype,"_error",2);a([r()],t.prototype,"_saving",2);a([r()],t.prototype,"_testing",2);a([r()],t.prototype,"_enabled",2);t=a([g("editor-assistant-settings")],t);const O=t;export{t as AIAssistantSettings,O as default};
//# sourceMappingURL=ai-assistant-BV9tCera.js.map
