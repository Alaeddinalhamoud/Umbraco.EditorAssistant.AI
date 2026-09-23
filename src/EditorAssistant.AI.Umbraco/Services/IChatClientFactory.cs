using EditorAssistant.AI.Umbraco.Models;

namespace EditorAssistant.AI.Umbraco.Services;

public interface IChatClientFactory
{
    Task<ChatResponse> GetResponseAsync(
        AISettings settings,
        string prompt,
        CancellationToken cancellationToken,
        bool bypassCache = false);
}
