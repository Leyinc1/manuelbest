using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace ManuelBestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly string _uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

    public FilesController()
    {
        if (!Directory.Exists(_uploadsRoot)) Directory.CreateDirectory(_uploadsRoot);
    }

    private string GetUserId()
    {
        // Tokens created by AuthController use the 'sub' claim (JwtRegisteredClaimNames.Sub).
        // Some flows or libraries expose that as ClaimTypes.NameIdentifier; check both.
        var nameId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(nameId)) return nameId;

        var sub = User.FindFirst("sub")?.Value; // JWT 'sub' claim
        if (!string.IsNullOrEmpty(sub)) return sub;

        return string.Empty;
    }

    private string GetUserFolder(string userId)
    {
        var folder = Path.Combine(_uploadsRoot, userId);
        if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
        return folder;
    }

    [HttpGet]
    public IActionResult List()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folder = GetUserFolder(userId);
        var files = Directory.GetFiles(folder)
            .Select(Path.GetFileName)
            .Select(n => new { name = n })
            .ToList();
        return Ok(files);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (file == null || file.Length == 0) return BadRequest(new { message = "No file provided" });

        var safeName = Path.GetFileName(file.FileName);
        var folder = GetUserFolder(userId);
        var path = Path.Combine(folder, safeName);

        await using var stream = System.IO.File.Create(path);
        await file.CopyToAsync(stream);

        return Ok(new { name = safeName });
    }

    [HttpGet("download/{name}")]
    public IActionResult Download(string name)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var safeName = Path.GetFileName(name);
        var folder = GetUserFolder(userId);
        var path = Path.Combine(folder, safeName);
        if (!System.IO.File.Exists(path)) return NotFound();

        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(path, out var contentType)) contentType = "application/octet-stream";

        var bytes = System.IO.File.ReadAllBytes(path);
        return File(bytes, contentType, safeName);
    }
}
