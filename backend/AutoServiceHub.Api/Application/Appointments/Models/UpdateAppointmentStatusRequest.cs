namespace AutoServiceHub.Api.Application.Appointments.Models;

public sealed class UpdateAppointmentStatusRequest
{
    public string Status { get; set; } = string.Empty;
}