using AutoServiceHub.Api.Application.Orders;
using AutoServiceHub.Api.Application.Orders.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Tests.Helpers;
using Xunit;

namespace AutoServiceHub.Tests.Orders;

public sealed class OrderServiceTests
{
    [Fact]
    public async Task CreateAsync_Should_CreateOrder_And_DecreaseInventory()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Parts.Add(new Part
        {
            Id = 1,
            Name = "Engine Oil",
            Price = 30
        });

        dbContext.InventoryItems.Add(new InventoryItem
        {
            PartId = 1,
            Quantity = 10
        });

        await dbContext.SaveChangesAsync();

        var service = new OrderService(dbContext);

        var result = await service.CreateAsync("client-1", new CreateOrderRequest
        {
            Items =
            [
                new CreateOrderItemRequest
                {
                    PartId = 1,
                    Quantity = 3
                }
            ]
        });

        Assert.Equal("Created", result.Status);
        Assert.Equal(90, result.TotalAmount);
        Assert.Single(result.Items);
        Assert.Equal(3, result.Items[0].Quantity);

        var inventoryItem = dbContext.InventoryItems.Single();
        Assert.Equal(7, inventoryItem.Quantity);

        var order = dbContext.Orders.Single();
        Assert.Equal("client-1", order.ClientId);
    }

    [Fact]
    public async Task CreateAsync_Should_Throw_When_OrderIsEmpty()
    {
        using var dbContext = TestDbContextFactory.Create();
        var service = new OrderService(dbContext);

        var action = async () => await service.CreateAsync("client-1", new CreateOrderRequest
        {
            Items = []
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Order must contain at least one item.", exception.Message);
    }

    [Fact]
    public async Task CreateAsync_Should_Throw_When_StockIsInsufficient()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Parts.Add(new Part
        {
            Id = 1,
            Name = "Spark Plug",
            Price = 15
        });

        dbContext.InventoryItems.Add(new InventoryItem
        {
            PartId = 1,
            Quantity = 1
        });

        await dbContext.SaveChangesAsync();

        var service = new OrderService(dbContext);

        var action = async () => await service.CreateAsync("client-1", new CreateOrderRequest
        {
            Items =
            [
                new CreateOrderItemRequest
                {
                    PartId = 1,
                    Quantity = 2
                }
            ]
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Not enough stock for part 'Spark Plug'.", exception.Message);
    }

    [Fact]
    public async Task CreateAsync_Should_Throw_When_PartDoesNotExist()
    {
        using var dbContext = TestDbContextFactory.Create();
        var service = new OrderService(dbContext);

        var action = async () => await service.CreateAsync("client-1", new CreateOrderRequest
        {
            Items =
            [
                new CreateOrderItemRequest
                {
                    PartId = 100,
                    Quantity = 1
                }
            ]
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("One or more parts were not found.", exception.Message);
    }
}