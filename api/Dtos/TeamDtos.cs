
using System.ComponentModel.DataAnnotations;

namespace ManuelBestApi.Dtos;

public record MemberDto(
    [Required] string StudentId,
    [Required] string FullName,
    [Required][EmailAddress] string Email
);

public record SubmitApplicationDto(
    [Required] string TeamName,
    string? Message,
    [Required][MinLength(2)][MaxLength(3)] List<MemberDto> Members
);
