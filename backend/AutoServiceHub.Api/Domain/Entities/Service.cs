namespace AutoServiceHub.Api.Domain.Entities;

public sealed class Service
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}