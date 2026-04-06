namespace AutoServiceHub.Api.Application.Appointments.Models;

public sealed class AppointmentResponse
{
    public int Id { get; set; }

    public int ServiceId { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Comment { get; set; }

    public string ClientId { get; set; } = string.Empty;

    public string? ClientName { get; set; }

    public string? MasterId { get; set; }

    public string? MasterName { get; set; }
}