using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AutoServiceHub.Api.Application.Auth;

public sealed class JwtTokenService
{
    private readonly JwtOptions _jwtOptions;
    private readonly UserManager<AppUser> _userManager;

    public JwtTokenService(
        IOptions<JwtOptions> jwtOptions,
        UserManager<AppUser> userManager)
    {
        _jwtOptions = jwtOptions.Value;
        _userManager = userManager;
    }

    public async Task<string> GenerateTokenAsync(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        var fullName = string.IsNullOrWhiteSpace(user.FullName)
            ? (user.UserName ?? user.Email ?? "User")
            : user.FullName;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, fullName),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new("fullName", fullName)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiresInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}