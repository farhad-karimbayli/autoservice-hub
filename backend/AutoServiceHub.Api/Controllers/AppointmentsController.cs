using System.Security.Claims;
using AutoServiceHub.Api.Application.Appointments;
using AutoServiceHub.Api.Application.Appointments.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoServiceHub.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public sealed class AppointmentsController : ControllerBase
{
    private readonly AppointmentService _appointmentService;

    public AppointmentsController(AppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [Authorize(Roles = "Client")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateAppointmentRequest request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(clientId))
            return Unauthorized();

        try
        {
            var result = await _appointmentService.CreateAsync(clientId, request);
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

        var result = await _appointmentService.GetClientAppointmentsAsync(clientId);
        return Ok(result);
    }

    [Authorize(Roles = "Master")]
    [HttpGet("master")]
    public async Task<IActionResult> Master()
    {
        var masterId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(masterId))
            return Unauthorized();

        var result = await _appointmentService.GetMasterAppointmentsAsync(masterId);
        return Ok(result);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _appointmentService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Director,Admin")]
    [HttpPost("{id:int}/assign-master")]
    public async Task<IActionResult> AssignMaster(int id, AssignMasterRequest request)
    {
        try
        {
            var result = await _appointmentService.AssignMasterAsync(id, request.MasterId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Director,Admin,Master")]
    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusRequest request)
    {
        try
        {
            var result = await _appointmentService.UpdateStatusAsync(id, request.Status);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Client")]
    [HttpGet("available-masters")]
    public async Task<IActionResult> GetAvailableMasters([FromQuery] int serviceId, [FromQuery] DateTime date)
    {
        var result = await _appointmentService.GetAvailableMastersAsync(serviceId, date);
        return Ok(result);
    }

    [Authorize(Roles = "Client")]
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(clientId))
            return Unauthorized();

        try
        {
            var result = await _appointmentService.CancelAsync(id, clientId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Client")]
    [HttpPost("{id:int}/reschedule")]
    public async Task<IActionResult> Reschedule(int id, RescheduleAppointmentRequest request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(clientId))
            return Unauthorized();

        try
        {
            var result = await _appointmentService.RescheduleAsync(id, clientId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}