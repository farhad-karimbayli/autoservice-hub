namespace AutoServiceHub.Api.Domain.Entities;

public sealed class Appointment
{
    public int Id { get; set; }

    public string ClientId { get; set; } = string.Empty;

    public string? MasterId { get; set; }

    public int ServiceId { get; set; }

    public DateTime Date { get; set; }

    public string Status { get; set; } = "Created";

    public string? Comment { get; set; }
}