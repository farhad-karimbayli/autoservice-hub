using Microsoft.EntityFrameworkCore;

namespace AutoServiceHub.Api.Infrastructure;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}