namespace AutoServiceHub.Api.Application.Appointments.Models;

public sealed class CreateAppointmentRequest
{
    public int ServiceId { get; set; }

    public DateTime Date { get; set; }

    public string? Comment { get; set; }
}