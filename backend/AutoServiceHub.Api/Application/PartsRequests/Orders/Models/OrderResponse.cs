namespace AutoServiceHub.Api.Application.Orders.Models;

public sealed class OrderResponse
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public List<OrderItemResponse> Items { get; set; } = [];
}