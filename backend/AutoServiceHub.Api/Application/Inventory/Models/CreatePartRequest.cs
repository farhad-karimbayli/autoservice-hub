namespace AutoServiceHub.Api.Application.Inventory.Models;

public sealed class CreatePartRequest
{
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }
}