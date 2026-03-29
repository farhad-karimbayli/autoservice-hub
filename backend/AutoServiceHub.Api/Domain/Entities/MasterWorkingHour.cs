namespace AutoServiceHub.Api.Domain.Entities;

public sealed class MasterWorkingHour
{
    public int Id { get; set; }

    public string MasterId { get; set; } = string.Empty;

    public int DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }
}