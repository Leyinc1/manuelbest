
using ManuelBestApi.Data;
using ManuelBestApi.Dtos;
using ManuelBestApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace ManuelBestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly ApiDbContext _context;

    public AttendanceController(ApiDbContext context)
    {
        _context = context;
    }

    // Corresponds to save-attendance.cjs
    [HttpPost]
    public async Task<IActionResult> SaveAttendance([FromBody] SaveAttendancePayloadDto payload)
    {
        try
        {
            foreach (var recordDto in payload.Records)
            {
                var attendanceRecord = new Attendance
                {
                    TeamName = recordDto.Team,
                    StudentId = recordDto.StudentId,
                    Present = recordDto.Present ? 1 : 0,
                    Salon = payload.Key,
                    RecordedAt = DateTime.UtcNow
                };
                _context.Attendances.Add(attendanceRecord);
            }

            await _context.SaveChangesAsync();

            return Ok(new { saved = payload.Records.Count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
