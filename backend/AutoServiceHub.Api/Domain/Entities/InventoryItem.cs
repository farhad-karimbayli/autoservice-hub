namespace AutoServiceHub.Api.Domain.Entities;

public sealed class InventoryItem
{
    public int Id { get; set; }

    public int PartId { get; set; }

    public int Quantity { get; set; }

    public Part Part { get; set; } = null!;
}