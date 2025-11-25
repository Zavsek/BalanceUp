using Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
namespace Backend.Endpoints
{
    public static class UserEventsEndpoints
    {
        public static void MapUserEventsEndpoints(this WebApplication app)
        {
            //Get events for user
            app.MapGet("/api/userevents/{userId}", async([FromBody] Guid userId, [FromServices] UserEventsController controller) => { return await controller.GetUserEvents(userId); });
            //Add user to event
            app.MapPost("/api/userevents", async([FromBody] UserEventDto dto, [FromServices] UserEventsController controller) => { return await controller.AddUserToEvent(dto); });
            //Delete user from event
            app.MapDelete("/api/userevents/{eventId}/{userId}", async ([FromBody] Guid eventId, Guid userId, [FromServices] UserEventsController controller) => { return await controller.RemoveUserFromEvent(eventId, userId); });
            //Delete event for all users
            app.MapDelete("/api/userevents/{eventId}", async ([FromBody] Guid eventId, [FromServices] UserEventsController controller) => { return await controller.RemoveEventFromAllUsers(eventId); });
        }
    }
}
