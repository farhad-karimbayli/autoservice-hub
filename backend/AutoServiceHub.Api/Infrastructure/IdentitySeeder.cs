using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Identity;

namespace AutoServiceHub.Api.Infrastructure;

public static class IdentitySeeder
{
    public static async Task SeedRoles(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        string[] roles = ["Admin", "Director", "Master", "Client"];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }
}