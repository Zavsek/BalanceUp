using Backend.Data;
using Backend.Handlers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace Backend.Endpoints
{
    public static class ExpenseEndpoints
    {
        public static void MapExpenseEndpoints(this WebApplication app)
        {
            var ExpenseGroup = app.MapGroup("/api/expenses")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");
            //Get all expenses for user
            ExpenseGroup.MapGet("/", async (  ExpenseHandler handler) => { return await handler.GetExpensesForUser(); });
            //Get paginated Expenses
            ExpenseGroup.MapGet("/{page}", async (int page, ExpenseHandler handler) => { return await handler.GetExpensesForUserPaginated(page); });

            //Get all expenses for event
            ExpenseGroup.MapGet("/${eventId}", async ( Guid eventId,ExpenseHandler handler) => { return await handler.GetExpensesForEvent(eventId); });
            //Add new expense
            ExpenseGroup.MapPost("/", async (ExpenseDto expense, ExpenseHandler handler) =>
            {
                return await handler.CreateExpense(expense);
            }); 
            //Delete expense by id
            ExpenseGroup.MapDelete("/{id}", async (Guid id,  ExpenseHandler handler) => { return await handler.DeleteExpense(id); });
            //Update expense by id
            ExpenseGroup.MapPut("/{expenseId}", async (Guid expenseId, ExpenseDto expense,  ExpenseHandler handler) => { return await handler.UpdateExpense( expense); });

        }
    }
}
