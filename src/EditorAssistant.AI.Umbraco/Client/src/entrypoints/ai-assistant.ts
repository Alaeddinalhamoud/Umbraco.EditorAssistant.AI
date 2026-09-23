import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { css, html } from '@umbraco-cms/backoffice/external/lit';
import { client } from '../api/client.gen.js';
import { jsonBodySerializer } from '../api/core/bodySerializer.gen.js';
import { customElement, state } from 'lit/decorators.js';

type Provider = 'Microsoft' | 'OpenAI' | 'Claude' | 'Gemini' | 'DeepSeek' | 'Ollama';
type Settings = { provider: Provider; model: string; endpoint?: string; enabled: boolean };

const defaultModels: Record<Provider, string> = {
  Microsoft: 'gpt-4o-mini',
  OpenAI: 'gpt-4o-mini',
  Claude: 'claude-3-5-sonnet-latest',
  Gemini: 'gemini-3.5-flash',
  DeepSeek: 'deepseek-chat',
  Ollama: 'llama3.2',
};

const modelDocumentation: Record<Provider, string> = {
  Microsoft: 'https://learn.microsoft.com/azure/ai-services/openai/concepts/models',
  OpenAI: 'https://platform.openai.com/docs/models',
  Claude: 'https://docs.anthropic.com/en/docs/about-claude/models',
  Gemini: 'https://ai.google.dev/gemini-api/docs/models',
  DeepSeek: 'https://api-docs.deepseek.com/quick_start/models',
  Ollama: 'https://ollama.com/library',
};

@customElement('editor-assistant-settings')
export class AIAssistantSettings extends UmbLitElement {
  @state() private _provider: Provider = 'Microsoft';
  @state() private _model = defaultModels.Microsoft;
  @state() private _endpoint = '';
  @state() private _apiKey = '';
  @state() private _message = '';
  @state() private _error = '';
  @state() private _saving = false;
  @state() private _testing = false;
  @state() private _enabled = true;

  connectedCallback() {
    super.connectedCallback();
    void this._configureAndLoad();
  }

  private async _configureAndLoad() {
    const authContext = await this.getContext(UMB_AUTH_CONTEXT);
    authContext?.configureClient(client);
    await this._load();
  }

  private async _load() {
    const result = await client.get<Settings>({
      url: '/umbraco/editorassistantaiumbraco/api/v1/Settings',
      security: [{ scheme: 'bearer', type: 'http' }],
    });
    if (!result.response?.ok || !result.data) return;
    const settings = result.data as unknown as Settings;
    this._provider = settings.provider;
    this._model = settings.model;
    this._endpoint = settings.endpoint ?? '';
    this._enabled = settings.enabled;
  }

  private async _save(event: SubmitEvent) {
    event.preventDefault();
    this._saving = true;
    this._message = '';
    this._error = '';
    if (this._enabled) {
      const testResponse = await this._request('/TestConnection');
      if (!testResponse.ok) {
        this._error = await this._readError(testResponse, 'The API key or model could not be verified.');
        this._saving = false;
        return;
      }
    }
    const response = await this._request('/Settings');
    if (response.ok) this._message = 'Connection verified and settings saved.';
    else this._error = await this._readError(response, 'Settings could not be saved.');
    this._saving = false;
  }

  private async _testConnection() {
    this._testing = true;
    this._message = '';
    this._error = '';
    const response = await this._request('/TestConnection');
    if (response.ok) this._message = 'Connection verified successfully.';
    else this._error = await this._readError(response, 'The API key or model could not be verified.');
    this._testing = false;
  }

  private _request(path: string) {
    return client.post({
      url: `/umbraco/editorassistantaiumbraco/api/v1${path}`,
      security: [{ scheme: 'bearer', type: 'http' }],
      bodySerializer: jsonBodySerializer.bodySerializer,
      headers: { 'Content-Type': 'application/json' },
      body: {
        provider: this._provider,
        model: this._model,
        endpoint: this._provider === 'Microsoft' || this._provider === 'Ollama' ? this._endpoint : undefined,
        apiKey: this._apiKey || undefined,
        enabled: this._enabled,
      },
    }).then(result => result.response!);
  }

  private async _readError(response: Response, fallback: string) {
    const body = await response.text().catch(() => '');
    if (body) {
      try {
        const problem = JSON.parse(body) as { detail?: string; title?: string; error?: string };
        if (problem.detail || problem.error || problem.title) {
          return problem.detail ?? problem.error ?? problem.title!;
        }
      } catch {
        return `${fallback}: ${body} (HTTP ${response.status})`;
      }
    }

    return `${fallback} (HTTP ${response.status})`;
  }

  render() {
    return html`
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
                <input type="checkbox" .checked=${this._enabled} @change=${(e: Event) =>
                  this._enabled = (e.target as HTMLInputElement).checked} />
                <span class="slider"></span>
              </label>
            </div>
            <uui-form-layout-item>
              <div slot="label" class="field-label"><uui-icon name="icon-cloud"></uui-icon><uui-label>Provider</uui-label></div>
              <select .value=${this._provider} @change=${(e: Event) => {
                this._provider = (e.target as HTMLSelectElement).value as Provider;
                this._model = defaultModels[this._provider];
              }}>
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
                <a href=${modelDocumentation[this._provider]} target="_blank" rel="noopener noreferrer">
                  <uui-icon name="icon-link"></uui-icon> View available models
                </a>
              </div>
              <uui-input required .value=${this._model} placeholder=${defaultModels[this._provider]}
                @input=${(e: Event) => this._model = (e.target as HTMLInputElement).value}></uui-input>
              <small>Enter the exact model or deployment name from your provider.</small>
            </uui-form-layout-item>
            ${this._provider === 'Microsoft' || this._provider === 'Ollama' ? html`
              <uui-form-layout-item>
                <div slot="label" class="field-label"><uui-icon name="icon-globe"></uui-icon><uui-label>${this._provider === 'Ollama' ? 'Ollama endpoint' : 'Azure OpenAI endpoint'}</uui-label></div>
                <uui-input required .value=${this._endpoint} placeholder=${this._provider === 'Ollama' ? 'http://localhost:11434' : 'https://your-resource.openai.azure.com'}
                  @input=${(e: Event) => this._endpoint = (e.target as HTMLInputElement).value}></uui-input>
              </uui-form-layout-item>
            ` : ''}
            ${this._provider !== 'Ollama' ? html`<uui-form-layout-item>
              <div slot="label" class="field-label"><uui-icon name="icon-lock"></uui-icon><uui-label>API key</uui-label></div>
              <uui-input type="password" placeholder="Leave blank to keep the saved key" .value=${this._apiKey}
                @input=${(e: Event) => this._apiKey = (e.target as HTMLInputElement).value}></uui-input>
              <small>Your key is encrypted and never returned to the browser.</small>
            </uui-form-layout-item>` : html`
              <div class="ollama-note">
                <uui-icon name="icon-check"></uui-icon>
                Ollama runs locally and does not require an API key.
              </div>
            `}
            <div class="actions">
              <uui-button type="button" look="secondary" .disabled=${this._testing || this._saving}
                @click=${this._testConnection}><uui-icon name="icon-wifi"></uui-icon>${this._testing ? 'Testing...' : 'Test connection'}</uui-button>
              <uui-button type="submit" look="primary" .disabled=${this._saving || this._testing}>
                <uui-icon name="icon-check"></uui-icon>${this._saving ? 'Verifying...' : 'Verify & save'}
              </uui-button>
            </div>
            ${this._message ? html`<p class="success" role="status">${this._message}</p>` : ''}
            ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : ''}
          </form>
        </uui-box>
        <div class="plan-note" role="note">
          <uui-icon name="icon-info"></uui-icon>
          <p><strong>A friendly tip:</strong> Free AI plans are useful for trying things out, but they may have slower responses, usage limits, or less consistent results. For the best experience on a live website, a paid plan is recommended.</p>
        </div>
      </div>
    `;
  }

  static styles = css`
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
  `;
}

export default AIAssistantSettings;
