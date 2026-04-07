using AutoServiceHub.Api.Application.Profile.Models;
using AutoServiceHub.Api.Domain;
using Microsoft.AspNetCore.Identity;

namespace AutoServiceHub.Api.Application.Profile;

public sealed class ProfileService
{
    private readonly UserManager<AppUser> _userManager;

    public ProfileService(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<ProfileResponse> GetAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            throw new InvalidOperationException("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return new ProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Email = user.Email,
            Role = roles.FirstOrDefault() ?? "No role"
        };
    }

    public async Task<ProfileResponse> UpdateAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            throw new InvalidOperationException("User not found.");

        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new InvalidOperationException("Full name is required.");

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            throw new InvalidOperationException("Phone number is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new InvalidOperationException("Email is required.");

        var existingUser = await _userManager.FindByEmailAsync(request.Email.Trim());

        if (existingUser is not null && existingUser.Id != user.Id)
            throw new InvalidOperationException("Email is already in use.");

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber.Trim();
        user.Email = request.Email.Trim();
        user.UserName = request.Email.Trim();

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            throw new InvalidOperationException(
                result.Errors.FirstOrDefault()?.Description ?? "Failed to update profile.");

        var roles = await _userManager.GetRolesAsync(user);

        return new ProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Email = user.Email,
            Role = roles.FirstOrDefault() ?? "No role"
        };
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            throw new InvalidOperationException("User not found.");

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            throw new InvalidOperationException("Current password is required.");

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            throw new InvalidOperationException("New password is required.");

        if (request.NewPassword != request.ConfirmNewPassword)
            throw new InvalidOperationException("New password and confirmation do not match.");

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
            throw new InvalidOperationException(
                result.Errors.FirstOrDefault()?.Description ?? "Failed to change password.");
    }
}