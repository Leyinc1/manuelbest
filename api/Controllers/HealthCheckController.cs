
using Microsoft.AspNetCore.Mvc;

namespace ManuelBestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthCheckController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        return Ok("API is running.");
    }
}
