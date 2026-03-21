using System.Security.Claims;
using AutoServiceHub.Api.Application.PartsRequests;
using AutoServiceHub.Api.Application.PartsRequests.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/parts-requests")]
public sealed class PartsRequestsController : ControllerBase
{
    private readonly PartsRequestService _partsRequestService;

    public PartsRequestsController(PartsRequestService partsRequestService)
    {
        _partsRequestService = partsRequestService;
    }

    [Authorize(Roles = "Master")]
    [HttpPost]
    public async Task<IActionResult> Create(CreatePartsRequestRequest request)
    {
        var masterId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(masterId))
            return Unauthorized();

        try
        {
            var result = await _partsRequestService.CreateAsync(masterId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Master")]
    [HttpGet("my")]
    public async Task<IActionResult> My()
    {
        var masterId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(masterId))
            return Unauthorized();

        var result = await _partsRequestService.GetMyAsync(masterId);
        return Ok(result);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _partsRequestService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdatePartsRequestStatusRequest request)
    {
        try
        {
            var result = await _partsRequestService.UpdateStatusAsync(id, request.Status);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}