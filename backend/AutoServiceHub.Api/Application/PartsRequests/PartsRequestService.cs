using AutoServiceHub.Api.Application.PartsRequests.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Domain.Enums;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Application.PartsRequests;

public sealed class PartsRequestService
{
    private readonly AppDbContext _dbContext;

    public PartsRequestService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PartsRequestResponse> CreateAsync(
        string masterId,
        CreatePartsRequestRequest request)
    {
        if (request.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var part = await _dbContext.Parts
            .FirstOrDefaultAsync(x => x.Id == request.PartId);

        if (part is null)
            throw new InvalidOperationException("Part not found.");

        var entity = new PartsRequest
        {
            MasterId = masterId,
            PartId = request.PartId,
            Quantity = request.Quantity,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow,
            Status = PartsRequestStatus.Created
        };

        _dbContext.PartsRequests.Add(entity);
        await _dbContext.SaveChangesAsync();

        return new PartsRequestResponse
        {
            Id = entity.Id,
            MasterId = entity.MasterId,
            PartId = entity.PartId,
            PartName = part.Name,
            Quantity = entity.Quantity,
            Comment = entity.Comment,
            CreatedAt = entity.CreatedAt,
            Status = entity.Status.ToString()
        };
    }

    public async Task<List<PartsRequestResponse>> GetMyAsync(string masterId)
    {
        return await _dbContext.PartsRequests
            .Include(x => x.Part)
            .Where(x => x.MasterId == masterId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PartsRequestResponse
            {
                Id = x.Id,
                MasterId = x.MasterId,
                PartId = x.PartId,
                PartName = x.Part.Name,
                Quantity = x.Quantity,
                Comment = x.Comment,
                CreatedAt = x.CreatedAt,
                Status = x.Status.ToString()
            })
            .ToListAsync();
    }

    public async Task<List<PartsRequestResponse>> GetAllAsync()
    {
        return await _dbContext.PartsRequests
            .Include(x => x.Part)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PartsRequestResponse
            {
                Id = x.Id,
                MasterId = x.MasterId,
                PartId = x.PartId,
                PartName = x.Part.Name,
                Quantity = x.Quantity,
                Comment = x.Comment,
                CreatedAt = x.CreatedAt,
                Status = x.Status.ToString()
            })
            .ToListAsync();
    }

    public async Task<PartsRequestResponse> UpdateStatusAsync(int id, string status)
    {
        var entity = await _dbContext.PartsRequests
            .Include(x => x.Part)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new InvalidOperationException("Parts request not found.");

        if (!Enum.TryParse<PartsRequestStatus>(status, true, out var parsedStatus))
            throw new InvalidOperationException("Invalid parts request status.");

        entity.Status = parsedStatus;
        await _dbContext.SaveChangesAsync();

        return new PartsRequestResponse
        {
            Id = entity.Id,
            MasterId = entity.MasterId,
            PartId = entity.PartId,
            PartName = entity.Part.Name,
            Quantity = entity.Quantity,
            Comment = entity.Comment,
            CreatedAt = entity.CreatedAt,
            Status = entity.Status.ToString()
        };
    }
}