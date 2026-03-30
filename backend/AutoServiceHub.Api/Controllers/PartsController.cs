using AutoServiceHub.Api.Application.Inventory;
using AutoServiceHub.Api.Application.Inventory.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/parts")]
public sealed class PartsController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public PartsController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [Authorize(Roles = "Director,Master,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var parts = await _inventoryService.GetPartsAsync();
        return Ok(parts);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreatePartRequest request)
    {
        var created = await _inventoryService.CreatePartAsync(request);
        return Ok(created);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdatePartRequest request)
    {
        try
        {
            var result = await _inventoryService.UpdatePartAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _inventoryService.DeletePartAsync(id);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}