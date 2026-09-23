namespace EditorAssistant.AI.Umbraco.Models;

public sealed record AISettingsResponse(string Provider = "Microsoft", string Model = "gpt-4o-mini", string? Endpoint = null, bool HasApiKey = false, bool Enabled = true);
