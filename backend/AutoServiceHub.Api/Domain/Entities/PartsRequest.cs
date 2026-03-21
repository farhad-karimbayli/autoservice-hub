using AutoServiceHub.Api.Domain.Enums;

namespace AutoServiceHub.Api.Domain.Entities;

public sealed class PartsRequest
{
    public int Id { get; set; }

    public string MasterId { get; set; } = string.Empty;

    public int PartId { get; set; }

    public Part Part { get; set; } = null!;

    public int Quantity { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public PartsRequestStatus Status { get; set; } = PartsRequestStatus.Created;
}