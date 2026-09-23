namespace EditorAssistant.AI.Umbraco.Models;

public sealed record GeminiRequest(IReadOnlyList<GeminiContent> Contents);