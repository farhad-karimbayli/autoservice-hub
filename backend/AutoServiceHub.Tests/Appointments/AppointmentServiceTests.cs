using AutoServiceHub.Api.Application.Appointments;
using AutoServiceHub.Api.Application.Appointments.Models;
using AutoServiceHub.Api.Domain;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Domain.Enums;
using AutoServiceHub.Tests.Helpers;
using Moq;

namespace AutoServiceHub.Tests.Appointments;

public sealed class AppointmentServiceTests
{
    [Fact]
    public async Task CreateAsync_Should_CreateAppointment_When_ServiceExists()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Oil Change",
            Price = 50,
            DurationMinutes = 30
        });

        await dbContext.SaveChangesAsync();

        var userManagerMock = UserManagerMockHelper.Create();
        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var result = await service.CreateAsync("client-1", new CreateAppointmentRequest
        {
            ServiceId = 1,
            Date = new DateTime(2026, 3, 20, 12, 0, 0),
            Comment = "Need quick service"
        });

        Assert.Equal(1, result.ServiceId);
        Assert.Equal("Oil Change", result.ServiceName);
        Assert.Equal("Created", result.Status);
        Assert.Equal("client-1", result.ClientId);

        var appointment = dbContext.Appointments.Single();
        Assert.Equal("client-1", appointment.ClientId);
        Assert.Equal(AppointmentStatus.Created, appointment.Status);
    }

    [Fact]
    public async Task CreateAsync_Should_Throw_When_ServiceNotFound()
    {
        using var dbContext = TestDbContextFactory.Create();

        var userManagerMock = UserManagerMockHelper.Create();
        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var action = async () => await service.CreateAsync("client-1", new CreateAppointmentRequest
        {
            ServiceId = 999,
            Date = DateTime.UtcNow
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Service not found.", exception.Message);
    }

    [Fact]
    public async Task GetClientAppointmentsAsync_Should_Return_OnlyClientAppointments()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Diagnostics",
            Price = 40,
            DurationMinutes = 20
        });

        dbContext.Appointments.AddRange(
            new Appointment
            {
                Id = 1,
                ClientId = "client-1",
                ServiceId = 1,
                Date = new DateTime(2026, 3, 20),
                Status = AppointmentStatus.Created
            },
            new Appointment
            {
                Id = 2,
                ClientId = "client-2",
                ServiceId = 1,
                Date = new DateTime(2026, 3, 21),
                Status = AppointmentStatus.Confirmed
            });

        await dbContext.SaveChangesAsync();

        var userManagerMock = UserManagerMockHelper.Create();
        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var result = await service.GetClientAppointmentsAsync("client-1");

        Assert.Single(result);
        Assert.Equal("client-1", result[0].ClientId);
        Assert.Equal("Diagnostics", result[0].ServiceName);
    }

    [Fact]
    public async Task GetMasterAppointmentsAsync_Should_Return_OnlyAssignedAppointments()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Brake Replacement",
            Price = 90,
            DurationMinutes = 60
        });

        dbContext.Appointments.AddRange(
            new Appointment
            {
                Id = 1,
                ClientId = "client-1",
                MasterId = "master-1",
                ServiceId = 1,
                Date = new DateTime(2026, 3, 20),
                Status = AppointmentStatus.Confirmed
            },
            new Appointment
            {
                Id = 2,
                ClientId = "client-2",
                MasterId = "master-2",
                ServiceId = 1,
                Date = new DateTime(2026, 3, 21),
                Status = AppointmentStatus.Confirmed
            });

        await dbContext.SaveChangesAsync();

        var userManagerMock = UserManagerMockHelper.Create();
        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var result = await service.GetMasterAppointmentsAsync("master-1");

        Assert.Single(result);
        Assert.Equal("master-1", result[0].MasterId);
    }

    [Fact]
    public async Task UpdateStatusAsync_Should_UpdateAppointmentStatus_When_StatusIsValid()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Suspension Check",
            Price = 70,
            DurationMinutes = 45
        });

        dbContext.Appointments.Add(new Appointment
        {
            Id = 1,
            ClientId = "client-1",
            ServiceId = 1,
            Date = new DateTime(2026, 3, 20),
            Status = AppointmentStatus.Created
        });

        await dbContext.SaveChangesAsync();

        var userManagerMock = UserManagerMockHelper.Create();
        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var result = await service.UpdateStatusAsync(1, "InProgress");

        Assert.Equal("InProgress", result.Status);
        Assert.Equal(AppointmentStatus.InProgress, dbContext.Appointments.Single().Status);
    }

    [Fact]
    public async Task UpdateStatusAsync_Should_Throw_When_StatusIsInvalid()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Diagnostics",
            Price = 40,
            DurationMinutes = 20
        });

        dbContext.Appointments.Add(new Appointment
        {
            Id = 1,
            ClientId = "client-1",
            ServiceId = 1,
            Date = DateTime.UtcNow,
            Status = AppointmentStatus.Created
        });

        await dbContext.SaveChangesAsync();

        var userManagerMock = UserManagerMockHelper.Create();
        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var action = async () => await service.UpdateStatusAsync(1, "WrongStatus");

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Invalid appointment status.", exception.Message);
    }

    [Fact]
    public async Task AssignMasterAsync_Should_AssignMaster_And_SetConfirmedStatus()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Oil Change",
            Price = 50,
            DurationMinutes = 30
        });

        dbContext.Appointments.Add(new Appointment
        {
            Id = 1,
            ClientId = "client-1",
            ServiceId = 1,
            Date = new DateTime(2026, 3, 20),
            Status = AppointmentStatus.Created
        });

        await dbContext.SaveChangesAsync();

        var masterUser = new AppUser
        {
            Id = "master-1",
            Email = "master@test.com",
            UserName = "master@test.com"
        };

        var userManagerMock = UserManagerMockHelper.Create();
        userManagerMock
            .Setup(x => x.FindByIdAsync("master-1"))
            .ReturnsAsync(masterUser);

        userManagerMock
            .Setup(x => x.IsInRoleAsync(masterUser, "Master"))
            .ReturnsAsync(true);

        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var result = await service.AssignMasterAsync(1, "master-1");

        Assert.Equal("master-1", result.MasterId);
        Assert.Equal("Confirmed", result.Status);

        var appointment = dbContext.Appointments.Single();
        Assert.Equal("master-1", appointment.MasterId);
        Assert.Equal(AppointmentStatus.Confirmed, appointment.Status);
    }

    [Fact]
    public async Task AssignMasterAsync_Should_Throw_When_UserIsNotMaster()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Services.Add(new Service
        {
            Id = 1,
            Name = "Oil Change",
            Price = 50,
            DurationMinutes = 30
        });

        dbContext.Appointments.Add(new Appointment
        {
            Id = 1,
            ClientId = "client-1",
            ServiceId = 1,
            Date = DateTime.UtcNow,
            Status = AppointmentStatus.Created
        });

        await dbContext.SaveChangesAsync();

        var someUser = new AppUser
        {
            Id = "user-1",
            Email = "user@test.com",
            UserName = "user@test.com"
        };

        var userManagerMock = UserManagerMockHelper.Create();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(someUser);

        userManagerMock
            .Setup(x => x.IsInRoleAsync(someUser, "Master"))
            .ReturnsAsync(false);

        var service = new AppointmentService(dbContext, userManagerMock.Object);

        var action = async () => await service.AssignMasterAsync(1, "user-1");

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Selected user is not a master.", exception.Message);
    }
}