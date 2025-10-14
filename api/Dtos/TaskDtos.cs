
using System.ComponentModel.DataAnnotations;

namespace ManuelBestApi.Dtos;

public record CreateTaskDto(
    [Required] string Content,
    [Required] string Status,
    [Required] Guid ProjectId,
    string? AssignedTo,
    string? Description,
    string[]? Tags
);

public record UpdateTaskDto(
    string? Content,
    string? Status,
    string? AssignedTo,
    string? Description,
    string[]? Tags
);
