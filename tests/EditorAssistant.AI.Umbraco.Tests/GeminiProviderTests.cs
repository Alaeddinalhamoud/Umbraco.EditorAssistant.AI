using System.Net;
using System.Text;
using System.Text.Json;
using EditorAssistant.AI.Umbraco.Models;
using EditorAssistant.AI.Umbraco.Services;
using Microsoft.Extensions.Caching.Memory;
using Serilog;
using Xunit;

namespace EditorAssistant.AI.Umbraco.Tests;

public class GeminiProviderTests
{
    private static readonly AISettings Settings = new("Gemini", "gemini-test-model", null, "test-api-key", true);

    [Fact]
    public async Task UsesGeminiSdkWithConfiguredModelKeyAndPromptAndCombinesTextParts()
    {
        using var handler = new GeminiTransport();
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var factory = new ChatClientFactory(handler, cache, Log.Logger);

        var response = await factory.GetResponseAsync(Settings, "Write a paragraph", CancellationToken.None);

        Assert.Equal("First second", response.Text);
        Assert.Equal("generativelanguage.googleapis.com", handler.RequestUri!.Host);
        Assert.EndsWith("/models/gemini-test-model:generateContent", handler.RequestUri.AbsolutePath);
        Assert.Equal("test-api-key", handler.ApiKey);
        using var body = JsonDocument.Parse(handler.Body!);
        Assert.Equal("Write a paragraph", body.RootElement.GetProperty("contents")[0].GetProperty("parts")[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task GeminiKeepsSummaryCacheAndEditorBypassBehavior()
    {
        using var handler = new GeminiTransport();
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var factory = new ChatClientFactory(handler, cache, Log.Logger);

        await factory.GetResponseAsync(Settings, "Prompt", CancellationToken.None);
        await factory.GetResponseAsync(Settings, "Prompt", CancellationToken.None);
        Assert.Equal(1, handler.Calls);
        await factory.GetResponseAsync(Settings, "Prompt", CancellationToken.None, bypassCache: true);
        Assert.Equal(2, handler.Calls);
    }

    [Fact]
    public async Task RejectsBlockedOrEmptyGeminiResponses()
    {
        using var handler = new GeminiTransport { ResponseBody = "{\"promptFeedback\":{\"blockReason\":\"SAFETY\"}}" };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var factory = new ChatClientFactory(handler, cache, Log.Logger);

        var error = await Assert.ThrowsAsync<HttpRequestException>(() => factory.GetResponseAsync(Settings, "Prompt", CancellationToken.None));
        Assert.Contains("no text content", error.Message);
    }

    [Fact]
    public async Task PropagatesGeminiApiFailures()
    {
        using var handler = new GeminiTransport
        {
            StatusCode = HttpStatusCode.BadRequest,
            ResponseBody = """{"error":{"code":400,"message":"Model is unavailable","status":"INVALID_ARGUMENT"}}"""
        };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var factory = new ChatClientFactory(handler, cache, Log.Logger);

        await Assert.ThrowsAsync<Google.GenAI.ClientError>(() => factory.GetResponseAsync(Settings, "Prompt", CancellationToken.None));
    }

    [Fact]
    public async Task PropagatesGeminiCancellation()
    {
        using var handler = new GeminiTransport();
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var factory = new ChatClientFactory(handler, cache, Log.Logger);
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => factory.GetResponseAsync(Settings, "Prompt", cancellation.Token));
    }

    private sealed class GeminiTransport : HttpMessageHandler, IHttpClientFactory
    {
        public int Calls { get; private set; }
        public Uri? RequestUri { get; private set; }
        public string? ApiKey { get; private set; }
        public string? Body { get; private set; }
        public HttpStatusCode StatusCode { get; init; } = HttpStatusCode.OK;
        public string ResponseBody { get; init; } = """
            {"candidates":[{"content":{"role":"model","parts":[{"text":"First "},{"text":"second"}]}}]}
            """;

        public HttpClient CreateClient(string name) => new(this, disposeHandler: false);

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            Calls++;
            RequestUri = request.RequestUri;
            ApiKey = request.Headers.GetValues("x-goog-api-key").Single();
            Body = await request.Content!.ReadAsStringAsync(cancellationToken);
            return new HttpResponseMessage(StatusCode)
            {
                Content = new StringContent(ResponseBody, Encoding.UTF8, "application/json")
            };
        }
    }
}
