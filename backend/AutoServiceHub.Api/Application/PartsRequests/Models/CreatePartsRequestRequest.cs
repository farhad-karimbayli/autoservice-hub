namespace AutoServiceHub.Api.Application.PartsRequests.Models;

public sealed class CreatePartsRequestRequest
{
    public int PartId { get; set; }

    public int Quantity { get; set; }

    public string? Comment { get; set; }
}