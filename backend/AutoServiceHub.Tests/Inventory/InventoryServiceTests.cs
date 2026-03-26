using AutoServiceHub.Api.Application.Inventory;
using AutoServiceHub.Api.Application.Inventory.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Tests.Helpers;
using Xunit;

namespace AutoServiceHub.Tests.Inventory;

public sealed class InventoryServiceTests
{
    [Fact]
    public async Task AddInventoryAsync_Should_CreateInventoryItem_When_NotExists()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Parts.Add(new Part
        {
            Id = 1,
            Name = "Oil Filter",
            Price = 25
        });

        await dbContext.SaveChangesAsync();

        var service = new InventoryService(dbContext);

        var result = await service.AddInventoryAsync(new AddInventoryRequest
        {
            PartId = 1,
            Quantity = 5
        });

        Assert.Equal(1, result.PartId);
        Assert.Equal(5, result.Quantity);

        var inventoryItem = dbContext.InventoryItems.Single();
        Assert.Equal(5, inventoryItem.Quantity);
    }

    [Fact]
    public async Task AddInventoryAsync_Should_IncreaseQuantity_When_ItemAlreadyExists()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Parts.Add(new Part
        {
            Id = 1,
            Name = "Brake Pads",
            Price = 80
        });

        dbContext.InventoryItems.Add(new InventoryItem
        {
            PartId = 1,
            Quantity = 2
        });

        await dbContext.SaveChangesAsync();

        var service = new InventoryService(dbContext);

        var result = await service.AddInventoryAsync(new AddInventoryRequest
        {
            PartId = 1,
            Quantity = 3
        });

        Assert.Equal(5, result.Quantity);

        var inventoryItem = dbContext.InventoryItems.Single();
        Assert.Equal(5, inventoryItem.Quantity);
    }

    [Fact]
    public async Task AddInventoryAsync_Should_Throw_When_QuantityIsInvalid()
    {
        using var dbContext = TestDbContextFactory.Create();

        dbContext.Parts.Add(new Part
        {
            Id = 1,
            Name = "Air Filter",
            Price = 20
        });

        await dbContext.SaveChangesAsync();

        var service = new InventoryService(dbContext);

        var action = async () => await service.AddInventoryAsync(new AddInventoryRequest
        {
            PartId = 1,
            Quantity = 0
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Quantity must be greater than zero.", exception.Message);
    }

    [Fact]
    public async Task AddInventoryAsync_Should_Throw_When_PartNotFound()
    {
        using var dbContext = TestDbContextFactory.Create();
        var service = new InventoryService(dbContext);

        var action = async () => await service.AddInventoryAsync(new AddInventoryRequest
        {
            PartId = 999,
            Quantity = 5
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal("Part not found.", exception.Message);
    }
}