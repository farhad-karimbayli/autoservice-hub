using AutoServiceHub.Api.Application.Appointments.Models;
using AutoServiceHub.Api.Domain;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Domain.Enums;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Application.Appointments;

public sealed class AppointmentService
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AppointmentService(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    private async Task<string?> GetUserFullNameAsync(string? userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return null;

        var user = await _userManager.Users
            .Where(x => x.Id == userId)
            .Select(x => new
            {
                x.FullName,
                x.Email
            })
            .FirstOrDefaultAsync();

        if (user is null)
            return null;

        if (!string.IsNullOrWhiteSpace(user.FullName))
            return user.FullName;

        return user.Email;
    }

    private async Task<bool> IsMasterAvailableAsync(
        string masterId,
        int serviceId,
        DateTime startDateTime,
        int? ignoreAppointmentId = null)
    {
        var service = await _dbContext.Services.FirstOrDefaultAsync(x => x.Id == serviceId);

        if (service is null)
            return false;

        var endDateTime = startDateTime.AddMinutes(service.DurationMinutes);

        var dayOfWeek = startDateTime.DayOfWeek switch
        {
            DayOfWeek.Monday => 1,
            DayOfWeek.Tuesday => 2,
            DayOfWeek.Wednesday => 3,
            DayOfWeek.Thursday => 4,
            DayOfWeek.Friday => 5,
            DayOfWeek.Saturday => 6,
            DayOfWeek.Sunday => 7,
            _ => 0
        };

        var hasSkill = await _dbContext.MasterServices
            .AnyAsync(x => x.MasterId == masterId && x.ServiceId == serviceId);

        if (!hasSkill)
            return false;

        var workingHours = await _dbContext.MasterWorkingHours
            .Where(x => x.MasterId == masterId && x.DayOfWeek == dayOfWeek)
            .ToListAsync();

        if (!workingHours.Any())
            return false;

        var fitsWorkingHours = workingHours.Any(x =>
            x.StartTime <= startDateTime.TimeOfDay &&
            x.EndTime >= endDateTime.TimeOfDay);

        if (!fitsWorkingHours)
            return false;

        var masterAppointments = await _dbContext.Appointments
            .Include(x => x.Service)
            .Where(x => x.MasterId == masterId)
            .Where(x => x.Status != AppointmentStatus.Cancelled)
            .Where(x => !ignoreAppointmentId.HasValue || x.Id != ignoreAppointmentId.Value)
            .ToListAsync();

        var hasConflict = masterAppointments.Any(existing =>
        {
            var existingStart = existing.Date;
            var existingEnd = existing.Date.AddMinutes(existing.Service.DurationMinutes);

            return startDateTime < existingEnd && existingStart < endDateTime;
        });

        return !hasConflict;
    }

    public async Task<List<AvailableMasterResponse>> GetAvailableMastersAsync(int serviceId, DateTime date)
    {
        var masterIds = await _dbContext.MasterServices
            .Where(x => x.ServiceId == serviceId)
            .Select(x => x.MasterId)
            .Distinct()
            .ToListAsync();

        var result = new List<AvailableMasterResponse>();

        foreach (var masterId in masterIds)
        {
            var user = await _userManager.FindByIdAsync(masterId);

            if (user is null)
                continue;

            var isMaster = await _userManager.IsInRoleAsync(user, "Master");

            if (!isMaster)
                continue;

            var available = await IsMasterAvailableAsync(masterId, serviceId, date);

            if (!available)
                continue;

            result.Add(new AvailableMasterResponse
            {
                MasterId = user.Id,
                FullName = !string.IsNullOrWhiteSpace(user.FullName)
                    ? user.FullName
                    : (user.Email ?? user.Id)
            });
        }

        return result.OrderBy(x => x.FullName).ToList();
    }

    public async Task<AppointmentResponse> CreateAsync(
        string clientId,
        CreateAppointmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MasterId))
            throw new InvalidOperationException("Master is required.");

        var service = await _dbContext.Services
            .FirstOrDefaultAsync(x => x.Id == request.ServiceId);

        if (service is null)
            throw new InvalidOperationException("Service not found.");

        var masterUser = await _userManager.FindByIdAsync(request.MasterId);

        if (masterUser is null)
            throw new InvalidOperationException("Master user not found.");

        var isMaster = await _userManager.IsInRoleAsync(masterUser, "Master");

        if (!isMaster)
            throw new InvalidOperationException("Selected user is not a master.");

        var available = await IsMasterAvailableAsync(
            request.MasterId,
            request.ServiceId,
            request.Date);

        if (!available)
            throw new InvalidOperationException("Selected master is not available at the chosen time.");

        var appointment = new Appointment
        {
            ClientId = clientId,
            MasterId = request.MasterId,
            ServiceId = request.ServiceId,
            Date = request.Date,
            Comment = request.Comment,
            Status = AppointmentStatus.Confirmed
        };

        _dbContext.Appointments.Add(appointment);
        await _dbContext.SaveChangesAsync();

        return new AppointmentResponse
        {
            Id = appointment.Id,
            ServiceId = appointment.ServiceId,
            ServiceName = service.Name,
            Date = appointment.Date,
            Status = appointment.Status.ToString(),
            Comment = appointment.Comment,
            ClientId = appointment.ClientId,
            ClientName = await GetUserFullNameAsync(appointment.ClientId),
            MasterId = appointment.MasterId,
            MasterName = await GetUserFullNameAsync(appointment.MasterId)
        };
    }

    public async Task<List<AppointmentResponse>> GetClientAppointmentsAsync(string clientId)
    {
        var appointments = await _dbContext.Appointments
            .Include(x => x.Service)
            .Where(x => x.ClientId == clientId)
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        var result = new List<AppointmentResponse>();

        foreach (var x in appointments)
        {
            result.Add(new AppointmentResponse
            {
                Id = x.Id,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.Name,
                Date = x.Date,
                Status = x.Status.ToString(),
                Comment = x.Comment,
                ClientId = x.ClientId,
                ClientName = await GetUserFullNameAsync(x.ClientId),
                MasterId = x.MasterId,
                MasterName = await GetUserFullNameAsync(x.MasterId)
            });
        }

        return result;
    }

    public async Task<List<AppointmentResponse>> GetMasterAppointmentsAsync(string masterId)
    {
        var appointments = await _dbContext.Appointments
            .Include(x => x.Service)
            .Where(x => x.MasterId == masterId)
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        var result = new List<AppointmentResponse>();

        foreach (var x in appointments)
        {
            result.Add(new AppointmentResponse
            {
                Id = x.Id,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.Name,
                Date = x.Date,
                Status = x.Status.ToString(),
                Comment = x.Comment,
                ClientId = x.ClientId,
                ClientName = await GetUserFullNameAsync(x.ClientId),
                MasterId = x.MasterId,
                MasterName = await GetUserFullNameAsync(x.MasterId)
            });
        }

        return result;
    }

    public async Task<List<AppointmentResponse>> GetAllAsync()
    {
        var appointments = await _dbContext.Appointments
            .Include(x => x.Service)
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        var result = new List<AppointmentResponse>();

        foreach (var x in appointments)
        {
            result.Add(new AppointmentResponse
            {
                Id = x.Id,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.Name,
                Date = x.Date,
                Status = x.Status.ToString(),
                Comment = x.Comment,
                ClientId = x.ClientId,
                ClientName = await GetUserFullNameAsync(x.ClientId),
                MasterId = x.MasterId,
                MasterName = await GetUserFullNameAsync(x.MasterId)
            });
        }

        return result;
    }

    public async Task<AppointmentResponse> AssignMasterAsync(int appointmentId, string masterId)
    {
        var appointment = await _dbContext.Appointments
            .Include(x => x.Service)
            .FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appointment is null)
            throw new InvalidOperationException("Appointment not found.");

        var masterUser = await _userManager.FindByIdAsync(masterId);

        if (masterUser is null)
            throw new InvalidOperationException("Master user not found.");

        var isMaster = await _userManager.IsInRoleAsync(masterUser, "Master");

        if (!isMaster)
            throw new InvalidOperationException("Selected user is not a master.");

        appointment.MasterId = masterId;

        if (appointment.Status == AppointmentStatus.Created)
            appointment.Status = AppointmentStatus.Confirmed;

        await _dbContext.SaveChangesAsync();

        return new AppointmentResponse
        {
            Id = appointment.Id,
            ServiceId = appointment.ServiceId,
            ServiceName = appointment.Service.Name,
            Date = appointment.Date,
            Status = appointment.Status.ToString(),
            Comment = appointment.Comment,
            ClientId = appointment.ClientId,
            ClientName = await GetUserFullNameAsync(appointment.ClientId),
            MasterId = appointment.MasterId,
            MasterName = await GetUserFullNameAsync(appointment.MasterId)
        };
    }

    public async Task<AppointmentResponse> UpdateStatusAsync(int appointmentId, string status)
    {
        var appointment = await _dbContext.Appointments
            .Include(x => x.Service)
            .FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appointment is null)
            throw new InvalidOperationException("Appointment not found.");

        if (!Enum.TryParse<AppointmentStatus>(status, true, out var parsedStatus))
            throw new InvalidOperationException("Invalid appointment status.");

        appointment.Status = parsedStatus;

        await _dbContext.SaveChangesAsync();

        return new AppointmentResponse
        {
            Id = appointment.Id,
            ServiceId = appointment.ServiceId,
            ServiceName = appointment.Service.Name,
            Date = appointment.Date,
            Status = appointment.Status.ToString(),
            Comment = appointment.Comment,
            ClientId = appointment.ClientId,
            ClientName = await GetUserFullNameAsync(appointment.ClientId),
            MasterId = appointment.MasterId,
            MasterName = await GetUserFullNameAsync(appointment.MasterId)
        };
    }

    public async Task<AppointmentResponse> CancelAsync(int appointmentId, string clientId)
    {
        var appointment = await _dbContext.Appointments
            .Include(x => x.Service)
            .FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appointment is null)
            throw new InvalidOperationException("Appointment not found.");

        if (appointment.ClientId != clientId)
            throw new InvalidOperationException("You can cancel only your own appointment.");

        if (appointment.Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Appointment is already cancelled.");

        if (appointment.Status == AppointmentStatus.Done)
            throw new InvalidOperationException("Completed appointment cannot be cancelled.");

        appointment.Status = AppointmentStatus.Cancelled;

        await _dbContext.SaveChangesAsync();

        return new AppointmentResponse
        {
            Id = appointment.Id,
            ServiceId = appointment.ServiceId,
            ServiceName = appointment.Service.Name,
            Date = appointment.Date,
            Status = appointment.Status.ToString(),
            Comment = appointment.Comment,
            ClientId = appointment.ClientId,
            ClientName = await GetUserFullNameAsync(appointment.ClientId),
            MasterId = appointment.MasterId,
            MasterName = await GetUserFullNameAsync(appointment.MasterId)
        };
    }

    public async Task<AppointmentResponse> RescheduleAsync(
        int appointmentId,
        string clientId,
        RescheduleAppointmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MasterId))
            throw new InvalidOperationException("Master is required.");

        var appointment = await _dbContext.Appointments
            .Include(x => x.Service)
            .FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appointment is null)
            throw new InvalidOperationException("Appointment not found.");

        if (appointment.ClientId != clientId)
            throw new InvalidOperationException("You can reschedule only your own appointment.");

        if (appointment.Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cancelled appointment cannot be rescheduled.");

        if (appointment.Status == AppointmentStatus.Done)
            throw new InvalidOperationException("Completed appointment cannot be rescheduled.");

        var masterUser = await _userManager.FindByIdAsync(request.MasterId);

        if (masterUser is null)
            throw new InvalidOperationException("Master user not found.");

        var isMaster = await _userManager.IsInRoleAsync(masterUser, "Master");

        if (!isMaster)
            throw new InvalidOperationException("Selected user is not a master.");

        var available = await IsMasterAvailableAsync(
            request.MasterId,
            appointment.ServiceId,
            request.Date,
            appointment.Id);

        if (!available)
            throw new InvalidOperationException("Selected master is not available at the chosen time.");

        appointment.MasterId = request.MasterId;
        appointment.Date = request.Date;
        appointment.Status = AppointmentStatus.Confirmed;

        await _dbContext.SaveChangesAsync();

        return new AppointmentResponse
        {
            Id = appointment.Id,
            ServiceId = appointment.ServiceId,
            ServiceName = appointment.Service.Name,
            Date = appointment.Date,
            Status = appointment.Status.ToString(),
            Comment = appointment.Comment,
            ClientId = appointment.ClientId,
            ClientName = await GetUserFullNameAsync(appointment.ClientId),
            MasterId = appointment.MasterId,
            MasterName = await GetUserFullNameAsync(appointment.MasterId)
        };
    }
}