using System.ComponentModel.DataAnnotations;

namespace EditorAssistant.AI.Umbraco.Models;

public sealed class ExecutePromptRequest
{
    [Required, StringLength(8000)]
    public string Prompt { get; set; } = string.Empty;

    [StringLength(50000)]
    public string? SelectedText { get; set; }

    [StringLength(100000)]
    public string? Context { get; set; }
}
