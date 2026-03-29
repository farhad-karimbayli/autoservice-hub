namespace AutoServiceHub.Api.Domain.Entities;

public sealed class MasterService
{
    public int Id { get; set; }

    public string MasterId { get; set; } = string.Empty;

    public int ServiceId { get; set; }

    public Service Service { get; set; } = null!;
}