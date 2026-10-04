import { client } from '../../api/client.gen.js';
import { jsonBodySerializer } from '../../api/core/bodySerializer.gen.js';
import type { AiService } from '../types/ai.types.js';

// Client integration point: replace executePrompt to connect a different AI implementation.
// The default calls the authenticated endpoint backed by the existing IChatClientFactory.
export const aiService: AiService = {
  async executePrompt(request, signal) {
    const result = await client.post<{ 200: { content: string } }>({
      url: '/umbraco/editorassistantaiumbraco/api/v1/ExecutePrompt',
      security: [{ scheme: 'bearer', type: 'http' }],
      headers: { 'Content-Type': 'application/json' },
      bodySerializer: jsonBodySerializer.bodySerializer,
      body: request,
      signal,
    });
    if (signal.aborted) throw new DOMException('Request cancelled', 'AbortError');
    if (!result.response?.ok) {
      const detail = (result.error as { detail?: string } | undefined)?.detail;
      throw new Error(detail ?? 'AI generation failed. Check the connection and try again.');
    }
    if (!result.data?.content?.trim()) throw new Error('The AI provider returned no content.');
    return result.data.content;
  },
};
