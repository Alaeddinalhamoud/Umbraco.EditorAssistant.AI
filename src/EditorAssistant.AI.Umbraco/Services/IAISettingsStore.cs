using EditorAssistant.AI.Umbraco.Models;

namespace EditorAssistant.AI.Umbraco.Services;

public interface IAISettingsStore
{
    Task<AISettings?> GetAsync(CancellationToken cancellationToken);
    Task SaveAsync(SaveAISettingsRequest request, CancellationToken cancellationToken);
}