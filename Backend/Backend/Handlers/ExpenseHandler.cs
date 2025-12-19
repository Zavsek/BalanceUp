using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Firebase.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Handlers
{
    public  class ExpenseHandler
    {
        private readonly AppDbContext _context;

        public ExpenseHandler(AppDbContext context)
        {
            _context = context;
        }
        public  async Task<IResult> GetExpenses([FromQuery]Guid UserId)
        {
            try
            {
                var expenses = await _context.Expenses
                   .Where(e => e.userId == UserId)
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
                    amount = expense.amount,
                    type = expense.type,
                    description = expense.description,
                    dateTime = expense.time,
                    userId = UserId
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
                if (payload.eventId != eventId) return Results.BadRequest("EventId does not match.");
                if (payload.shares == null || !payload.shares.Any())
                    return Results.BadRequest("There must be atleast 1 share.");

                var ev = await _context.Events
                .Include(e => e.userEvents)
                    .FirstOrDefaultAsync(e => e.id == eventId);

                if (ev == null) return Results.NotFound("Event ne obstaja.");

                var eventUserIds = ev.userEvents.Select(ue => ue.userId).ToHashSet();

                foreach (var s in payload.shares)
                {
                    if (!eventUserIds.Contains(s.userId))
                        return Results.BadRequest($"User {s.userId} ni član dogodka.");
                    if (s.shareAmount < 0)
                        return Results.BadRequest("ShareAmount ne sme biti negativen.");
                }

                decimal sumShares = payload.shares.Sum(s => s.shareAmount);
                if (Math.Round(sumShares, 2) != Math.Round(payload.amount, 2))
                    return Results.BadRequest($"Vsota share-ov ({sumShares}) se ne ujema z Amount ({payload.amount}).");

                var expense = new Expense
                {
                    eventId = payload.eventId,
                    amount = payload.amount,
                    type = payload.type,
                    description = payload.description,
                    dateTime = payload.time
                };

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();

                var shares = payload.shares.Select(s => new UserExpenseShare
                {
                    expenseId = expense.id,
                    userId = s.userId,
                    shareAmount = s.shareAmount
                }).ToList();

                _context.UserExpenseShares.AddRange(shares);
                await _context.SaveChangesAsync();

                
                var result = new
                {
                    expense.id,
                    expense.eventId,
                    expense.amount,
                    expense.type,
                    expense.description,
                    expense.dateTime,
                    Shares = shares.Select(x => new { x.userId, x.shareAmount })
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
                if (id != expense.id) return TypedResults.BadRequest("Id does not match");
                if (!await _context.Expenses.AnyAsync(e => e.id == id)) return TypedResults.BadRequest("Expense not Found in Database");
                
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

                if (payload == null || payload.shares == null || !payload.shares.Any())
                    return Results.BadRequest("Poslati morate nove deleže.");


                var expense = await _context.Expenses
                    .Include(e => e.expenseEvent)
                    .FirstOrDefaultAsync(e => e.id == expenseId && e.eventId == eventId);

                if (expense == null)
                    return Results.NotFound("Expense ne obstaja v tem eventu.");


                var eventUserIds = await _context.UserEvents
                    .Where(x => x.eventId == eventId)
                    .Select(x => x.userId)
                    .ToListAsync();

                foreach (var s in payload.shares)
                {
                    if (!eventUserIds.Contains(s.userId))
                        return Results.BadRequest($"Uporabnik {s.userId} ni del dogodka.");
                }

                var sum = payload.shares.Sum(x => x.shareAmount);
                if (Math.Round(sum, 2) != Math.Round(expense.amount, 2))
                    return Results.BadRequest($"Vsota deležev {sum} se ne ujema z zneskom {expense.amount}.");

                
                var oldShares = _context.UserExpenseShares.Where(x => x.expenseId == expenseId);
                _context.UserExpenseShares.RemoveRange(oldShares);
                await _context.SaveChangesAsync();

                
                var newShares = payload.shares.Select(s => new UserExpenseShare
                {
                    expenseId = expenseId,
                    userId = s.userId,
                    shareAmount = s.shareAmount
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
