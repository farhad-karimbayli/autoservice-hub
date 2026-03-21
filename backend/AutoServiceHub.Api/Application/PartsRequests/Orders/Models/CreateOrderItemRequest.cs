namespace AutoServiceHub.Api.Application.Orders.Models;

public sealed class CreateOrderItemRequest
{
    public int PartId { get; set; }

    public int Quantity { get; set; }
}