using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    public static class UserEventsController
    {
        public static async Task<IResult> GetUserEvents(Guid userId, AppDbContext context)
        {
            try
            {
                var events = await context.UserEvents
                .Where(x => x.UserId == userId)
                .Select(x => new EventDto
                (x.Event.Id, x.Event.Title, x.Event.Description, x.Event.CreatedAt))
                .ToListAsync();

                return TypedResults.Ok(events);
            }
            catch(Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }
        public static async Task<IResult> AddUserToEvent(UserEventDto dto, AppDbContext context)
        {
            try
            {
                var exists = await context.UserEvents
                    .AnyAsync(x => x.UserId == dto.UserId && x.EventId == dto.EventId);

                if (exists)
                    return TypedResults.BadRequest("Uporabnik je že prijavljen na dogodek.");

                var ue = new UserEvents
                {
                    UserId = dto.UserId,
                    EventId = dto.EventId
                };

                context.UserEvents.Add(ue);
                await context.SaveChangesAsync();

                return TypedResults.Ok("Dodano.");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }

        public static async Task<IResult> RemoveUserFromEvent(UserEventDto dto, AppDbContext context)
        {
            try
            {
                var ue = await context.UserEvents
                    .FirstOrDefaultAsync(x => x.UserId == dto.UserId && x.EventId == dto.EventId);

                if (ue == null)
                    return Results.NotFound("Connection doesn't exist.");

                context.UserEvents.Remove(ue);
                await context.SaveChangesAsync();

                return Results.Ok("Removed.");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }
        public static async Task<IResult> RemoveEventFromAllUsers(Guid eventId, AppDbContext context)
        {
            try
            {
                var userEvents = await context.UserEvents
                .Where(ue => ue.EventId == eventId)
                .ToListAsync();
                context.UserEvents.RemoveRange(userEvents);
                var ev = await context.Events.FindAsync(eventId);
                if (ev != null) context.Events.Remove(ev);

                await context.SaveChangesAsync();
                return Results.Ok("Event removed from all users.");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }
        public static async Task<(bool ok, string? error)> AddUserToEventInternal(Guid userId, Guid eventId, AppDbContext context)
        {
            var exists = await context.UserEvents
                .AnyAsync(x => x.UserId == userId && x.EventId == eventId);

            if (exists)
                return (false, "Uporabnik je že prijavljen na dogodek.");

            var ue = new UserEvents
            {
                UserId = userId,
                EventId = eventId
            };

            context.UserEvents.Add(ue);
            await context.SaveChangesAsync();

            return (true, null);
        }

    }
}
