using AutoServiceHub.Api.Domain.Enums;

namespace AutoServiceHub.Api.Domain.Entities;

public sealed class Order
{
    public int Id { get; set; }

    public string ClientId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Created;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}