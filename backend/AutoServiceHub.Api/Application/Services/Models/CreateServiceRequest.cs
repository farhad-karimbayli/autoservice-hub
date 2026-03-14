namespace AutoServiceHub.Api.Application.Services.Models;

public sealed class CreateServiceRequest
{
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }
}