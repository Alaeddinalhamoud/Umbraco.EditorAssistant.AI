namespace EditorAssistant.AI.Umbraco.Models;

public sealed record GeminiResponse(IReadOnlyList<GeminiCandidate>? Candidates);
