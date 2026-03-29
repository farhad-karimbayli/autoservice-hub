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
    public IActionResult GetUsers()
    {
        var users = _userManager.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.PhoneNumber
            })
            .ToList();

        return Ok(users);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(AssignRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
            return NotFound(new { message = "User not found." });

        var roles = await _userManager.GetRolesAsync(user);

        if (roles.Any())
            await _userManager.RemoveFromRolesAsync(user, roles);

        var result = await _userManager.AddToRoleAsync(user, request.Role);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Role assigned successfully." });
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpPost("masters/{masterId}/services")]
    public async Task<IActionResult> AssignMasterServices(
        string masterId,
        AssignMasterServicesRequest request)
    {
        var master = await _userManager.FindByIdAsync(masterId);

        if (master == null)
            return NotFound(new { message = "Master not found." });

        var isMaster = await _userManager.IsInRoleAsync(master, "Master");

        if (!isMaster)
            return BadRequest(new { message = "Selected user is not a master." });

        var serviceIds = request.ServiceIds.Distinct().ToList();

        var existingServices = await _dbContext.Services
            .Where(x => serviceIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync();

        if (existingServices.Count != serviceIds.Count)
            return BadRequest(new { message = "One or more services were not found." });

        var oldRelations = await _dbContext.MasterServices
            .Where(x => x.MasterId == masterId)
            .ToListAsync();

        _dbContext.MasterServices.RemoveRange(oldRelations);

        var newRelations = serviceIds.Select(serviceId => new MasterService
        {
            MasterId = masterId,
            ServiceId = serviceId
        });

        await _dbContext.MasterServices.AddRangeAsync(newRelations);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Master services updated successfully." });
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
                ServiceName = x.Service.Name,
                x.Service.Price,
                x.Service.DurationMinutes
            })
            .ToListAsync();

        return Ok(services);
    }

    [Authorize(Roles = "Admin,Director")]
    [HttpPost("masters/{masterId}/working-hours")]
    public async Task<IActionResult> AddWorkingHour(
        string masterId,
        SetWorkingHoursRequest request)
    {
        var master = await _userManager.FindByIdAsync(masterId);

        if (master == null)
            return NotFound(new { message = "Master not found." });

        var isMaster = await _userManager.IsInRoleAsync(master, "Master");

        if (!isMaster)
            return BadRequest(new { message = "Selected user is not a master." });

        if (request.DayOfWeek < 1 || request.DayOfWeek > 7)
            return BadRequest(new { message = "DayOfWeek must be between 1 and 7." });

        if (request.StartTime >= request.EndTime)
            return BadRequest(new { message = "StartTime must be less than EndTime." });

        var entity = new MasterWorkingHour
        {
            MasterId = masterId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        };

        _dbContext.MasterWorkingHours.Add(entity);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Working hour added successfully." });
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
        var hour = await _dbContext.MasterWorkingHours.FindAsync(id);

        if (hour == null)
            return NotFound(new { message = "Working hour not found." });

        _dbContext.MasterWorkingHours.Remove(hour);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Working hour deleted successfully." });
    }
}