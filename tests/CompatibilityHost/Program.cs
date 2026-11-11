using System.Net;
using System.Net.Http.Json;
using EditorAssistant.AI.Umbraco.Services;

// Every run installs its own disposable database and writes outside the repository.
var contentRoot = Path.Combine(Path.GetTempPath(), "EditorAssistantCompatibility", Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(contentRoot);
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = contentRoot,
    EnvironmentName = "Development"
});
builder.WebHost.UseStaticWebAssets();
builder.WebHost.UseUrls("http://127.0.0.1:0");
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["Umbraco:CMS:Global:Id"] = Guid.NewGuid().ToString(),
    ["Umbraco:CMS:Global:UseHttps"] = "false",
    ["Umbraco:CMS:Unattended:InstallUnattended"] = "true",
    ["Umbraco:CMS:Unattended:UnattendedUserName"] = "Compatibility Admin",
    ["Umbraco:CMS:Unattended:UnattendedUserEmail"] = "compatibility@example.test",
    ["Umbraco:CMS:Unattended:UnattendedUserPassword"] = "Compatibility-Only-Password-123!",
    ["ConnectionStrings:umbracoDbDSN"] = $"Data Source={Path.Combine(contentRoot, "Umbraco.sqlite.db")};Cache=Shared;Foreign Keys=True;Pooling=True",
    ["ConnectionStrings:umbracoDbDSN_ProviderName"] = "Microsoft.Data.Sqlite"
});
builder.Logging.SetMinimumLevel(LogLevel.Warning);
builder.CreateUmbracoBuilder().AddBackOffice().AddWebsite().AddComposers().Build();
await using var app = builder.Build();
await app.BootUmbracoAsync();
app.UseUmbraco().WithMiddleware(u => { u.UseBackOffice(); u.UseWebsite(); })
    .WithEndpoints(u => { u.UseBackOfficeEndpoints(); u.UseWebsiteEndpoints(); });
await app.StartAsync();

try
{
    // Resolving these also detects incompatible dependencies in the packed assembly.
    _ = app.Services.GetRequiredService<IAISettingsStore>();
    _ = app.Services.GetRequiredService<IChatClientFactory>();
    using var client = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false })
    {
        BaseAddress = new Uri(app.Urls.Single())
    };
    await Expect("/App_Plugins/EditorAssistantAIUmbraco/umbraco-package.json", HttpStatusCode.OK);
    await Expect("/App_Plugins/EditorAssistantAIUmbraco/editor-assistant-ai-umbraco.js", HttpStatusCode.OK);
    await Expect("/App_Plugins/EditorAssistantAIUmbraco/editor-assistant-frontend.js", HttpStatusCode.OK);
    await Expect("/umbraco/editorassistantaiumbraco/api/v1/ping", HttpStatusCode.Unauthorized);
    using var summary = await client.PostAsJsonAsync("/umbraco/editorassistantaiumbraco/api/v1/Summarize",
        new { text = "This page contains content for the compatibility check." });
    if (summary.StatusCode != HttpStatusCode.ServiceUnavailable)
        throw new Exception($"Anonymous summary: expected 503 with no provider configured, got {(int)summary.StatusCode}: {await summary.Content.ReadAsStringAsync()}");
    using var prompt = await client.PostAsJsonAsync("/umbraco/editorassistantaiumbraco/api/v1/ExecutePrompt",
        new { prompt = "Compatibility check" });
    if (prompt.StatusCode != HttpStatusCode.Unauthorized)
        throw new Exception($"Editor prompt must require authentication, got {(int)prompt.StatusCode}");
    Console.WriteLine("PASS: package composition, static assets, API routing, anonymous summaries and editor authorization.");

    async Task Expect(string path, HttpStatusCode expected)
    {
        using var response = await client.GetAsync(path);
        if (response.StatusCode != expected)
            throw new Exception($"{path}: expected {(int)expected}, got {(int)response.StatusCode}");
    }
}
finally
{
    await app.StopAsync();
}
