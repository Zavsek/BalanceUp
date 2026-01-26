using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace Backend.Handlers
{
    public  class EventHandler
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserEventsHandler _userEventsHandler;
        public EventHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor, UserEventsHandler userEventsHandler)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _userEventsHandler = userEventsHandler;
        }
        public  async Task<IResult> UpdateEvent(Guid id, EventDto Event)
        {
            try
            {
                if (id != Event.id) return TypedResults.BadRequest("Id does not match");
                var existingEvent = await _context.Events.FindAsync(id);
                if (existingEvent == null)
                    return TypedResults.NotFound("Event not found");
                existingEvent.title = Event.title;
                existingEvent.description = Event.description;
                _context.Events.Update(existingEvent);
                await _context.SaveChangesAsync();
                return TypedResults.Ok(existingEvent);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Event Controller " + ex.Message);
            }
        }
        public async Task<IResult> CreateEvent(CreateEventDto dto)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;

                if (userId == null)
                    return TypedResults.Unauthorized();

                if (string.IsNullOrWhiteSpace(dto.title))
                    return Results.BadRequest("A title is required.");


                Event newEvent = null;

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    newEvent = new Event
                    {
                        id = Guid.NewGuid(), 
                        title = dto.title,
                        description = dto.description,
                        createdAt = DateTime.UtcNow
                    };

                    _context.Events.Add(newEvent);
                    await _context.SaveChangesAsync();


                    var creatorResult = await _userEventsHandler.AddUserToEventInternal(userId.Value, newEvent.id, _context);
                    if (!creatorResult.ok)
                    {
                        await transaction.RollbackAsync();
                        return Results.BadRequest($"Error adding creator: {creatorResult.error}");
                    }


                    if (dto.users != null)
                    {
                        foreach (var inviteeId in dto.users)
                        {
                            var inviteeResult = await _userEventsHandler.AddUserToEventInternal(inviteeId, newEvent.id, _context);
                            if (!inviteeResult.ok)
                            {
                                await transaction.RollbackAsync();
                                return Results.BadRequest($"Error in adding user {inviteeId}: {inviteeResult.error}");
                            }
                        }
                    }

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return TypedResults.InternalServerError("Database transaction failed: " + ex.Message);
                }

                return Results.Ok(new EventDto
                (
                    newEvent.id,
                    newEvent.title,
                    newEvent.description,
                    newEvent.createdAt
                ));
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("General error in creating event: " + ex.Message);
            }
        }
        public  async Task<IResult> GetEventInfo(Guid eventId )
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null) return TypedResults.Unauthorized();

                
                var ev = await _context.Events
                    .Include(e => e.userEvents)
                        .ThenInclude(ue => ue.user)
                    .FirstOrDefaultAsync(e => e.id == eventId);

                if (ev == null) return TypedResults.NotFound("Dogodek ne obstaja.");


                if (!ev.userEvents.Any(ue => ue.userId == userId))
                    return TypedResults.Forbid(); 


                var result = new EventDetailsDto(
                    ev.id,
                    ev.title,
                    ev.description,
                    ev.createdAt,
                    ev.userEvents.Select(ue => new EventUserDto(
                        ue.userId,
                        ue.user.username ?? "Unknown"
                    )).ToList()
                );

                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri pridobivanju podatkov o dogodku: " + ex.Message);
            }
        }
        public  async Task<IResult> DeleteExpenseFromEvent(Guid eventId, Guid expenseId)
        {
            try
            {
                var expense = await _context.Expenses
                    .Include(e => e.userExpenseShares)
                    .FirstOrDefaultAsync(e => e.id == expenseId && e.eventId == eventId);

                if (expense == null)
                    return Results.NotFound("Expense ne obstaja za ta event.");

                if (expense.userExpenseShares.Any())
                {
                    _context.UserExpenseShares.RemoveRange(expense.userExpenseShares);
                }

                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();

                return Results.Ok("Expense odstranjen.");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri brisanju expense-a: " + ex.Message);
            }
        }



    }
}
