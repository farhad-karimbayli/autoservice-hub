using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Identity;

namespace AutoServiceHub.Api.Infrastructure;

public static class IdentitySeeder
{
    public static async Task Seed(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();

        string[] roles = ["Admin", "Director", "Master", "Client"];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        var adminEmail = "admin@autoservice.local";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new AppUser
            {
                Email = adminEmail,
                UserName = adminEmail,
                EmailConfirmed = true
            };

            await userManager.CreateAsync(adminUser, "Admin123!");
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}