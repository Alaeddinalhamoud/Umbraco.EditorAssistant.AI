namespace EditorAssistant.AI.Umbraco.Models;

public sealed record AISettings(string Provider, string Model, string? Endpoint, string ApiKey, bool Enabled = true);