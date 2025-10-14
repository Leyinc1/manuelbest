
using ManuelBestApi.Data;
using ManuelBestApi.Dtos;
using ManuelBestApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ManuelBestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApiDbContext _context;

    public TasksController(ApiDbContext context)
    {
        _context = context;
    }

    // GET: api/Tasks?projectId=...
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] Guid projectId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // 1. Verify user is a member of the project
        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (!isMember)
        {
            return Forbid(); // User does not have permission to see tasks for this project
        }

        // 2. Get tasks for the project
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();

        return Ok(tasks);
    }

    // POST: api/Tasks
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto taskDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Verify user is a member of the project for which the task is being created
        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == taskDto.ProjectId && pm.UserId == userId);

        if (!isMember)
        {
            return Forbid();
        }

        var newTask = new ApiTask
        {
            Content = taskDto.Content,
            Status = taskDto.Status,
            ProjectId = taskDto.ProjectId,
            AssignedTo = taskDto.AssignedTo,
            Description = taskDto.Description,
            Tags = taskDto.Tags
        };

        _context.Tasks.Add(newTask);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTasks), new { projectId = newTask.ProjectId }, newTask);
    }

    // PUT: api/Tasks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto taskDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        // Verify user is a member of the project the task belongs to
        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        if (!isMember)
        {
            return Forbid();
        }

        // Update only the fields that are provided in the DTO
        if (taskDto.Content != null) task.Content = taskDto.Content;
        if (taskDto.Status != null) task.Status = taskDto.Status;
        if (taskDto.AssignedTo != null) task.AssignedTo = taskDto.AssignedTo;
        if (taskDto.Description != null) task.Description = taskDto.Description;
        if (taskDto.Tags != null) task.Tags = taskDto.Tags;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Tasks.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Tasks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        // Verify user is a member of the project the task belongs to
        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        if (!isMember)
        {
            return Forbid();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
