namespace AutoServiceHub.Api.Application.Orders.Models;

public sealed class OrderItemResponse
{
    public int PartId { get; set; }

    public string PartName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }
}