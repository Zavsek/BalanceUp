namespace Backend.Models.Utility
{
    public record CurrentTimeFrame(DateTime today, DateTime sevenDaysAgo, DateTime tomorrow, DateTime firstOfMovingMonth);
}
