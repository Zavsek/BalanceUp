using Backend.Controllers;

namespace Backend.Endpoints
{
    public static class UserEventsEndpoints
    {
        public static void MapUserEventsEndpoints(this WebApplication app)
        {
            //Get events for user
            app.MapGet("/api/userevents/{userId}", UserEventsController.GetUserEvents);
            //Add user to event
            app.MapPost("/api/userevents", UserEventsController.AddUserToEvent);
            //Delete user from event
            app.MapDelete("/api/userevents/{id}", UserEventsController.RemoveUserFromEvent);
            //Delete event for all users
            app.MapDelete("/api/userevents/event/{eventId}", UserEventsController.RemoveEventFromAllUsers);
        }
    }
}
