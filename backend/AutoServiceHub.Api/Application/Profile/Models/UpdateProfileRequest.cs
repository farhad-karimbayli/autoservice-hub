namespace AutoServiceHub.Api.Application.Profile.Models;

public sealed class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}