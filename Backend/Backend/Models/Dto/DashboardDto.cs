using System.Numerics;

namespace Backend.Models.Dto
{
    public record DashboardDto (decimal dailySpent, int? dailyLimit, decimal monthlySpent, int? monthlyLimit, List<RecentExpensesDto> recentExpenses);

    public record RecentExpensesDto(string description,  decimal amount, string type);
}
