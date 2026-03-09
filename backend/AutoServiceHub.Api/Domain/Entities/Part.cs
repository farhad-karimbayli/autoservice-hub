namespace AutoServiceHub.Api.Domain.Entities;

public sealed class Part
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public InventoryItem? InventoryItem { get; set; }
}