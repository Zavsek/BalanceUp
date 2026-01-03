using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
using Backend.Handlers;
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
            UserEventGroup.MapGet("/", async( UserEventsHandler handler) => { return await handler.GetUserEvents(); });
            //Add user to event
            UserEventGroup.MapPost("/add-user", async( UserEventDto dto, UserEventsHandler handler) => { return await handler.AddUserToEvent(dto); });
            //Delete user from event
            UserEventGroup.MapDelete("/{eventId}/{userId}", async ( Guid eventId, Guid userId,UserEventsHandler handler) => { return await handler.RemoveUserFromEvent(eventId, userId); });
            //Delete event for all users
            UserEventGroup.MapDelete("/{eventId}", async ( Guid eventId,UserEventsHandler handler) => { return await handler.RemoveEventFromAllUsers(eventId); });
        }
    }
}
