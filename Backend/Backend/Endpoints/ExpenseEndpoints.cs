using Backend.Data;
using Backend.Handlers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Backend.Endpoints
{
    public static class ExpenseEndpoints
    {
        public static void MapExpenseEndpoints(this WebApplication app)
        {
            var ExpenseGroup = app.MapGroup("/api/expenses")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");
            //Get all expenses
            ExpenseGroup.MapGet("/", async (Guid id,  ExpenseHandler handler) => { return await handler.GetExpenses(id); });
            //Add new expense
            ExpenseGroup.MapPost("/", async (Guid userId, ExpenseDto expense,  ExpenseHandler handler) => { return await handler.CreateExpense(expense, userId); });
            //Delete expense by id
            ExpenseGroup.MapDelete("/{id}", async (Guid id,  ExpenseHandler handler) => { return await handler.DeleteExpense(id); });
            //Update expense by id
            ExpenseGroup.MapPut("/api/expenses/{id}", async (Guid id, Expense expense,  ExpenseHandler handler) => { return await handler.UpdateExpense(id, expense); });

        }
    }
}
