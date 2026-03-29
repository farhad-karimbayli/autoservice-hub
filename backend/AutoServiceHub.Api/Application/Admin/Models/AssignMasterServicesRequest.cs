namespace AutoServiceHub.Api.Application.Admin.Models;

public sealed class AssignMasterServicesRequest
{
    public List<int> ServiceIds { get; set; } = [];
}