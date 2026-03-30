using AutoServiceHub.Api.Application.Admin.Models;
using AutoServiceHub.Api.Domain;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/admin")]
public sealed class AdminController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _dbContext;

    public AdminController(UserManager<AppUser> userManager, AppDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = _userManager.Users
            .OrderBy(x => x.Email)
            .ToList();

        var result = new List<AdminUserResponse>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            result.Add(new AdminUserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = roles.FirstOrDefault() ?? "No role"
            });
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(AssignRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
            return NotFound(new { message = "User not found." });

        var roleExists = await _dbContext.Roles.AnyAsync(x => x.Name == request.Role);
        if (!roleExists)
            return BadRequest(new { message = "Role does not exist." });

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (currentRoles.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                return BadRequest(removeResult.Errors);
        }

        var addResult = await _userManager.AddToRoleAsync(user, request.Role);
        if (!addResult.Succeeded)
            return BadRequest(addResult.Errors);

        return Ok(new { message = "Role assigned successfully." });
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpGet("masters")]
    public async Task<IActionResult> GetMastersList()
    {
        var masters = await _userManager.GetUsersInRoleAsync("Master");

        var result = masters
            .Select(user => new
            {
                user.Id,
                user.Email,
                user.FullName,
                user.PhoneNumber
            })
            .OrderBy(x => x.Email)
            .ToList();

        return Ok(result);
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpPost("masters/{masterId}/services")]
    public async Task<IActionResult> AssignServices(string masterId, AssignMasterServicesRequest request)
    {
        var user = await _userManager.FindByIdAsync(masterId);

        if (user == null)
            return NotFound(new { message = "User not found." });

        if (!await _userManager.IsInRoleAsync(user, "Master"))
            return BadRequest(new { message = "User is not a master." });

        var validServiceIds = await _dbContext.Services
            .Where(x => request.ServiceIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync();

        var existing = _dbContext.MasterServices.Where(x => x.MasterId == masterId);
        _dbContext.MasterServices.RemoveRange(existing);

        foreach (var serviceId in validServiceIds.Distinct())
        {
            _dbContext.MasterServices.Add(new MasterService
            {
                MasterId = masterId,
                ServiceId = serviceId
            });
        }

        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Services assigned successfully." });
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpGet("masters/{masterId}/services")]
    public async Task<IActionResult> GetMasterServices(string masterId)
    {
        var services = await _dbContext.MasterServices
            .Where(x => x.MasterId == masterId)
            .Include(x => x.Service)
            .Select(x => new
            {
                x.ServiceId,
                x.Service.Name
            })
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(services);
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpPost("masters/{masterId}/working-hours")]
    public async Task<IActionResult> SetWorkingHours(string masterId, SetWorkingHoursRequest request)
    {
        var user = await _userManager.FindByIdAsync(masterId);

        if (user == null)
            return NotFound(new { message = "User not found." });

        if (!await _userManager.IsInRoleAsync(user, "Master"))
            return BadRequest(new { message = "User is not a master." });

        if (request.DayOfWeek < 1 || request.DayOfWeek > 7)
            return BadRequest(new { message = "DayOfWeek must be between 1 and 7." });

        if (request.StartTime >= request.EndTime)
            return BadRequest(new { message = "StartTime must be earlier than EndTime." });

        _dbContext.MasterWorkingHours.Add(new MasterWorkingHour
        {
            MasterId = masterId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        });

        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Working hours added successfully." });
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpGet("masters/{masterId}/working-hours")]
    public async Task<IActionResult> GetWorkingHours(string masterId)
    {
        var hours = await _dbContext.MasterWorkingHours
            .Where(x => x.MasterId == masterId)
            .OrderBy(x => x.DayOfWeek)
            .ThenBy(x => x.StartTime)
            .Select(x => new
            {
                x.Id,
                x.MasterId,
                x.DayOfWeek,
                x.StartTime,
                x.EndTime
            })
            .ToListAsync();

        return Ok(hours);
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpDelete("masters/working-hours/{id:int}")]
    public async Task<IActionResult> DeleteWorkingHour(int id)
    {
        var entity = await _dbContext.MasterWorkingHours.FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            return NotFound(new { message = "Working hour not found." });

        _dbContext.MasterWorkingHours.Remove(entity);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Working hour deleted successfully." });
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpPut("masters/working-hours/{id:int}")]
    public async Task<IActionResult> UpdateWorkingHour(int id, UpdateWorkingHourRequest request)
    {
        var entity = await _dbContext.MasterWorkingHours.FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            return NotFound(new { message = "Working hour not found." });

        if (request.DayOfWeek < 1 || request.DayOfWeek > 7)
            return BadRequest(new { message = "DayOfWeek must be between 1 and 7." });

        if (request.StartTime >= request.EndTime)
            return BadRequest(new { message = "StartTime must be earlier than EndTime." });

        entity.DayOfWeek = request.DayOfWeek;
        entity.StartTime = request.StartTime;
        entity.EndTime = request.EndTime;

        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Working hour updated successfully." });
    }
}