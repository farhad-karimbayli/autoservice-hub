using AutoServiceHub.Api.Application.Appointments.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Domain.Enums;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Application.Appointments;

public sealed class AppointmentService
{
    private readonly AppDbContext _dbContext;

    public AppointmentService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AppointmentResponse> CreateAsync(
        string clientId,
        CreateAppointmentRequest request)
    {
        var service = await _dbContext.Services
            .FirstOrDefaultAsync(x => x.Id == request.ServiceId);

        if (service is null)
            throw new InvalidOperationException("Service not found.");

        var appointment = new Appointment
        {
            ClientId = clientId,
            ServiceId = request.ServiceId,
            Date = request.Date,
            Comment = request.Comment,
            Status = AppointmentStatus.Created
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
            MasterId = appointment.MasterId
        };
    }

    public async Task<List<AppointmentResponse>> GetClientAppointmentsAsync(string clientId)
    {
        return await _dbContext.Appointments
            .Include(x => x.Service)
            .Where(x => x.ClientId == clientId)
            .OrderByDescending(x => x.Date)
            .Select(x => new AppointmentResponse
            {
                Id = x.Id,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.Name,
                Date = x.Date,
                Status = x.Status.ToString(),
                Comment = x.Comment,
                ClientId = x.ClientId,
                MasterId = x.MasterId
            })
            .ToListAsync();
    }

    public async Task<List<AppointmentResponse>> GetMasterAppointmentsAsync(string masterId)
    {
        return await _dbContext.Appointments
            .Include(x => x.Service)
            .Where(x => x.MasterId == masterId)
            .OrderByDescending(x => x.Date)
            .Select(x => new AppointmentResponse
            {
                Id = x.Id,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.Name,
                Date = x.Date,
                Status = x.Status.ToString(),
                Comment = x.Comment,
                ClientId = x.ClientId,
                MasterId = x.MasterId
            })
            .ToListAsync();
    }

    public async Task<List<AppointmentResponse>> GetAllAsync()
    {
        return await _dbContext.Appointments
            .Include(x => x.Service)
            .OrderByDescending(x => x.Date)
            .Select(x => new AppointmentResponse
            {
                Id = x.Id,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.Name,
                Date = x.Date,
                Status = x.Status.ToString(),
                Comment = x.Comment,
                ClientId = x.ClientId,
                MasterId = x.MasterId
            })
            .ToListAsync();
    }
}