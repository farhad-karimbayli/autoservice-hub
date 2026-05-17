using System.Text;
using AutoServiceHub.Api.Application.Appointments;
using AutoServiceHub.Api.Application.Auth;
using AutoServiceHub.Api.Application.Inventory;
using AutoServiceHub.Api.Application.Orders;
using AutoServiceHub.Api.Application.PartsRequests;
using AutoServiceHub.Api.Application.Profile;
using AutoServiceHub.Api.Application.Services;
using AutoServiceHub.Api.Domain;
using AutoServiceHub.Api.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddScoped<AppointmentService>();
builder.Services.AddScoped<ServicesService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<PartsRequestService>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<InventoryService>();
builder.Services.AddScoped<ProfileService>();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AutoServiceHub API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Введите JWT токен в формате: Bearer {your token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()?
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .ToArray();

        if (allowedOrigins is not { Length: > 0 })
        {
            allowedOrigins = ["http://localhost:5173"];
        }

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services
    .AddIdentityCore<AppUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 6;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection(JwtOptions.SectionName));

var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? throw new InvalidOperationException("JWT settings are missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AutoServiceHub API v1");
        options.RoutePrefix = "swagger";
    });
}

// app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    await InitializeDatabaseAsync(scope.ServiceProvider, app.Configuration, app.Logger);
}

app.Run();

static async Task InitializeDatabaseAsync(
    IServiceProvider services,
    IConfiguration configuration,
    ILogger logger)
{
    var applyMigrations = configuration.GetValue("Database:ApplyMigrations", false);
    var retryCount = configuration.GetValue("Database:MigrationRetries", 10);
    var retryDelaySeconds = configuration.GetValue("Database:MigrationRetryDelaySeconds", 5);

    for (var attempt = 1; attempt <= retryCount; attempt++)
    {
        try
        {
            if (applyMigrations)
            {
                var dbContext = services.GetRequiredService<AppDbContext>();
                await dbContext.Database.MigrateAsync();
            }

            await IdentitySeeder.Seed(services);
            return;
        }
        catch (Exception ex) when (attempt < retryCount)
        {
            logger.LogWarning(
                ex,
                "Database initialization failed on attempt {Attempt}/{RetryCount}. Retrying in {DelaySeconds} seconds.",
                attempt,
                retryCount,
                retryDelaySeconds);

            await Task.Delay(TimeSpan.FromSeconds(retryDelaySeconds));
        }
    }
}
