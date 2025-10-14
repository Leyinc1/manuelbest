
using ManuelBestApi.Data;
using ManuelBestApi.Dtos;
using ManuelBestApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManuelBestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ApiDbContext _context;

    public TeamsController(ApiDbContext context)
    {
        _context = context;
    }

    // Corresponds to submit-application.cjs
    [HttpPost]
    public async Task<IActionResult> SubmitApplication([FromBody] SubmitApplicationDto applicationDto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var newTeam = new Team
            {
                Name = applicationDto.TeamName,
                Message = applicationDto.Message
            };

            _context.Teams.Add(newTeam);
            await _context.SaveChangesAsync(); // Save to get the newTeam.Id

            for (int i = 0; i < applicationDto.Members.Count; i++)
            {
                var memberDto = applicationDto.Members[i];
                var newMember = new Member
                {
                    TeamId = newTeam.Id,
                    StudentId = memberDto.StudentId,
                    FullName = memberDto.FullName,
                    Email = memberDto.Email,
                    IsLeader = (i == 0) // First member is the leader
                };
                _context.Members.Add(newMember);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Team registered successfully" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Corresponds to get-teams.cjs
    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var teams = await _context.Teams
            .Include(t => t.Members)
            .OrderByDescending(t => t.Id)
            .ToListAsync();
        return Ok(teams);
    }

    // Corresponds to search-teams.cjs
    [HttpGet("search")]
    public async Task<IActionResult> SearchTeams([FromQuery] string q = "")
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            var recentTeams = await _context.Teams.OrderBy(t => t.Name).Take(20).ToListAsync();
            return Ok(recentTeams);
        }

        var teams = await _context.Teams
            .Where(t => t.Name.ToLower().Contains(q.ToLower()))
            .OrderBy(t => t.Name)
            .Take(50)
            .ToListAsync();
        
        return Ok(teams);
    }

    // Corresponds to get-members.cjs
    [HttpGet("{teamName}/members")]
    public async Task<IActionResult> GetTeamMembers(string teamName)
    {
        var members = await _context.Members
            .Where(m => m.Team.Name == teamName)
            .OrderByDescending(m => m.IsLeader)
            .ThenBy(m => m.FullName)
            .ToListAsync();

        if (!members.Any())
        {
            return NotFound();
        }

        return Ok(members);
    }
}
