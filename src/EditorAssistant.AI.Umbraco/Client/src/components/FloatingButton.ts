import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('editor-assistant-floating-button')
export class FloatingButton extends LitElement {
  @state() private _summary = '';
  @state() private _isOpen = false;
  @state() private _isLoading = false;
  @state() private _error = '';

  private _summaryPoints() {
    return this._summary
      .split(/\r?\n/)
      .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
      .map(line => line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#+\s*/, ''))
      .filter(Boolean);
  }

  private async _summarize() {
    this._isLoading = true;
    this._error = '';
    try {
      const response = await fetch('/umbraco/editorassistantaiumbraco/api/v1/Summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: document.body.innerText }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => undefined) as { detail?: string } | undefined;
        throw new Error(problem?.detail ?? 'The page could not be summarized.');
      }

      const data = await response.json() as { summary: string };
      this._summary = data.summary;
      this._isOpen = true;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'The page could not be summarized.';
      this._isOpen = true;
    } finally {
      this._isLoading = false;
    }
  }

  render() {
    return html`
      <button class="trigger" @click=${this._summarize} ?disabled=${this._isLoading}>
        <svg class="trigger-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path>
          <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"></path>
        </svg>
        <span>${this._isLoading ? 'Summarizing...' : 'Summarize page'}</span>
      </button>
      ${this._isOpen ? html`
        <div class="overlay" role="presentation" @click=${(event: MouseEvent) => {
          if (event.target === event.currentTarget) this._isOpen = false;
        }}>
          <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="summary-title">
            <button class="close" aria-label="Close" @click=${() => this._isOpen = false}>×</button>
            <div class="dialog-header">
              <div class="header-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path>
                  <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"></path>
                </svg>
              </div>
              <div>
                <h2 id="summary-title">Page summary</h2>
                <p class="subtitle">Here are the key points from this page.</p>
              </div>
            </div>
            ${this._error
              ? html`
                <div class="error-card" role="alert">
                  <span class="status-icon" aria-hidden="true">!</span>
                  <p class="error">${this._error}</p>
                </div>
              `
              : html`
                <ul class="summary-list">
                  ${this._summaryPoints().map(point => html`
                    <li>
                      <span class="point-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="m7 12 3 3 7-7"></path>
                        </svg>
                      </span>
                      <span>${point}</span>
                    </li>
                  `)}
                </ul>
              `}
          </section>
        </div>
      ` : ''}
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 10000;
      display: block;
      margin: 0;
      pointer-events: none;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .trigger {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid #ffffff33; border-radius: 999px; padding: 13px 19px;
      color: white; background: linear-gradient(135deg, #4338ca, #7c3aed);
      box-shadow: 0 8px 24px #312e8166, inset 0 1px #ffffff44;
      cursor: pointer; font: 600 14px/1 inherit; transition: transform .18s, box-shadow .18s;
      pointer-events: auto;
    }
    .trigger-icon { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .trigger:hover { transform: translateY(-2px); box-shadow: 0 12px 28px #312e8180, inset 0 1px #ffffff55; }
    .trigger:disabled { opacity: .7; cursor: wait; }
    .overlay {
      position: fixed; inset: 0; display: grid; place-items: center;
      padding: 16px; background: #0008; z-index: 10001;
      pointer-events: auto;
    }
    .dialog {
      position: relative; box-sizing: border-box; width: min(560px, 100%);
      max-height: min(80vh, 720px);
      overflow: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 20px;
      background: linear-gradient(180deg, #ffffff, #f8faff); color: #1f2937;
      box-shadow: 0 24px 70px #11182740;
    }
    .dialog-header { display: flex; align-items: center; gap: 14px; padding-right: 28px; }
    .header-icon {
      display: grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px;
      border-radius: 14px; color: #4f46e5; background: #eef2ff;
    }
    .header-icon svg { width: 25px; height: 25px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    h2 { margin: 0; font-size: 1.3rem; letter-spacing: -.02em; }
    .subtitle { margin: 4px 0 0; color: #667085; font-size: .9rem; line-height: 1.4; }
    .summary-list { display: grid; gap: 12px; margin: 26px 0 0; padding: 0; list-style: none; }
    .summary-list li {
      display: flex; align-items: flex-start; gap: 12px; padding: 15px 16px;
      border: 1px solid #e6e9f2; border-radius: 13px; background: #fff;
      line-height: 1.55; color: #344054;
    }
    .point-icon {
      display: grid; place-items: center; flex: 0 0 23px; width: 23px; height: 23px;
      margin-top: 1px; border-radius: 50%; color: #fff; background: #6366f1;
    }
    .point-icon svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .error-card { display: flex; gap: 12px; align-items: flex-start; margin-top: 24px; padding: 15px; border: 1px solid #fecaca; border-radius: 13px; background: #fff1f2; }
    .status-icon { display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 22px; border-radius: 50%; color: #fff; background: #dc2626; font-weight: 700; }
    .error { margin: 0; color: #b42318; line-height: 1.5; white-space: pre-wrap; }
    .close {
      position: absolute; top: 12px; right: 16px; border: 0; background: none;
      width: 40px; height: 40px; padding: 0; font-size: 1.7rem; cursor: pointer; color: #667085;
    }
    @media (max-width: 600px) {
      :host { right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); }
      .trigger { padding: 12px 15px; }
      .trigger span { display: none; }
      .overlay {
        place-items: end center;
        padding: 12px max(12px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-bottom));
      }
      .dialog {
        width: 100%; max-height: calc(100dvh - 24px); padding: 24px 16px 16px;
        border-radius: 16px;
      }
      .dialog-header { gap: 10px; padding-right: 32px; }
      .header-icon { flex-basis: 38px; width: 38px; height: 38px; border-radius: 12px; }
      .header-icon svg { width: 21px; height: 21px; }
      h2 { font-size: 1.15rem; }
      .subtitle { font-size: .84rem; }
      .summary-list { gap: 8px; margin-top: 18px; }
      .summary-list li { gap: 10px; padding: 12px; line-height: 1.45; }
      .error-card { gap: 10px; margin-top: 18px; padding: 12px; }
      .close { top: 8px; right: 8px; }
    }
  `;
}
