using AutoServiceHub.Api.Application.Services;
using AutoServiceHub.Api.Application.Services.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/services")]
public sealed class ServicesController : ControllerBase
{
    private readonly ServicesService _servicesService;

    public ServicesController(ServicesService servicesService)
    {
        _servicesService = servicesService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _servicesService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateServiceRequest request)
    {
        try
        {
            var result = await _servicesService.CreateAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}