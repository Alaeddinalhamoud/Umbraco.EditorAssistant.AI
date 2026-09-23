using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace EditorAssistant.AI.Umbraco.Middleware;

public sealed class EditorAssistantFrontendScriptMiddleware(
    RequestDelegate next,
    ILogger<EditorAssistantFrontendScriptMiddleware> logger)
{
    private const string ScriptTag =
        "<script type=\"module\" src=\"/App_Plugins/EditorAssistantAIUmbraco/editor-assistant-frontend.js\"></script>";

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Method is "HEAD" or "OPTIONS" )
        {
            await next(context);
            return;
        }

        await using var responseBody = new MemoryStream();
        var originalBody = context.Response.Body;
        context.Response.Body = responseBody;

        try
        {
            await next(context);

            if (IsHtmlResponse(context.Response) && responseBody.Length > 0)
            {
                responseBody.Position = 0;
                using var reader = new StreamReader(
                    responseBody,
                    Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: true,
                    bufferSize: 1024,
                    leaveOpen: true);
                var html = await reader.ReadToEndAsync(context.RequestAborted);
                var bodyIndex = html.LastIndexOf("</body>", StringComparison.OrdinalIgnoreCase);

                if (bodyIndex >= 0)
                {
                    html = html.Insert(bodyIndex, ScriptTag);
                    context.Response.ContentLength = Encoding.UTF8.GetByteCount(html);
                    await originalBody.WriteAsync(Encoding.UTF8.GetBytes(html), context.RequestAborted);
                    return;
                }
            }

            responseBody.Position = 0;
            await responseBody.CopyToAsync(originalBody, context.RequestAborted);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // A client disconnect or navigation cancels the response copy.
            logger.LogDebug("Frontend response was cancelled because the client disconnected.");
        }
        finally
        {
            context.Response.Body = originalBody;
        }
    }

    private static bool IsHtmlResponse(HttpResponse response) =>
        response.ContentType?.StartsWith("text/html", StringComparison.OrdinalIgnoreCase) == true &&
        response.StatusCode is >= 200 and < 300;
}
