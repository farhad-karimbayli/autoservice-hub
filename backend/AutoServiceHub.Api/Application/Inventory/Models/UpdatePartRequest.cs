namespace AutoServiceHub.Api.Application.Inventory.Models;

public sealed class UpdatePartRequest
{
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }
}