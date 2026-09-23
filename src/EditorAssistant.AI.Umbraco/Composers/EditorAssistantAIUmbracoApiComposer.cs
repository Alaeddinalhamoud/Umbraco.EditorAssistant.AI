using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using EditorAssistant.AI.Umbraco.Middleware;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using EditorAssistant.AI.Umbraco.Services;

namespace EditorAssistant.AI.Umbraco.Composers
{
    public class EditorAssistantAIUmbracoApiComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddMemoryCache();
            builder.Services.AddSingleton<IAISettingsStore, FileAISettingsStore>();
            builder.Services.AddSingleton<IChatClientFactory, ChatClientFactory>();
            builder.Services.AddHttpClient();
            builder.Services.AddTransient<IStartupFilter, EditorAssistantFrontendScriptStartupFilter>();

        }
    }
}
