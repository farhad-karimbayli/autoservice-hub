using AutoServiceHub.Api.Application.Inventory.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Application.Inventory;

public sealed class InventoryService
{
    private readonly AppDbContext _dbContext;

    public InventoryService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<PartResponse>> GetPartsAsync()
    {
        return await _dbContext.Parts
            .OrderBy(x => x.Name)
            .Select(x => new PartResponse
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price
            })
            .ToListAsync();
    }

    public async Task<PartResponse> CreatePartAsync(CreatePartRequest request)
    {
        var part = new Part
        {
            Name = request.Name.Trim(),
            Price = request.Price
        };

        _dbContext.Parts.Add(part);
        await _dbContext.SaveChangesAsync();

        return new PartResponse
        {
            Id = part.Id,
            Name = part.Name,
            Price = part.Price
        };
    }

    public async Task<List<InventoryItemResponse>> GetInventoryAsync()
    {
        return await _dbContext.InventoryItems
            .Include(x => x.Part)
            .OrderBy(x => x.Part.Name)
            .Select(x => new InventoryItemResponse
            {
                PartId = x.PartId,
                PartName = x.Part.Name,
                PartPrice = x.Part.Price,
                Quantity = x.Quantity
            })
            .ToListAsync();
    }

    public async Task<InventoryItemResponse> AddInventoryAsync(AddInventoryRequest request)
    {
        if (request.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var part = await _dbContext.Parts
            .FirstOrDefaultAsync(x => x.Id == request.PartId);

        if (part is null)
            throw new InvalidOperationException("Part not found.");

        var inventoryItem = await _dbContext.InventoryItems
            .Include(x => x.Part)
            .FirstOrDefaultAsync(x => x.PartId == request.PartId);

        if (inventoryItem is null)
        {
            inventoryItem = new InventoryItem
            {
                PartId = request.PartId,
                Quantity = request.Quantity
            };

            _dbContext.InventoryItems.Add(inventoryItem);
        }
        else
        {
            inventoryItem.Quantity += request.Quantity;
        }

        await _dbContext.SaveChangesAsync();

        inventoryItem = await _dbContext.InventoryItems
            .Include(x => x.Part)
            .FirstAsync(x => x.PartId == request.PartId);

        return new InventoryItemResponse
        {
            PartId = inventoryItem.PartId,
            PartName = inventoryItem.Part.Name,
            PartPrice = inventoryItem.Part.Price,
            Quantity = inventoryItem.Quantity
        };
    }
}