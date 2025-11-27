using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    public  class UserEventsController
    {
        private readonly AppDbContext _context;
        public UserEventsController(AppDbContext context)
        {
            _context = context;
        }
        public  async Task<IResult> GetUserEvents(Guid userId)
        {
            try
            {
                var events = await _context.UserEvents
                .Where(x => x.userId == userId)
                .Select(x => new EventDto
                (x.userEvent.id, x.userEvent.title, x.userEvent.description, x.userEvent.createdAt))
                .ToListAsync();

                return TypedResults.Ok(events);
            }
            catch(Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }
        public  async Task<IResult> AddUserToEvent(UserEventDto dto)
        {
            try
            {
                var exists = await _context.UserEvents
                    .AnyAsync(x => x.userId == dto.userId && x.eventId == dto.eventId);

                if (exists)
                    return TypedResults.BadRequest("Uporabnik je že prijavljen na dogodek.");

                var ue = new UserEvents
                {
                    userId = dto.userId,
                    eventId = dto.eventId
                };

                _context.UserEvents.Add(ue);
                await _context.SaveChangesAsync();

                return TypedResults.Ok("Dodano.");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }

        public  async Task<IResult> RemoveUserFromEvent(Guid eventId, Guid userId)
        {
            try
            {
                var ue = await _context.UserEvents
                    .FirstOrDefaultAsync(x => x.userId == userId && x.eventId == eventId);

                if (ue == null)
                    return Results.NotFound("Connection doesn't exist.");

                _context.UserEvents.Remove(ue);
                await _context.SaveChangesAsync();

                return Results.Ok("Removed.");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in UserEvents Controller " + ex.Message);
            }
        }
        public  async Task<IResult> RemoveEventFromAllUsers(Guid eventId)
        {
            try
            {
                var userEvents = await _context.UserEvents
                .Where(ue => ue.eventId == eventId)
                .ToListAsync();
                _context.UserEvents.RemoveRange(userEvents);
                var ev = await _context.Events.FindAsync(eventId);
                if (ev != null) _context.Events.Remove(ev);

                await _context.SaveChangesAsync();
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
                .AnyAsync(x => x.userId == userId && x.eventId == eventId);

            if (exists)
                return (false, "Uporabnik je že prijavljen na dogodek.");

            var ue = new UserEvents
            {
                userId = userId,
                eventId = eventId
            };

            context.UserEvents.Add(ue);
            await context.SaveChangesAsync();

            return (true, null);
        }

    }
}
