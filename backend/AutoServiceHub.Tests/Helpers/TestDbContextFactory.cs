using AutoServiceHub.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Tests.Helpers;

public static class TestDbContextFactory
{
    public static AppDbContext Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}