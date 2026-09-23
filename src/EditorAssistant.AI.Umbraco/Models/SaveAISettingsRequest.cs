using System.ComponentModel.DataAnnotations;

namespace EditorAssistant.AI.Umbraco.Models;

public sealed record SaveAISettingsRequest([property: Required] string Provider, [property: Required] string Model, string? Endpoint, string? ApiKey, bool Enabled = true);
