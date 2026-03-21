namespace AutoServiceHub.Api.Application.PartsRequests.Models;

public sealed class PartsRequestResponse
{
    public int Id { get; set; }

    public string MasterId { get; set; } = string.Empty;

    public int PartId { get; set; }

    public string PartName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = string.Empty;
}