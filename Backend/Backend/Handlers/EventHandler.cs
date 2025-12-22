using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Handlers
{
    public  class EventHandler
    {
        private readonly AppDbContext _context;
        public EventHandler(AppDbContext context)
        {
            _context = context;
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
        public  async Task<IResult> CreateEvent(CreateEventDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.title))
                    return Results.BadRequest("Naslov je obvezen.");

                var ev = new Event
                {
                    title = dto.title,
                    description = dto.description,
                    createdAt = DateTime.UtcNow
                };

                _context.Events.Add(ev);
                await _context.SaveChangesAsync();

                foreach (var userId in dto.users)
                {
                    var result = await UserEventsHandler.AddUserToEventInternal(userId, ev.id, _context);

                    if (!result.ok)
                        return Results.BadRequest($"Error in adding user {userId}: {result.error}");
                }

                return Results.Ok(new
                {
                    eventId = ev.id,
                    message = "Event created."
                });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in creating event: " + ex.Message);
            }
        }
        public  async Task<IResult> GetExpensesForEvent(Guid eventId )
        {
            try
            {
                var expenses = await _context.Expenses
                    .Where(e => e.eventId == eventId)
                    .Include(e => e.userExpenseShares) 
                    .ToListAsync();

                var result = expenses.Select(e => new
                {
                    e.id,
                    e.eventId,
                    e.amount,
                    e.type,
                    e.description,
                    e.dateTime,
                    Shares = e.userExpenseShares.Select(s => new { s.userId, s.shareAmount })
                });

                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri pridobivanju expense-ov: " + ex.Message);
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
