using AutoServiceHub.Api.Application.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/catalog")]
public sealed class CatalogController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public CatalogController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [Authorize(Roles = "Client")]
    [HttpGet("parts")]
    public async Task<IActionResult> GetParts()
    {
        var result = await _inventoryService.GetAvailableForClientAsync();
        return Ok(result);
    }
}