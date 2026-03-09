namespace AutoServiceHub.Api.Application.Inventory.Models;

public sealed class PartResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }
}