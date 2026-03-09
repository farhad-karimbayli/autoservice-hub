using AutoServiceHub.Api.Application.Inventory;
using AutoServiceHub.Api.Application.Inventory.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/inventory")]
public sealed class InventoryController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public InventoryController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [Authorize(Roles = "Director,Master,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryService.GetInventoryAsync();
        return Ok(items);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpPost("add")]
    public async Task<IActionResult> Add(AddInventoryRequest request)
    {
        try
        {
            var result = await _inventoryService.AddInventoryAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}