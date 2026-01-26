namespace Backend.Models.Dto
{
    public record CalendarDto(decimal totalMonthly, Dictionary<string, decimal> dailyTotals);
}
