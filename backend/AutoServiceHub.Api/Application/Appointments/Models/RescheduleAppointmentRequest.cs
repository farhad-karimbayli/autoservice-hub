namespace AutoServiceHub.Api.Application.Appointments.Models;

public sealed class RescheduleAppointmentRequest
{
    public string MasterId { get; set; } = string.Empty;

    public DateTime Date { get; set; }
}