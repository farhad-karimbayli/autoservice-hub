namespace AutoServiceHub.Api.Application.Admin.Models;

public sealed class UpdateWorkingHourRequest
{
    public int DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }
}