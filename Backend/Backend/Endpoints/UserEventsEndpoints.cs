using Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
namespace Backend.Endpoints
{
    public static class UserEventsEndpoints
    {
        public static void MapUserEventsEndpoints(this WebApplication app)
        {
            var UserEventGroup = app.MapGroup("/api/user-events")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");

            //Get events for user   
            UserEventGroup.MapGet("/{userId}", async( Guid userId, [FromServices] UserEventsController controller) => { return await controller.GetUserEvents(userId); });
            //Add user to event
            UserEventGroup.MapPost("/add-user", async( UserEventDto dto, [FromServices] UserEventsController controller) => { return await controller.AddUserToEvent(dto); });
            //Delete user from event
            UserEventGroup.MapDelete("/{eventId}/{userId}", async ( Guid eventId, Guid userId, [FromServices] UserEventsController controller) => { return await controller.RemoveUserFromEvent(eventId, userId); });
            //Delete event for all users
            UserEventGroup.MapDelete("/{eventId}", async ( Guid eventId, [FromServices] UserEventsController controller) => { return await controller.RemoveEventFromAllUsers(eventId); });
        }
    }
}
