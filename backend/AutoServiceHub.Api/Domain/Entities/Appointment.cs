using AutoServiceHub.Api.Domain.Enums;

namespace AutoServiceHub.Api.Domain.Entities;

public sealed class Appointment
{
    public int Id { get; set; }

    public string ClientId { get; set; } = string.Empty;

    public string? MasterId { get; set; }

    public int ServiceId { get; set; }

    public Service Service { get; set; } = null!;

    public DateTime Date { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Created;

    public string? Comment { get; set; }
}