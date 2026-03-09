namespace AutoServiceHub.Api.Application.Inventory.Models;

public sealed class AddInventoryRequest
{
    public int PartId { get; set; }

    public int Quantity { get; set; }
}