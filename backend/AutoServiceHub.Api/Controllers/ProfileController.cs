using System.Security.Claims;
using AutoServiceHub.Api.Application.Profile;
using AutoServiceHub.Api.Application.Profile.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public sealed class ProfileController : ControllerBase
{
    private readonly ProfileService _profileService;

    public ProfileController(ProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        try
        {
            var result = await _profileService.GetAsync(userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        try
        {
            var result = await _profileService.UpdateAsync(userId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        try
        {
            await _profileService.ChangePasswordAsync(userId, request);
            return Ok(new { message = "Password changed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}