using AutoServiceHub.Api.Application.Admin.Models;
using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    public AdminController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = _userManager.Users
            .Select(u => new
            {
                u.Id,
                u.Email
            })
            .ToList();

        return Ok(users);
    }

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(AssignRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        if (roles.Any())
            await _userManager.RemoveFromRolesAsync(user, roles);

        await _userManager.AddToRoleAsync(user, request.Role);

        return Ok();
    }
}