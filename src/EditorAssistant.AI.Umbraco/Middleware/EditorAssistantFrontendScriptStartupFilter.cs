using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;

namespace EditorAssistant.AI.Umbraco.Middleware;

public sealed class EditorAssistantFrontendScriptStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) =>
        app =>
        {
            app.UseMiddleware<EditorAssistantFrontendScriptMiddleware>();
            next(app);
        };
}
