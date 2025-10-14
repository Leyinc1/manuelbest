
using Microsoft.EntityFrameworkCore;
using ManuelBestApi.Models;

namespace ManuelBestApi.Data;

public class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ApiTask> Tasks { get; set; }
    public DbSet<ProjectMember> ProjectMembers { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<ScheduleItem> ScheduleItems { get; set; }
    public DbSet<Attendance> Attendances { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure composite primary key for ProjectMember
        modelBuilder.Entity<ProjectMember>()
            .HasKey(pm => new { pm.ProjectId, pm.UserId });

        // Relationship: A project has many members
        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId);

        // Relationship: A user can be a member of many projects
        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.User)
            .WithMany() // No navigation property back from User
            .HasForeignKey(pm => pm.UserId);
        
        // Relationship: A project has many tasks
        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tasks)
            .WithOne(t => t.Project)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade); // Cascade delete tasks when project is deleted

        // Relationship: A team has many members
        modelBuilder.Entity<Team>()
            .HasMany(t => t.Members)
            .WithOne(m => m.Team)
            .HasForeignKey(m => m.TeamId)
            .OnDelete(DeleteBehavior.Cascade); // Cascade delete members when team is deleted
    }
}
