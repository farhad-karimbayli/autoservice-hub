using AutoServiceHub.Api.Application.Orders.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Domain.Enums;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Application.Orders;

public sealed class OrderService
{
    private readonly AppDbContext _dbContext;

    public OrderService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OrderResponse> CreateAsync(string clientId, CreateOrderRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
            throw new InvalidOperationException("Order must contain at least one item.");

        var normalizedItems = request.Items
            .GroupBy(x => x.PartId)
            .Select(g => new
            {
                PartId = g.Key,
                Quantity = g.Sum(x => x.Quantity)
            })
            .ToList();

        foreach (var item in normalizedItems)
        {
            if (item.Quantity <= 0)
                throw new InvalidOperationException("Item quantity must be greater than zero.");
        }

        var partIds = normalizedItems.Select(x => x.PartId).ToList();

        var parts = await _dbContext.Parts
            .Include(x => x.InventoryItem)
            .Where(x => partIds.Contains(x.Id))
            .ToListAsync();

        if (parts.Count != partIds.Count)
            throw new InvalidOperationException("One or more parts were not found.");

        foreach (var item in normalizedItems)
        {
            var part = parts.First(x => x.Id == item.PartId);

            if (part.InventoryItem is null)
                throw new InvalidOperationException($"Part '{part.Name}' is not available in inventory.");

            if (part.InventoryItem.Quantity < item.Quantity)
                throw new InvalidOperationException($"Not enough stock for part '{part.Name}'.");
        }

        var order = new Order
        {
            ClientId = clientId,
            CreatedAt = DateTime.UtcNow,
            Status = OrderStatus.Created
        };

        foreach (var item in normalizedItems)
        {
            var part = parts.First(x => x.Id == item.PartId);

            part.InventoryItem!.Quantity -= item.Quantity;

            order.Items.Add(new OrderItem
            {
                PartId = part.Id,
                Quantity = item.Quantity,
                UnitPrice = part.Price
            });
        }

        order.TotalAmount = order.Items.Sum(x => x.UnitPrice * x.Quantity);

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync();

        var createdOrder = await _dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Part)
            .FirstAsync(x => x.Id == order.Id);

        return new OrderResponse
        {
            Id = createdOrder.Id,
            CreatedAt = createdOrder.CreatedAt,
            Status = createdOrder.Status.ToString(),
            TotalAmount = createdOrder.TotalAmount,
            Items = createdOrder.Items.Select(x => new OrderItemResponse
            {
                PartId = x.PartId,
                PartName = x.Part.Name,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                LineTotal = x.UnitPrice * x.Quantity
            }).ToList()
        };
    }

    public async Task<List<OrderResponse>> GetMyOrdersAsync(string clientId)
    {
        return await _dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Part)
            .Where(x => x.ClientId == clientId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrderResponse
            {
                Id = x.Id,
                CreatedAt = x.CreatedAt,
                Status = x.Status.ToString(),
                TotalAmount = x.TotalAmount,
                Items = x.Items.Select(i => new OrderItemResponse
                {
                    PartId = i.PartId,
                    PartName = i.Part.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.UnitPrice * i.Quantity
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<List<OrderResponse>> GetAllAsync()
    {
        return await _dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Part)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrderResponse
            {
                Id = x.Id,
                CreatedAt = x.CreatedAt,
                Status = x.Status.ToString(),
                TotalAmount = x.TotalAmount,
                Items = x.Items.Select(i => new OrderItemResponse
                {
                    PartId = i.PartId,
                    PartName = i.Part.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.UnitPrice * i.Quantity
                }).ToList()
            })
            .ToListAsync();
    }
}