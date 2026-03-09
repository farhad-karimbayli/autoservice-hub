namespace AutoServiceHub.Api.Application.Inventory.Models;

public sealed class InventoryItemResponse
{
    public int PartId { get; set; }

    public string PartName { get; set; } = string.Empty;

    public decimal PartPrice { get; set; }

    public int Quantity { get; set; }
}