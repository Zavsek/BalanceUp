using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
using Backend.Handlers;
using Backend.Models;
namespace Backend.Endpoints
{
    public static class GoalEndpoints
    {

        public static void MapGoalEndpoints(this WebApplication app)
        {
            var GoalsGroup = app.MapGroup("/api/goals")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");
            //GET spending goal for user
            GoalsGroup.MapGet("/{userId}", async (Guid userId,  SpendingGoalsHandler handler) => { return await handler.GetGoal(userId);});
            //PUT update goal
            GoalsGroup.MapPut("/", async (SpendingGoalDto goal,  SpendingGoalsHandler handler) => { return await handler.UpdateGoal(goal); });
        }
    }
}
