using System.Security.Claims;
using AutoServiceHub.Api.Application.Orders;
using AutoServiceHub.Api.Application.Orders.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [Authorize(Roles = "Client")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(clientId))
            return Unauthorized();

        try
        {
            var result = await _orderService.CreateAsync(clientId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Client")]
    [HttpGet("my")]
    public async Task<IActionResult> My()
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(clientId))
            return Unauthorized();

        var result = await _orderService.GetMyOrdersAsync(clientId);
        return Ok(result);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _orderService.GetAllAsync();
        return Ok(result);
    }
}