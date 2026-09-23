import './components/FloatingButton.js';

if (!window.location.pathname.startsWith('/umbraco')) {
  const response = await fetch('/umbraco/editorassistantaiumbraco/api/v1/Status');
  const status = response.ok ? await response.json() as { enabled: boolean; hasApiKey: boolean } : undefined;
  if (status?.enabled && status.hasApiKey &&
      !document.querySelector('editor-assistant-floating-button')) {
    const button = document.createElement('editor-assistant-floating-button');
    document.body.appendChild(button);
  }
}
