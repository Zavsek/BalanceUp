using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Firebase.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    public static class ExpenseController
    {
        public static async Task<IResult> GetExpenses([FromQuery]Guid UserId, AppDbContext context)
        {
            try
            {
                var expenses = await context.Expenses
                   .Where(e => e.UserId == UserId)
                   .ToListAsync();
                return Results.Ok(expenses);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }

        public static async Task<IResult> CreateExpense(ExpenseDto expense, Guid UserId, AppDbContext context)
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
                context.Expenses.Add(NewExpense);
                await context.SaveChangesAsync();
                return Results.Ok(expense);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }


        public static async Task<IResult> CreateExpenseForEvent(Guid eventId,
            [FromBody] EventExpenseDto payload,
            AppDbContext db)
            {
            try
            {

                if (payload == null) return Results.BadRequest("Payload is Empty.");
                if (payload.EventId != eventId) return Results.BadRequest("EventId does not match.");
                if (payload.Shares == null || !payload.Shares.Any())
                    return Results.BadRequest("There must be atleast 1 share.");

                var ev = await db.Events
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

                db.Expenses.Add(expense);
                await db.SaveChangesAsync();

                var shares = payload.Shares.Select(s => new UserExpenseShare
                {
                    ExpenseId = expense.Id,
                    UserId = s.UserId,
                    ShareAmount = s.ShareAmount
                }).ToList();

                db.UserExpenseShares.AddRange(shares);
                await db.SaveChangesAsync();

                
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
        public static async Task<IResult> DeleteExpense(Guid id, AppDbContext context)
        {
            try
            {
                if (await context.Expenses.FindAsync(id) is Expense expense)
                {
                    context.Expenses.Remove(expense);
                    await context.SaveChangesAsync();
                    return Results.NoContent();
                }
                else return Results.NotFound();
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }
        public static async Task<IResult> UpdateExpense(Guid id, Expense expense, AppDbContext context)
        {
            try
            {
                if (id != expense.Id) return TypedResults.BadRequest("Id does not match");
                if (!await context.Expenses.AnyAsync(e => e.Id == id)) return TypedResults.BadRequest("Expense not Found in Database");
                
                context.Expenses.Update(expense);
                await context.SaveChangesAsync();
                return Results.NoContent();

            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }

        public static async Task<IResult> UpdateShares(Guid eventId, Guid expenseId, [FromBody] UpdateSharesDto payload, AppDbContext db)
        {
            try
            {

                if (payload == null || payload.Shares == null || !payload.Shares.Any())
                    return Results.BadRequest("Poslati morate nove deleže.");

                // pridobi expense skupaj z eventom
                var expense = await db.Expenses
                    .Include(e => e.Event)
                    .FirstOrDefaultAsync(e => e.Id == expenseId && e.EventId == eventId);

                if (expense == null)
                    return Results.NotFound("Expense ne obstaja v tem eventu.");

                // userji, ki so del eventa
                var eventUserIds = await db.UserEvents
                    .Where(x => x.EventId == eventId)
                    .Select(x => x.UserId)
                    .ToListAsync();

                // validacija userjev
                foreach (var s in payload.Shares)
                {
                    if (!eventUserIds.Contains(s.UserId))
                        return Results.BadRequest($"Uporabnik {s.UserId} ni del dogodka.");
                }

                var sum = payload.Shares.Sum(x => x.ShareAmount);
                if (Math.Round(sum, 2) != Math.Round(expense.Amount, 2))
                    return Results.BadRequest($"Vsota deležev {sum} se ne ujema z zneskom {expense.Amount}.");

                
                var oldShares = db.UserExpenseShares.Where(x => x.ExpenseId == expenseId);
                db.UserExpenseShares.RemoveRange(oldShares);
                await db.SaveChangesAsync();

                
                var newShares = payload.Shares.Select(s => new UserExpenseShare
                {
                    ExpenseId = expenseId,
                    UserId = s.UserId,
                    ShareAmount = s.ShareAmount
                });

                db.UserExpenseShares.AddRange(newShares);
                await db.SaveChangesAsync();

                return Results.Ok("Deleži posodobljeni.");
            }
        
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri posodabljanju deležev: " + ex.Message);
            }
}
    }
}
