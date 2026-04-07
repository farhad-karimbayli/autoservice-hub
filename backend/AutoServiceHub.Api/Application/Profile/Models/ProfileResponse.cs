namespace AutoServiceHub.Api.Application.Profile.Models;

public sealed class ProfileResponse
{
    public string Id { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public string Role { get; set; } = string.Empty;
}