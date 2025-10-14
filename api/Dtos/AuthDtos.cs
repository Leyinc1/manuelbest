
using System.ComponentModel.DataAnnotations;

namespace ManuelBestApi.Dtos;

public record RegisterDto(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password
);

public record LoginDto(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record UserDto(
    string Id,
    string Email
);

public record AuthResponseDto(
    string Token,
    UserDto User
);
