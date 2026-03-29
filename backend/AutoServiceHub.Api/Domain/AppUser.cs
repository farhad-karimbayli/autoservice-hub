using Microsoft.AspNetCore.Identity;

namespace AutoServiceHub.Api.Domain;

public sealed class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}