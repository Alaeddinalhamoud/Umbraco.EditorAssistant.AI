using System.ComponentModel.DataAnnotations;

namespace EditorAssistant.AI.Umbraco.Models;

public sealed record SummarizeRequest([property: Required, MinLength(20), MaxLength(100_000)] string Text);