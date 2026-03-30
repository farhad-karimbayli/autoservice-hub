namespace AutoServiceHub.Api.Application.Admin.Models;

public sealed class AdminUserResponse
{
    public string Id { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string Role { get; set; } = "No role";
}