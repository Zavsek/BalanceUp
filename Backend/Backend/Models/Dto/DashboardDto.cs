using System.Numerics;

namespace Backend.Models.Dto
{
    public record DashboardDto (decimal dailySpent, int? dailyLimit, decimal montlySpent, int? montlyLimit, List<RecentExpensesDto> recentExpenses);

    public record RecentExpensesDto(string description,  decimal amount, string type);
}
