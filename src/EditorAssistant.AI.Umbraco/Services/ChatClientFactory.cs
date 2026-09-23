using EditorAssistant.AI.Umbraco.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Caching.Memory;
using OpenAI;
using OpenAI.Chat;
using Serilog;
using System.Security.Cryptography;
using System.Text;
using System.Net.Http.Json;
using System.Text.Json;

namespace EditorAssistant.AI.Umbraco.Services;

public sealed class ChatClientFactory(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    ILogger logger) : IChatClientFactory
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(1);

    public async Task<Models.ChatResponse> GetResponseAsync(
        AISettings settings,
        string prompt,
        CancellationToken cancellationToken,
        bool bypassCache = false)
    {
        try
        {
            var cacheKey = CreateCacheKey(settings, prompt);
            if (!bypassCache && cache.TryGetValue<Models.ChatResponse>(cacheKey, out var cachedResponse) &&
                cachedResponse is not null)
            {
                logger.Debug("Returning cached AI response for provider {Provider} and model {Model}.",
                    settings.Provider, settings.Model);
                return cachedResponse;
            }

            var response = await GetResponseFromProviderAsync(settings, prompt, cancellationToken);
            if (!bypassCache)
            {
                cache.Set(cacheKey, response, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = CacheDuration
                });
            }

            return response;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.Information("AI request was cancelled for provider {Provider} and model {Model}.",
                settings.Provider, settings.Model);
            throw;
        }
        catch (Exception exception)
        {
            logger.Error(exception, "AI request failed for provider {Provider} and model {Model}.",
                settings.Provider, settings.Model);
            throw;
        }
    }

    private async Task<Models.ChatResponse> GetResponseFromProviderAsync(
        AISettings settings,
        string prompt,
        CancellationToken cancellationToken)
    {
            if (settings.Provider.Equals("Gemini", StringComparison.OrdinalIgnoreCase))
                return await GetGeminiResponseAsync(settings, prompt, cancellationToken);

            if (settings.Provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase))
            {
                var ollamaEndpoint = new Uri(string.IsNullOrWhiteSpace(settings.Endpoint)
                    ? "http://localhost:11434"
                    : settings.Endpoint);
                var ollamaClient = new OllamaChatClient(ollamaEndpoint, settings.Model);
                var ollamaResult = await ollamaClient.GetResponseAsync(prompt, cancellationToken: cancellationToken);
                return new Models.ChatResponse(ollamaResult.Text);
            }

            var endpoint = GetEndpoint(settings);
            var options = endpoint is null ? null : new OpenAIClientOptions { Endpoint = endpoint };
            var client = new ChatClient(settings.Model, new System.ClientModel.ApiKeyCredential(settings.ApiKey), options);
            var result = await client.AsIChatClient().GetResponseAsync(prompt, cancellationToken: cancellationToken);
            return new Models.ChatResponse(result.Text);
    }

    private static string CreateCacheKey(AISettings settings, string prompt)
    {
        var value = string.Join('\n', settings.Provider, settings.Model, settings.Endpoint, settings.ApiKey, prompt);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return $"editor-assistant:chat:{Convert.ToHexString(hash)}";
    }

    private async Task<Models.ChatResponse> GetGeminiResponseAsync(AISettings settings, string prompt, CancellationToken cancellationToken)
    {
        var model = Uri.EscapeDataString(settings.Model);
        var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
        using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
        request.Headers.Add("X-goog-api-key", settings.ApiKey);
        request.Content = JsonContent.Create(new GeminiRequest(
            [new GeminiContent([new GeminiPart(prompt)])]));

        var client = httpClientFactory.CreateClient();
        using var response = await client.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException(
                $"Gemini returned HTTP {(int)response.StatusCode} ({response.ReasonPhrase}). Provider details: {responseBody}",
                null,
                response.StatusCode);

        var result = JsonSerializer.Deserialize<Models.GeminiResponse>(
            responseBody,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var text = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(text))
            throw new HttpRequestException($"Gemini returned no text content. Provider details: {responseBody}");

        return new Models.ChatResponse(text);
    }

    private static Uri? GetEndpoint(AISettings settings)
    {
        if (settings.Provider.Equals("Microsoft", StringComparison.OrdinalIgnoreCase))
            return new Uri($"{settings.Endpoint?.TrimEnd('/')}/openai/v1/");

        return settings.Provider.ToLowerInvariant() switch
        {
            "claude" => new Uri("https://api.anthropic.com/v1/"),
            "gemini" => new Uri("https://generativelanguage.googleapis.com/v1beta/openai/"),
            "deepseek" => new Uri("https://api.deepseek.com/v1/"),
            _ => null,
        };
    }
}