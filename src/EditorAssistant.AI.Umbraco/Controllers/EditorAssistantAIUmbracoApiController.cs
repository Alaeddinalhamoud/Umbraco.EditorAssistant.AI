using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EditorAssistant.AI.Umbraco.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "EditorAssistant.AI.Umbraco")]
    public class EditorAssistantAIUmbracoApiController : EditorAssistantAIUmbracoApiControllerBase
    {

        [HttpGet("ping")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        public string Ping() => "Pong";
    }
}
