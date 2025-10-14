
using System.ComponentModel.DataAnnotations;

namespace ManuelBestApi.Dtos;

public record CreateProjectDto(
    [Required]
    [StringLength(100, MinimumLength = 1)]
    string Name
);

public record AddMemberDto(
    [Required]
    [EmailAddress]
    string Email
);
