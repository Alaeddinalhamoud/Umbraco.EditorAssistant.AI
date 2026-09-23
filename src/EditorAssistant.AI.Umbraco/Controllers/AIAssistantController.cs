using EditorAssistant.AI.Umbraco.Models;
using EditorAssistant.AI.Umbraco.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace EditorAssistant.AI.Umbraco.Controllers;

public sealed class AIAssistantController(
    IAISettingsStore settingsStore,
    IChatClientFactory chatClientFactory,
    ILogger logger)
    : EditorAssistantAIUmbracoApiControllerBase
{
    [HttpPost("Summarize")]
    [AllowAnonymous]
    public async Task<IActionResult> Summarize([FromBody] SummarizeRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var settings = await settingsStore.GetAsync(cancellationToken);
            if (settings is null || !settings.Enabled || !HasCredential(settings) || string.IsNullOrWhiteSpace(settings.Model))
                return Problem("The AI Assistant has not been configured in the Umbraco backoffice.", statusCode: StatusCodes.Status503ServiceUnavailable);

            var response = await chatClientFactory.GetResponseAsync(
                settings,
                $"Summarize the following web page in 3 to 5 concise bullet points. Do not invent information.\n\n{request.Text}",
                cancellationToken: cancellationToken);

            return Ok(new { summary = response.Text });
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.Information("Page summarization request was cancelled.");
            throw;
        }
        catch (HttpRequestException exception)
        {
            logger.Warning(exception, "Page summarization provider request failed.");
            return ProviderProblem(exception.Message);
        }
        catch (System.ClientModel.ClientResultException exception)
        {
            logger.Warning(exception, "Page summarization provider request failed.");
            return ProviderProblem(exception.Message);
        }
        catch (Exception exception)
        {
            logger.Error(exception, "Unexpected error while summarizing a page.");
            return Problem("The page could not be summarized.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("Status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        try
        {
            var settings = await settingsStore.GetAsync(cancellationToken);
            return Ok(new
            {
                enabled = settings?.Enabled == true,
                hasApiKey = settings is not null && HasCredential(settings)
            });
        }
        catch (Exception exception)
        {
            if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
                throw;
            logger.Error(exception, "Failed to read AI assistant status.");
            return Problem("The AI Assistant status could not be loaded.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("Settings")]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
    {
        try
        {
            var settings = await settingsStore.GetAsync(cancellationToken);
            return Ok(settings is null
                ? new AISettingsResponse()
                : new AISettingsResponse(
                    settings.Provider,
                    settings.Model,
                    settings.Endpoint,
                    HasCredential(settings),
                    settings.Enabled));
        }
        catch (Exception exception)
        {
            if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
                throw;
            logger.Error(exception, "Failed to read AI assistant settings.");
            return Problem("The AI Assistant settings could not be loaded.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost("Settings")]
    public async Task<IActionResult> SaveSettings([FromBody] SaveAISettingsRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            await settingsStore.SaveAsync(request, cancellationToken);
        }
        catch (ValidationException exception)
        {
            logger.Warning("Invalid AI settings submitted for provider {Provider}: {ValidationMessage}",
                request.Provider, exception.Message);
            return BadRequest(new { detail = exception.Message });
        }
        catch (Exception exception)
        {
            if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
                throw;
            logger.Error(exception, "Failed to save AI settings for provider {Provider} and model {Model}.",
                request.Provider, request.Model);
            return Problem("The AI Assistant settings could not be saved.", statusCode: StatusCodes.Status500InternalServerError);
        }

        return NoContent();
    }

    [HttpPost("TestConnection")]
    public async Task<IActionResult> TestConnection([FromBody] SaveAISettingsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var current = await settingsStore.GetAsync(cancellationToken);
            var apiKey = request.Provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase)
                ? string.Empty
                : string.IsNullOrWhiteSpace(request.ApiKey) ? current?.ApiKey : request.ApiKey;
            ValidateRequest(request, apiKey);
            await chatClientFactory.GetResponseAsync(
                new AISettings(request.Provider, request.Model, request.Endpoint, apiKey!),
                "Reply with OK.",
                cancellationToken,
                bypassCache: true);
            return Ok(new { message = "Connection verified." });
        }
        catch (ValidationException exception)
        {
            logger.Warning("Invalid AI connection test submitted for provider {Provider}: {ValidationMessage}",
                request.Provider, exception.Message);
            return BadRequest(new { detail = exception.Message });
        }
        catch (HttpRequestException exception)
        {
            logger.Warning(exception, "AI connection test failed for provider {Provider} and model {Model}.",
                request.Provider, request.Model);
            return ProviderProblem(exception.Message);
        }
        catch (System.ClientModel.ClientResultException exception)
        {
            logger.Warning(exception, "AI connection test failed for provider {Provider} and model {Model}.",
                request.Provider, request.Model);
            return ProviderProblem(exception.Message);
        }
        catch (Exception exception)
        {
            if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
                throw;
            logger.Error(exception, "Unexpected error during AI connection test for provider {Provider} and model {Model}.",
                request.Provider, request.Model);
            return Problem("The provider connection could not be tested.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private IActionResult ProviderProblem(string message)
    {
        var providerMessage = ExtractProviderMessage(message);
        var reason = providerMessage.Contains("Connection refused", StringComparison.OrdinalIgnoreCase) ||
                     providerMessage.Contains("No connection could be made", StringComparison.OrdinalIgnoreCase)
            ? "The provider endpoint could not be reached. Check that the endpoint is correct and that the local/provider service is running."
            : providerMessage.Contains("model", StringComparison.OrdinalIgnoreCase) &&
              (providerMessage.Contains("not found", StringComparison.OrdinalIgnoreCase) ||
               providerMessage.Contains("no longer available", StringComparison.OrdinalIgnoreCase) ||
               providerMessage.Contains("does not exist", StringComparison.OrdinalIgnoreCase))
                ? "The selected model is unavailable. Choose a supported model from the provider's model list."
                : providerMessage.Contains("insufficient_quota", StringComparison.OrdinalIgnoreCase) ||
                  providerMessage.Contains("credit_balance_exhausted", StringComparison.OrdinalIgnoreCase)
            ? "The provider account has no remaining quota or credits. Add billing credits or use an account with available quota, then test the connection again."
            : providerMessage.Contains("invalid_api_key", StringComparison.OrdinalIgnoreCase) ||
              providerMessage.Contains("api key", StringComparison.OrdinalIgnoreCase) &&
              providerMessage.Contains("invalid", StringComparison.OrdinalIgnoreCase)
                ? "The provider rejected the API key. Check that the key is active, copied completely, and belongs to the selected provider."
                : "The provider rejected the request. Check the API key, model/deployment, and endpoint.";

        return Problem($"{reason} Provider message: {providerMessage}", statusCode: StatusCodes.Status502BadGateway);
    }

    private static string ExtractProviderMessage(string message)
    {
        const string detailsMarker = "Provider details:";
        var details = message.IndexOf(detailsMarker, StringComparison.OrdinalIgnoreCase);
        var candidate = details >= 0
            ? message[(details + detailsMarker.Length)..].Trim()
            : message.Trim();

        try
        {
            using var document = JsonDocument.Parse(candidate);
            var error = document.RootElement.TryGetProperty("error", out var errorElement)
                ? errorElement
                : document.RootElement;

            if (error.TryGetProperty("message", out var messageElement) &&
                messageElement.ValueKind == JsonValueKind.String)
                return messageElement.GetString() ?? candidate;
        }
        catch (JsonException)
        {
            // The provider returned plain text rather than a JSON error envelope.
        }

        return candidate;
    }

    internal static void ValidateRequest(SaveAISettingsRequest request, string? apiKey)
    {
        if (string.IsNullOrWhiteSpace(request.Model))
            throw new ValidationException("A model or deployment name is required.");
        if (!request.Provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase) &&
            string.IsNullOrWhiteSpace(apiKey))
            throw new ValidationException("An API key is required.");
        if (!new[] { "Microsoft", "OpenAI", "Claude", "Gemini", "DeepSeek", "Ollama" }
            .Contains(request.Provider, StringComparer.OrdinalIgnoreCase))
            throw new ValidationException("The selected AI provider is not supported.");
        if (request.Provider.Equals("Microsoft", StringComparison.OrdinalIgnoreCase) &&
            !Uri.TryCreate(request.Endpoint, UriKind.Absolute, out _))
            throw new ValidationException("A valid Azure OpenAI endpoint is required.");
        if (request.Provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase) &&
            !Uri.TryCreate(string.IsNullOrWhiteSpace(request.Endpoint) ? "http://localhost:11434" : request.Endpoint, UriKind.Absolute, out _))
            throw new ValidationException("A valid Ollama endpoint is required.");
    }

    private static bool HasCredential(AISettings settings) =>
        settings.Provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase) ||
        !string.IsNullOrWhiteSpace(settings.ApiKey);
}







