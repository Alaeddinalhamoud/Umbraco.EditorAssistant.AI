using EditorAssistant.AI.Umbraco.Controllers;
using EditorAssistant.AI.Umbraco.Models;
using EditorAssistant.AI.Umbraco.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Xunit;

namespace EditorAssistant.AI.Umbraco.Tests;

public class ExecutePromptTests
{
    private static AIAssistantController Controller(Store store, Provider provider) => new(store, provider, Log.Logger)
    {
        ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
    };

    [Fact]
    public async Task PassesPromptSelectionAndContextToExistingProviderWithoutCache()
    {
        var provider = new Provider();
        var result = await Controller(new Store(), provider).ExecutePrompt(new ExecutePromptRequest
        {
            Prompt = "Improve this", SelectedText = "Selected words", Context = "Surrounding text"
        }, CancellationToken.None);
        Assert.IsType<OkObjectResult>(result);
        Assert.Contains("Improve this", provider.Prompt);
        Assert.Contains("Selected words", provider.Prompt);
        Assert.Contains("Surrounding text", provider.Prompt);
        Assert.True(provider.BypassCache);
    }

    [Fact]
    public async Task RejectsWhitespacePromptWithoutCallingProvider()
    {
        var provider = new Provider();
        Assert.IsType<BadRequestObjectResult>(await Controller(new Store(), provider)
            .ExecutePrompt(new ExecutePromptRequest { Prompt = "  " }, CancellationToken.None));
        Assert.Null(provider.Prompt);
    }

    [Fact]
    public async Task GeneratesEditorContentWhenPageSummariesAreDisabled()
    {
        var provider = new Provider();
        var result = await Controller(new Store { Enabled = false }, provider)
            .ExecutePrompt(new ExecutePromptRequest { Prompt = "Write" }, CancellationToken.None);
        Assert.IsType<OkObjectResult>(result);
        Assert.Contains("Write", provider.Prompt);
    }

    [Fact]
    public async Task RejectsPageSummaryWhenPageSummariesAreDisabled()
    {
        var provider = new Provider();
        var result = await Controller(new Store { Enabled = false }, provider)
            .Summarize(new SummarizeRequest("A page with enough text to summarize."), CancellationToken.None);
        Assert.Equal(503, Assert.IsType<ObjectResult>(result).StatusCode);
        Assert.Null(provider.Prompt);
    }

    [Theory]
    [InlineData("empty", 502)]
    [InlineData("failure", 502)]
    [InlineData("timeout", 504)]
    public async Task ReportsProviderErrors(string behavior, int expectedStatus)
    {
        var result = await Controller(new Store(), new Provider { Behavior = behavior })
            .ExecutePrompt(new ExecutePromptRequest { Prompt = "Write" }, CancellationToken.None);
        Assert.Equal(expectedStatus, Assert.IsType<ObjectResult>(result).StatusCode);
    }

    [Fact]
    public async Task PropagatesBrowserCancellation()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => Controller(new Store(), new Provider())
            .ExecutePrompt(new ExecutePromptRequest { Prompt = "Write" }, cancellation.Token));
    }

    [Fact]
    public void PromptEndpointRetainsBackofficeAuthorization()
    {
        var method = typeof(AIAssistantController).GetMethod(nameof(AIAssistantController.ExecutePrompt))!;
        Assert.Empty(method.GetCustomAttributes(typeof(AllowAnonymousAttribute), true));
        Assert.NotEmpty(typeof(AIAssistantController).GetCustomAttributes(typeof(AuthorizeAttribute), true));
    }

    private sealed class Store : IAISettingsStore
    {
        public bool Enabled { get; init; } = true;
        public Task<AISettings?> GetAsync(CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return Task.FromResult<AISettings?>(new AISettings("Ollama", "model", null, "", Enabled));
        }
        public Task SaveAsync(SaveAISettingsRequest request, CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private sealed class Provider : IChatClientFactory
    {
        public string? Prompt { get; private set; }
        public bool BypassCache { get; private set; }
        public string Behavior { get; init; } = "success";
        public Task<ChatResponse> GetResponseAsync(AISettings settings, string prompt, CancellationToken cancellationToken, bool bypassCache = false)
        {
            Prompt = prompt;
            BypassCache = bypassCache;
            return Behavior switch
            {
                "failure" => throw new HttpRequestException("Provider unavailable"),
                "timeout" => throw new OperationCanceledException(),
                "empty" => Task.FromResult(new ChatResponse(" ")),
                _ => Task.FromResult(new ChatResponse("<p>Generated text</p>"))
            };
        }
    }
}
