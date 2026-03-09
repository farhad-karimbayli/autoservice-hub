using AutoServiceHub.Api.Application.Auth;
using AutoServiceHub.Api.Application.Auth.Models;
using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly JwtTokenService _jwtService;

    public AuthController(
        UserManager<AppUser> userManager,
        JwtTokenService jwtService)
    {
        _userManager = userManager;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var user = new AppUser
        {
            Email = request.Email,
            UserName = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, "Client");

        var token = await _jwtService.GenerateTokenAsync(user);

        return Ok(new AuthResponse { Token = token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
            return Unauthorized();

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!validPassword)
            return Unauthorized();

        var token = await _jwtService.GenerateTokenAsync(user);

        return Ok(new AuthResponse { Token = token });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            User = User.Identity?.Name,
            Claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }
}