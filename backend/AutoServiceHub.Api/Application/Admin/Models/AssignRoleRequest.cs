namespace AutoServiceHub.Api.Application.Admin.Models;

public sealed class AssignRoleRequest
{
    public string UserId { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
}