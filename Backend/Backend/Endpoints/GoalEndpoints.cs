using Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
namespace Backend.Endpoints
{
    public static class GoalEndpoints
    {
        public static void MapGoalEndpoints(this WebApplication app)
        {
            //GET spending goal for user
            app.MapGet("/api/goals/{userId}", async ([FromBody] Guid userId, [FromServices] SpendingGoalsController controller ) => { return await controller.GetGoal(userId); });
            //PUT update goal
            app.MapPut("/api/goals/{id}", async ([FromBody] Guid id, [FromServices] SpendingGoalsController controller) => { return await controller.GetGoal(id); });
        }
    }
}
