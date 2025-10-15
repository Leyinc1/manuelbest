
using ManuelBestApi.Data;
using ManuelBestApi.Dtos;
using ManuelBestApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ManuelBestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints in this controller require authentication
public class ProjectsController : ControllerBase
{
    private readonly ApiDbContext _context;

    public ProjectsController(ApiDbContext context)
    {
        _context = context;
    }

    // GET: api/Projects
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var projects = await _context.ProjectMembers
            .Where(pm => pm.UserId == userId)
            .Select(pm => pm.Project)
            .ToListAsync();

        return Ok(projects);
    }

    // POST: api/Projects
    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto projectDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            // This should never happen for an authenticated user.
            // If it does, it indicates a data consistency issue.
            return StatusCode(500, "Authenticated user not found in the database.");
        }

        var newProject = new Project
        {
            Name = projectDto.Name,
            OwnerId = userId
        };

        var newMember = new ProjectMember
        {
            Project = newProject,
            UserId = userId
        };

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Projects.Add(newProject);
            _context.ProjectMembers.Add(newMember);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetProjects), new { id = newProject.Id }, newProject);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "A failure occurred while creating the project.");
        }
    }

    // DELETE: api/Projects/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        if (project.OwnerId != userId)
        {
            return Forbid(); // User is not the owner
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Projects/{id}/members
    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddMemberDto memberDto)
    {
        var inviterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(inviterId))
        {
            return Unauthorized();
        }

        // 1. Verify the inviter is a member of the project
        var isInviterMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == id && pm.UserId == inviterId);

        if (!isInviterMember)
        {
            return Forbid();
        }

        // 2. Find the user to invite in the local database
        var userToInvite = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == memberDto.Email.ToLower());

        if (userToInvite == null)
        {
            return NotFound(new { message = "User not found. The user must log in to the application at least once before being invited." });
        }

        // 3. Check if the user is already a member
        var isAlreadyMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == id && pm.UserId == userToInvite.Id);

        if (isAlreadyMember)
        {
            return Conflict(new { message = "User is already a member of this project." });
        }

        // 4. Add the new member
        var newMember = new ProjectMember
        {
            ProjectId = id,
            UserId = userToInvite.Id
        };

        _context.ProjectMembers.Add(newMember);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Member added successfully." });
    }
}
