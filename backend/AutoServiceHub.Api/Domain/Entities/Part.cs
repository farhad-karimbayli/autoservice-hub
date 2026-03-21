namespace AutoServiceHub.Api.Domain.Entities;

public sealed class Part
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public InventoryItem? InventoryItem { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public ICollection<PartsRequest> PartsRequests { get; set; } = new List<PartsRequest>();
}