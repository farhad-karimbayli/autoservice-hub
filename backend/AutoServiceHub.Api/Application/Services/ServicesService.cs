using AutoServiceHub.Api.Application.Services.Models;
using AutoServiceHub.Api.Domain.Entities;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Application.Services;

public sealed class ServicesService
{
    private readonly AppDbContext _dbContext;

    public ServicesService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ServiceResponse>> GetAllAsync()
    {
        return await _dbContext.Services
            .OrderBy(x => x.Name)
            .Select(x => new ServiceResponse
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                DurationMinutes = x.DurationMinutes
            })
            .ToListAsync();
    }

    public async Task<ServiceResponse> CreateAsync(CreateServiceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new InvalidOperationException("Service name is required.");

        if (request.Price < 0)
            throw new InvalidOperationException("Price cannot be negative.");

        if (request.DurationMinutes <= 0)
            throw new InvalidOperationException("Duration must be greater than zero.");

        var entity = new Service
        {
            Name = request.Name.Trim(),
            Price = request.Price,
            DurationMinutes = request.DurationMinutes
        };

        _dbContext.Services.Add(entity);
        await _dbContext.SaveChangesAsync();

        return new ServiceResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Price = entity.Price,
            DurationMinutes = entity.DurationMinutes
        };
    }

    public async Task<ServiceResponse> UpdateAsync(int id, UpdateServiceRequest request)
    {
        var entity = await _dbContext.Services.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new InvalidOperationException("Service not found.");

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new InvalidOperationException("Service name is required.");

        if (request.Price < 0)
            throw new InvalidOperationException("Price cannot be negative.");

        if (request.DurationMinutes <= 0)
            throw new InvalidOperationException("Duration must be greater than zero.");

        entity.Name = request.Name.Trim();
        entity.Price = request.Price;
        entity.DurationMinutes = request.DurationMinutes;

        await _dbContext.SaveChangesAsync();

        return new ServiceResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Price = entity.Price,
            DurationMinutes = entity.DurationMinutes
        };
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _dbContext.Services.FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new InvalidOperationException("Service not found.");

        _dbContext.Services.Remove(entity);
        await _dbContext.SaveChangesAsync();
    }
}