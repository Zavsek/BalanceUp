using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Firebase.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Backend.Handlers
{
    public  class ExpenseHandler
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExpenseHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public  async Task<IResult> GetExpensesForUser()
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;

                if (userId == null)
                    return TypedResults.Unauthorized();
                var expenses = await _context.Expenses
                   .Where(e => e.userId == userId)
                   .Select(e => new ExpenseDto
                   (
                       e.id,
                       e.amount,
                       e.type.ToString(),
                       e.description,
                       e.dateTime.ToUniversalTime()
                   ))
                   .ToListAsync();
                return Results.Ok(expenses);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }
        public async Task<IResult> GetExpensesForEvent(Guid eventId)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;

                if (userId == null)
                    return TypedResults.Unauthorized();

                var expenses = await _context.Expenses
                    .Where(e => e.eventId == eventId)
                    .OrderByDescending(e => e.dateTime) 
                    .Select(e => new EventExpensesDto
                    (
                        e.id,
                        e.amount,
                        e.description,
                        e.type.ToString(),
                        e.dateTime,
                        e.userExpenseShares.Select(s => new ExpenseShareDto
                        (
                            s.userId,
                            s.user.username, 
                            s.shareAmount
                        )).ToList()
                    ))
                    .ToListAsync();

                return Results.Ok(expenses);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller: " + ex.Message);
            }
        }
        public  async Task<IResult> CreateExpense( ExpenseDto expense)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                
                if (userId == null)
                    return TypedResults.Unauthorized();
                var NewExpense = new Expense
                {
                    amount = expense.amount,
                    type = Enum.Parse<ExpenseType>(expense.type),
                    description = expense.description,
                    dateTime = DateTime.SpecifyKind(expense.time, DateTimeKind.Utc),
                    userId = userId
                };
                _context.Expenses.Add(NewExpense);
                await _context.SaveChangesAsync();
                return Results.Ok(NewExpense);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller " + ex.Message);
            }
        }


        public async Task<IResult> CreateExpenseForEvent(Guid eventId,
             EventExpensesDto payload)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;

                if (userId == null)
                    return TypedResults.Unauthorized();
                if (payload == null) return Results.BadRequest("Payload is Empty.");
                if (payload.shares == null || !payload.shares.Any())
                    return Results.BadRequest("There must be atleast 1 share.");
                decimal sum = payload.shares.Sum(s => s.shareAmount);
                if (Math.Ceiling(sum) != 100) return Results.BadRequest("share ammounts do not add upp");

                var ev = await _context.Events
                .Include(e => e.userEvents)
                    .FirstOrDefaultAsync(e => e.id == eventId);

                if (ev == null) return Results.NotFound("Event ne obstaja.");
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    var expense = new Expense
                    {
                        id = Guid.NewGuid(),
                        amount = payload.amount,
                        dateTime = payload.dateTime,
                        description = payload.description,
                        type = Enum.Parse<ExpenseType>(payload.type),
                        eventId = eventId
                    };
                    _context.Expenses.Add(expense);
                    await _context.SaveChangesAsync();
                    foreach(var s in payload.shares)
                    {
                        Console.WriteLine($"Vstavljam share za UserID: {s.userId}");
                        var share = new UserExpenseShare
                        {
                            expenseId = expense.id,
                            userId = s.userId,
                            shareAmount = s.shareAmount
                        };
                        _context.UserExpenseShares.Add(share);
                    }
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Results.Ok(new EventExpensesDto(expense.id, expense.amount, expense.description, payload.type, expense.dateTime, payload.shares));

                }
                catch (Exception ex)
                {
                    return TypedResults.InternalServerError("Napaka pri ustvarjanju expense: " + ex.Message);
                }
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Napaka pri ustvarjanju expense: " + ex.Message);
            }
        }
        public async Task<IResult> DeleteExpense(Guid id) 
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;

                if (userId == null)
                    return TypedResults.Unauthorized();
                var expense = await _context.Expenses
                    .FirstOrDefaultAsync(ex => ex.id == id && ex.userId == userId);

                if (expense == null)
                    return TypedResults.NotFound("Expense not found or you don't have permission.");

                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();

                return Results.NoContent();
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller: " + ex.Message);
            }
        }
        public async Task<IResult> UpdateExpense( ExpenseDto expenseDto) 
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;

                if (userId == null)
                    return TypedResults.Unauthorized();

                var existingExpense = await _context.Expenses
                    .FirstOrDefaultAsync(e => e.id == expenseDto.id && e.userId == userId);

                if (existingExpense == null)
                    return TypedResults.NotFound("Expense not found or access denied.");


                existingExpense.amount = expenseDto.amount;
                existingExpense.type = Enum.Parse<ExpenseType>(expenseDto.type);
                existingExpense.description = expenseDto.description;
                existingExpense.dateTime = expenseDto.time.ToUniversalTime();

                await _context.SaveChangesAsync();
                return Results.NoContent();
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in Expense Controller: " + ex.Message);
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
