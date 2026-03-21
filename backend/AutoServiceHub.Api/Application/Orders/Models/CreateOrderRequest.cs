namespace AutoServiceHub.Api.Application.Orders.Models;

public sealed class CreateOrderRequest
{
    public List<CreateOrderItemRequest> Items { get; set; } = [];
}