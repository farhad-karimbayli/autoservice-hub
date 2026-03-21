namespace AutoServiceHub.Api.Domain.Entities;

public sealed class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public Order Order { get; set; } = null!;

    public int PartId { get; set; }

    public Part Part { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}