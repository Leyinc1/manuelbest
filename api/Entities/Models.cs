
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManuelBestApi.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = null!;

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = null!;
}

[Table("projects")]
public class Project
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("owner_id")]
    public string OwnerId { get; set; } = null!;
    
    [ForeignKey("OwnerId")]
    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public virtual ICollection<ApiTask> Tasks { get; set; } = new List<ApiTask>();
}

[Table("tasks")]
public class ApiTask // Renamed from Task to avoid conflict with System.Threading.Tasks.Task
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("content")]
    public string Content { get; set; } = null!;

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("project_id")]
    public Guid ProjectId { get; set; }
    [ForeignKey("ProjectId")]
    public virtual Project Project { get; set; } = null!;

    [Column("assigned_to")]
    public string? AssignedTo { get; set; } // Nullable
    [ForeignKey("AssignedTo")]
    public virtual User? Assignee { get; set; }

    [Column("description")]
    public string? Description { get; set; } // Nullable

    [Column("tags", TypeName = "jsonb")]
    public string[]? Tags { get; set; } // Nullable
}

[Table("project_members")]
public class ProjectMember
{
    [Column("project_id")]
    public Guid ProjectId { get; set; }
    public virtual Project Project { get; set; } = null!;

    [Column("user_id")]
    public string UserId { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

[Table("teams")]
public class Team
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("message")]
    public string? Message { get; set; }

    public virtual ICollection<Member> Members { get; set; } = new List<Member>();
}

[Table("members")]
public class Member
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("team_id")]
    public int TeamId { get; set; }
    [ForeignKey("TeamId")]
    public virtual Team Team { get; set; } = null!;

    [Column("student_id")]
    public string StudentId { get; set; } = null!;

    [Column("full_name")]
    public string FullName { get; set; } = null!;

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("is_leader")]
    public bool IsLeader { get; set; }
}

[Table("schedule_items")]
public class ScheduleItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("course_name")]
    public string CourseName { get; set; } = null!;

    [Column("day")]
    public int Day { get; set; }

    [Column("start_hour")]
    public int StartHour { get; set; }

    [Column("duration")]
    public int Duration { get; set; }

    [Column("user_id")]
    public string UserId { get; set; } = null!;
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}

[Table("attendance")]
public class Attendance
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("team_name")]
    public string? TeamName { get; set; }

    [Column("student_id")]
    public string? StudentId { get; set; }

    [Column("present")]
    public int Present { get; set; }

    [Column("salon")]
    public string? Salon { get; set; }

    [Column("recorded_at")]
    public DateTime RecordedAt { get; set; }
}
