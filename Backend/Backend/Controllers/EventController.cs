using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    public  class EventController
    {
        private readonly AppDbContext _context;
        public EventController(AppDbContext context)
        {
            _context = context;
        }
        public  async Task<IResult> UpdateEvent(Guid id, EventDto Event)
        {
            try
            {
                if (id != Event.Id) return TypedResults.BadRequest("Id does not match");
                var existingEvent = await _context.Events.FindAsync(id);
                if (existingEvent == null)
                    return TypedResults.NotFound("Event not found");
                existingEvent.Title = Event.Title;
                existingEvent.Description = Event.Description;
                _context.Events.Update(existingEvent);
                await _context.SaveChangesAsync();
                return TypedResults.Ok(existingEvent);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Event Controller " + ex.Message);
            }
        }
        public  async Task<IResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Title))
                    return Results.BadRequest("Naslov je obvezen.");

                var ev = new Event
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Events.Add(ev);
                await _context.SaveChangesAsync();

                foreach (var userId in dto.Users)
                {
                    var result = await UserEventsController.AddUserToEventInternal(userId, ev.Id, _context);

                    if (!result.ok)
                        return Results.BadRequest($"Error in adding user {userId}: {result.error}");
                }

                return Results.Ok(new
                {
                    eventId = ev.Id,
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
                    .Where(e => e.EventId == eventId)
                    .Include(e => e.UserExpenseShares) 
                    .ToListAsync();

                var result = expenses.Select(e => new
                {
                    e.Id,
                    e.EventId,
                    e.Amount,
                    e.Type,
                    e.Description,
                    e.DateTime,
                    Shares = e.UserExpenseShares.Select(s => new { s.UserId, s.ShareAmount })
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
                    .Include(e => e.UserExpenseShares)
                    .FirstOrDefaultAsync(e => e.Id == expenseId && e.EventId == eventId);

                if (expense == null)
                    return Results.NotFound("Expense ne obstaja za ta event.");

                if (expense.UserExpenseShares.Any())
                {
                    _context.UserExpenseShares.RemoveRange(expense.UserExpenseShares);
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
