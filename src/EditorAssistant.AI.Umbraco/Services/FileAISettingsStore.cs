using EditorAssistant.AI.Umbraco.Controllers;
using EditorAssistant.AI.Umbraco.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Serilog;
using System.Text.Json;

namespace EditorAssistant.AI.Umbraco.Services;

public sealed class FileAISettingsStore(
    IWebHostEnvironment environment,
    IDataProtectionProvider dataProtectionProvider,
    ILogger logger) : IAISettingsStore
{
    private const string FileName = "settings.json";
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector("EditorAssistant.AI.Settings.v1");

    private string FilePath => Path.Combine(environment.ContentRootPath, "App_Data", "EditorAssistant.AI", FileName);

    public async Task<AISettings?> GetAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _gate.WaitAsync(cancellationToken);
            try
            {
                return await ReadCoreAsync(cancellationToken);
            }
            finally
            {
                _gate.Release();
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.Information("Reading AI settings was cancelled.");
            throw;
        }
        catch (Exception exception)
        {
            logger.Error(exception, "Failed to read AI settings from {SettingsPath}.", FilePath);
            throw;
        }
    }

    public async Task SaveAsync(SaveAISettingsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _gate.WaitAsync(cancellationToken);
            try
            {
                var current = await ReadCoreAsync(cancellationToken);
                var apiKey = request.Provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase)
                    ? string.Empty
                    : string.IsNullOrWhiteSpace(request.ApiKey) ? current?.ApiKey : request.ApiKey;
                AIAssistantController.ValidateRequest(request, apiKey);

                var settings = new AISettings(request.Provider, request.Model, request.Endpoint, apiKey!, request.Enabled);
                var json = JsonSerializer.Serialize(settings);
                var protectedValue = _protector.Protect(json);
                Directory.CreateDirectory(Path.GetDirectoryName(FilePath)!);
                var temporaryPath = $"{FilePath}.{Guid.NewGuid():N}.tmp";
                try
                {
                    await File.WriteAllTextAsync(temporaryPath, protectedValue, cancellationToken);
                    File.Move(temporaryPath, FilePath, true);
                }
                finally
                {
                    if (File.Exists(temporaryPath))
                        File.Delete(temporaryPath);
                }
            }
            finally
            {
                _gate.Release();
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.Information("Saving AI settings was cancelled for provider {Provider}.", request.Provider);
            throw;
        }
        catch (Exception exception)
        {
            logger.Error(exception, "Failed to save AI settings for provider {Provider} and model {Model}.",
                request.Provider, request.Model);
            throw;
        }
    }

    private async Task<AISettings?> ReadCoreAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(FilePath))
            return null;

        var protectedValue = await File.ReadAllTextAsync(FilePath, cancellationToken);
        var json = _protector.Unprotect(protectedValue);
        return JsonSerializer.Deserialize<AISettings>(json);
    }
}
