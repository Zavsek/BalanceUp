using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Firebase.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    public  class ExpenseController
    {
        private readonly AppDbContext _context;

        public ExpenseController(AppDbContext context)
        {
            _context = context;
        }
        public  async Task<IResult> GetExpenses([FromQuery]Guid UserId)
        {
            try
            {
                var expenses = await _context.Expenses
                   .Where(e => e.UserId == UserId)
                   .ToListAsync();
                return Results.Ok(expenses);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }

        public  async Task<IResult> CreateExpense(ExpenseDto expense, Guid UserId)
        {
            try
            {
                var NewExpense = new Expense
                {
                    Amount = expense.Amount,
                    Type = expense.Type,
                    Description = expense.Description,
                    DateTime = expense.Time,
                    UserId = UserId
                };
                _context.Expenses.Add(NewExpense);
                await _context.SaveChangesAsync();
                return Results.Ok(expense);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }


        public  async Task<IResult> CreateExpenseForEvent(Guid eventId,
             EventExpenseDto payload)
            {
            try
            {

                if (payload == null) return Results.BadRequest("Payload is Empty.");
                if (payload.EventId != eventId) return Results.BadRequest("EventId does not match.");
                if (payload.Shares == null || !payload.Shares.Any())
                    return Results.BadRequest("There must be atleast 1 share.");

                var ev = await _context.Events
                .Include(e => e.UserEvents)
                    .FirstOrDefaultAsync(e => e.Id == eventId);

                if (ev == null) return Results.NotFound("Event ne obstaja.");

                var eventUserIds = ev.UserEvents.Select(ue => ue.UserId).ToHashSet();

                foreach (var s in payload.Shares)
                {
                    if (!eventUserIds.Contains(s.UserId))
                        return Results.BadRequest($"User {s.UserId} ni član dogodka.");
                    if (s.ShareAmount < 0)
                        return Results.BadRequest("ShareAmount ne sme biti negativen.");
                }

                decimal sumShares = payload.Shares.Sum(s => s.ShareAmount);
                if (Math.Round(sumShares, 2) != Math.Round(payload.Amount, 2))
                    return Results.BadRequest($"Vsota share-ov ({sumShares}) se ne ujema z Amount ({payload.Amount}).");

                var expense = new Expense
                {
                    EventId = payload.EventId,
                    Amount = payload.Amount,
                    Type = payload.Type,
                    Description = payload.Description,
                    DateTime = payload.Time
                };

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();

                var shares = payload.Shares.Select(s => new UserExpenseShare
                {
                    ExpenseId = expense.Id,
                    UserId = s.UserId,
                    ShareAmount = s.ShareAmount
                }).ToList();

                _context.UserExpenseShares.AddRange(shares);
                await _context.SaveChangesAsync();

                
                var result = new
                {
                    expense.Id,
                    expense.EventId,
                    expense.Amount,
                    expense.Type,
                    expense.Description,
                    expense.DateTime,
                    Shares = shares.Select(x => new { x.UserId, x.ShareAmount })
                };

                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri ustvarjanju expense: " + ex.Message);
            }
        }
        public  async Task<IResult> DeleteExpense(Guid id)
        {
            try
            {
                if (await _context.Expenses.FindAsync(id) is Expense expense)
                {
                    _context.Expenses.Remove(expense);
                    await   _context.SaveChangesAsync();
                    return Results.NoContent();
                }
                else return Results.NotFound();
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }
        public  async Task<IResult> UpdateExpense(Guid id, Expense expense)
        {
            try
            {
                if (id != expense.Id) return TypedResults.BadRequest("Id does not match");
                if (!await _context.Expenses.AnyAsync(e => e.Id == id)) return TypedResults.BadRequest("Expense not Found in Database");
                
                _context.Expenses.Update(expense);
                await _context.SaveChangesAsync();
                return Results.NoContent();

            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }

        public  async Task<IResult> UpdateShares(Guid eventId, Guid expenseId, UpdateSharesDto payload)
        {
            try
            {

                if (payload == null || payload.Shares == null || !payload.Shares.Any())
                    return Results.BadRequest("Poslati morate nove deleže.");


                var expense = await _context.Expenses
                    .Include(e => e.Event)
                    .FirstOrDefaultAsync(e => e.Id == expenseId && e.EventId == eventId);

                if (expense == null)
                    return Results.NotFound("Expense ne obstaja v tem eventu.");


                var eventUserIds = await _context.UserEvents
                    .Where(x => x.EventId == eventId)
                    .Select(x => x.UserId)
                    .ToListAsync();

                foreach (var s in payload.Shares)
                {
                    if (!eventUserIds.Contains(s.UserId))
                        return Results.BadRequest($"Uporabnik {s.UserId} ni del dogodka.");
                }

                var sum = payload.Shares.Sum(x => x.ShareAmount);
                if (Math.Round(sum, 2) != Math.Round(expense.Amount, 2))
                    return Results.BadRequest($"Vsota deležev {sum} se ne ujema z zneskom {expense.Amount}.");

                
                var oldShares = _context.UserExpenseShares.Where(x => x.ExpenseId == expenseId);
                _context.UserExpenseShares.RemoveRange(oldShares);
                await _context.SaveChangesAsync();

                
                var newShares = payload.Shares.Select(s => new UserExpenseShare
                {
                    ExpenseId = expenseId,
                    UserId = s.UserId,
                    ShareAmount = s.ShareAmount
                });

                _context.UserExpenseShares.AddRange(newShares);
                await _context.SaveChangesAsync();

                return Results.Ok("Deleži posodobljeni.");
            }
        
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri posodabljanju deležev: " + ex.Message);
            }
}
    }
}
