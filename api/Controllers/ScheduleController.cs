
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
public class ScheduleController : ControllerBase
{
    private readonly ApiDbContext _context;

    public ScheduleController(ApiDbContext context)
    {
        _context = context;
    }

    // Corresponds to load-schedule.cjs
    [HttpGet]
    public async Task<IActionResult> LoadSchedule()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var scheduleItems = await _context.ScheduleItems
            .Where(s => s.UserId == userId)
            .ToListAsync();

        // The original function transformed the data, we'll do the same.
        var scheduleEvents = scheduleItems.Select(item => 
        {
            var start = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, item.StartHour, 0, 0);
            var dayDifference = item.Day - (int)start.DayOfWeek;
            start = start.AddDays(dayDifference);

            var end = start.AddHours(item.Duration);

            return new ScheduleItemDto(item.CourseName, start, end);
        });

        return Ok(new { schedule = scheduleEvents });
    }

    // Corresponds to save-schedule.cjs
    [HttpPost]
    public async Task<IActionResult> SaveSchedule([FromBody] List<ScheduleItemDto> schedule)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Delete old schedule items for the user
            await _context.ScheduleItems.Where(s => s.UserId == userId).ExecuteDeleteAsync();

            foreach (var item in schedule)
            {
                var newItem = new ScheduleItem
                {
                    CourseName = item.Title,
                    Day = (int)item.Start.DayOfWeek,
                    StartHour = item.Start.Hour,
                    Duration = (int)(item.End - item.Start).TotalHours,
                    UserId = userId
                };
                _context.ScheduleItems.Add(newItem);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Schedule saved successfully" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
