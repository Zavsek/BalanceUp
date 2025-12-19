using Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
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
            GoalsGroup.MapGet("/{userId}", async (Guid userId,  SpendingGoalsController controller) => { return await controller.GetGoal(userId);});
            //PUT update goal
            GoalsGroup.MapPut("/{id}", async (Guid id,  SpendingGoalsController controller) => { return await controller.GetGoal(id); });
        }
    }
}
