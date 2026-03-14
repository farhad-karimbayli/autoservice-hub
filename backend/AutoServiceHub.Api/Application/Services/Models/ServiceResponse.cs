namespace AutoServiceHub.Api.Application.Services.Models;

public sealed class ServiceResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }
}